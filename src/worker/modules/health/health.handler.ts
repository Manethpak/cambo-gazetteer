/**
 * Health check handler - Business logic for health endpoints
 */

import type { HealthResponse } from "../../types";

/**
 * Get health status of the API
 */
export function getHealthStatus(): HealthResponse {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}
