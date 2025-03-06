import React, { useEffect, useState } from "react";
import {
  PlatformTypes,
  RegionTypes,
  EditionTypes,
  mapItemToLabel,
} from "./optionMapper";
import { state } from "./store";
import { useSnapshot } from "valtio";
import supabase from "../../config/supabase";

const LoadingBar = () => {
  return (
    <div className="loadingBarContainer">
      <div className="loadingBar">
        <div className="loadingBarFill"></div>
      </div>
    </div>
  );
};

export default function MetaDataHandler() {
  const CASE_MODE = "CASE";
  const snap = useSnapshot(state);

  const [isLoadingRowData, setIsLoadingRowData] = useState(false);
  const [isLoadingGameReleases, setIsLoadingGameReleases] = useState(false);
  const [isLoadingTableData, setIsLoadingTableData] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });
  const [filters, setFilters] = useState({
    title: "",
    platform: "",
    region: "",
    edition: "",
    releaseDate: "",
    genres: "",
  });

  const headers = [
    { key: "title", label: "Title" },
    { key: "platform", label: "Platform" },
    { key: "region", label: "Region" },
    { key: "edition", label: "Edition" },
    { key: "releaseDate", label: "Release Date" },
    { key: "genres", label: "Genres" },
  ];

  // Get game release data from database
  const loadGameReleasesData = async (gameId) => {
    setIsLoadingGameReleases(true);
    setIsLoadingRowData(true);

    // If cache contains data for gameId, skip database call
    const existingReleases = state.metadataCache.gameReleases;
    if (existingReleases && existingReleases.length > 0) {
      const hasGameIdData = existingReleases.some(
        (release) => release.game_id === gameId
      );

      if (hasGameIdData) {
        console.log(
          `Game releases for gameId ${gameId} already in cache. Skipping database fetch.`
        );
        return existingReleases;
      }
    }

    // If no existing data, proceed with database fetch
    try {
      console.log(
        `Retrieving game releases for gameId = ${gameId} from database...`
      );
      const { data, error } = await supabase
        .from("game_releases")
        .select(`*, games!inner (title)`)
        .eq("game_id", gameId);

      if (error) throw error;

      // Clear and update cache
      state.metadataCache.gameReleases = [...data];

      console.log(`Loaded ${data.length} game releases for gameId ${gameId}`);

      return data;
    } catch (error) {
      setFetchError("Unable to fetch game releases from database");
      console.error(
        `Error fetching game releases for gameId = ${gameId} from database: `,
        error
      );

      // Clear cache on error
      state.metadataCache.gameReleases = [];

      return [];
    } finally {
      setIsLoadingGameReleases(false);
      setIsLoadingRowData(false);
    }
  };

  // Toggle asc and desc for input key
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      // If already sorted by key in asc, change to desc
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Update filter for input key
  const handleFilterChange = (e, key) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Update page size
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Fetch table data from Supabase database upon initial startup
  useEffect(() => {
    const fetchTableData = async () => {
      setIsLoadingTableData(true);

      // Check if table data is cached
      if (state.metadataCache.tableData) {
        console.log(
          "Table data has been retrieved before, using cache instead of calling database..."
        );
        setData(state.metadataCache.tableData);
        setFilteredData(state.metadataCache.tableData);
        setIsLoadingTableData(false);
        return;
      }

      try {
        console.log(
          "Table data cache is empty, retrieving data from database..."
        );

        // Join games with game_releases tables
        const { data, error } = await supabase.from("game_releases").select(
          `
          game_id,
          platform,
          region,
          edition,
          release_date,
          genres,
          games(title_text)`
        );

        if (error) throw error;

        // Transform data to match table structure
        const formattedData = data.map((item) => ({
          gameId: item.game_id,
          title: item.games.title_text,
          platform: mapItemToLabel(item.platform, PlatformTypes),
          region: mapItemToLabel(item.region, RegionTypes),
          edition: mapItemToLabel(item.edition, EditionTypes),
          releaseDate: item.release_date
            ? new Date(item.release_date).toISOString().split("T")[0]
            : "N/A",
          genres: Array.isArray(item.genres)
            ? item.genres.join(", ")
            : item.genres || "N/A",
        }));

        // Update cache and state
        state.metadataCache.tableData = formattedData;
        setData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        setFetchError("Unable to fetch table data");
        console.error("Error fetching table data from database: ", error);

        // Fallback to empty array if fetch fails
        setData([]);
        setFilteredData([]);
      } finally {
        setIsLoadingTableData(false);
      }
    };

    fetchTableData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...data]; // Create a copy of data array, this copy will be modified

    // Apply filters
    result = result.filter((item) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true; // Skip empty filters
        return item[key].toLowerCase().includes(filters[key].toLowerCase());
      });
    });

    // Apply sorting
    result.sort((a, b) => {
      // Compare 2 elements, a & b
      // -1: a < b
      // 1: b < a
      // 0: a == b
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1; // a < b (asc) : b < a (desc)
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1; // b < a (asc) : a < b (desc)
      }
      return 0; // a & b have equal order
    });

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters/sort change
  }, [filters, sortConfig, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize); // Round up to nearest integer
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize, // Start inclusive
    currentPage * pageSize // End exclusive
  );

  // Update state with selected row data
  const handleRowClick = async (item) => {
    if (isLoadingRowData) return;

    console.log("Row clicked - item values:", JSON.stringify(item));

    setIsLoadingRowData(true);

    // Ensure cache is updated
    await loadGameReleasesData(item.gameId);

    console.log(
      "Retrieved gameReleases data:",
      JSON.stringify(state.metadataCache.gameReleases[0])
    );

    try {
      // Check if gameReleases exists and has items
      if (
        state.metadataCache.gameReleases &&
        state.metadataCache.gameReleases.length > 0
      ) {
        Object.assign(state, {
          title: state.metadataCache.gameReleases[0].games.title,
          platform: state.metadataCache.gameReleases[0].platform,
          region: state.metadataCache.gameReleases[0].region,
          edition: state.metadataCache.gameReleases[0].edition,
          coverText: state.metadataCache.gameReleases[0].cover_text,
          coverWidth: state.metadataCache.gameReleases[0].cover_width,
          coverHeight: state.metadataCache.gameReleases[0].cover_height,
        });
      }
      console.log(
        `Successfully updated state with:\n` +
          `Title: ${state.title}\n` +
          `Platform: ${state.platform}\n` +
          `Region: ${state.region}\n` +
          `Edition: ${state.edition}\n` +
          `Cover Text: ${state.coverText?.slice(0, 10) || ""}\n` +
          `Cover Width: ${state.coverWidth}\n` +
          `Cover Height: ${state.coverHeight}`
      );

      console.log(
        "Included items content:",
        JSON.stringify(
          state.metadataCache.gameReleases[0].included_items,
          null,
          2
        )
      );

      // For additional items
      const includedItems = state.metadataCache.gameReleases[0].included_items;

      // Check if includedItems has a non-empty 'item' array
      const hasAdditionalItems =
        includedItems &&
        Array.isArray(includedItems.item) &&
        includedItems.item.length > 0;

      if (hasAdditionalItems) {
        console.log("Selected game title has additional items!");
        state.additional = state.metadataCache.gameReleases[0].included_items;

        state.additional.forEach((material) => {
          if (material.item === "manual") {
            Object.assign(state, {
              manualWidth: material.page_width,
              manualHeight: material.page_height,
              manualPageNumber: material.number_of_pages,
            });

            console.log(
              `Successfully updated state with manual-related data:\n` +
                `Manual Width: ${state.manualWidth}\n` +
                `Manual Height: ${state.manualHeight}\n` +
                `Manual Page Number: ${state.manualPageNumber}\n`
            );
          }
        });
      } else {
        console.log(
          "Selected game title does not have additional items! Resetting additional state..."
        );
        state.additional = "";
      }

      state.isMetaDataHandlerOpened = false;
      state.currentMode = CASE_MODE; // Always start from case
    } catch (error) {
      console.error("Error updating state:", error);
    } finally {
      setIsLoadingRowData(false);
    }
  };

  const CloseButton = () => {
    const handleClose = () => {
      state.isMetaDataHandlerOpened = false;
    };

    return (
      <button className="buttonText" onClick={handleClose}>
        Close
      </button>
    );
  };

  return (
    <div className="metadataHandlerContainer">
      <div className="metadataContent">
        <div className="closeButtonContainer">
          <CloseButton />
        </div>
        <h1 className="metadataHandlerHeader">VIDEO GAME 3D LIBRARY</h1>
        <div className="instructionText">
          Welcome to the Game Library! <br />
          Please select the title you wish to view.
          {fetchError && <p>{fetchError}</p>}
        </div>

        <div className="gameTable">
          {/* Page Size Controls */}
          {isLoadingRowData && <LoadingBar />}

          <div className="gameTablePageSizeContainer">
            <div className="gameTablePageSize">
              <label className="gameTablePageSizeLabel">Rows per page:</label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="gameTableSelectBox"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div
            className={`gameTableTitleTableContainer ${
              isLoadingRowData ? "disabled" : ""
            }`}
          >
            <table className="gameTableTitleTable">
              {/* Table Headers */}
              <thead className="gameTableTitleTableHeaderContainer">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header.key}
                      onClick={() => requestSort(header.key)}
                      className="gameTableTitleTableHeader"
                    >
                      <div className="gameTableTitleTableHeaderText">
                        <span>{header.label}</span>
                        {sortConfig.key === header.key && (
                          <span className="gameTableTitleTableHeaderTextOrder">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
                <tr>
                  {/* Filter Input Row */}
                  {headers.map((header) => (
                    <th
                      key={`filter-${header.key}`}
                      className="gameTableTitleTableFilterHeader"
                    >
                      <input
                        type="text"
                        placeholder={`Filter ${header.label}`}
                        value={filters[header.key]}
                        onChange={(e) => handleFilterChange(e, header.key)}
                        className="gameTableTitleTableFilterBox"
                      />
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Title Table Rows */}
              <tbody className="gameTableTitleTableBody">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className={`gameTableTitleTableRow ${
                        isLoadingRowData ? "non-clickable" : ""
                      }`}
                      // className="gameTableTitleTableRow"
                      onClick={() => handleRowClick(item)}
                    >
                      {headers.map((header) => (
                        <td
                          key={`${index}-${header.key}`}
                          className="gameTableTitleTableRowText"
                        >
                          {item[header.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className="gameTableTitleTableRowTextEmpty"
                    >
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="gameTablePaginationContainer">
            <div>
              Showing{" "}
              {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{" "}
              to {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} entries
            </div>
            <div className="gameTablePaginationButtonContainer">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gameTablePaginationButton"
              >
                Previous
              </button>
              <span className="PaginationPageText">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="gameTablePaginationButton"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
