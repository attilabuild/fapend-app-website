"use client";

import Link from "next/link";
import { MOCK_FLOWS } from "@/lib/mockData";

const TEMPLATE_ICONS: Record<string, string> = {
  "1": "1:1",
  "2": "12w",
  "3": "VIP",
};

const TEMPLATE_COLORS: Record<string, string> = {
  "1": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "2": "bg-sky-50 border-sky-200 text-sky-700",
  "3": "bg-violet-50 border-violet-200 text-violet-700",
};

export default function FlowsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-normal tracking-[-0.01em] md:text-3xl">
            Coaching flows
          </h1>
          <p className="mt-1 text-gray-500">
            Choose a template, then edit steps and copy. No complex builder.
          </p>
        </div>
      </div>

      {/* Template chooser */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Choose a template
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {MOCK_FLOWS.map((flow) => (
            <Link
              key={flow.id}
              href={`/dashboard/flows/${flow.id}`}
              className={`group relative rounded-2xl border-2 p-6 transition-all hover:shadow-md ${
                TEMPLATE_COLORS[flow.id] ?? "bg-gray-50 border-gray-200 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-sm font-bold">
                  {TEMPLATE_ICONS[flow.id] ?? "?"}
                </span>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    {flow.title}
                  </h3>
                  <p className="text-xs text-gray-500">{flow.stepCount} steps</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">{flow.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {flow.steps.slice(0, 4).map((step) => (
                  <span
                    key={step.id}
                    className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                  >
                    {step.title.length > 20
                      ? step.title.slice(0, 20) + "…"
                      : step.title}
                  </span>
                ))}
                {flow.steps.length > 4 && (
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                    +{flow.steps.length - 4} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
