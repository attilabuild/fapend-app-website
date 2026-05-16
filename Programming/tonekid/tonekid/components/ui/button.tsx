import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  subtitle?: string;
  loading?: boolean;
}

const variantClasses: Record<
  Variant,
  { bg: string; text: string; pressed: string }
> = {
  primary: { bg: "bg-ink", text: "text-white", pressed: "bg-ink-pressed" },
  secondary: {
    bg: "bg-surface",
    text: "text-ink",
    pressed: "bg-surface-elevated",
  },
  ghost: { bg: "bg-transparent", text: "text-ink", pressed: "bg-surface" },
  danger: { bg: "bg-danger", text: "text-white", pressed: "bg-danger" },
};

const sizeClasses: Record<Size, { py: string; px: string; text: string }> = {
  sm: { py: "py-2", px: "px-4", text: "text-sm" },
  md: { py: "py-3", px: "px-5", text: "text-base" },
  lg: { py: "py-4", px: "px-6", text: "text-base" },
};

export function Button({
  label,
  variant = "primary",
  size = "lg",
  fullWidth,
  leftIcon,
  rightIcon,
  subtitle,
  loading,
  disabled,
  ...rest
}: ButtonProps) {
  const v = variantClasses[variant];
  const s = sizeClasses[size];
  return (
    <Pressable
      disabled={disabled || loading}
      {...rest}
      className={`${fullWidth ? "w-full" : ""} ${disabled ? "opacity-40" : ""}`}
    >
      {({ pressed }) => (
        <View
          className={`flex-row items-center justify-center rounded-full ${pressed ? v.pressed : v.bg} ${s.py} ${s.px}`}
        >
          {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
          <View className="flex-1 items-center">
            {loading ? (
              <ActivityIndicator
                color={
                  variant === "primary" || variant === "danger"
                    ? "#FFFFFF"
                    : "#0A0A0A"
                }
              />
            ) : (
              <>
                <Text
                  className={`${v.text} ${s.text} font-bold tracking-tight`}
                >
                  {label}
                </Text>
                {subtitle ? (
                  <Text className={`${v.text} text-xs opacity-80`}>
                    {subtitle}
                  </Text>
                ) : null}
              </>
            )}
          </View>
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}
