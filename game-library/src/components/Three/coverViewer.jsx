import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "valtio";
import { state } from "./store";

import coverFlipSound from "../../assets/sound/page-flip-01a.mp3";

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
  const [isTextViewerOpen, setIsTextViewerOpen] = useState(false);
  const coverFlip = new Audio(coverFlipSound);
  const [text, setText] = useState("");

  // function to toggle cover viewer interface
  const handleClose = () => {
    state.currentMode = CASE_MODE;
  };

  // function to toggle front and reverse covers
  const handleCoverFlip = () => {
    setIsFrontCover((isFrontCover) => !isFrontCover);
    coverFlip.volume = 0.3;
    coverFlip.play();
  };

  // function to toggle text viewer
  const handleTextViewer = () => {
    setIsTextViewerOpen((isTextViewerOpen) => !isTextViewerOpen);
  };

  // function to display image based on state
  const handleCoverDisplay = () => {
    return isFrontCover
      ? "models/ps4_fallout4.jpg"
      : "models/ps4_mafia_de_reverse_cover.jpg";
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

  useEffect(() => {
    fetch("/textData/ps4_fallout4_cover_text.txt")
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
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}

      <div className="coverImage">
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
      </div>

      <div className="buttons">
        <button className="exit" onClick={handleClose}>
          Go back to Case
        </button>
      </div>
    </div>
  );
}
