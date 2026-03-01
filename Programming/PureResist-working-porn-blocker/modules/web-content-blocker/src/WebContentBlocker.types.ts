export type WebContentBlockerAvailabilityResult = {
  available: boolean;
  deviceSupported: boolean;
  error?: string;
};

export type WebContentBlockerAuthorizationResult = {
  status:
    | "approved"
    | "denied"
    | "notDetermined"
    | "unavailable"
    | "error"
    | string;
  error?: string;
};

export type WebContentBlockerSetBlockedDomainsResult = {
  enabled: boolean;
  error?: string;
};

export type WebContentBlockerDisableBlockingResult = {
  disabled: boolean;
  error?: string;
};
