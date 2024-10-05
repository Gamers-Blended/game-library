import { proxy } from "valtio";

const state = proxy({
  currentMode: "CASE",
});

export { state };
