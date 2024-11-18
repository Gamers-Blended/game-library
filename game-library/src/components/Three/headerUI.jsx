import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { state } from "./store";
import { useSnapshot } from "valtio";

// img
import keyboardIconLeftClick from "../../assets/icons/icons8-left-click-96.png";
import keyboardIconRightClick from "../../assets/icons/icons8-right-click-96.png";
import keyboardIconScrollUp from "../../assets/icons/icons8-scroll-up-96.png";
import keyboardIconScrollDown from "../../assets/icons/icons8-scroll-down-96.png";

export default function HeaderUI() {
  const transition = { type: "spring", duration: 0.8 };
  const config = {
    initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
    animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
    exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } },
  };

  const snap = useSnapshot(state);
  const getHeaderText = () => {
    return snap.currentMode;
  };

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
      {snap.currentMode == "CASE" && <CaseButtons />}
    </div>
  );
}

function CaseButtons() {
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
    </div>
  );
}
