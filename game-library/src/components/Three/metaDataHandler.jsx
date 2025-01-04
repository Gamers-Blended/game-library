import React, { useEffect, useState } from "react";
import { state } from "./store";
import { useSnapshot } from "valtio";
import Select from "react-select";

export default function MetaDataHandler() {
  const TXT_EXT = ".txt";
  const [textSourcePath, setTextSourcePath] = useState("");
  const snap = useSnapshot(state);

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

    const getCurrentOption = (options, stateValue) => {
      return options.find((option) => option.value === stateValue) || null;
    };

    const handleSelectionChange = (option, actionMeta) => {
      switch (actionMeta.name) {
        case "title":
          state.title = option.value;
          break;
        case "platform":
          state.platform = option.value;
          break;
        case "region":
          state.region = option.value;
          break;
        case "edition":
          state.edition = option.value;
          break;
      }
    };

    const ViewButton = () => {
      const areAllSelectionsChosen = () => {
        return snap.title && snap.platform && snap.region && snap.edition;
      };

      const constructSourcePath = () => {
        return `/textData/metadata_${snap.platform}_${snap.title}_${snap.region}_${snap.edition}${TXT_EXT}`;
      };

      const handleView = () => {
        if (areAllSelectionsChosen()) {
          const path = constructSourcePath();
          setTextSourcePath(path);
        }

        // setTextSourcePath("/textData/metadata_" + state.title + TXT_EXT);
        console.log("view clicked! text: " + textSourcePath);
      };
      return (
        <button className="buttonText" onClick={handleView}>
          View
        </button>
      );
    };

    return (
      <div className="metadataHandlerSelector">
        <div className="selectorRow">
          <span className="selectorLabel">Title: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="title"
            onChange={handleSelectionChange}
            options={titleOptions}
            value={getCurrentOption(titleOptions, snap.title)}
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Platform: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="platform"
            onChange={handleSelectionChange}
            options={platformOptions}
            value={getCurrentOption(platformOptions, snap.platform)}
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Region: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="region"
            onChange={handleSelectionChange}
            options={regionOptions}
            value={getCurrentOption(regionOptions, snap.region)}
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Edition: </span>
          <Select
            className="metadataHandlerSelectBox"
            name="edition"
            onChange={handleSelectionChange}
            options={editionOptions}
            value={getCurrentOption(editionOptions, snap.edition)}
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
