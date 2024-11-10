import React from "react";

import keyboardIcon1 from "../../assets/icons/icons8-1-key-96.png";
import keyboardIcon2 from "../../assets/icons/icons8-2-key-96.png";
import keyboardIcon3 from "../../assets/icons/icons8-3-key-96.png";
import keyboardIcon4 from "../../assets/icons/icons8-4-key-96.png";
import keyboardIcon5 from "../../assets/icons/icons8-5-key-96.png";

export default function ModeSelector() {
  const handleCoverFlip = () => {
    console.log("test");
  };

  return (
    <div className="modeSelectorContainer">
      <div className="modelSelectorRow">
        <img
          src={keyboardIcon1}
          className="modeSelectorControlsKeys"
          alt="1 key"
        />

        <button className="modeSelectorButtons" onClick={handleCoverFlip}>
          Case
        </button>
      </div>

      <div className="modelSelectorRow">
        <img
          src={keyboardIcon2}
          className="modeSelectorControlsKeys"
          alt="2 key"
        />

        <button className="modeSelectorButtons" onClick={handleCoverFlip}>
          Cover
        </button>
      </div>

      <div className="modelSelectorRow">
        <img
          src={keyboardIcon3}
          className="modeSelectorControlsKeys"
          alt="3 key"
        />

        <button className="modeSelectorButtons" onClick={handleCoverFlip}>
          Disc
        </button>
      </div>

      <div className="modelSelectorRow">
        <img
          src={keyboardIcon4}
          className="modeSelectorControlsKeys"
          alt="4 key"
        />

        <button className="modeSelectorButtons" onClick={handleCoverFlip}>
          Manual
        </button>
      </div>

      <div className="modelSelectorRow">
        <img
          src={keyboardIcon5}
          className="modeSelectorControlsKeys"
          alt="5 key"
        />

        <button className="modeSelectorButtons" onClick={handleCoverFlip}>
          Additional Material
        </button>
      </div>
    </div>
  );
}
