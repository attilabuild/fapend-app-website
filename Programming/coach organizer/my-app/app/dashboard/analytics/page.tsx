"use client";

import { MOCK_ANALYTICS } from "@/lib/mockData";

export default function AnalyticsPage() {
  const { completionRateByClient, avgOnboardingDays, dropOffSteps, inactiveClients } =
    MOCK_ANALYTICS;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-normal tracking-[-0.01em] md:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-gray-500">
          Useful signals. No chart overload.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Average onboarding time */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-sm font-medium text-gray-500">
            Average time to finish onboarding
          </h2>
          <p className="mt-2 text-3xl font-normal">{avgOnboardingDays} days</p>
        </div>

        {/* Completion rate per client */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-sm font-medium text-gray-500">
            Completion rate per client
          </h2>
          <ul className="space-y-3">
            {completionRateByClient.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-500">{item.rate}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Drop-off points */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-sm font-medium text-gray-500">
            Drop-off points
          </h2>
          <p className="mb-4 text-xs text-gray-400">
            Steps where clients most often stop
          </p>
          <ul className="space-y-3">
            {dropOffSteps.map((item) => (
              <li
                key={item.step}
                className="flex items-center justify-between gap-4"
              >
                <span className="font-medium">{item.step}</span>
                <span className="text-gray-500">{item.count} clients</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Inactive clients */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 text-sm font-medium text-gray-500">
            Clients inactive for 3+ days
          </h2>
          <ul className="space-y-3">
            {inactiveClients.length > 0 ? (
              inactiveClients.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-amber-600">{item.days} days</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">None</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
