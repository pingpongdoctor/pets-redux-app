import { useState, useEffect } from "react";
//DECLARE THE HOOK USE WINDOW SIZE
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}
//FUNCTION CONVERTING A NUMBDER TO AN ARRAY OF ASCENDING ARRAY OF NUMBERS (ex: 4 -> [1,2,3,4])
export const convertNumberToArr = function (number) {
  const arr = [];
  for (let i = 1; i <= number; i++) {
    arr.push(i);
  }
  return arr;
};
