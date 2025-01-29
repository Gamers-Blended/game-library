import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import { state } from "./store";
import { useSnapshot } from "valtio";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { easing } from "maath";
import supabase from "../../config/supabase";
import { preloadImage } from "../utils/imageUtils";

// sounds
import pageFlipSound from "../../assets/sound/page-flip-01a.mp3";

function useManualPages(totalPages, platform, title, region, edition) {
  const [pageUrls, setPageUrls] = useState([]);
  const JPG = "jpg";

  useEffect(() => {
    const fetchPageUrls = async () => {
      const urls = [];
      for (let i = 0; i < totalPages; i += 2) {
        const frontPage = `images/${platform}/${region}/manual/${platform}_${title}_${region}_${edition}_manual_${
          i + 1
        }.${JPG}`;
        const backPage = `images/${platform}/${region}/manual/${platform}_${title}_${region}_${edition}_manual_${
          i + 2
        }.${JPG}`;

        // Fetch the URLs directly using supabase
        const { data: frontData } = await supabase.storage
          .from("game_data")
          .getPublicUrl(frontPage);

        const { data: backData } = await supabase.storage
          .from("game_data")
          .getPublicUrl(backPage);

        // Validate the URLs (check if the images exist)
        const frontUrl = await validateImageUrl(frontData.publicUrl);
        const backUrl = await validateImageUrl(backData.publicUrl);

        urls.push({ front: frontUrl, back: backUrl });
      }
      setPageUrls(urls);
    };

    fetchPageUrls();
  }, [totalPages, platform, title, region, edition]);

  return pageUrls;
}

async function validateImageUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      return url; // URL is valid
    }
  } catch (error) {
    console.error("Error validating image URL:", error);
  }
  return null; // URL is invalid or image does not exist
}

const Page = ({
  number,
  front,
  back,
  pageNumber,
  opened,
  manualClosed,
  ...props
}) => {
  const snap = useSnapshot(state);
  const [pictureFront, pictureBack] = useTexture([front, back]);
  pictureFront.colorSpace = pictureBack.colorSpace = SRGBColorSpace;

  // page geometry 4:3 aspect ratio
  const PAGE_WIDTH = snap.manualWidth;
  const PAGE_HEIGHT = snap.manualHeight;
  const PAGE_DEPTH = 0.003;
  const PAGE_SEGMENTS = 30;
  const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

  // page open animation speed
  const easingFactor = 0.5;

  // texture and material of a page
  const whiteColor = new Color("white");
  const group = useRef();
  const skinnedMeshRef = useRef();

  const pageGeometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    2
  );

  // push pageGeometry such that side is at origin (instead of middle of page)
  pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

  const position = pageGeometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes = []; // bones
  const skinWeights = [];

  // allow pages to bend by adding bones
  for (let i = 0; i < position.count; i++) {
    // go through all positions
    // for each vertex
    // ALL VERTICES
    vertex.fromBufferAttribute(position, i); // get the vertex
    const x = vertex.x; // get the x position of the vertex

    // if near 0 -> 1st bone, further away -> last bone
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH)); // calculate the skin index
    let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH; // calculate the skin weight

    // (1st bone that has impact on vertex, 2nd bone that has impact)
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0); // set the skin indexes
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0); // set the skin weights
  }

  pageGeometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4)
  );
  pageGeometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4) // between 0 & 1
  );

  // 6 materials for 6 faces
  // last two will be created dynamically since front and back will change based on page number
  // Create materials with unique IDs for face detection
  const pageMaterials = useMemo(() => {
    const sideMaterials = [
      new MeshStandardMaterial({ color: whiteColor }),
      new MeshStandardMaterial({ color: "#111" }),
      new MeshStandardMaterial({ color: whiteColor }),
      new MeshStandardMaterial({ color: whiteColor }),
      // Front page material with unique ID
      new MeshStandardMaterial({
        color: whiteColor,
        map: pictureFront,
        roughness: 0.1,
        userData: { isFrontFace: true },
      }),
      // Back page material with unique ID
      new MeshStandardMaterial({
        color: whiteColor,
        map: pictureBack,
        roughness: 0.1,
        userData: { isBackFace: true },
      }),
    ];
    return sideMaterials;
  }, [pictureFront, pictureBack]);

  const manualSkinnedMesh = useMemo(() => {
    const bones = []; // number of bones = number of segments
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      // for each segment, create a bone
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        // 1st bone
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      // if not 1st bone, attach new bone to previous bone
      if (i > 0) {
        bones[i - 1].add(bone); // attach the new bone to the previous bone
      }
    }

    const skeleton = new Skeleton(bones);

    // 4 side faces + front + back
    const materials = [
      ...pageMaterials,
      // front page
      new MeshStandardMaterial({
        color: whiteColor,
        map: pictureFront,
        roughness: 1, // 0 for glossy surfaces
      }),
      // back page
      new MeshStandardMaterial({
        color: whiteColor,
        map: pictureBack,
        roughness: 1, // 0 for glossy surfaces
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]); // add root bone to mesh
    mesh.bind(skeleton);
    return mesh;
  }, [pageMaterials]);

  // Next page if front face clicked
  // Previous page if back face clicked
  const handleClickPage = (event) => {
    event.stopPropagation();
    const manualPageUpperLimit = snap.manualPageNumber / 2 + 1;

    if (event.face) {
      const clickedMaterial = pageMaterials[event.face.materialIndex];

      if (
        clickedMaterial.userData.isFrontFace &&
        snap.manualCurrentPage < manualPageUpperLimit
      ) {
        state.manualCurrentPage += 1;
      } else if (
        clickedMaterial.userData.isBackFace &&
        snap.manualCurrentPage > 1
      ) {
        state.manualCurrentPage -= 1;
      }
    }
  };

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!manualClosed) {
      targetRotation += degToRad(number * 0.8);
    } else if (pageNumber == snap.manualPageNumber / 2 + 1) {
      targetRotation = -Math.PI / 2 + degToRad(number);
    } else {
      targetRotation = Math.PI / 2 + degToRad(number);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;

    easing.dampAngle(
      bones[0].rotation,
      "y",
      targetRotation,
      easingFactor,
      delta
    );
  });

  // cursor icon changes when hovering over Pages
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  return (
    // each page takes a different z location
    <group
      {...props}
      ref={group}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + pageNumber * PAGE_DEPTH}
        onClick={handleClickPage}
      />
    </group>
  );
};

export default function Model() {
  const snap = useSnapshot(state);

  // page flip sound
  const pageFlip = new Audio(pageFlipSound);

  // Use the custom hook to fetch all page URLs
  const pageUrls = useManualPages(
    snap.manualPageNumber,
    snap.platform,
    snap.title,
    snap.region,
    snap.edition
  );

  // Preload textures
  useEffect(() => {
    pageUrls.forEach((page) => {
      if (page.front) {
        preloadImage(page.front);
      }
      if (page.back) {
        preloadImage(page.back);
      }
    });
  }, [pageUrls]);

  // play a sound whenever a page is flipped
  useEffect(() => {
    pageFlip.play();
  }, [snap.manualCurrentPage]);

  return (
    <group rotation-y={-Math.PI / 2}>
      {pageUrls.map((page, index) => (
        <Page
          key={index}
          number={index}
          pageNumber={snap.manualCurrentPage}
          opened={snap.manualCurrentPage > index + 1}
          manualClosed={
            snap.manualCurrentPage == 1 ||
            snap.manualCurrentPage == pageUrls.length + 1
          }
          front={page.front}
          back={page.back}
        />
      ))}
    </group>
  );
}
