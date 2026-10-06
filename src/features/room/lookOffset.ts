// Mutable, non-reactive look offset written by touch handlers and
// consumed + decayed by CameraRig. Kept outside React to avoid
// re-renders on every touchmove.
export const lookOffset = { x: 0, y: 0 };
