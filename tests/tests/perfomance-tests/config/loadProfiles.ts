import { Stage } from "k6/options";

// Tuned for a local Next.js dev server + local MariaDB instance, not a
// production deployment. Raise these via the VUS env var if you are load
// testing a real server.
const AVERAGE_VUS = Number(__ENV.VUS || 5);
const STRESS_VUS = AVERAGE_VUS * 2;
const SOAK_VUS = AVERAGE_VUS;
const SPIKE_VUS = AVERAGE_VUS * 4;
const STEP = AVERAGE_VUS;

export const average: Stage[] = [
  { duration: "15s", target: AVERAGE_VUS },
  { duration: "1m", target: AVERAGE_VUS },
  { duration: "15s", target: AVERAGE_VUS },
];

export const stress: Stage[] = [
  { duration: "30s", target: STRESS_VUS }, // Ramp-up
  { duration: "1m", target: STRESS_VUS },
  { duration: "30s", target: STRESS_VUS }, // Ramp-down
];

export const soak: Stage[] = [
  { duration: "15s", target: SOAK_VUS }, // Ramp-up
  { duration: "2m", target: SOAK_VUS },
  { duration: "15s", target: SOAK_VUS }, // Ramp-down
];

export const spike: Stage[] = [
  { duration: "10s", target: AVERAGE_VUS }, // Ramp-up
  { duration: "5s", target: SPIKE_VUS }, // Instant increase
  { duration: "10s", target: SPIKE_VUS }, // Retention time
  { duration: "5s", target: AVERAGE_VUS }, // Sharp decline back to average
  { duration: "20s", target: AVERAGE_VUS }, // Recovery stage
  { duration: "10s", target: 0 }, // Ramp-down
];

export const breakpoint: Stage[] = [
  { duration: "10s", target: AVERAGE_VUS },
  { duration: "20s", target: AVERAGE_VUS },

  { duration: "10s", target: STRESS_VUS },
  { duration: "20s", target: STRESS_VUS },

  { duration: "10s", target: STRESS_VUS + STEP },
  { duration: "20s", target: STRESS_VUS + STEP },

  { duration: "10s", target: STRESS_VUS + STEP * 2 },
  { duration: "20s", target: STRESS_VUS + STEP * 2 },

  { duration: "10s", target: STRESS_VUS + STEP * 3 },
  { duration: "20s", target: STRESS_VUS + STEP * 3 },
];
