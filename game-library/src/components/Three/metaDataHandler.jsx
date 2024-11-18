import React, { useEffect, useState } from "react";
import { state } from "./store";
import { useSnapshot } from "valtio";
import Select from "react-select";

export default function MetaDataHandler() {
  const TXT_EXT = ".txt";
  const ADDITIONAL = "additional:";
  const [textSourcePath, setTextSourcePath] = useState("");
  const snap = useSnapshot(state);

  const titleOptions = [
    { value: "fallout4", label: "Fallout 4" },
    { value: "mafia_de", label: "Mafia Definite Edition" },
  ];

  const handleSelect = (option) => {
    state.title = option.value;
    setTextSourcePath("/textData/metadata_" + state.title + TXT_EXT);
  };

  useEffect(() => {
    fetch(textSourcePath)
      .then((response) => response.text())
      .then((text) => {
        if (text.includes('<html lang="en">')) {
          return Promise.reject(text);
        } else {
          return text;
        }
      })
      .then((text) => {
        let additionalElements = text.indexOf(ADDITIONAL) + ADDITIONAL.length;
        const trimmed = text.slice(additionalElements);
        state.additional = trimmed;
        console.log(
          "Successfully set additional materials for " +
            snap.title +
            ": " +
            snap.additional
        );
      })
      .catch(() => {
        state.additional = "";
        console.log("The metadata file for " + snap.title + " is not found");
      });
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
