"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MOCK_CLIENTS, MOCK_TASKS, MOCK_FLOWS } from "@/lib/mockData";

export default function ClientPortalPage() {
  const params = useParams();
  const token = params.token as string;
  const client = MOCK_CLIENTS.find((c) => c.id === token);

  const tasks = client ? (MOCK_TASKS[client.id] ?? []) : [];
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(
    tasks.reduce(
      (acc, t) => ({ ...acc, [t.id]: t.completed }),
      {} as Record<string, boolean>
    )
  );

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = tasks.length || 1;
  const progress = Math.round((completedCount / totalTasks) * 100);

  const programName = client?.programName ?? "Your Program";
  const currentStep = client?.currentStep ?? 1;
  const totalSteps = client?.totalSteps ?? 5;

  const flow = MOCK_FLOWS[0];
  const milestones = flow?.steps.filter((s) => s.type === "milestone") ?? [];

  const coachMessages = [
    {
      id: "1",
      text: "Welcome! Complete your intake form to get started.",
      date: "Mar 1",
      type: "welcome" as const,
    },
    {
      id: "2",
      text: "Great progress. Next up: schedule your intro call.",
      date: "Mar 3",
      type: "checkin" as const,
    },
    {
      id: "3",
      text: "You haven't logged in for a few days — just checking in!",
      date: "Mar 7",
      type: "reminder" as const,
    },
  ];

  const MESSAGE_STYLES = {
    welcome: "border-l-emerald-400 bg-emerald-50/60",
    checkin: "border-l-sky-400 bg-sky-50/60",
    reminder: "border-l-amber-400 bg-amber-50/60",
  };

  return (
    <div className="min-h-screen bg-[#fafafa] px-5 py-12">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-normal tracking-[-0.01em]">
            {programName}
          </h1>
          <p className="mt-2 text-gray-500">
            Welcome! Here&apos;s your coaching journey overview.
          </p>

          {/* Milestone tracker */}
          <div className="mt-8">
            <h2 className="text-sm font-medium text-gray-500">
              Your journey
            </h2>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`h-2 w-full rounded-full transition-colors ${
                      i < currentStep ? "bg-black" : "bg-gray-200"
                    }`}
                  />
                  <span className="text-[10px] text-gray-400">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500">
                Task completion
              </h2>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-black transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-medium">Your tasks</h2>
          <p className="mt-1 text-sm text-gray-500">
            Complete each task to move to the next milestone.
          </p>
          {tasks.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50/50"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      completedTasks[task.id]
                        ? "border-black bg-black"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {completedTasks[task.id] && (
                      <svg
                        width={14}
                        height={14}
                        viewBox="0 0 12 12"
                        fill="none"
                        className="text-white"
                      >
                        <path
                          d="M2 6l3 3 5-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <span
                    className={
                      completedTasks[task.id]
                        ? "text-gray-400 line-through"
                        : ""
                    }
                  >
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex flex-col items-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                No tasks assigned yet. Your coach will add them soon.
              </p>
            </div>
          )}
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-medium">Milestones</h2>
            <ul className="mt-4 space-y-3">
              {milestones.map((m, i) => (
                <li key={m.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      i < currentStep - 1
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {i < currentStep - 1 ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
                        <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      i < currentStep - 1 ? "text-gray-400 line-through" : ""
                    }`}
                  >
                    {m.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coach messages (including reminders) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-medium">Messages from your coach</h2>
          <p className="mt-1 text-sm text-gray-500">
            Updates, check-ins, and reminders.
          </p>
          <ul className="mt-4 space-y-3">
            {coachMessages.map((msg) => (
              <li
                key={msg.id}
                className={`rounded-xl border-l-4 p-4 text-sm text-gray-700 ${MESSAGE_STYLES[msg.type]}`}
              >
                <p>{msg.text}</p>
                <p className="mt-2 text-xs text-gray-400">{msg.date}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Powered by Growial
        </p>
      </div>
    </div>
  );
}
