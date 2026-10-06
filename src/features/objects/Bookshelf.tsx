"use client";

import { useState } from "react";
import booksRaw from "../../content/books.json";
import { bookSchema } from "../../types/content";
import { useRoomStore } from "../room/store";

const books = booksRaw.map((b) => bookSchema.parse(b));

export function Bookshelf() {
  const setActiveBook = useRoomStore((s) => s.setActiveBook);
  const activeBookId = useRoomStore((s) => s.activeBookId);
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <group position={[2.5, 0, 0.2]} rotation={[0, -Math.PI / 2.6, 0]}>
      {/* frame */}
      <mesh position={[0, 1.1, -0.25]} castShadow>
        <boxGeometry args={[1.9, 2.2, 0.12]} />
        <meshStandardMaterial color="#1c1712" roughness={0.85} />
      </mesh>
      {[0.45, 1.1, 1.75].map((y) => (
        <mesh key={y} position={[0, y, 0.02]}>
          <boxGeometry args={[1.7, 0.06, 0.55]} />
          <meshStandardMaterial color="#2a2118" roughness={0.8} />
        </mesh>
      ))}
      {books.map((book) => {
        const x = -0.6 + books.indexOf(book) * 0.38;
        const selected = activeBookId === book.no;
        return (
          <mesh
            key={book.no}
            position={[x, selected ? 1.35 : 1.28, selected ? 0.28 : 0.05]}
            rotation={[0, selected ? 0.35 : 0, selected ? -0.18 : 0]}
            onClick={(e) => {
              e.stopPropagation();
              setActiveBook(selected ? null : book.no);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoverId(book.no);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHoverId(null);
              document.body.style.cursor = "auto";
            }}
            castShadow
          >
            <boxGeometry args={[0.28, 0.62, 0.4]} />
            <meshStandardMaterial
              color={book.color}
              roughness={0.75}
              emissive="#ffffff"
              emissiveIntensity={selected ? 0.25 : hoverId === book.no ? 0.12 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}
