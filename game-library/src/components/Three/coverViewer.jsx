import React, { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { state } from "./store";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import parse from "html-react-parser";
import supabase from "../../config/supabase";

import coverFlipSound from "../../assets/sound/page-flip-01a.mp3";
import textViewerOpenSound from "../../assets/sound/open-textviewer.mp3";
import keyboardIconQ from "../../assets/icons/icons8-q-key-96.png";
import keyboardIconE from "../../assets/icons/icons8-e-key-96.png";
import keyboardIconR from "../../assets/icons/icons8-r-key-96.png";
import keyboardIconArrowUp from "../../assets/icons/icons8-page-up-button-96.png";
import keyboardIconArrowDown from "../../assets/icons/icons8-page-down-button-96.png";

export default function CoverViewer() {
  const snap = useSnapshot(state);
  const COVER_TEXT = snap.coverText;
  const COVER_WIDTH = snap.coverWidth;
  const COVER_HEIGHT = snap.coverHeight;
  const JPG = "jpg";
  const [isFrontCover, setIsFrontCover] = useState(true);
  // View Current Cover Text
  const [isTextViewerOpen, setIsTextViewerOpen] = useState(false);
  const textViewerOpenAudio = new Audio(textViewerOpenSound);
  // Flip Cover
  const coverFlipAudio = new Audio(coverFlipSound);

  // Utility to get base URL pattern
  async function getStorageBaseUrl() {
    const { data } = await supabase.storage.from("game_data").getPublicUrl("");

    // Remove the trailing slash if any
    return data.publicUrl.replace(/\/$/, "");
  }

  // Optimize image loading
  function preloadImage(url) {
    const img = new Image();
    img.src = url;
  }

  function useValidatedSupabaseImage(path) {
    const [baseUrl, setBaseUrl] = useState("");
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
      const validateAndSetUrl = async () => {
        const url = await getStorageBaseUrl();
        const fullUrl = `${url}/${path}`;

        // Validate image loads correctly
        const img = new Image();
        img.onload = () => {
          setIsValid(true);
          setBaseUrl(url);
        };
        img.onerror = () => {
          setIsValid(false);
          setBaseUrl("");
        };
        img.src = fullUrl;
      };

      validateAndSetUrl();
    }, [path]);

    return baseUrl && isValid ? `${baseUrl}/${path}` : null;
  }

  // function to toggle text viewer
  const handleTextViewer = () => {
    setIsTextViewerOpen((isTextViewerOpen) => {
      if (!isTextViewerOpen) {
        textViewerOpenAudio.volume = 0.3;
        textViewerOpenAudio.play();
        return true;
      } else {
        return false;
      }
    });
  };

  // function to toggle front and reverse covers
  const handleCoverFlip = () => {
    if (backCoverImageUrl) {
      console.log(backCoverImageUrl);
      setIsFrontCover((isFrontCover) => !isFrontCover);
      coverFlipAudio.volume = 0.3;
      coverFlipAudio.play();
    }
  };

  const frontCoverImageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/cover/${snap.platform}_${snap.title}_${snap.region}_${snap.edition}.${JPG}`
  );

  const backCoverImageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/cover/${snap.platform}_${snap.title}_${snap.region}_${snap.edition}_reverse_cover.${JPG}`
  );

  useEffect(() => {
    if (frontCoverImageUrl) {
      preloadImage(frontCoverImageUrl);
    }

    if (backCoverImageUrl) {
      preloadImage(backCoverImageUrl);
    }
  }, [frontCoverImageUrl, backCoverImageUrl]);

  /* buttons for cover viewer
  View Current Cover Text - View text
  Flip Cover - Flip cover
  Zoom In - Zooms in cover (up to zoomLevelLimit)
  Zoom Out - Zooms out cover
  Reset - Reset to original scale
  Go Back - Close interface
  */
  const CoverImageButtons = () => {
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
    Q - View text
    E - Flip cover
    Up Arrow - Zooms in cover (up to zoomLevelLimit)
    Down Arrow - Zooms out cover
    R - Reset to original scale
    */
    useEffect(() => {
      const onKeyDown = (e) => {
        switch (e.key) {
          case "q":
            handleTextViewer();
            break;
          case "e":
            handleCoverFlip();
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
      <div className="coverViewerButtons">
        <img
          src={keyboardIconQ}
          className="coverViewercontrolsKeys"
          alt="Q key"
        />
        <button className="buttonText" onClick={handleTextViewer}>
          {isTextViewerOpen ? "Close Cover Text" : "View Cover Text"}
        </button>

        {backCoverImageUrl && (
          <>
            <img
              src={keyboardIconE}
              className="coverViewercontrolsKeys"
              alt="E key"
            />
            <button className="buttonText" onClick={handleCoverFlip}>
              Flip Cover
            </button>
          </>
        )}

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
    <div className="coverViewer">
      {/* text viewer */}
      {isTextViewerOpen && (
        <div className="coverTextViewerBackground">
          <div className="coverTextViewerTextArea">{parse(COVER_TEXT)}</div>;
        </div>
      )}

      {/* cover viewer */}
      <div className="coverImage">
        <TransformWrapper
          doubleClick={{
            disabled: true,
          }}
          wheel={{
            disabled: true,
          }}
        >
          <TransformComponent>
            <img
              src={
                isFrontCover || !backCoverImageUrl
                  ? frontCoverImageUrl
                  : backCoverImageUrl
              }
              width={COVER_WIDTH}
              height={COVER_HEIGHT}
            />
          </TransformComponent>

          {/* buttons */}
          <CoverImageButtons />
        </TransformWrapper>
      </div>
    </div>
  );
}
