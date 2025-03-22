import React, { useEffect, useState } from "react";
import {
  PlatformTypes,
  RegionTypes,
  EditionTypes,
  mapItemToLabel,
} from "./optionMapper";
import GenreColors, { getGenreColor } from "./genreColors";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Select from "react-select";
import TableLoadingOverlay from "./tableLoadingOverlay";
import { state } from "./store";
import supabase from "../../config/supabase";

export default function MetaDataHandler() {
  const CASE_MODE = "CASE";

  const [isLoadingRowData, setIsLoadingRowData] = useState(false);
  const [isLoadingGameReleases, setIsLoadingGameReleases] = useState(false);
  const [isLoadingTableData, setIsLoadingTableData] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState({
    value: currentPage,
    label: String(currentPage),
  });
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
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

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

  // Update filter for input key (text inputs)
  const handleFilterChange = (e, key) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle date selection
  const handleDateChange = (date, type) => {
    const formattedDate = date ? date.toISOString().split("T")[0] : "";
    setFilters((prev) => ({ ...prev, [type]: formattedDate }));

    // Close the calendar after selection
    if (type === "startDate") {
      setShowStartCalendar(false);
    } else {
      setShowEndCalendar(false);
    }
  };

  // Toggle calendar visibility
  const toggleCalendar = (calendarType) => {
    if (calendarType === "start") {
      setShowStartCalendar(!showStartCalendar);
      setShowEndCalendar(false);
    } else {
      setShowEndCalendar(!showEndCalendar);
      setShowStartCalendar(false);
    }
  };

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isStartCalendarClick = event.target.closest(".startDatePicker");
      const isEndCalendarClick = event.target.closest(".endDatePicker");

      if (!isStartCalendarClick && showStartCalendar) {
        setShowStartCalendar(false);
      }

      if (!isEndCalendarClick && showEndCalendar) {
        setShowEndCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStartCalendar, showEndCalendar]);

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
          platform: mapItemToLabel(item.platform, PlatformTypes), // e.g. PS4 -> PlayStation 4
          region: mapItemToLabel(item.region, RegionTypes), // e.g. US -> United States
          edition: mapItemToLabel(item.edition, EditionTypes), // e.g. std -> Standard
          releaseDate: item.release_date
            ? new Date(item.release_date).toISOString().split("T")[0]
            : "N/A",
          genres: Array.isArray(item.genres)
            ? item.genres
            : [item.genres ?? "N/A"],
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
      // Special handling for date range filter
      const dateFilter = () => {
        if (filters.startDate && filters.endDate) {
          // Both start and end dates are provided
          return (
            item.releaseDate >= filters.startDate &&
            item.releaseDate <= filters.endDate
          );
        } else if (filters.startDate) {
          // Only start date is provided
          return item.releaseDate >= filters.startDate;
        } else if (filters.endDate) {
          // Only end date is provided
          return item.releaseDate <= filters.endDate;
        }
        return true; // No date filters applied
      };

      // Check all non-date filters
      const nonDateFilters = Object.keys(filters)
        .filter((key) => key !== "startDate" && key !== "endDate")
        .every((key) => {
          if (!filters[key]) return true; // Skip empty filters

          if (key === "genres" && Array.isArray(item[key])) {
            // For genres dropdown, check if any genre in the array matches (case-insensitive)
            return item[key].some(
              (genre) => genre.toLowerCase() === filters[key].toLowerCase()
            );
          }
          // Use include substring for other filters
          return String(item[key])
            .toLowerCase()
            .includes(filters[key].toLowerCase());
        });

      return nonDateFilters && dateFilter();
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

  // Options for page select dropdown box
  const pageOptions = Array.from({ length: totalPages }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));

  const handleSelectChange = (option) => {
    setSelectedPage(option);
    handlePageChange(option.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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

  // Update selectedPage whenever currentPage changes
  useEffect(() => {
    setSelectedPage({ value: currentPage, label: String(currentPage) });
  }, [currentPage]);

  const CloseButton = () => {
    const handleClose = () => {
      state.isMetaDataHandlerOpened = false;
    };

    return (
      <button
        className={"gameTableButton"}
        onClick={handleClose}
        disabled={state.title === "default"}
      >
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
            {(isLoadingRowData ||
              isLoadingGameReleases ||
              isLoadingTableData) && <TableLoadingOverlay />}

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
                            {sortConfig.direction === "asc" ? "▲" : "▼"}
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
                      {/* Date range picker for release date */}
                      {header.key === "releaseDate" ? (
                        <div className="dateRangeContainer">
                          {/* Start date picker */}
                          <div className="startDatePicker datePickerContainer">
                            <div className="dateInputContainer">
                              <input
                                type="text"
                                placeholder="Start Date"
                                value={filters.startDate}
                                readOnly
                                onClick={() => toggleCalendar("start")}
                                className="gameTableTitleTableFilterBox dateInput"
                              />
                              <CalendarIcon
                                size={16}
                                className="calendarIcon"
                                onClick={() => toggleCalendar("start")}
                              />
                            </div>
                            {showStartCalendar && (
                              <div className="calendarDropdown">
                                <Calendar
                                  value={
                                    filters.startDate
                                      ? new Date(filters.startDate)
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange(date, "startDate")
                                  }
                                  className="react-calendar"
                                />
                              </div>
                            )}
                          </div>

                          {/* End date picker */}
                          <div className="endDatePicker datePickerContainer">
                            <div className="dateInputContainer">
                              <input
                                type="text"
                                placeholder="End Date"
                                value={filters.endDate}
                                readOnly
                                onClick={() => toggleCalendar("end")}
                                className="gameTableTitleTableFilterBox dateInput"
                              />
                              <CalendarIcon
                                size={16}
                                className="calendarIcon"
                                onClick={() => toggleCalendar("end")}
                              />
                            </div>
                            {showEndCalendar && (
                              <div className="calendarDropdown">
                                <Calendar
                                  value={
                                    filters.endDate
                                      ? new Date(filters.endDate)
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange(date, "endDate")
                                  }
                                  className="react-calendar"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : header.key === "genres" ? (
                        // Genre filter is a dropdown
                        <select
                          value={filters[header.key]}
                          onChange={(e) => handleFilterChange(e, header.key)}
                          className="gameTableTitleTableFilterBox"
                        >
                          <option value="">All Genres</option>
                          {Object.keys(GenreColors).map((genre) => (
                            <option key={genre} value={genre.toLowerCase()}>
                              {genre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        // Rest of the filters are text inputs
                        <input
                          type="text"
                          placeholder={`Filter ${header.label}`}
                          value={filters[header.key]}
                          onChange={(e) => handleFilterChange(e, header.key)}
                          className="gameTableTitleTableFilterBox"
                        />
                      )}
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
                      onClick={() => handleRowClick(item)}
                    >
                      {headers.map((header) => (
                        <td
                          key={`${index}-${header.key}`}
                          className="gameTableTitleTableRowText"
                        >
                          {/* for genres, text will be displayed as badges */}
                          {header.key === "genres" ? (
                            <div className="genreBadgeContainer">
                              {item[header.key][0] === "N/A"
                                ? "N/A"
                                : item[header.key].map((genre, i) => {
                                    const color = getGenreColor(genre);

                                    return (
                                      <span
                                        key={i}
                                        className="genreBadge"
                                        style={{
                                          borderColor: color,
                                          backgroundColor: `${color}30`, // Add 30 hex for 30% opacity
                                        }}
                                      >
                                        {genre}
                                      </span>
                                    );
                                  })}
                            </div>
                          ) : (
                            item[header.key]
                          )}
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
                onClick={() => handlePageChange(1)}
                className="gameTableButton"
                disabled={currentPage === 1}
              >
                <ChevronsLeft size={20} />
              </button>
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                className="gameTableButton"
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="PaginationPageText">Page</span>

              <Select
                value={selectedPage}
                onChange={handleSelectChange}
                options={pageOptions}
                isSearchable={true}
                menuPlacement="auto" // dropdown auto position above or below the input
                openMenuOnFocus={true} // dropdown auto opens when input is clicked/tabbed
                styles={{
                  container: (base) => ({
                    ...base,
                    width: "80px",
                  }),
                  // Ensure the value stays visible after selection
                  singleValue: (base) => ({
                    ...base,
                    position: "relative",
                    overflow: "visible",
                  }),
                }}
              />

              <span className="PaginationPageText">of {totalPages || 1}</span>

              <button
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                className="gameTableButton"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                className="gameTableButton"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
