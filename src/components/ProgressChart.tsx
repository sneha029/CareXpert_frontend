// src/components/ProgressChart.tsx
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTheme } from "@/context/useTheme";

// ==========================================
// TYPES & INTERFACES
// ==========================================

/**
 * Raw data structure from backend (flexible keys)
 */
interface RawActivityData {
  date?: string;
  day?: string;
  timestamp?: string;
  activity?: number;
  count?: number;
  value?: number;
  activityCount?: number;
  [key: string]: unknown; // Allow additional fields
}

/**
 * Normalized internal data structure (strict format)
 */
interface NormalizedActivityData {
  date: string;
  activityCount: number;
}

interface ProgressChartProps {
  data: RawActivityData[];
  title?: string;
  color?: string;
  showReferenceLine?: boolean;
  referenceValue?: number;
  referenceLabel?: string;
}

// ==========================================
// DATA NORMALIZATION LAYER
// ==========================================

/**
 * Normalizes backend data into consistent internal format
 * - Ensures single consistent key (activityCount)
 * - Coerces all values to numbers
 * - Defaults missing/invalid values to 0
 * - Maintains strict data structure
 */
const normalizeActivityData = (
  rawData: RawActivityData[]
): NormalizedActivityData[] => {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((item) => {
    // Extract date with multiple fallback keys
    const date =
      item.date ||
      item.day ||
      item.timestamp ||
      new Date().toISOString().split("T")[0];

    // Extract activity count with multiple fallback keys
    // Priority: activityCount > activity > count > value > 0
    const activityValue =
      item.activityCount ?? item.activity ?? item.count ?? item.value ?? 0;

    // Ensure numeric coercion and handle edge cases
    const activityCount = Number(activityValue);
    const safeActivityCount = Number.isFinite(activityCount)
      ? Math.max(0, activityCount) // Ensure non-negative
      : 0;

    return {
      date: String(date),
      activityCount: safeActivityCount,
    };
  });
};

// ==========================================
// Y-AXIS DOMAIN CALCULATION
// ==========================================

/**
 * Calculates optimal Y-axis domain with:
 * - Always starts from 0
 * - Dynamically calculates max value
 * - Adds proportional padding (15%)
 * - Handles all-zero datasets gracefully
 */
const calculateYAxisDomain = (
  data: NormalizedActivityData[]
): [number, number] => {
  if (!data || data.length === 0) {
    return [0, 10]; // Default range for empty data
  }

  const values = data.map((d) => d.activityCount);
  const maxValue = Math.max(...values);

  // Handle all-zero dataset
  if (maxValue === 0) {
    return [0, 10]; // Show 0-10 range for visual clarity
  }

  // Add 15% padding above maximum for breathing room
  const padding = maxValue * 0.15;
  const domainMax = Math.ceil(maxValue + padding);

  return [0, domainMax];
};

// ==========================================
// RESPONSIVE HELPER
// ==========================================

/**
 * Determines if viewport is mobile-sized
 */
const useIsMobile = (): boolean => {
  // Use window.innerWidth for responsive detection
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768; // md breakpoint
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ProgressChart({
  data,
  title = "Activity Progress",
  color = "#3b82f6", // Default blue-600
  showReferenceLine = false,
  referenceValue,
  referenceLabel = "Target",
}: ProgressChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isMobile = useIsMobile();

  // ==========================================
  // DATA NORMALIZATION (Step 1)
  // ==========================================
  const normalizedData = useMemo(() => normalizeActivityData(data), [data]);

  // ==========================================
  // Y-AXIS DOMAIN CALCULATION (Step 2)
  // ==========================================
  const yAxisDomain = useMemo(
    () => calculateYAxisDomain(normalizedData),
    [normalizedData]
  );

  // ==========================================
  // THEME-AWARE COLORS
  // ==========================================
  const gridColor = isDark ? "#374151" : "#e5e7eb"; // gray-700 : gray-200
  const textColor = isDark ? "#9ca3af" : "#6b7280"; // gray-400 : gray-500
  const tooltipBg = isDark ? "#1f2937" : "#ffffff"; // gray-800 : white
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb"; // gray-700 : gray-200

  // ==========================================
  // RESPONSIVE REFERENCE LINE POSITIONING (Step 3)
  // ==========================================
  const referenceLineProps = useMemo(() => {
    if (!showReferenceLine || !referenceValue) return null;

    const labelPosition = isMobile ? ("insideTopLeft" as const) : ("insideTopRight" as const);

    return {
      y: referenceValue,
      stroke: isDark ? "#f59e0b" : "#f97316", // amber-500 : orange-500
      strokeDasharray: "5 5",
      strokeWidth: 2,
      label: {
        value: referenceLabel,
        position: labelPosition, // Adjust for mobile
        fill: isDark ? "#fbbf24" : "#ea580c", // amber-400 : orange-600
        fontSize: isMobile ? 10 : 12, // Smaller font on mobile
        fontWeight: 600,
        offset: isMobile ? 5 : 10, // Reduce offset on mobile
      },
    };
  }, [
    showReferenceLine,
    referenceValue,
    referenceLabel,
    isDark,
    isMobile,
  ]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
        <LineChart
          data={normalizedData}
          margin={{
            top: 20,
            right: isMobile ? 10 : 30,
            left: isMobile ? -10 : 0,
            bottom: isMobile ? 10 : 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

          <XAxis
            dataKey="date"
            stroke={textColor}
            fontSize={isMobile ? 10 : 12}
            tickMargin={isMobile ? 5 : 10}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
          />

          <YAxis
            stroke={textColor}
            fontSize={isMobile ? 10 : 12}
            tickMargin={5}
            domain={yAxisDomain}
            allowDecimals={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "8px",
              padding: isMobile ? "6px" : "10px",
              fontSize: isMobile ? "11px" : "14px",
            }}
            labelStyle={{
              color: textColor,
              fontWeight: 600,
              marginBottom: "4px",
            }}
            itemStyle={{
              color: color,
            }}
          />

          {referenceLineProps && <ReferenceLine {...referenceLineProps} />}

          <Line
            type="monotone"
            dataKey="activityCount"
            stroke={color}
            strokeWidth={isMobile ? 2 : 3}
            dot={{
              fill: color,
              r: isMobile ? 3 : 4,
            }}
            activeDot={{
              r: isMobile ? 5 : 6,
              fill: color,
            }}
            name="Activity"
          />
        </LineChart>
      </ResponsiveContainer>

      {normalizedData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No activity data available
        </div>
      )}
    </div>
  );
}

// Utilities are internal to this component file to avoid fast-refresh issues
// (move to a separate file if you need to reuse them elsewhere)

