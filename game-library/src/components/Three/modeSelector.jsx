import React, { useEffect } from "react";
import { state } from "./store";

import keyboardIcon1 from "../../assets/icons/icons8-1-key-96.png";
import keyboardIcon2 from "../../assets/icons/icons8-2-key-96.png";
import keyboardIcon3 from "../../assets/icons/icons8-3-key-96.png";
import keyboardIcon4 from "../../assets/icons/icons8-4-key-96.png";
import keyboardIcon5 from "../../assets/icons/icons8-5-key-96.png";

export default function ModeSelector() {
  const CASE_MODE = "CASE";
  const COVER_MODE = "COVER";
  const DISC_MODE = "DISC";
  const MANUAL_MODE = "MANUAL";
  const ADDITIONAL_MODE = "ADDITIONAL MATERIAL";

  const handleModeCase = () => {
    state.currentMode = CASE_MODE;
  };

  const handleModeCover = () => {
    state.currentMode = COVER_MODE;
  };

  const handleModeDisc = () => {
    state.currentMode = DISC_MODE;
  };

  const handleModeManual = () => {
    state.currentMode = MANUAL_MODE;
  };

  const handleModeAdditional = () => {
    state.currentMode = ADDITIONAL_MODE;
  };

  /* key events
  1 - Case mode
  2 - Cover mode
  3 - Disc mode
  4 - Manual mode
  5 - Additional mode
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
        case "4":
          handleModeManual();
          // button grey out if not available
          break;
        case "5":
          handleModeAdditional();
          // button grey out if not available
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
          <img
            src={keyboardIcon1}
            className="modeSelectorControlsKeys"
            alt="1 key"
          />

          <button className="modeSelectorButtons" onClick={handleModeCase}>
            Case
          </button>
        </div>

        <div className="modelSelectorRow">
          <img
            src={keyboardIcon2}
            className="modeSelectorControlsKeys"
            alt="2 key"
          />

          <button className="modeSelectorButtons" onClick={handleModeCover}>
            Cover
          </button>
        </div>

        <div className="modelSelectorRow">
          <img
            src={keyboardIcon3}
            className="modeSelectorControlsKeys"
            alt="3 key"
          />

          <button className="modeSelectorButtons" onClick={handleModeDisc}>
            Disc
          </button>
        </div>

        <div className="modelSelectorRow">
          <img
            src={keyboardIcon4}
            className="modeSelectorControlsKeys"
            alt="4 key"
          />

          <button className="modeSelectorButtons" onClick={handleModeManual}>
            Manual
          </button>
        </div>

        <div className="modelSelectorRow">
          <img
            src={keyboardIcon5}
            className="modeSelectorControlsKeys"
            alt="5 key"
          />

          <button
            className="modeSelectorButtons"
            onClick={handleModeAdditional}
          >
            Additional Material
          </button>
        </div>
      </div>
    </div>
  );
}
