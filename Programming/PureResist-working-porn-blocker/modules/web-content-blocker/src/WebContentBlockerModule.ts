import { requireNativeModule } from "expo";
import type {
  WebContentBlockerAvailabilityResult,
  WebContentBlockerAuthorizationResult,
  WebContentBlockerSetBlockedDomainsResult,
  WebContentBlockerDisableBlockingResult,
} from "./WebContentBlocker.types";

const Native = requireNativeModule("WebContentBlocker");

/**
 * Checks if the device supports Family Controls and ManagedSettings APIs (iOS 16+).
 * @returns {Promise<WebContentBlockerAvailabilityResult>} An object indicating availability and device support.
 */
export async function checkWebContentBlockerAvailability(): Promise<WebContentBlockerAvailabilityResult> {
  return await Native.checkAvailability();
}

/**
 * Requests authorization from the user to enable Family Controls.
 * @returns {Promise<WebContentBlockerAuthorizationResult>} An object with the authorization status and any error.
 */
export async function requestWebContentBlockerAuthorization(): Promise<WebContentBlockerAuthorizationResult> {
  return await Native.requestAuthorization();
}

/**
 * Gets the current Family Controls authorization status.
 * @returns {Promise<WebContentBlockerAuthorizationResult>} An object with the current authorization status.
 */
export async function getWebContentBlockerAuthorizationStatus(): Promise<WebContentBlockerAuthorizationResult> {
  return await Native.getAuthorizationStatus();
}

/**
 * Checks if blocking is currently active.
 * @returns {Promise<boolean>} True if blocking is active, false otherwise.
 */
export async function isWebContentBlockerBlockingActive(): Promise<boolean> {
  return await Native.isBlockingActive();
}

/**
 * Sets the list of domains to block using Family Controls.
 * @param {string[]} domains - The list of domains to block (e.g., ["example.com"]).
 * @returns {Promise<WebContentBlockerSetBlockedDomainsResult>} An object indicating if blocking was enabled and any error.
 */
export async function setWebContentBlockerBlockedDomains(
  domains: string[],
): Promise<WebContentBlockerSetBlockedDomainsResult> {
  return await Native.setBlockedDomains(domains);
}

/**
 * Disables all domain blocking set by Family Controls.
 * @returns {Promise<WebContentBlockerDisableBlockingResult>} An object indicating if blocking was disabled and any error.
 */
export async function disableWebContentBlockerBlocking(): Promise<WebContentBlockerDisableBlockingResult> {
  return await Native.disableBlocking();
}
