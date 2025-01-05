import React, { useEffect, useState, useCallback, useRef } from "react";
import { state } from "./store";
import { useSnapshot } from "valtio";
import Select from "react-select";

export default function MetaDataHandler() {
  const TXT_EXT = ".txt";
  const [textSourcePath, setTextSourcePath] = useState("");
  const snap = useSnapshot(state);
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

  const titleOptions = [
    { value: "fallout4", label: "Fallout 4" },
    { value: "mafia_de", label: "Mafia Definite Edition" },
    { value: "wolfenstein_young_blood", label: "Wolfenstein Young Blood" },
  ];

  const platformOptions = [
    { value: "ps3", label: "PlayStation 3" },
    { value: "ps4", label: "PlayStation 4" },
    { value: "xbox360", label: "Xbox 360" },
    { value: "xboxone", label: "Xbox One" },
    { value: "pc", label: "PC" },
  ];

  const regionOptions = [
    { value: "us", label: "US" },
    { value: "eur", label: "EUR" },
    { value: "asia", label: "ASIA" },
    { value: "jp", label: "JP" },
  ];

  const editionOptions = [{ value: "std", label: "Standard" }];

  const getCurrentOption = (options, value) =>
    options.find((option) => option.value == value) || null;

  useEffect(() => {
    // Initialise only if a selection has been made before
    if (snap.title !== "default") {
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
  }, []); // Empty dependency array -> runs once on mount

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

    // Update cache
    setSelectionsCache((prev) => ({
      ...prev,
      [actionMeta.name]: selectedOption,
    }));
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
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Platform: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="platform"
            onChange={handleSelectionChange}
            options={platformOptions}
            value={selectionsCache.platform}
            menuPlacement="auto"
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Region: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="region"
            onChange={handleSelectionChange}
            options={regionOptions}
            value={selectionsCache.region}
            menuPlacement="auto"
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
          <div className="closeButtonContainer">
            <CloseButton />
          </div>
        </div>
        <Selector />
      </div>
    </div>
  );
}
