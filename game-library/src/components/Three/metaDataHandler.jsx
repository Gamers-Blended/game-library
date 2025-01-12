import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [dataRetrievedFromDb, setDataRetrievedFromDb] = useState(null);
  const [titleOptions, setTitleOptions] = useState(null);
  const [platformOptions, setPlatformOptions] = useState(null);
  const [regionOptions, setRegionOptions] = useState(null);
  const [editionOptions, setEditionOptions] = useState(null);

  const isUserInteraction = useRef(false);
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

  // get title options from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: dataFromDb, error } = await supabase
          .from("games")
          .select("*")
          .order("title_text", { ascending: true });

        if (error) throw error;
        if (dataFromDb) {
          const titleOptions = dataFromDb.map((item) => ({
            gameId: item.game_id,
            value: item.title,
            label: item.title_text,
          }));

          setDataRetrievedFromDb(dataFromDb);
          setTitleOptions(titleOptions);
          setFetchError(null);
          console.log("Complete data from supabase: ", dataFromDb);
          console.log("Transformed titleOptions: ", titleOptions);
        }
      } catch (error) {
        setDataRetrievedFromDb(null);
        setTitleOptions(null);
        setFetchError("Unable to fetch game data");
        console.error("Error fetching game titles from database: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCurrentOption = (options, value) =>
    options.find((option) => option.value == value) || null;

  useEffect(() => {
    // Initialise only if a selection has been made before
    if (titleOptions && snap.title !== "default") {
      const initialSelections = {
        title: getCurrentOption(titleOptions, snap.title),
        platform: getCurrentOption(platformOptions, snap.platform),
        region: getCurrentOption(regionOptions, snap.region),
        edition: getCurrentOption(editionOptions, snap.edition),
      };
      setSelectionsCache(initialSelections); // update cache

      // Update previous values to match current values
      Object.assign(prevSnapValues.current, {
        title: snap.title,
        platform: snap.platform,
        region: snap.region,
        edition: snap.edition,
      });
    }
  }, [titleOptions]);

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

  // Memoised handler to prevent recreation on renders
  const handleSelectionChange = useCallback((selectedOption, actionMeta) => {
    isUserInteraction.current = true;
    console.log("Selection changed:", selectedOption, actionMeta.name);

    // If title is changed, reset other selections
    if (actionMeta.name === "title") {
      console.log("querying database for: ", selectedOption.value);
      setIsLoadingOptions(true);

      // Get available options for selected gameId
      const fetchAvailableOptions = async () => {
        try {
          const { data, error } = await supabase
            .from("game_releases")
            .select("*")
            .eq("game_id", selectedOption.gameId);

          if (error) throw error;
          if (data) {
            console.log(
              `Related data for gameId ${selectedOption.gameId}:`,
              data
            );

            const platformOptions = [
              ...new Set(
                data
                  .filter((item) => item.platform)
                  .map((item) => item.platform)
              ),
            ].map((platform) => ({
              value: platform,
              label: mapItemToLabel(platform, PlatformTypes),
            }));

            const regionOptions = [
              ...new Set(
                data.filter((item) => item.region).map((item) => item.region)
              ),
            ].map((region) => ({
              value: region,
              label: mapItemToLabel(region, RegionTypes),
            }));

            const editionOptions = [
              ...new Set(
                data.filter((item) => item.edition).map((item) => item.edition)
              ),
            ].map((edition) => ({
              value: edition,
              label: mapItemToLabel(edition, EditionTypes),
            }));

            setPlatformOptions(platformOptions);
            setRegionOptions(regionOptions);
            setEditionOptions(editionOptions);
            setFetchError(null);
            console.log(
              "Available options: ",
              platformOptions,
              regionOptions,
              editionOptions
            );
          }
        } catch (error) {
          setPlatformOptions(null);
          setRegionOptions(null);
          setEditionOptions(null);
          setFetchError("Unable to fetch options for :", selectedOption.title);
          console.error(
            `Error fetching related data for ${selectedOption.title}:`,
            error
          );
        } finally {
          setIsLoadingOptions(false);
        }
      };

      fetchAvailableOptions();

      setSelectionsCache((prev) => ({
        title: selectedOption,
        platform: null,
        region: null,
        edition: null,
      }));
    } else {
      // Update cache
      setSelectionsCache((prev) => ({
        ...prev,
        [actionMeta.name]: selectedOption,
      }));
    }
  }, []);

  const areAllSelectionsChosen = () => {
    return (
      selectionsCache.title &&
      selectionsCache.platform &&
      selectionsCache.region &&
      selectionsCache.edition
    );
  };

  // Save cache to state only when View button is clicked
  const handleView = async () => {
    if (!areAllSelectionsChosen()) return;

    try {
      // Update state immediately with cache values
      const newState = {
        title: selectionsCache.title.value,
        platform: selectionsCache.platform.value,
        region: selectionsCache.region.value,
        edition: selectionsCache.edition.value,
      };

      // Fetch metadata before updating state
      const metadata = await createMetaDataPath(newState);

      // Update state with new selections
      Object.assign(state, {
        ...newState,
      });

      // Update previous values with latest state
      Object.assign(prevSnapValues.current, newState);

      console.log(
        `Successfully updated state with:\n` +
          `Title: ${newState.title}\n` +
          `Platform: ${newState.platform}\n` +
          `Region: ${newState.region}\n` +
          `Edition: ${newState.edition}\n`
      );
    } catch (error) {
      console.error("Error updating state:", error);
    }
  };

  const CloseButton = () => {
    const handleClose = () => {
      state.isMetaDataHandlerOpened = !snap.isMetaDataHandlerOpened;
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
          disabled={!areAllSelectionsChosen()}
          style={!areAllSelectionsChosen ? disabledButtonStyle : {}}
        >
          View
        </button>
      );
    };

    // Whenever state changes, cache and previous store need to be automatically updated to match
    useEffect(() => {
      // Skip if the change was from user interaction
      if (isUserInteraction.current) {
        isUserInteraction.current = false;
        return;
      }

      // Check if any values changed from previous state
      const hasExternalChanges = [
        "title",
        "platform",
        "region",
        "edition",
      ].some((key) => snap[key] !== prevSnapValues.current[key]);

      if (!hasExternalChanges) {
        return;
      }

      const newSelections = {
        title: getCurrentOption(titleOptions, snap.title),
        platform: getCurrentOption(platformOptions, snap.platform),
        region: getCurrentOption(regionOptions, snap.region),
        edition: getCurrentOption(editionOptions, snap.edition),
      };

      setSelectionsCache(newSelections);

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
            value={selectionsCache.title}
            menuPlacement="auto"
            isDisabled={isLoading}
          />
        </div>
        {isLoading && (
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
            value={selectionsCache.platform}
            menuPlacement="auto"
            isDisabled={isLoading || isLoadingOptions || !selectionsCache.title}
          />
        </div>
        {isLoadingOptions && (
          <div className="loadingRow">Loading options... Please wait...</div>
        )}

        <div className="selectorRow">
          <span className="selectorLabel">Region: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="region"
            onChange={handleSelectionChange}
            options={regionOptions}
            value={selectionsCache.region}
            menuPlacement="auto"
            isDisabled={isLoading || !selectionsCache.platform}
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Edition: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="edition"
            onChange={handleSelectionChange}
            options={editionOptions}
            value={selectionsCache.edition}
            menuPlacement="auto"
            isDisabled={isLoading || !selectionsCache.region}
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
