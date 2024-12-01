import useDetectScroll from "@smakss/react-scroll-direction";
import { useScrollDirection } from "use-scroll-direction";
import React, { useEffect, useState, useRef } from "react";

export default function Test() {
  const { scrollDir, scrollPosition } = useDetectScroll();

  const {
    scrollDirection,
    isScrolling,
    isScrollingUp,
    isScrollingDown,
    isScrollingLeft,
    isScrollingRight,
  } = useScrollDirection();

  useEffect(() => {
    console.log(scrollDirection);
  }, [scrollDirection]);

  return <div>The user is scrolling: {scrollDir}</div>;
}
