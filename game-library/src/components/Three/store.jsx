import { proxy } from "valtio";

const state = proxy({
  currentMode: "CASE",
  title: "default",
  platform: "default",
  region: "default",
  edition: "default",
  coverText: "",
  coverWidth: 0,
  coverHeight: 0,
  additional: "",
  open: false,
  manualPageNumber: 0,
  manualCurrentPage: 1,
  isImageViewerOpened: false,
  isMetaDataHandlerOpened: false,
  metadataCache: {
    titleInfo: null,
    gameReleases: null,
  },
});

export { state };
