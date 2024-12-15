import React, { useEffect, useState } from "react";
import { state } from "./store";
import { useSnapshot } from "valtio";
import Select from "react-select";

export default function MetaDataHandler() {
  const TXT_EXT = ".txt";
  const [textSourcePath, setTextSourcePath] = useState("");
  const [isTitleSet, setIsTitleSet] = useState(false);
  const snap = useSnapshot(state);

  const titleOptions = [
    { value: "fallout4", label: "Fallout 4" },
    { value: "mafia_de", label: "Mafia Definite Edition" },
  ];

  const handleSelect = (option) => {
    state.title = option.value;
    setTextSourcePath("/textData/metadata_" + state.title + TXT_EXT);
    setIsTitleSet(true);
  };

  useEffect(() => {
    if (isTitleSet) {
      fetch(textSourcePath)
        .then((response) => response.text())
        .then((text) => {
          return JSON.parse(text);
        })
        .then((textParsed) => {
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
              snap.manualPageNumber
          );
        })
        .catch((jsonError) => {
          console.error(
            "Error in parsing JSON for " + textSourcePath + ": " + jsonError
          );
        });
    } else {
      console.error("No title selected");
    }
  });

  return (
    <div className="metadataHandlerContainer">
      <Select
        className="metadataHandlerSelectBox"
        onChange={handleSelect}
        options={titleOptions}
      />
    </div>
  );
}
