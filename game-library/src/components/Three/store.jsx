import { proxy } from "valtio";

const state = proxy({
  currentMode: "CASE",
  title: "default",
  additional: "",
  open: false,
  manualPageNumber: 0,
  manualCurrentPage: 1,
  isManualViewerOpened: false,
});

export { state };
