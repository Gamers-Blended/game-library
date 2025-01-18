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
  const TXT_EXT = ".txt";
  const snap = useSnapshot(state);

  const [textSourcePath, setTextSourcePath] = useState("");
  const [isLoadingTitleData, setIsLoadingTitleData] = useState(false);
  const [isLoadingGameReleases, setIsLoadingGameReleases] = useState(false);
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

  const createMetaDataPath = async (newState) => {
    try {
      const metaDataPath = `/textData/metadata_${newState.title}_${newState.platform}_${newState.region}_${newState.edition}${TXT_EXT}`;
      console.log("MetaData path created: " + metaDataPath);
      return metaDataPath;
    } catch (error) {
      console.error("Error creating metaDataPath:", error);
      throw error;
    }
  };

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
      Object.assign(state, {
        title: selections.title.value,
        platform: selections.platform.value,
        region: selections.region.value,
        edition: selections.edition.value,
      });

      console.log(
        `Successfully updated state with:\n` +
          `Title: ${state.title}\n` +
          `Platform: ${state.platform}\n` +
          `Region: ${state.region}\n` +
          `Edition: ${state.edition}\n`
      );

      state.isMetaDataHandlerOpened = false;
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
      </div>
    );
  };

  useEffect(() => {
    if (textSourcePath) {
      fetch(textSourcePath)
        .then((response) => response.text())
        .then((text) => {
          return JSON.parse(text);
        })
        .then((textParsed) => {
          state.platform = textParsed.platforms[0];
          state.additional = textParsed.additional;
          state.manualPageNumber = textParsed.manualPageNumber
            ? textParsed.manualPageNumber
            : 0;
          console.log(
            "Successfully set additional materials for " +
              snap.title +
              ": \n" +
              snap.additional +
              "\nNumber of pages for manual: " +
              snap.manualPageNumber +
              "\nPlatform: " +
              snap.platform
          );
        })
        .catch((jsonError) => {
          console.error(
            "Error in parsing JSON for " + textSourcePath + ": " + jsonError
          );
        });
    }
  }, [textSourcePath]);

  return (
    <div className="metadataHandlerContainer">
      <div className="metadataContent">
        <div className="instructionText">
          Welcome to the Game Library! <br />
          Please select the title you wish to view.
          {fetchError && <p>{fetchError}</p>}
          <div className="closeButtonContainer">
            <CloseButton />
          </div>
        </div>
        <Selector />
      </div>
    </div>
  );
}
