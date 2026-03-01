import { POSTHOG_API_KEY, POSTHOG_HOST } from "config";
import PostHog from "posthog-react-native";

export const posthog = new PostHog(POSTHOG_API_KEY, {
  host: POSTHOG_HOST,
});

export const POST_HOG_EVENTS = {
  SIGN_IN: "sign_in",
  INITIATE_PURCHASE: "initiate_purchase",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_COMPLETED: "purchase_completed",
  PURCHASE_ERROR: "purchase_error",
  RESTORE_COMPLETED: "restore_completed",
  PAYWALL_DISMISSED: "paywall_dismissed",
  SURVEY_PROBLEM_RECOGNITION: "survey_problem_recognition",
  SURVEY_HABIT_DURATION: "survey_habit_duration",
  SURVEY_EMOTIONAL_CONSEQUENCES: "survey_emotional_consequences",
  SURVEY_IDENTITY_CONFLICT: "survey_identity_conflict",
  SURVEY_ACTUAL_LOSS_OF_CONTROL: "survey_actual_loss_of_control",
  SURVEY_TRIGGERS: "survey_triggers",
  SURVEY_FAILED_ATTEMPTS: "survey_failed_attempts",
  SURVEY_TIME_SPENT: "survey_time_spent",
  SURVEY_SUCCESS_VISION: "survey_success_vision",
  SURVEY_READY_FOR_CHALLENGE: "survey_ready_for_challenge",
};

export const POST_HOG_SCREENS = {
  WELCOME: "welcome",
  AUTH: "auth",
  ONBOARDING: "onboarding",
  PAYWALL: "paywall",
};

export const captureScreen = (
  screen: string,
  properties?: Record<string, any>,
) => {
  if (!__DEV__) {
    posthog.screen(screen, properties);
  }
};

export const captureEvent = (
  event: string,
  properties?: Record<string, any>,
) => {
  if (!__DEV__) {
    posthog.capture(event, properties);
  }
};
