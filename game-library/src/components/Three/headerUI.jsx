import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "valtio";
import { state } from "./store";

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
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "10%",
      }}
    >
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
            >
              <h1>{getHeaderText()}</h1>
            </motion.div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
