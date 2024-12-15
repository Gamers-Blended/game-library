import { proxy } from "valtio";

const state = proxy({
  currentMode: "CASE",
  title: "default",
  additional: "",
  open: false,
  manualPageNumber: 0,
  manualCurrentPage: 0,
});

export { state };
