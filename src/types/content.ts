import { z } from "zod";

export const exhibitSchema = z.object({
  no: z.string(),
  title: z.string(),
  medium: z.string(),
  year: z.string(),
  note: z.string(),
});

export const bookSchema = z.object({
  no: z.string(),
  title: z.string(),
  medium: z.string(),
  year: z.string(),
  note: z.string(),
  color: z.string(),
});

export const trackSchema = z.object({
  no: z.string(),
  title: z.string(),
  medium: z.string(),
  year: z.string(),
});

export const momentSchema = z.object({
  no: z.string(),
  title: z.string(),
  medium: z.string(),
  year: z.string(),
  note: z.string(),
});

export const signalSchema = z.object({
  no: z.string(),
  label: z.string(),
  note: z.string(),
});

export const rotationSchema = z.object({
  no: z.string(),
  title: z.string(),
  medium: z.string(),
  year: z.string(),
  note: z.string(),
  until: z.string(),
});

export const paintingSchema = exhibitSchema.extend({
  seed: z.number(),
  palette: z.tuple([z.string(), z.string(), z.string()]),
  image: z.string().optional(),
});

export const sculptureSchema = exhibitSchema.extend({
  form: z.enum(["knot", "stack", "twin"]),
});

export type Exhibit = z.infer<typeof exhibitSchema>;
export type Book = z.infer<typeof bookSchema>;
export type Track = z.infer<typeof trackSchema>;
export type Moment = z.infer<typeof momentSchema>;
export type Signal = z.infer<typeof signalSchema>;
export type Rotation = z.infer<typeof rotationSchema>;
export type Painting = z.infer<typeof paintingSchema>;
export type Sculpture = z.infer<typeof sculptureSchema>;
