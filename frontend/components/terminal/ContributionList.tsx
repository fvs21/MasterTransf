import React, { useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Contribution } from "@/context/TerminalContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ContributionListProps = {
  contributions: Contribution[];
  isLoading: boolean;
};

// Apple Intelligence-inspired glowing border component
function AppleIntelligenceGlow() {
  // Animation values
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 600, easing: Easing.ease });

    // Continuous flowing gradient progress (0 to 1)
    progress.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Breathing pulse effect
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value * 0.5,
      transform: [{ scale: pulse.value }],
    };
  });

  // Animated border that changes color as it flows clockwise
  const animatedBorderStyle = useAnimatedStyle(() => {
    const cycle = progress.value; // 0 to 1
    
    // Lighter, pastel colors with smooth easing
    // Using easeInOut for smoother transitions
    const easeInOut = (t: number) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };
    
    let r = 0, g = 0, b = 0;
    
    if (cycle < 0.25) {
      // Very Light Purple to Very Light Blue transition
      const t = easeInOut(cycle / 0.25);
      r = 230 + (200 - 230) * t;  // E6 to C8 (Very Light Purple to Very Light Blue)
      g = 220 + (240 - 220) * t;  // DC to F0
      b = 255 + (255 - 255) * t;  // FF to FF
    } else if (cycle < 0.5) {
      // Very Light Blue to Very Light Pink transition
      const t = easeInOut((cycle - 0.25) / 0.25);
      r = 200 + (255 - 200) * t;  // C8 to FF (Very Light Blue to Very Light Pink)
      g = 240 + (210 - 240) * t;  // F0 to D2
      b = 255 + (230 - 255) * t;  // FF to E6
    } else if (cycle < 0.75) {
      // Very Light Pink to Very Light Peach transition
      const t = easeInOut((cycle - 0.5) / 0.25);
      r = 255 + (255 - 255) * t;  // FF to FF (Very Light Pink to Very Light Peach)
      g = 210 + (225 - 210) * t;  // D2 to E1
      b = 230 + (200 - 230) * t;  // E6 to C8
    } else {
      // Very Light Peach to Very Light Purple transition
      const t = easeInOut((cycle - 0.75) / 0.25);
      r = 255 + (230 - 255) * t;  // FF to E6 (Very Light Peach to Very Light Purple)
      g = 225 + (220 - 225) * t;  // E1 to DC
      b = 200 + (255 - 200) * t;  // C8 to FF
    }
    
    const color = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    
    return {
      borderColor: color,
      shadowColor: color,
      opacity: opacity.value,
      transform: [{ scale: pulse.value }],
    };
  });

  return (
    <View style={styles.glowContainer}>
      {/* Animated gradient border */}
      <Animated.View style={[styles.gradientBorder, animatedBorderStyle]} />
    </View>
  );
}
  
export function ContributionList({ contributions, isLoading }: ContributionListProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const isDark = false; // App uses light mode only

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.intelligenceCard}>
          <AppleIntelligenceGlow />
          
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <View style={[styles.emptyIcon, { borderColor: palette.icon + "20" }]}>
                <ThemedText style={styles.emptyIconText}>💳</ThemedText>
              </View>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
              Setting up...
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: palette.tint }]}>
              Please wait...
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  if (contributions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.intelligenceCard}>
          <AppleIntelligenceGlow />
          
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <View style={[styles.emptyIcon, { borderColor: palette.icon + "20" }]}>
                <ThemedText style={styles.emptyIconText}>💳</ThemedText>
              </View>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
              Ready to Receive
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: palette.tint }]}>
              Tap phone to terminal
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: palette.icon }]}>
              Waiting for payment...
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: Contribution; index: number }) => {
    const time = new Date(item.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Gradient colors for modern Apple Intelligence look
    const gradientColors = [
      ["#8B5CF6", "#6366F1"], // Purple to Indigo
      ["#3B82F6", "#06B6D4"], // Blue to Cyan
      ["#EC4899", "#8B5CF6"], // Pink to Purple
      ["#10B981", "#06B6D4"], // Green to Cyan
      ["#F59E0B", "#EC4899"], // Amber to Pink
    ];

    const colorPair = gradientColors[index % gradientColors.length];

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        style={styles.itemWrapper}
      >
        <View style={styles.item}>
          {/* Corner accent design */}
          <View style={styles.cornerAccents}>
            <View
              style={[
                styles.contributionCornerTopLeft,
                {
                  borderTopColor: colorPair[0],
                  borderLeftColor: colorPair[0],
                },
              ]}
            />
            <View
              style={[
                styles.contributionCornerTopRight,
                {
                  borderTopColor: colorPair[1],
                  borderRightColor: colorPair[1],
                },
              ]}
            />
            <View
              style={[
                styles.contributionCornerBottomLeft,
                {
                  borderBottomColor: colorPair[0],
                  borderLeftColor: colorPair[0],
                },
              ]}
            />
            <View
              style={[
                styles.contributionCornerBottomRight,
                {
                  borderBottomColor: colorPair[1],
                  borderRightColor: colorPair[1],
                },
              ]}
            />
          </View>

          {/* Glassmorphism background */}
          <View
            style={[
              styles.glassBackground,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.8)",
              },
            ]}
          />

          {/* Gradient overlay */}
          <View
            style={[
              styles.gradientOverlay,
              {
                opacity: isDark ? 0.15 : 0.08,
              },
            ]}
          >
            <View
              style={[
                styles.gradientStart,
                { backgroundColor: colorPair[0] },
              ]}
            />
            <View
              style={[
                styles.gradientEnd,
                { backgroundColor: colorPair[1] },
              ]}
            />
          </View>

          {/* Content */}
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <View style={styles.nameContainer}>
                <View
                  style={[
                    styles.avatarDot,
                    { backgroundColor: colorPair[0] },
                  ]}
                />
                <ThemedText type="defaultSemiBold" style={styles.name}>
                  {item.name}
                </ThemedText>
              </View>
              <View style={styles.amountContainer}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.amount,
                    { color: isDark ? "#A7F3D0" : "#059669" },
                  ]}
                >
                  +${item.amount.toFixed(2)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.itemFooter}>
              <ThemedText style={[styles.time, { color: palette.icon }]}>
                {time}
              </ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(134, 239, 172, 0.15)"
                      : "rgba(16, 185, 129, 0.1)",
                  },
                ]}
              >
                <View style={styles.statusDot} />
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: isDark ? "#86EFAC" : "#059669" },
                  ]}
                >
                  Received
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <FlatList
      data={contributions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    padding: 24,
  },
  intelligenceCard: {
    position: "relative",
    flex: 1,
    borderRadius: 32,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 36,
    elevation: 24,
  },
  glowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  glowOuter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    backgroundColor: "transparent",
  },
  // Animated gradient border
  gradientBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#D8C1FD",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    elevation: 10,
  },
  // Secondary flowing segments (slightly offset for smoother blend)
  flowingSegment1Secondary: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "#A78BFA",
    shadowColor: "#A78BFA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
  },
  flowingSegment2Secondary: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "#60A5FA",
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
  },
  flowingSegment3Secondary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "#F472B6",
    shadowColor: "#F472B6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
  },
  flowingSegment4Secondary: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "#22D3EE",
    shadowColor: "#22D3EE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
  },
  // Corner pieces - blend colors at intersections
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 5,
    height: 5,
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 5,
    height: 5,
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 5,
    height: 5,
    backgroundColor: "#EC4899",
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 5,
    height: 5,
    backgroundColor: "#06B6D4",
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  emptyContent: {
    flex: 1,
    position: "relative",
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 16,
    paddingBottom: 8,
  },
  itemWrapper: {
    position: "relative",
  },
  item: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 90,
  },
  cornerAccents: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  contributionCornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 20,
  },
  contributionCornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 20,
  },
  contributionCornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 20,
  },
  contributionCornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 20,
  },
  glassBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  gradientStart: {
    position: "absolute",
    top: 0,
    left: 0,
    right: "50%",
    bottom: 0,
    opacity: 0.6,
  },
  gradientEnd: {
    position: "absolute",
    top: 0,
    left: "50%",
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  itemContent: {
    position: "relative",
    zIndex: 2,
    padding: 18,
    gap: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  name: {
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    fontSize: 13,
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
