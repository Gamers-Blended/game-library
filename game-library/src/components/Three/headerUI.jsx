import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { state } from "./store";
import { useSnapshot } from "valtio";

// img
import keyboardIconQ from "../../assets/icons/icons8-q-key-96.png";
import keyboardIconE from "../../assets/icons/icons8-e-key-96.png";
import keyboardIconLeftClick from "../../assets/icons/icons8-left-click-96.png";
import keyboardIconRightClick from "../../assets/icons/icons8-right-click-96.png";
import keyboardIconScrollUp from "../../assets/icons/icons8-scroll-up-96.png";
import keyboardIconScrollDown from "../../assets/icons/icons8-scroll-down-96.png";
import infoIcon from "../../assets/icons/icons8-info-96.png";

// sounds
import caseOpenSound from "../../assets/sound/open-case.mp3";
import caseCloseSound from "../../assets/sound/close-case.mp3";

export default function HeaderUI() {
  // case open and close audio
  const openCase = new Audio(caseOpenSound);
  const closeCase = new Audio(caseCloseSound);

  const transition = { type: "spring", duration: 0.8 };
  const config = {
    initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
    animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
    exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } },
  };

  const snap = useSnapshot(state);
  const [shouldRenderInfoBox, setShouldRenderInfoBox] = useState(true);

  const getHeaderText = () => {
    return snap.currentMode;
  };

  function InformationBox() {
    return (
      <div className="informationBox">
        <div className="informationText">
          <img src={infoIcon} className="informationIcon" />
          Click on the front cover to open and close the case.
        </div>
        <div className="informationText">
          <img src={infoIcon} className="informationIcon" />
          Hover cursor to the top right to show mode selector.
        </div>

        {snap.open && (
          <div>
            <div className="informationText">
              <img src={infoIcon} className="informationIcon" />
              Click on the disc to display it.
            </div>
            <div className="informationText">
              <img src={infoIcon} className="informationIcon" />
              Click on the manual to display it.
            </div>
          </div>
        )}
      </div>
    );
  }

  function CaseButtons() {
    // function to toggle case open and close
    const handleInformationBoxToggle = () => {
      setShouldRenderInfoBox((shouldRenderInfoBox) => !shouldRenderInfoBox);
    };

    // function to toggle case open and close
    const handleOpenCloseCase = () => {
      state.open = !state.open;

      if (snap.open) {
        closeCase.volume = 0.3;
        closeCase.play();
      } else {
        openCase.volume = 0.3;
        openCase.play();
      }
    };

    /* key events
    Q - Toggle information box
    E - Open/close case
    */
    useEffect(() => {
      const onKeyDown = (e) => {
        switch (e.key) {
          case "q":
            handleInformationBoxToggle();
            break;
          case "e":
            handleOpenCloseCase();
            break;
        }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
      <div className="caseButtons">
        <img src={keyboardIconLeftClick} className="caseControlsKeys" />
        (Hold) Rotate
        <img src={keyboardIconRightClick} className="caseControlsKeys" />
        (Hold) Drag
        <img src={keyboardIconScrollUp} className="caseControlsKeys" />
        Zoom In
        <img src={keyboardIconScrollDown} className="caseControlsKeys" />
        Zoom Out
        <img src={keyboardIconE} className="caseControlsKeys" />
        {snap.open ? "Close Case" : "Open Case"}
        <img src={keyboardIconQ} className="caseControlsKeys" />
        {shouldRenderInfoBox ? "Hide Information" : "Show Information"}
      </div>
    );
  }

  return (
    <div className="headerUIContainer">
      <motion.header
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <h1>Video Game 3D Library</h1>
      </motion.header>
      <AnimatePresence>
        <motion.section key="main" {...config}>
          <div className="section--container">
            <motion.div
              key="title"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: "spring",
                damping: 5,
                stiffness: 40,
                restDelta: 0.001,
                duration: 0.3,
              }}
            ></motion.div>
          </div>
        </motion.section>
      </AnimatePresence>
      <div className="subHeader">{getHeaderText()}</div>
      {shouldRenderInfoBox && <InformationBox />}
      {snap.currentMode == "CASE" && <CaseButtons />}
    </div>
  );
}
