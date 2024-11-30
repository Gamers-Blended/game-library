import { proxy } from "valtio";

const state = proxy({
  currentMode: "CASE",
  title: "default",
  additional: "",
  open: false,
});

export { state };
