import { useEffect, useState, useRef } from "react";

export default function useNativeInvoke() {
  useEffect(() => {
    return () => {};
  }, []);

  return {
    invoke: () => {},
  };
}
