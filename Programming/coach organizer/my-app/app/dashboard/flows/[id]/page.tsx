"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_FLOWS, type MockFlowStep } from "@/lib/mockData";

const STEP_TYPE_LABELS: Record<MockFlowStep["type"], { label: string; color: string }> = {
  welcome: { label: "Welcome", color: "bg-emerald-100 text-emerald-800" },
  task: { label: "Task", color: "bg-sky-100 text-sky-800" },
  milestone: { label: "Milestone", color: "bg-violet-100 text-violet-800" },
  checkin: { label: "Check-in", color: "bg-amber-100 text-amber-800" },
  feedback: { label: "Feedback", color: "bg-rose-100 text-rose-800" },
};

let nextStepId = 100;

export default function FlowEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const flow = MOCK_FLOWS.find((f) => f.id === id);

  const [steps, setSteps] = useState<MockFlowStep[]>(
    flow?.steps ?? [
      { id: "1", title: "Welcome message", type: "welcome", copy: "" },
      { id: "2", title: "Intro task", type: "task", copy: "" },
    ]
  );
  const [saved, setSaved] = useState(false);

  if (!flow) {
    return (
      <div className="space-y-8">
        <Link
          href="/dashboard/flows"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← Back to flows
        </Link>
        <p className="text-gray-500">Flow not found.</p>
      </div>
    );
  }

  const updateStep = (stepId: string, field: "title" | "copy", value: string) => {
    setSaved(false);
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, [field]: value } : s))
    );
  };

  const changeType = (stepId: string, type: MockFlowStep["type"]) => {
    setSaved(false);
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, type } : s))
    );
  };

  const removeStep = (stepId: string) => {
    setSaved(false);
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  const addStep = () => {
    setSaved(false);
    setSteps((prev) => [
      ...prev,
      { id: `new-${nextStepId++}`, title: "New step", type: "task", copy: "" },
    ]);
  };

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/flows"
        className="inline-block text-sm font-medium text-gray-500 hover:text-black"
      >
        ← Back to flows
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-normal tracking-[-0.01em] md:text-3xl">
            {flow.title}
          </h1>
          <p className="mt-1 text-gray-500">
            Edit steps, change types, reorder. {steps.length} steps total.
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`h-10 shrink-0 rounded-full px-6 text-sm font-medium transition-all ${
            saved
              ? "bg-emerald-600 text-white"
              : "bg-black text-white hover:opacity-90"
          }`}
        >
          {saved ? "Saved" : "Save flow"}
        </button>
      </div>

      {/* Steps timeline */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <ul>
          {steps.map((step, index) => {
            const typeInfo = STEP_TYPE_LABELS[step.type];
            return (
              <li
                key={step.id}
                className={`p-5 ${index < steps.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Step number + connector line */}
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    {/* Header: type badge + delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <select
                          value={step.type}
                          onChange={(e) => changeType(step.id, e.target.value as MockFlowStep["type"])}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-gray-400"
                        >
                          <option value="welcome">Welcome</option>
                          <option value="task">Task</option>
                          <option value="milestone">Milestone</option>
                          <option value="checkin">Check-in</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>
                      {steps.length > 1 && (
                        <button
                          onClick={() => removeStep(step.id)}
                          className="text-xs font-medium text-gray-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(step.id, "title", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-base font-medium outline-none focus:border-gray-400"
                    />

                    {/* Copy (for welcome, task, feedback) */}
                    {(step.type === "welcome" || step.type === "task" || step.type === "feedback") && (
                      <textarea
                        value={step.copy ?? ""}
                        onChange={(e) => updateStep(step.id, "copy", e.target.value)}
                        placeholder="Step copy / message..."
                        rows={2}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Add step */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={addStep}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-black"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            Add step
          </button>
        </div>
      </div>
    </div>
  );
}
