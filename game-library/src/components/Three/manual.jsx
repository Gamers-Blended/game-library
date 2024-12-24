import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
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

// sounds
import pageFlipSound from "../../assets/sound/page-flip-01a.mp3";

export default function Model() {
  const snap = useSnapshot(state);

  // page geometry
  const PAGE_WIDTH = 1.28;
  const PAGE_HEIGHT = 1.71; // 4:3 aspect ratio
  const PAGE_DEPTH = 0.003;
  const PAGE_SEGMENTS = 30;
  const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

  // page open animation speed
  const easingFactor = 0.5;

  // page flip sound
  const pageFlip = new Audio(pageFlipSound);

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

  // texture and material of a page
  const whiteColor = new Color("white");

  // 6 materials for 6 faces
  // last two will be created dynamically since front and back will change based on page number
  const pageMaterials = [
    new MeshStandardMaterial({
      color: whiteColor,
    }),
    // left side
    new MeshStandardMaterial({
      color: "#111",
    }),
    new MeshStandardMaterial({
      color: whiteColor,
    }),
    new MeshStandardMaterial({
      color: whiteColor,
    }),
  ];

  const manualPages = [
    "ps4_wolfenstein_young_blood_manual_2",
    "ps4_wolfenstein_young_blood_manual_3",
  ];

  // front page
  const pages = [
    {
      front: "ps4_wolfenstein_young_blood_manual_1",
      back: manualPages[0],
    },
  ];

  // middle pages
  for (let i = 1; i < manualPages.length - 1; i += 2) {
    pages.push({
      front: manualPages[i % manualPages.length],
      back: manualPages[(i + 1) % manualPages.length],
    });
  }

  // back page
  pages.push({
    front: manualPages[manualPages.length - 1],
    back: "ps4_wolfenstein_young_blood_manual_4",
  });

  pages.forEach((page) => {
    useTexture.preload(`/models/${page.front}.jpg`);
    useTexture.preload(`/models/${page.back}.jpg`);
  });

  // play a sound whenever a page is flipped
  useEffect(() => {
    pageFlip.play();
  }, [snap.manualCurrentPage]);

  const Page = ({
    number,
    front,
    back,
    pageNumber,
    opened,
    manualClosed,
    ...props
  }) => {
    const [pictureFront, pictureBack] = useTexture([
      `/models/${front}.jpg`,
      `/models/${back}.jpg`,
    ]);

    pictureFront.colorSpace = pictureBack.colorSpace = SRGBColorSpace;
    const group = useRef();
    const skinnedMeshRef = useRef();

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
          roughness: 0.1, // 0 for glossy surfaces
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
    }, []);

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

    return (
      // each page takes a different z location
      <group {...props} ref={group}>
        <primitive
          object={manualSkinnedMesh}
          ref={skinnedMeshRef}
          position-z={-number * PAGE_DEPTH + pageNumber * PAGE_DEPTH}
        />
      </group>
    );
  };

  return (
    <group rotation-y={-Math.PI / 2}>
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          number={index}
          pageNumber={snap.manualCurrentPage}
          opened={snap.manualCurrentPage > index + 1}
          manualClosed={
            snap.manualCurrentPage == 1 ||
            snap.manualCurrentPage == pages.length + 1
          }
          {...pageData}
        />
      ))}
    </group>
  );
}
