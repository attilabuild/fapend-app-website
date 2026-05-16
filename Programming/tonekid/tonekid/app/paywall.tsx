import { router, useNavigation } from "expo-router";
import { Bell, Crown, Unlock } from "lucide-react-native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as WebBrowser from "expo-web-browser";

import { Button } from "@/components/ui";
import { colors } from "@/constants/tokens";
import { useRevenueCat, type Plan } from "@/lib/revenuecat";
import { useApp } from "@/lib/store";
import { scheduleTrialNotifications } from "@/lib/trialNotifications";

const IS_EXPO_GO = Constants.appOwnership === "expo";
const SHOW_DEV_SKIP = __DEV__;

const FALLBACK_MONTHLY = "$9.99";
const FALLBACK_YEARLY = "$49.99";
const FALLBACK_YEARLY_PER_MONTH = "$4.17";

function divideYearly(priceString: string | null): string | null {
  if (!priceString) return null;
  const match = priceString.match(/([^\d.,\-]*)([\d.,]+)([^\d.,]*)/);
  if (!match) return null;
  const [, prefix, num, suffix] = match;

  // Detect locale decimal separator. EU formats use "59,99"; US uses "$59.99".
  // When both are present (e.g. "1.234,56" or "1,234.56") the later separator
  // is the decimal one. When only one is present with 1–2 trailing digits,
  // treat it as the decimal. Anything else is treated as a thousands sep.
  const lastDot = num.lastIndexOf(".");
  const lastComma = num.lastIndexOf(",");
  let decimalSep: "." | "," | null = null;
  if (lastDot >= 0 && lastComma >= 0) {
    decimalSep = lastDot > lastComma ? "." : ",";
  } else if (lastDot >= 0 && /\.\d{1,2}$/.test(num)) {
    decimalSep = ".";
  } else if (lastComma >= 0 && /,\d{1,2}$/.test(num)) {
    decimalSep = ",";
  }

  let normalized: string;
  if (decimalSep === ",") {
    normalized = num.replace(/\./g, "").replace(",", ".");
  } else if (decimalSep === ".") {
    normalized = num.replace(/,/g, "");
  } else {
    normalized = num.replace(/[^\d]/g, "");
  }

  const value = parseFloat(normalized);
  if (Number.isNaN(value)) return null;

  // Re-format with the same decimal separator as the input so EU users see
  // "4,99" rather than "4.99".
  const result = (value / 12).toFixed(2);
  const localized = decimalSep === "," ? result.replace(".", ",") : result;
  return `${prefix}${localized}${suffix}`;
}

export default function PaywallScreen() {
  const navigation = useNavigation();
  const {
    ready,
    isPro,
    monthlyPackage,
    yearlyPackage,
    monthlyPriceString,
    yearlyPriceString,
    refreshOfferings,
    purchase,
    restore,
  } = useRevenueCat();
  const { setDevProOverride } = useApp();
  const [plan, setPlan] = useState<Plan>("yearly");
  const [busy, setBusy] = useState(false);
  const [notifsAllowed, setNotifsAllowed] = useState<boolean | null>(null);

  // Hard paywall: no swipe-to-dismiss, no hardware back, no X button.
  useLayoutEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  // Check notification permission so the timeline only promises a reminder
  // when iOS will actually deliver one.
  useEffect(() => {
    let cancelled = false;
    Notifications.getPermissionsAsync()
      .then((r) => {
        if (!cancelled) setNotifsAllowed(r.status !== "denied");
      })
      .catch(() => {
        if (!cancelled) setNotifsAllowed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (ready && !monthlyPackage && !yearlyPackage) {
      refreshOfferings();
    }
  }, [ready, monthlyPackage, yearlyPackage, refreshOfferings]);

  // If entitlement is already active (or becomes active mid-purchase), enter the app.
  useEffect(() => {
    if (isPro) router.replace("/(tabs)/explore");
  }, [isPro]);

  const billingDate = useMemo(() => {
    const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const monthlyPrice = monthlyPriceString ?? FALLBACK_MONTHLY;
  const yearlyPrice = yearlyPriceString ?? FALLBACK_YEARLY;
  const yearlyPerMonth =
    divideYearly(yearlyPriceString) ?? FALLBACK_YEARLY_PER_MONTH;

  // Both plans ship with a 3-day free trial configured in App Store Connect.
  // We default to true so the badge and CTA show even when the RC package
  // hasn't loaded yet (e.g. Expo Go, no network), and only flip false if RC
  // explicitly reports no introPrice for a loaded package.
  const hasYearlyTrial = useMemo(() => {
    if (!yearlyPackage) return true;
    const intro = yearlyPackage.product.introPrice;
    return Boolean(intro && intro.price === 0);
  }, [yearlyPackage]);
  const hasMonthlyTrial = useMemo(() => {
    if (!monthlyPackage) return true;
    const intro = monthlyPackage.product.introPrice;
    return Boolean(intro && intro.price === 0);
  }, [monthlyPackage]);

  const offeringsMissing = ready && !monthlyPackage && !yearlyPackage;

  const onSubscribe = async () => {
    if (busy) return;
    if (offeringsMissing) {
      Alert.alert(
        "Subscriptions unavailable",
        IS_EXPO_GO
          ? "In-app purchases don't work in Expo Go. Use the dev Skip button or run a development build."
          : "We couldn't load subscription options. Check your internet connection and try again.",
      );
      return;
    }
    setBusy(true);
    const result = await purchase(plan);
    if (result === "success") {
      // Schedule the trial reminder + billing notifications promised in the
      // paywall timeline. Only meaningful for the yearly plan with a free trial,
      // but harmless on monthly (and it cancels first, so no duplicates).
      if (plan === "yearly" && hasYearlyTrial) {
        scheduleTrialNotifications().catch(() => {});
      }
      // Listener + isPro effect will dismiss. Keep busy=true to prevent double-tap.
      return;
    }
    setBusy(false);
    if (result === "cancelled") return;
    Alert.alert(
      "Purchase failed",
      "We could not complete your purchase. Please try again or restore purchases if you already subscribed.",
    );
  };

  const onRestore = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await restore();
    setBusy(false);
    if (ok) {
      router.replace("/(tabs)/explore");
      return;
    }
    Alert.alert(
      "Restore Purchases",
      "No previous purchases were found on this account.",
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <View style={{ minHeight: 12 }} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12 }}
      >
        <Text className="text-ink mt-2 text-[34px] font-extrabold leading-tight tracking-tight">
          Unlock ToneKid to match unlimited guitar tones
        </Text>

        <View className="mt-8">
          <TimelineRow
            Icon={Unlock}
            title="Today"
            desc="Unlock unlimited tone adaptations matched to your exact gear."
            showLine
          />
          {notifsAllowed !== false ? (
            <TimelineRow
              Icon={Bell}
              title="In 1 Day — Reminder"
              desc="If notifications are on, we'll remind you before your trial ends."
              showLine
            />
          ) : null}
          <TimelineRow
            Icon={Crown}
            title="In 3 Days — Billing Starts"
            desc={`You'll be charged on ${billingDate} unless you cancel before.`}
          />
        </View>
      </ScrollView>

      <View
        className="px-6 pb-1 pt-4"
        style={{
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: "#C7C7CC",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: "#FFFFFF",
        }}
      >
        <PricingCard
          plan="yearly"
          price={yearlyPrice}
          perMonth={yearlyPerMonth}
          hasTrial={hasYearlyTrial}
          selected={plan === "yearly"}
          onPress={() => setPlan("yearly")}
        />
        <View className="h-2" />
        <PricingCard
          plan="monthly"
          price={monthlyPrice}
          perMonth={null}
          hasTrial={hasMonthlyTrial}
          selected={plan === "monthly"}
          onPress={() => setPlan("monthly")}
        />

        <View className="mt-3">
          <Button
            label={
              busy
                ? "Processing…"
                : (plan === "yearly" && hasYearlyTrial) ||
                    (plan === "monthly" && hasMonthlyTrial)
                  ? "Try for free 🎁"
                  : "Continue"
            }
            onPress={onSubscribe}
            disabled={busy || !ready}
            fullWidth
          />
        </View>

        <View className="mt-1.5 flex-row items-center justify-center gap-4">
          <Pressable onPress={onRestore} hitSlop={8} className="py-1">
            <Text className="text-ink-muted text-xs underline">Restore</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync("https://tonekid.com/terms")
            }
            hitSlop={8}
            className="py-1"
          >
            <Text className="text-ink-muted text-xs underline">Terms</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync("https://tonekid.com/privacy")
            }
            hitSlop={8}
            className="py-1"
          >
            <Text className="text-ink-muted text-xs underline">Privacy</Text>
          </Pressable>
        </View>

        <Text className="text-ink-muted mt-1 px-2 text-center text-[10px] leading-[13px]">
          Auto-renews until cancelled. Cancel anytime in App Store settings.
        </Text>

        {SHOW_DEV_SKIP ? (
          <View className="items-center">
            <Pressable
              onPress={() => {
                setDevProOverride(true);
                router.replace("/(tabs)/explore");
              }}
              hitSlop={8}
              className="py-1"
            >
              <Text className="text-[10px] uppercase tracking-widest text-amber-600">
                Skip (dev{IS_EXPO_GO ? " · Expo Go" : ""})
              </Text>
            </Pressable>
          </View>
        ) : null}

        {busy ? (
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <View className="bg-ink/5 h-12 w-12 items-center justify-center rounded-full">
              <ActivityIndicator color={colors.ink} />
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function TimelineRow({
  Icon,
  title,
  desc,
  showLine,
}: {
  Icon: typeof Bell;
  title: string;
  desc: string;
  showLine?: boolean;
}) {
  return (
    <View className="flex-row" style={{ minHeight: 84 }}>
      <View className="items-center" style={{ width: 44 }}>
        <View className="bg-ink h-11 w-11 items-center justify-center rounded-full">
          <Icon size={20} color="#fff" strokeWidth={2.2} />
        </View>
        {showLine ? <View className="bg-hairline mt-1 w-0.5 flex-1" /> : null}
      </View>
      <View className="ml-4 flex-1 pb-6">
        <Text className="text-ink text-[18px] font-bold">{title}</Text>
        <Text
          className="text-ink-secondary mt-1 text-[14px] leading-snug"
          numberOfLines={2}
        >
          {desc}
        </Text>
      </View>
    </View>
  );
}

function PricingCard({
  plan,
  price,
  perMonth,
  hasTrial,
  selected,
  onPress,
}: {
  plan: Plan;
  price: string;
  perMonth: string | null;
  hasTrial: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  if (plan === "yearly") {
    return (
      <Pressable onPress={onPress}>
        <View
          className={`overflow-hidden rounded-2xl border-2 ${
            selected ? "border-ink" : "border-[#C7C7CC]"
          }`}
        >
          {hasTrial ? (
            <View
              className={`items-center py-2 ${selected ? "bg-ink" : "bg-surface"}`}
            >
              <Text
                className={`text-[11px] font-extrabold uppercase tracking-widest ${
                  selected ? "text-white" : "text-ink-muted"
                }`}
              >
                3-Day Free Trial
              </Text>
            </View>
          ) : null}
          <View className="bg-bg flex-row items-center px-5 py-4">
            <View className="flex-1">
              <Text className="text-ink text-base font-bold tracking-tight">
                Yearly
              </Text>
              {perMonth ? (
                <Text className="text-ink-muted mt-0.5 text-[11px]">
                  ≈ {perMonth}/month
                </Text>
              ) : null}
            </View>
            <View className="items-end">
              <Text className="text-ink text-xl font-extrabold tracking-tight">
                {price}
                <Text className="text-ink-muted text-sm font-medium">/year</Text>
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <View
        className={`overflow-hidden rounded-2xl border-2 ${
          selected ? "border-ink" : "border-[#C7C7CC]"
        }`}
      >
        {hasTrial ? (
          <View
            className={`items-center py-2 ${selected ? "bg-ink" : "bg-surface"}`}
          >
            <Text
              className={`text-[11px] font-extrabold uppercase tracking-widest ${
                selected ? "text-white" : "text-ink-muted"
              }`}
            >
              3-Day Free Trial
            </Text>
          </View>
        ) : null}
        <View className="bg-bg flex-row items-center px-5 py-4">
          <Text className="text-ink flex-1 text-base font-bold tracking-tight">
            Monthly
          </Text>
          <Text className="text-ink text-xl font-extrabold tracking-tight">
            {price}
            <Text className="text-ink-muted text-sm font-medium">/month</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
