import React from "react";
import { useSnapshot } from "valtio";
import { state } from "./store";
import Case from "./case.jsx";
import Disc from "./disc.jsx";

export default function ModelSelector() {
  const snap = useSnapshot(state);

  switch (snap.currentMode) {
    case "CASE":
      return <Case />;
    case "DISC":
      return <Disc />;
    default:
      return <Case />;
  }
}
