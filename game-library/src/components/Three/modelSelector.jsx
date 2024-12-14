import React from "react";
import { useSnapshot } from "valtio";
import { state } from "./store";
import Case from "./case.jsx";
import Disc from "./disc.jsx";
import Manual from "./manual.jsx";

export default function ModelSelector() {
  const snap = useSnapshot(state);

  switch (snap.currentMode) {
    case "CASE":
      return <Case />;
    case "DISC":
      return <Disc />;
    case "MANUAL":
      return <Manual />;
    default:
      return <Case />;
  }
}
