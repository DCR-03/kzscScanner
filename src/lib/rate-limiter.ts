const timestamps: Record<string, number> = {};

/**
 * Simple rate limiter. Waits if the minimum interval hasn't elapsed since the
 * last call for the given key.
 */
export async function rateLimit(
  key: string,
  minIntervalMs: number
): Promise<void> {
  const now = Date.now();
  const last = timestamps[key] || 0;
  const elapsed = now - last;
  if (elapsed < minIntervalMs) {
    await new Promise((r) => setTimeout(r, minIntervalMs - elapsed));
  }
  timestamps[key] = Date.now();
}
