import { proxy } from "valtio";

const state = proxy({
  currentMode: "CASE",
  title: "default",
  platform: "default",
  additional: "",
  open: false,
  manualPageNumber: 0,
  manualCurrentPage: 1,
  isImageViewerOpened: false,
});

export { state };
