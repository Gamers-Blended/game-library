import React, { useEffect, useState } from "react";
import { state } from "./store";
import { useSnapshot } from "valtio";
import Select from "react-select";

export default function MetaDataHandler() {
  const TXT_EXT = ".txt";
  const [textSourcePath, setTextSourcePath] = useState("");
  const snap = useSnapshot(state);

  useEffect(() => {
    if (textSourcePath) {
      // Only fetch if there's a path
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

    // Find the current selected option based on state.title
    const getCurrentOption = () => {
      return titleOptions.find((option) => option.value === snap.title) || null;
    };

    const handleSelect = (option) => {
      state.title = option.value;
      setTextSourcePath("/textData/metadata_" + state.title + TXT_EXT);
    };

    return (
      <div className="metadataHandlerSelector">
        <div className="selectorRow">
          <span className="selectorLabel">Title: </span>
          <Select
            className="metadataHandlerSelectBox"
            onChange={handleSelect}
            options={titleOptions}
            value={getCurrentOption()}
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Platform: </span>
          <Select
            className="metadataHandlerSelectBox"
            onChange={handleSelect}
            options={platformOptions}
            value={getCurrentOption()}
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Region: </span>
          <Select
            className="metadataHandlerSelectBox"
            onChange={handleSelect}
            options={regionOptions}
            value={getCurrentOption()}
          />
        </div>

        <div className="selectorRow">
          <span className="selectorLabel">Edition: </span>
          <Select
            className="metadataHandlerSelectBox"
            onChange={handleSelect}
            options={editionOptions}
            value={getCurrentOption()}
          />
        </div>
      </div>
    );
  };

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
