import React, { useEffect, useState, useMemo } from "react";
import { useSnapshot } from "valtio";
import { state } from "./store";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useValidatedSupabaseImage, preloadImage } from "../utils/imageUtils";

import keyboardIconA from "../../assets/icons/icons8-a-key-96.png";
import keyboardIconD from "../../assets/icons/icons8-d-key-96.png";
import keyboardIconQ from "../../assets/icons/icons8-q-key-96.png";
import keyboardIconR from "../../assets/icons/icons8-r-key-96.png";
import keyboardIconArrowUp from "../../assets/icons/icons8-page-up-button-96.png";
import keyboardIconArrowDown from "../../assets/icons/icons8-page-down-button-96.png";

const PageNavigation = ({ totalPages }) => {
  const snap = useSnapshot(state);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      state.manualCurrentPage = newPage;
    }
  };

  return (
    <div className="pageNavigationContainer">
      <button
        onClick={() => handlePageChange(1)}
        className="buttonText"
        disabled={snap.manualCurrentPage === 1}
      >
        <ChevronsLeft size={20} />
      </button>

      <button
        onClick={() => handlePageChange(snap.manualCurrentPage - 1)}
        className="buttonText"
        disabled={snap.manualCurrentPage === 1}
      >
        <ChevronLeft size={20} />
      </button>

      <select
        value={snap.manualCurrentPage}
        onChange={(e) => handlePageChange(parseInt(e.target.value))}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
      <span>of {totalPages}</span>

      <button
        onClick={() => handlePageChange(snap.manualCurrentPage + 1)}
        className="buttonText"
        disabled={snap.manualCurrentPage === totalPages}
      >
        <ChevronRight size={20} />
      </button>

      <button
        onClick={() => handlePageChange(totalPages)}
        className="buttonText"
        disabled={snap.manualCurrentPage === totalPages}
      >
        <ChevronsRight size={20} />
      </button>
    </div>
  );
};

export default function ManualViewer() {
  const snap = useSnapshot(state);
  const JPG = "jpg";
  const manualPageUpperLimit = snap.manualPageNumber / 2 + 1;

  // Precompute page URLs at the top level for all possible pages
  const currentPageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/manual/${snap.platform}_${snap.title}_${snap.region}_${snap.edition}_manual_${snap.manualCurrentPage}.${JPG}`
  );

  const nextPageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/manual/${snap.platform}_${
      snap.title
    }_${snap.region}_${snap.edition}_manual_${
      snap.manualCurrentPage + 1
    }.${JPG}`
  );

  // Compute manualPages consistently
  const manualPages = useMemo(() => {
    const pages = [];

    // First and last page should only have 1 page displayed
    // First page
    if (snap.manualCurrentPage === 1) {
      preloadImage(currentPageUrl);
      pages.push(currentPageUrl);
    }
    // Last page
    else if (snap.manualCurrentPage === manualPageUpperLimit) {
      preloadImage(nextPageUrl);
      pages.push(nextPageUrl);
    }
    // Display two middle pages (only if they exist)
    else {
      if (currentPageUrl) {
        preloadImage(currentPageUrl);
        pages.push(currentPageUrl);
      }
      if (nextPageUrl) {
        preloadImage(nextPageUrl);
        pages.push(nextPageUrl);
      }
    }

    return pages;
  }, [
    snap.manualCurrentPage,
    snap.platform,
    snap.title,
    snap.region,
    snap.edition,
    currentPageUrl,
    nextPageUrl,
  ]);

  /* buttons for cover viewer
  Previous Page - Flip back 1 page
  Next Page - Flip forward 1 page
  Zoom In - Zooms in pages (up to zoomLevelLimit)
  Zoom Out - Zooms out pages
  Reset - Reset to original scale
  Close Viewer - Close interface
  */
  const ManualImageButtons = () => {
    // if manual has 4 pages, it has 3 forms: (page1), (page2 + page3), (page4) -> n pages, n/2 + 1 forms
    // const manualPageUpperLimit = snap.manualPageNumber / 2 + 1;

    const handleImageViewerClose = () => {
      state.isImageViewerOpened = false;
    };

    const handlePreviousPage = () => {
      if (snap.manualCurrentPage > 1) {
        state.manualCurrentPage -= 1;
      }
    };

    const handleNextPage = () => {
      if (snap.manualCurrentPage < manualPageUpperLimit) {
        state.manualCurrentPage += 1;
      }
    };

    // Zoom In & Out
    const { zoomIn, zoomOut, resetTransform } = useControls();
    const [zoomLevel, setZoomLevel] = useState(1);
    const zoomLevelLimit = 3;

    const handleZoomIn = () => {
      if (zoomLevel < zoomLevelLimit) {
        zoomIn();
        setZoomLevel((zoomLevel) => zoomLevel + 1);
      }
    };

    const handleZoomOut = () => {
      if (zoomLevel > 1) {
        zoomOut();
        setZoomLevel((zoomLevel) => zoomLevel - 1);
      }
    };

    const handleReset = () => {
      resetTransform();
      setZoomLevel(1);
    };

    const disabledButtonStyle = {
      opacity: 0.5,
      cursor: "not-allowed",
    };

    /* key events
      Q - Close viewer
      A - Flip back 1 page
      D - Flip forward 1 page
      Up Arrow - Zooms in cover (up to zoomLevelLimit)
      Down Arrow - Zooms out cover
      R - Reset to original scale
    */
    useEffect(() => {
      const onKeyDown = (e) => {
        switch (e.key) {
          case "q":
            handleImageViewerClose();
            break;
          case "a":
            handlePreviousPage();
            break;
          case "d":
            handleNextPage();
            break;
          case "ArrowUp":
            handleZoomIn();
            break;
          case "ArrowDown":
            handleZoomOut();
            break;
          case "r":
            handleReset();
            break;
        }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [zoomLevel]);

    return (
      <div className="imageViewerButtons">
        <img src={keyboardIconQ} className="coverViewercontrolsKeys" />
        <button className="buttonText" onClick={handleImageViewerClose}>
          Close Viewer
        </button>

        <img src={keyboardIconD} className="UIcontrolsKeys" />
        <button
          className="buttonText"
          onClick={handleNextPage}
          disabled={snap.manualCurrentPage >= manualPageUpperLimit}
          style={
            snap.manualCurrentPage >= manualPageUpperLimit
              ? disabledButtonStyle
              : {}
          }
        >
          Next Page
        </button>
        <img src={keyboardIconA} className="UIcontrolsKeys" />
        <button
          className="buttonText"
          onClick={handlePreviousPage}
          disabled={snap.manualCurrentPage <= 1}
          style={snap.manualCurrentPage <= 1 ? disabledButtonStyle : {}}
        >
          Previous Page
        </button>

        <img
          src={keyboardIconArrowUp}
          className="coverViewercontrolsKeys"
          alt="Arrow up key"
        />
        <button
          className="buttonText"
          onClick={handleZoomIn}
          disabled={zoomLevel >= zoomLevelLimit}
          style={zoomLevel >= zoomLevelLimit ? disabledButtonStyle : {}}
        >
          Zoom In
        </button>

        <img
          src={keyboardIconArrowDown}
          className="coverViewercontrolsKeys"
          alt="Arrow down key"
        />
        <button
          className="buttonText"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1}
          style={zoomLevel <= 1 ? disabledButtonStyle : {}}
        >
          Zoom Out
        </button>

        <img
          src={keyboardIconR}
          className="coverViewercontrolsKeys"
          alt="R key"
        />
        <button className="buttonText" onClick={handleReset}>
          Reset
        </button>
      </div>
    );
  };

  return (
    <div className="manualViewerContainer">
      <PageNavigation totalPages={snap.manualPageNumber / 2 + 1} />
      <div className="manualViewer">
        <TransformWrapper
          doubleClick={{
            disabled: true,
          }}
          wheel={{
            disabled: true,
          }}
        >
          <TransformComponent>
            {[...manualPages].map((_, index) => (
              <img
                key={index}
                src={manualPages[index]}
                className="manualPage"
                alt={`Manual Page ${index + 1}`}
              />
            ))}
          </TransformComponent>

          {/* buttons */}
          <ManualImageButtons />
        </TransformWrapper>
      </div>
    </div>
  );
}
