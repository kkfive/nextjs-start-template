export function getEnv(): Env {
  // eslint-disable-next-line node/prefer-global/process
  return process.env as unknown as Env
}
