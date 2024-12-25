import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "valtio";
import { state } from "./store";
import CoverViewer from "./coverViewer.jsx";
import ManualViewer from "./manualViewer.jsx";

export default function ImageModeSelector() {
  const snap = useSnapshot(state);

  if (snap.isImageViewerOpened) {
    const transition = { type: "spring", duration: 0.8 };
    const config = {
      initial: {
        x: -100,
        opacity: 0,
        transition: { ...transition, delay: 0.5 },
      },
      animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
      exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } },
    };

    return (
      <div className="imageViewerContainer">
        <AnimatePresence>
          <motion.section
            className="imageViewerUIContainer"
            key="custom"
            {...config}
          >
            <UI />
          </motion.section>
        </AnimatePresence>
      </div>
    );
  }
}

function UI() {
  const snap = useSnapshot(state);

  switch (snap.currentMode) {
    case "COVER": {
      return <CoverViewer />;
    }
    case "MANUAL": {
      return <ManualViewer />;
    }
  }
}
