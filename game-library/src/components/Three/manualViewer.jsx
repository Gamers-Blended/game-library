import React, { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { state } from "./store";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

import flipSound from "../../assets/sound/page-flip-01a.mp3";
import keyboardIconA from "../../assets/icons/icons8-a-key-96.png";
import keyboardIconD from "../../assets/icons/icons8-d-key-96.png";
import keyboardIconQ from "../../assets/icons/icons8-q-key-96.png";
import keyboardIconR from "../../assets/icons/icons8-r-key-96.png";
import keyboardIconArrowUp from "../../assets/icons/icons8-page-up-button-96.png";
import keyboardIconArrowDown from "../../assets/icons/icons8-page-down-button-96.png";

export default function ManualViewer() {
  const snap = useSnapshot(state);

  const [imageUrl, setImageUrl] = useState("models/ps4_fallout4.jpg");

  const handleImageChange = (newImageUrl) => {
    setImageUrl(newImageUrl);
  };

  const handleImageViewerClose = () => {
    state.isImageViewerOpened = false;
  };

  /* buttons for cover viewer
  Previous Page - Go back 1 page
  Next Page - Go forward 1 page
  Zoom In - Zooms in pages (up to zoomLevelLimit)
  Zoom Out - Zooms out pages
  Reset - Reset to original scale
  Close Viewer - Close interface
  */
  const ManualImageButtons = () => {
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
      Q - Close viewer
      Up Arrow - Zooms in cover (up to zoomLevelLimit)
      Down Arrow - Zooms out cover
      R - Reset to original scale
    */
    useEffect(() => {
      const onKeyDown = (e) => {
        switch (e.key) {
          case "q":
            handleImageViewerClose();
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
      <div className="imageViewerButtons">
        <img src={keyboardIconQ} className="coverViewercontrolsKeys" />
        <button className="buttonText" onClick={handleImageViewerClose}>
          Close Viewer
        </button>

        {/* <img
          src={keyboardIconE}
          className="coverViewercontrolsKeys"
          alt="E key"
        />
        <button className="buttonText" onClick={handleCoverFlip}>
          Flip Cover
        </button> */}

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

  return (
    <div className="manualViewerContainer">
      <div className="pageInfo">
        Current page number: {snap.manualCurrentPage}
      </div>
      <div className="manualViewer">
        <TransformWrapper
          doubleClick={{
            disabled: true,
          }}
          wheel={{
            disabled: true,
          }}
        >
          <TransformComponent>
            <img src={imageUrl} className="manualPage" />
            <img src={imageUrl} className="manualPage" />
          </TransformComponent>

          {/* buttons */}
          <ManualImageButtons />
        </TransformWrapper>
      </div>
    </div>
  );
}
