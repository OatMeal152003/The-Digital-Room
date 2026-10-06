// Timestamps of the last fired micro-event, written by the scheduler and
// consumed inside useFrame loops. Zero means "never".
export const roomEvents = {
  flickerAt: 0,
  pulseAt: 0,
  breathAt: 0,
  gustAt: 0,
  skipAt: 0,
};
