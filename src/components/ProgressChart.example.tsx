// src/components/ProgressChart.example.tsx
// This file demonstrates usage examples of the ProgressChart component

import ProgressChart from "./ProgressChart";

// ==========================================
// EXAMPLE 1: Basic Usage with Normalized Data
// ==========================================
export function BasicProgressChartExample() {
  const data = [
    { date: "2024-01-01", activityCount: 45 },
    { date: "2024-01-02", activityCount: 52 },
    { date: "2024-01-03", activityCount: 48 },
    { date: "2024-01-04", activityCount: 61 },
    { date: "2024-01-05", activityCount: 55 },
    { date: "2024-01-06", activityCount: 67 },
    { date: "2024-01-07", activityCount: 59 },
  ];

  return (
    <div className="p-4">
      <ProgressChart 
        data={data} 
        title="Weekly Activity" 
      />
    </div>
  );
}

// ==========================================
// EXAMPLE 2: Backend Data with Multiple Key Formats (Auto-Normalized)
// ==========================================
export function MixedKeyFormatExample() {
  // This demonstrates the normalization layer handling different key formats
  const backendData = [
    { date: "Mon", activity: 30 }, // Uses 'activity' key
    { day: "Tue", count: 45 },     // Uses 'day' and 'count' keys
    { timestamp: "Wed", value: 38 }, // Uses 'timestamp' and 'value' keys
    { date: "Thu", activityCount: 52 }, // Uses standard 'activityCount' key
    { date: "Fri" }, // Missing activity data (defaults to 0)
    { date: "Sat", activity: 61 },
    { date: "Sun", count: 48 },
  ];

  return (
    <div className="p-4">
      <ProgressChart 
        data={backendData}
        title="Mixed Format Data (Auto-Normalized)"
        color="#10b981" // green-500
      />
    </div>
  );
}

// ==========================================
// EXAMPLE 3: All-Zero Dataset (Edge Case)
// ==========================================
export function AllZeroDataExample() {
  const zeroData = [
    { date: "Day 1", activityCount: 0 },
    { date: "Day 2", activityCount: 0 },
    { date: "Day 3", activityCount: 0 },
    { date: "Day 4", activityCount: 0 },
    { date: "Day 5", activityCount: 0 },
  ];

  return (
    <div className="p-4">
      <ProgressChart 
        data={zeroData}
        title="All Zero Dataset (Handled Gracefully)"
        color="#ef4444" // red-500
      />
    </div>
  );
}

// ==========================================
// EXAMPLE 4: High Spike Values (Domain Padding)
// ==========================================
export function HighSpikeExample() {
  const spikeData = [
    { date: "Week 1", activityCount: 20 },
    { date: "Week 2", activityCount: 25 },
    { date: "Week 3", activityCount: 180 }, // High spike
    { date: "Week 4", activityCount: 30 },
    { date: "Week 5", activityCount: 22 },
  ];

  return (
    <div className="p-4">
      <ProgressChart 
        data={spikeData}
        title="High Spike Data (15% Padding Applied)"
        color="#8b5cf6" // violet-500
      />
    </div>
  );
}

// ==========================================
// EXAMPLE 5: With Reference Line (Target)
// ==========================================
export function WithReferenceLineExample() {
  const data = [
    { date: "Jan", activityCount: 45 },
    { date: "Feb", activityCount: 52 },
    { date: "Mar", activityCount: 48 },
    { date: "Apr", activityCount: 61 },
    { date: "May", activityCount: 55 },
    { date: "Jun", activityCount: 67 },
  ];

  return (
    <div className="p-4">
      <ProgressChart 
        data={data}
        title="Monthly Activity with Target"
        color="#0ea5e9" // sky-500
        showReferenceLine={true}
        referenceValue={60}
        referenceLabel="Monthly Target"
      />
    </div>
  );
}

// ==========================================
// EXAMPLE 6: Empty Dataset
// ==========================================
export function EmptyDataExample() {
  return (
    <div className="p-4">
      <ProgressChart 
        data={[]}
        title="Empty Dataset (Shows Message)"
      />
    </div>
  );
}

// ==========================================
// EXAMPLE 7: Custom Colors and Styling
// ==========================================
export function CustomColorExample() {
  const data = [
    { date: "Q1", activityCount: 120 },
    { date: "Q2", activityCount: 145 },
    { date: "Q3", activityCount: 132 },
    { date: "Q4", activityCount: 168 },
  ];

  return (
    <div className="p-4">
      <ProgressChart 
        data={data}
        title="Quarterly Performance"
        color="#f59e0b" // amber-500
        showReferenceLine={true}
        referenceValue={150}
        referenceLabel="Target"
      />
    </div>
  );
}

// ==========================================
// EXAMPLE 8: Real-world API Response Simulation
// ==========================================
export function ApiResponseExample() {
  // Simulates a real backend API response with inconsistent structure
  const apiResponse = [
    { date: "2024-02-20", appointments: 12, activity: 12 },
    { date: "2024-02-21", appointments: 15 }, // Missing activity
    { date: "2024-02-22", count: 18 },
    { date: "2024-02-23", value: 14 },
    { date: "2024-02-24", activityCount: 20 },
    { date: "2024-02-25", activity: 16 },
    { date: "2024-02-26", appointments: 22, count: 22 },
  ];

  return (
    <div className="p-4">
      <ProgressChart 
        data={apiResponse}
        title="Patient Activity (Real API Data)"
        color="#06b6d4" // cyan-500
        showReferenceLine={true}
        referenceValue={18}
        referenceLabel="Weekly Average"
      />
    </div>
  );
}

// ==========================================
// COMPLETE DASHBOARD EXAMPLE
// ==========================================
export function DashboardWithChartsExample() {
  const patientActivityData = [
    { date: "Mon", activityCount: 34 },
    { date: "Tue", activityCount: 41 },
    { date: "Wed", activityCount: 38 },
    { date: "Thu", activityCount: 52 },
    { date: "Fri", activityCount: 46 },
    { date: "Sat", activityCount: 29 },
    { date: "Sun", activityCount: 33 },
  ];

  const appointmentData = [
    { date: "Week 1", count: 45 },
    { date: "Week 2", count: 52 },
    { date: "Week 3", count: 48 },
    { date: "Week 4", count: 61 },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard Analytics
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Patient Activity Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <ProgressChart 
            data={patientActivityData}
            title="Patient Activity (This Week)"
            color="#3b82f6" // blue-600
            showReferenceLine={true}
            referenceValue={40}
            referenceLabel="Daily Target"
          />
        </div>

        {/* Appointments Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <ProgressChart 
            data={appointmentData}
            title="Appointments (Monthly)"
            color="#10b981" // green-500
            showReferenceLine={true}
            referenceValue={55}
            referenceLabel="Monthly Goal"
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// EXAMPLE 10: Testing Responsive Behavior
// ==========================================
export function ResponsiveExample() {
  const data = [
    { date: "2024-01-15", activityCount: 45 },
    { date: "2024-01-16", activityCount: 52 },
    { date: "2024-01-17", activityCount: 48 },
    { date: "2024-01-18", activityCount: 61 },
    { date: "2024-01-19", activityCount: 55 },
    { date: "2024-01-20", activityCount: 67 },
    { date: "2024-01-21", activityCount: 59 },
    { date: "2024-01-22", activityCount: 63 },
  ];

  return (
    <div className="p-4">
      <div className="max-w-sm mx-auto"> {/* Mobile simulator */}
        <ProgressChart 
          data={data}
          title="Mobile Responsive Chart"
          color="#ec4899" // pink-500
          showReferenceLine={true}
          referenceValue={60}
          referenceLabel="Target"
        />
      </div>
    </div>
  );
}
