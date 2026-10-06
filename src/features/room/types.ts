export type ActiveObject =
  | "computer"
  | "book"
  | "record"
  | "camera"
  | "door"
  | "window"
  | "drawer"
  | "painting"
  | "sculpture"
  | null;

export type ExhibitId = Exclude<ActiveObject, null>;

export type Environment = "dark" | "studio";

export type GalleryKind = "painting" | "sculpture";

export interface GallerySelection {
  kind: GalleryKind;
  no: string;
}

export type WalkLocation = "room" | "hall";
export type WalkPhase = "idle" | "approach" | "cross" | "arrive";
export type WalkDir = "in" | "out" | null;

export type Mix = [number, number, number];

export interface RoomState {
  active: ActiveObject;
  activeBookId: string | null;
  gallery: GallerySelection | null;
  visited: ExhibitId[];
  environment: Environment;
  muted: boolean;
  playing: boolean;
  switchTouched: boolean;
  enteredAt: number | null;
  doorAjar: boolean;
  location: WalkLocation;
  walkPhase: WalkPhase;
  walkDir: WalkDir;
  seated: boolean;
  toggleSeated: () => void;
  setActive: (next: ActiveObject) => void;
  setActiveBook: (id: string | null) => void;
  setGallery: (kind: GalleryKind, no: string | null) => void;
  toggleEnvironment: () => void;
  setEnvironment: (next: Environment) => void;
  toggleMuted: () => void;
  togglePlaying: () => void;
  close: () => void;
  startWalkIn: () => void;
  startWalkOut: () => void;
}
