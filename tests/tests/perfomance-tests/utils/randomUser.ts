export interface GeneratedUser {
  name: string;
  email: string;
  password: string;
}

// A distinct user per iteration - purchasing a course is a one-time action
// per user (a repeat purchase gets rejected with 409 Already purchased), so
// each virtual user "client" must be a fresh account.
export function randomUser(): GeneratedUser {
  const unique = `${Date.now()}-${__VU}-${__ITER}-${Math.floor(
    Math.random() * 1_000_000,
  )}`;

  return {
    name: `Perf User ${unique}`,
    email: `perf.user.${unique}@load-test.dojo`,
    password: "Password1",
  };
}
