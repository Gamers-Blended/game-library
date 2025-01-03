import React, { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { state } from "./store";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

import coverFlipSound from "../../assets/sound/page-flip-01a.mp3";
import textViewerOpenSound from "../../assets/sound/open-textviewer.mp3";
import keyboardIconQ from "../../assets/icons/icons8-q-key-96.png";
import keyboardIconE from "../../assets/icons/icons8-e-key-96.png";
import keyboardIconR from "../../assets/icons/icons8-r-key-96.png";
import keyboardIconArrowUp from "../../assets/icons/icons8-page-up-button-96.png";
import keyboardIconArrowDown from "../../assets/icons/icons8-page-down-button-96.png";

export default function CoverViewer() {
  const COVER_WIDTH = "1065";
  const COVER_HEIGHT = "631";
  const [isFrontCover, setIsFrontCover] = useState(true);
  // View Current Cover Text
  const [isTextViewerOpen, setIsTextViewerOpen] = useState(false);
  const [textSourcePath, setTextSourcePath] = useState("");
  const [text, setText] = useState("");
  const textViewerOpenAudio = new Audio(textViewerOpenSound);
  // Flip Cover
  const coverFlipAudio = new Audio(coverFlipSound);

  const snap = useSnapshot(state);

  // function to toggle text viewer
  const handleTextViewer = () => {
    setIsTextViewerOpen((isTextViewerOpen) => {
      if (!isTextViewerOpen) {
        textViewerOpenAudio.volume = 0.3;
        textViewerOpenAudio.play();
        return true;
      } else {
        return false;
      }
    });
  };

  // function to toggle front and reverse covers
  const handleCoverFlip = () => {
    setIsFrontCover((isFrontCover) => !isFrontCover);
    coverFlipAudio.volume = 0.3;
    coverFlipAudio.play();
  };

  // function to display image based on state
  const handleCoverDisplay = () => {
    return isFrontCover
      ? "models/ps4_fallout4.jpg"
      : "models/ps4_mafia_de_reverse_cover.jpg";
  };

  /* buttons for cover viewer
  View Current Cover Text - View text
  Flip Cover - Flip cover
  Zoom In - Zooms in cover (up to zoomLevelLimit)
  Zoom Out - Zooms out cover
  Reset - Reset to original scale
  Go Back - Close interface
  */
  const CoverImageButtons = () => {
    // Zoom In & Out
    const { zoomIn, zoomOut, resetTransform } = useControls();
    const [zoomLevel, setZoomLevel] = useState(1);
    const zoomLevelLimit = 3;

    const handleZoomIn = () => {
      if (zoomLevel < zoomLevelLimit) {
        zoomIn();
        setZoomLevel((zoomLevel) => zoomLevel + 1);
      }
    };

    const handleZoomOut = () => {
      if (zoomLevel > 1) {
        zoomOut();
        setZoomLevel((zoomLevel) => zoomLevel - 1);
      }
    };

    const handleReset = () => {
      resetTransform();
      setZoomLevel(1);
    };

    const disabledButtonStyle = {
      opacity: 0.5,
      cursor: "not-allowed",
    };

    /* key events
    Q - View text
    E - Flip cover
    Up Arrow - Zooms in cover (up to zoomLevelLimit)
    Down Arrow - Zooms out cover
    R - Reset to original scale
    */
    useEffect(() => {
      const onKeyDown = (e) => {
        switch (e.key) {
          case "q":
            handleTextViewer();
            break;
          case "e":
            handleCoverFlip();
            break;
          case "ArrowUp":
            handleZoomIn();
            break;
          case "ArrowDown":
            handleZoomOut();
            break;
          case "r":
            handleReset();
            break;
        }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [zoomLevel]);

    return (
      <div className="coverViewerButtons">
        <img
          src={keyboardIconQ}
          className="coverViewercontrolsKeys"
          alt="Q key"
        />
        <button className="buttonText" onClick={handleTextViewer}>
          {isTextViewerOpen ? "Close Cover Text" : "View Cover Text"}
        </button>

        <img
          src={keyboardIconE}
          className="coverViewercontrolsKeys"
          alt="E key"
        />
        <button className="buttonText" onClick={handleCoverFlip}>
          Flip Cover
        </button>

        <img
          src={keyboardIconArrowUp}
          className="coverViewercontrolsKeys"
          alt="Arrow up key"
        />
        <button
          className="buttonText"
          onClick={handleZoomIn}
          disabled={zoomLevel >= zoomLevelLimit}
          style={zoomLevel >= zoomLevelLimit ? disabledButtonStyle : {}}
        >
          Zoom In
        </button>

        <img
          src={keyboardIconArrowDown}
          className="coverViewercontrolsKeys"
          alt="Arrow down key"
        />
        <button
          className="buttonText"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1}
          style={zoomLevel <= 1 ? disabledButtonStyle : {}}
        >
          Zoom Out
        </button>

        <img
          src={keyboardIconR}
          className="coverViewercontrolsKeys"
          alt="R key"
        />
        <button className="buttonText" onClick={handleReset}>
          Reset
        </button>
      </div>
    );
  };

  // text dependent on front or back cover
  useEffect(() => {
    if (isFrontCover) {
      setTextSourcePath("/textData/ps4_fallout4_cover_text.txt");
    } else {
      setTextSourcePath("/textData/ps4_mafia_de_cover_reverse_text.txt");
    }
  });

  useEffect(() => {
    fetch(textSourcePath)
      .then((response) => response.text())
      .then((text) => {
        setText(text);
      });
  });

  return (
    <div className="coverViewer">
      {/* text viewer */}
      {isTextViewerOpen && (
        <div className="coverTextViewerBackground">
          <div
            className="coverTextViewerTextArea"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      )}

      {/* cover viewer */}
      <div className="coverImage">
        <TransformWrapper
          doubleClick={{
            disabled: true,
          }}
          wheel={{
            disabled: true,
          }}
        >
          <TransformComponent>
            <img
              src={
                isFrontCover
                  ? "models/ps4_fallout4.jpg"
                  : "models/ps4_mafia_de_reverse_cover.jpg"
              }
              className="coverPage"
            />
          </TransformComponent>

          {/* buttons */}
          <CoverImageButtons />
        </TransformWrapper>
      </div>
    </div>
  );
}
