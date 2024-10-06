import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "valtio";
import { state } from "./store";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

import coverFlipSound from "../../assets/sound/page-flip-01a.mp3";
import textViewerOpenSound from "../../assets/sound/open-textviewer.mp3";

export default function CoverViewer() {
  const COVER_MODE = "COVER";
  const snap = useSnapshot(state);

  const transition = { type: "spring", duration: 0.8 };
  const config = {
    initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
    animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
    exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } },
  };

  // window height changes when interface is opened
  const getHeight = () => {
    return snap.currentMode == COVER_MODE ? "100%" : "10%";
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 0,
        width: "100%",
        height: getHeight,
      }}
    >
      <AnimatePresence>
        {snap.currentMode != COVER_MODE ? (
          <motion.section key="main" {...config}>
            <div className="support--content">
              <button
                style={{ background: snap.color }}
                onClick={() => {
                  state.currentMode = COVER_MODE;
                }}
              >
                View Cover
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section key="custom" {...config}>
            <UI />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

// interface for viewing cover sheet (front and back)
function UI() {
  const CASE_MODE = "CASE";
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

  // function to toggle text viewer
  const handleTextViewer = () => {
    // setIsTextViewerOpen((isTextViewerOpen) => !isTextViewerOpen);
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

  // function to toggle cover viewer interface
  const handleClose = () => {
    state.currentMode = CASE_MODE;
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
  Go Back - Close interface
  */
  const CoverImageButtons = () => {
    // Zoom In & Out
    const { zoomIn, zoomOut } = useControls();
    const [zoomLevel, setZoomLevel] = useState(1);
    const zoomLevelLimit = 3;

    const handleZoomIn = () => {
      if (zoomLevel < zoomLevelLimit) {
        zoomIn();
        setZoomLevel((prevZoom) => prevZoom + 1);
      }
    };

    const handleZoomOut = () => {
      if (zoomLevel > 1) {
        zoomOut();
        setZoomLevel((prevZoom) => prevZoom - 1);
      }
    };

    const disabledButtonStyle = {
      opacity: 0.5,
      cursor: "not-allowed",
    };

    return (
      <div className="buttons">
        <button onClick={handleTextViewer}>View Current Cover Text</button>

        <button onClick={handleCoverFlip}>Flip Cover</button>

        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= zoomLevelLimit}
          style={zoomLevel >= zoomLevelLimit ? disabledButtonStyle : {}}
        >
          Zoom In
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1}
          style={zoomLevel <= 1 ? disabledButtonStyle : {}}
        >
          Zoom Out
        </button>

        <button onClick={handleClose}>Back</button>
      </div>
    );
  };

  /* key events
  Q - View text
  E - Flip cover
  Esc - Close interface
  */
  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.key) {
        case "q":
          handleTextViewer();
          break;
        case "e":
          handleCoverFlip();
          // button grey out if not available
          break;
        case "Escape":
          handleClose();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
      {isTextViewerOpen && (
        <div
          className="coverTextViewer"
          dangerouslySetInnerHTML={{ __html: text }}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            width: "80%",
            height: "80%",
            zIndex: 10,
          }}
        />
      )}

      <div className="coverImage">
        <TransformWrapper>
          <TransformComponent>
            <img
              src={
                isFrontCover
                  ? "models/ps4_fallout4.jpg"
                  : "models/ps4_mafia_de_reverse_cover.jpg"
              }
              alt="An image of the cover sheet."
              width={COVER_WIDTH}
              height={COVER_HEIGHT}
            />
          </TransformComponent>
          <CoverImageButtons />
        </TransformWrapper>
      </div>
    </div>
  );
}
