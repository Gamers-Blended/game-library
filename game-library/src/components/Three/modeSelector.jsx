import React, { useEffect } from "react";
import { state } from "./store";
import { useSnapshot } from "valtio";

import keyboardIcon1 from "../../assets/icons/icons8-1-key-96.png";
import keyboardIcon2 from "../../assets/icons/icons8-2-key-96.png";
import keyboardIcon3 from "../../assets/icons/icons8-3-key-96.png";
import keyboardIcon4 from "../../assets/icons/icons8-4-key-96.png";
import keyboardIcon5 from "../../assets/icons/icons8-5-key-96.png";

export default function ModeSelector() {
  const CASE_MODE = "CASE";
  const COVER_MODE = "COVER";
  const DISC_MODE = "DISC";
  const snap = useSnapshot(state);
  const shouldRenderExtraButtons = snap.additional != "";

  const handleModeCase = () => {
    state.currentMode = CASE_MODE;
    state.isImageViewerOpened = false;
  };

  const handleModeCover = () => {
    state.currentMode = COVER_MODE;
    state.isImageViewerOpened = true;
  };

  const handleModeDisc = () => {
    state.currentMode = DISC_MODE;
    state.isImageViewerOpened = false;
  };

  /* key events
  1 - Case mode
  2 - Cover mode
  3 - Disc mode
  */
  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.key) {
        case "1":
          handleModeCase();
          break;
        case "2":
          handleModeCover();
          break;
        case "3":
          handleModeDisc();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="modeSelectorContainerParent">
      <div className="modeSelectorContainer">
        <div className="modelSelectorRow">
          <img src={keyboardIcon1} className="modeSelectorControlsKeys" />

          <button className="modeSelectorButtons" onClick={handleModeCase}>
            Case
          </button>
        </div>

        <div className="modelSelectorRow">
          <img src={keyboardIcon2} className="modeSelectorControlsKeys" />

          <button className="modeSelectorButtons" onClick={handleModeCover}>
            Cover
          </button>
        </div>

        <div className="modelSelectorRow">
          <img src={keyboardIcon3} className="modeSelectorControlsKeys" />

          <button className="modeSelectorButtons" onClick={handleModeDisc}>
            Disc
          </button>
        </div>

        {shouldRenderExtraButtons && <ExtraButtons />}
      </div>
    </div>
  );
}

function ExtraButtons() {
  const snap = useSnapshot(state);
  const MANUAL_MODE = "MANUAL";
  const ADDITIONAL_MODE = "ADDITIONAL MATERIAL";
  const keyboardIconArray = [keyboardIcon4, keyboardIcon5];
  const additionalMaterials = snap.additional;
  let additionalMaterialsToRender = [];

  const handleModeManual = () => {
    state.currentMode = MANUAL_MODE;
    state.isImageViewerOpened = false;
  };

  const handleModeAdditional = () => {
    state.currentMode = ADDITIONAL_MODE;
  };

  /* key events
  4 - Manual mode
  5 - Additional mode
  */
  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.key) {
        case "4":
          handleModeManual();
          break;
        case "5":
          handleModeAdditional();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  additionalMaterials.forEach((material, index) => {
    switch (material.item) {
      case "manual":
        additionalMaterialsToRender.push(
          <div className="modelSelectorRow" key={index}>
            <img
              src={keyboardIconArray[index]}
              className="modeSelectorControlsKeys"
            />

            <button className="modeSelectorButtons" onClick={handleModeManual}>
              Manual
            </button>
          </div>
        );
        break;
      default:
        additionalMaterialsToRender.push(
          <div className="modelSelectorRow" key={index}>
            <img
              src={keyboardIconArray[index]}
              className="modeSelectorControlsKeys"
            />

            <button
              className="modeSelectorButtons"
              onClick={handleModeAdditional}
            >
              {material}
            </button>
          </div>
        );
    }
  });

  return <div>{additionalMaterialsToRender}</div>;
}
