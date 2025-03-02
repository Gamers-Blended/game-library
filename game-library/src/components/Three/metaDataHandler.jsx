import React, { useEffect, useState, useRef } from "react";
import {
  PlatformTypes,
  RegionTypes,
  EditionTypes,
  mapItemToLabel,
} from "./optionMapper";
import { state } from "./store";
import { useSnapshot } from "valtio";
import Select from "react-select";
import supabase from "../../config/supabase";

export default function MetaDataHandler() {
  const CASE_MODE = "CASE";
  const snap = useSnapshot(state);

  const [isLoadingTitleData, setIsLoadingTitleData] = useState(false);
  const [isLoadingGameReleases, setIsLoadingGameReleases] = useState(false);
  const [isLoadingTableData, setIsLoadingTableData] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [titleOptions, setTitleOptions] = useState(null);
  const [platformOptions, setPlatformOptions] = useState(null);
  const [regionOptions, setRegionOptions] = useState(null);
  const [editionOptions, setEditionOptions] = useState(null);

  const isUserInteraction = useRef(false);
  const isTitleChange = useRef(false);
  const prevSnapValues = useRef({
    title: snap.title,
    platform: snap.platform,
    region: snap.region,
    edition: snap.edition,
  });
  const [selectionsCache, setSelectionsCache] = useState({
    title: null,
    platform: null,
    region: null,
    edition: null,
  });

  // Current selections
  const [selections, setSelections] = useState({
    title: null,
    platform: null,
    region: null,
    edition: null,
  });

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

  // Fetch table data from Supabase database
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

  // Initial title data load
  useEffect(() => {
    const loadTitleData = async () => {
      setIsLoadingTitleData(true);

      // Set options from if cache exists
      if (state.metadataCache.titleInfo) {
        console.log(
          "Game data has been retrieved before, using cache instead of calling database..."
        );
        const options = state.metadataCache.titleInfo.map((item) => ({
          gameId: item.game_id,
          value: item.title,
          label: item.title_text,
        }));
        setTitleOptions(options);
        setIsLoadingTitleData(false);
        return;
      }

      // Fetch from database if not cached
      try {
        console.log(
          "Game data cache is empty, retrieving data from database..."
        );
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .order("title_text", { ascending: true });

        if (error) throw error;

        // Update cache and state
        state.metadataCache.titleInfo = data;
        const options = data.map((item) => ({
          gameId: item.game_id,
          value: item.title,
          label: item.title_text,
        }));
        setTitleOptions(options);
      } catch (error) {
        setTitleOptions(null);
        setFetchError("Unable to fetch game titles");
        console.error("Error fetching game titles from database: ", error);
      } finally {
        setIsLoadingTitleData(false);
      }
    };
    loadTitleData();
  }, []);

  const loadGameReleases = async (gameId) => {
    setIsLoadingGameReleases(true);
    setPlatformOptions(null);
    setRegionOptions(null);
    setEditionOptions(null);

    // Check cache first
    if (state.metadataCache.gameReleases) {
      // Cache needs to contain current game_id info
      const releases = state.metadataCache.gameReleases.filter(
        (release) => release.game_id === gameId
      );
      if (releases.length > 0) {
        console.log(
          `Current cache has gameId = ${gameId} data, skipping database...`
        );
        const platforms = [
          ...new Set(
            releases
              .filter((item) => item.platform)
              .map((item) => item.platform)
          ),
        ];
        setPlatformOptions(
          platforms.map((platform) => ({
            value: platform,
            label: mapItemToLabel(platform, PlatformTypes),
          }))
        );
        setIsLoadingGameReleases(false);
        return;
      }
    }

    // Cache does not exist or does not contain gameId data, fetch game releases from database when title changes
    try {
      console.log(
        `Game releases cache is empty or does not contain gameId = ${gameId} data, retrieving data from database...`
      );
      const { data, error } = await supabase
        .from("game_releases")
        .select("*")
        .eq("game_id", gameId);

      if (error) throw error;

      state.metadataCache.gameReleases = [];
      state.metadataCache.gameReleases.push(...data);

      const platforms = [
        ...new Set(
          data.filter((item) => item.platform).map((item) => item.platform)
        ),
      ];
      setPlatformOptions(
        platforms.map((platform) => ({
          value: platform,
          label: mapItemToLabel(platform, PlatformTypes),
        }))
      );
    } catch (error) {
      setPlatformOptions(null);
      setFetchError("Unable to fetch game releases");
      console.error(
        `Error fetching game releases for gameId = ${gameId} from database: `,
        error
      );
    } finally {
      setIsLoadingGameReleases(false);
    }
  };

  // Update region options when platform is selected
  useEffect(() => {
    if (!selections.platform || !state.metadataCache.gameReleases) return;

    const releases = state.metadataCache.gameReleases.filter(
      (release) =>
        release.game_id === selections.title.gameId &&
        release.platform === selections.platform.value
    );

    const regions = [
      ...new Set(
        releases.filter((item) => item.region).map((item) => item.region)
      ),
    ];
    setRegionOptions(
      regions.map((region) => ({
        value: region,
        label: mapItemToLabel(region, RegionTypes),
      }))
    );
  }, [selections.platform]);

  // Update edition options when region is selected
  useEffect(() => {
    if (!selections.region || !state.metadataCache.gameReleases) return;

    const releases = state.metadataCache.gameReleases.filter(
      (release) =>
        release.game_id === selections.title.gameId &&
        release.platform === selections.platform.value &&
        release.region === selections.region.value
    );

    const editions = [
      ...new Set(
        releases.filter((item) => item.edition).map((item) => item.edition)
      ),
    ];
    setEditionOptions(
      editions.map((edition) => ({
        value: edition,
        label: mapItemToLabel(edition, EditionTypes),
      }))
    );
  }, [selections.region]);

  const getCurrentOption = (options, value) =>
    options?.find((option) => option.value == value) || null;

  // Load game release options for submitted title (if any) upon mount
  useEffect(() => {
    if (snap.title !== "default" && titleOptions) {
      const currentTitle = getCurrentOption(titleOptions, snap.title);
      if (currentTitle) {
        console.log(`Setting current title: ${currentTitle.value}`);
        setSelections({
          title: currentTitle,
          platform: null,
          region: null,
          edition: null,
        });
        loadGameReleases(currentTitle.gameId);
      }
    }
  }, [titleOptions]);

  // Restore submitted platform, region, and edition selections (if any)
  useEffect(() => {
    if (
      snap.platform !== "default" &&
      platformOptions &&
      !isTitleChange.current
    ) {
      const currentPlatform = getCurrentOption(platformOptions, snap.platform);
      if (currentPlatform) {
        console.log(`Setting current platform: ${currentPlatform.value}`);
        setSelections((prev) => ({ ...prev, platform: currentPlatform }));
      }
    }
  }, [platformOptions]);

  useEffect(() => {
    if (!isTitleChange.current && snap.region !== "default" && regionOptions) {
      const currentRegion = getCurrentOption(regionOptions, snap.region);
      if (currentRegion) {
        console.log(`Setting current region: ${currentRegion.value}`);
        setSelections((prev) => ({ ...prev, region: currentRegion }));
      }
    }
  }, [regionOptions]);

  useEffect(() => {
    if (
      !isTitleChange.current &&
      snap.edition !== "default" &&
      editionOptions
    ) {
      const currentEdition = getCurrentOption(editionOptions, snap.edition);
      if (currentEdition) {
        console.log(`Setting current edition: ${currentEdition.value}`);
        setSelections((prev) => ({ ...prev, edition: currentEdition }));
      }
    }
  }, [editionOptions]);

  // For logs
  useEffect(() => {
    if (titleOptions) {
      console.log("titleOptions updated: ", titleOptions);
    }
  }, [titleOptions]);

  useEffect(() => {
    if (platformOptions && regionOptions && editionOptions) {
      console.log(
        "Available options: ",
        platformOptions,
        regionOptions,
        editionOptions
      );
    }
  }, [platformOptions, regionOptions, editionOptions]);

  // Handle selection changes
  const handleSelectionChange = (selectedOption, { name }) => {
    if (name === "title") {
      isTitleChange.current = true; // When title changes
      // Reset other selections whenever title changes & set available options for selected title
      setSelections({
        title: selectedOption,
        platform: null,
        region: null,
        edition: null,
      });
      loadGameReleases(selectedOption.gameId);
    } else {
      // Set selected option (that's not title)
      setSelections((prev) => ({
        ...prev,
        [name]: selectedOption,
      }));
    }
  };

  const isAllSelectionChosen = () => {
    return (
      selections.title &&
      selections.platform &&
      selections.region &&
      selections.edition
    );
  };

  // Update state with selected row data
  const handleRowClick = (item) => {
    console.log("Row clicked:", item);
  };

  const handleView = () => {
    if (!isAllSelectionChosen) return;

    console.log("Attempting to update state with:", {
      title: selections.title.value,
      platform: selections.platform.value,
      region: selections.region.value,
      edition: selections.edition.value,
    });

    // Update global state
    try {
      const selectedItemInfo = state.metadataCache.gameReleases.find(
        (release) =>
          release.game_id === selections.title.gameId &&
          release.platform === selections.platform.value &&
          release.region === selections.region.value &&
          release.edition === selections.edition.value
      );

      if (selectedItemInfo) {
        Object.assign(state, {
          title: selections.title.value,
          platform: selections.platform.value,
          region: selections.region.value,
          edition: selections.edition.value,
          coverText: selectedItemInfo.cover_text,
          coverWidth: selectedItemInfo.cover_width,
          coverHeight: selectedItemInfo.cover_height,
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
        JSON.stringify(selectedItemInfo.included_items, null, 2)
      );

      // For additional items
      if (
        selectedItemInfo.included_items.length > 0 &&
        selectedItemInfo.included_items.some((obj) =>
          obj.hasOwnProperty("item")
        )
      ) {
        console.log("Selected game title has additional items!");
        state.additional = selectedItemInfo.included_items;

        selectedItemInfo.included_items.forEach((material) => {
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

  const Selector = () => {
    const ViewButton = () => {
      const disabledButtonStyle = {
        opacity: 0.5,
        cursor: "not-allowed",
      };

      return (
        <button
          className="buttonText"
          onClick={handleView}
          disabled={!isAllSelectionChosen()}
          style={!isAllSelectionChosen ? disabledButtonStyle : {}}
        >
          View
        </button>
      );
    };

    // Whenever state changes, cache and previous store need to be automatically updated to match external changes
    useEffect(() => {
      // Skip if the change was from user interaction
      if (isUserInteraction.current) {
        isUserInteraction.current = false;
        return;
      }

      // Only update cache when MetadataHandler is opened or when there are external changes
      const hasExternalChanges = [
        "title",
        "platform",
        "region",
        "edition",
      ].some((key) => snap[key] !== prevSnapValues.current[key]);

      if (!hasExternalChanges && selectionsCache.title) {
        return;
      }

      if (!hasExternalChanges) {
        return;
      }

      // Only update selections that haven't been modified by the user
      const newSelections = {
        title: getCurrentOption(titleOptions, snap.title),
        platform: getCurrentOption(platformOptions, snap.platform),
        region: getCurrentOption(regionOptions, snap.region),
        edition: getCurrentOption(editionOptions, snap.edition),
      };

      setSelectionsCache((prev) => ({
        title: prev.title || newSelections.title,
        platform: prev.platform || newSelections.platform,
        region: prev.region || newSelections.region,
        edition: prev.edition || newSelections.edition,
      }));

      // Update previous values with latest state
      Object.assign(prevSnapValues.current, {
        title: snap.title,
        platform: snap.platform,
        region: snap.region,
        edition: snap.edition,
      });
    }, [snap.title, snap.platform, snap.region, snap.edition]);

    return (
      <div className="metadataHandlerSelector">
        <div className="selectorRow">
          <span className="selectorLabel">Title: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="title"
            onChange={handleSelectionChange}
            options={titleOptions}
            value={selections.title}
            menuPlacement="auto"
            isDisabled={isLoadingTitleData}
          />
        </div>
        {isLoadingTitleData && (
          <div className="loadingRow">
            Loading game titles... Please wait...
          </div>
        )}

        <div className="selectorRow">
          <span className="selectorLabel">Platform: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="platform"
            onChange={handleSelectionChange}
            options={platformOptions}
            value={selections.platform}
            menuPlacement="auto"
            isDisabled={isLoadingGameReleases || !selections.title}
          />
        </div>
        {isLoadingGameReleases && (
          <div className="loadingRow">Loading options... Please wait...</div>
        )}

        <div className="selectorRow">
          <span className="selectorLabel">Region: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="region"
            onChange={handleSelectionChange}
            options={regionOptions}
            value={selections.region}
            menuPlacement="auto"
            isDisabled={!selections.platform}
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Edition: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="edition"
            onChange={handleSelectionChange}
            options={editionOptions}
            value={selections.edition}
            menuPlacement="auto"
            isDisabled={!selections.region}
          />
        </div>

        <div className="viewButtonContainer">
          <ViewButton />
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

          <div className="gameTableTitleTableContainer">
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
                      className="gameTableTitleTableRow"
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
        <Selector />
      </div>
    </div>
  );
}
