"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Bookshelf } from "../objects/Bookshelf";
import { CameraObject } from "../objects/CameraObject";
import { ComputerDesk } from "../objects/ComputerDesk";
import { DoorObject } from "../objects/DoorObject";
import { DrawerObject } from "../objects/DrawerObject";
import { LightSwitch } from "../objects/LightSwitch";
import { RecordPlayer } from "../objects/RecordPlayer";
import { StudyDressing } from "../objects/StudyDressing";
import { WindowView } from "../objects/WindowView";
import { CameraRig } from "./CameraRig";
import { Dust } from "./Dust";
import { EntranceLabel } from "./EntranceLabel";
import { ExhibitMarkers } from "./ExhibitMarkers";
import { GalleryHall } from "./GalleryHall";
import { Lighting } from "./Lighting";
import { RoomShell } from "./RoomShell";

export function RoomScene() {
  return (
    <>
      <CameraRig />
      <Lighting />
      <RoomShell />
      <GalleryHall />
      <ComputerDesk />
      <Bookshelf />
      <RecordPlayer />
      <CameraObject />
      <DoorObject />
      <LightSwitch />
      <WindowView />
      <DrawerObject />
      <StudyDressing />
      <Dust count={320} />
      <ExhibitMarkers />
      <EntranceLabel />
      <EffectComposer multisampling={4}>
        <Bloom
          mipmapBlur
          intensity={0.4}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.2}
        />
        <Vignette offset={0.22} darkness={0.78} eskil={false} />
      </EffectComposer>
    </>
  );
}
