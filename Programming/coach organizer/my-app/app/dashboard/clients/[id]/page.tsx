"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_CLIENTS, MOCK_TASKS, type ClientStage } from "@/lib/mockData";

const STAGE_COLORS: Record<ClientStage, string> = {
  Onboarding: "bg-blue-100 text-blue-800",
  Active: "bg-green-100 text-green-800",
  "At Risk": "bg-amber-100 text-amber-800",
  Completed: "bg-gray-100 text-gray-700",
};

function needsAttention(client: (typeof MOCK_CLIENTS)[0]): boolean {
  return client.stage === "At Risk" || !!client.stuck || (client.daysInactive ?? 0) >= 3;
}

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const client = MOCK_CLIENTS.find((c) => c.id === id);
  const tasks = MOCK_TASKS[id] ?? [];

  const [taskCompletion, setTaskCompletion] = useState<Record<string, boolean>>(
    tasks.reduce(
      (acc, t) => ({ ...acc, [t.id]: t.completed }),
      {} as Record<string, boolean>
    )
  );
  const [reminderSent, setReminderSent] = useState(false);

  const toggleTask = (taskId: string) => {
    setTaskCompletion((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  if (!client) {
    return (
      <div className="space-y-8">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← Back to dashboard
        </Link>
        <p className="text-gray-500">Client not found.</p>
      </div>
    );
  }

  const completedCount = Object.values(taskCompletion).filter(Boolean).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const attention = needsAttention(client);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-block text-sm font-medium text-gray-500 hover:text-black"
      >
        ← Back to dashboard
      </Link>

      {/* Needs attention banner */}
      {attention && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm">
            !
          </span>
          <div>
            <p className="text-sm font-medium text-amber-900">
              This client needs attention
            </p>
            <p className="text-xs text-amber-700">
              {client.daysInactive
                ? `Inactive for ${client.daysInactive} days.`
                : "Client may be stuck. Consider a check-in."}
            </p>
          </div>
        </div>
      )}

      {/* Client header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-medium text-gray-600">
            {client.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-normal tracking-[-0.01em] md:text-3xl">
              {client.name}
            </h1>
            <p className="text-gray-500">{client.programName}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STAGE_COLORS[client.stage]}`}
              >
                {client.stage}
              </span>
              {attention && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Needs attention
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setReminderSent(true)}
            className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
              reminderSent
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            {reminderSent ? "Reminder sent" : "Send reminder"}
          </button>
          <Link
            href={`/portal/${client.id}`}
            className="flex h-10 items-center rounded-full bg-black px-4 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            View portal
          </Link>
        </div>
      </div>

      {/* Progress + Info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Progress</h3>
          <p className="mt-1 text-2xl font-medium">{progress}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-black transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Current step</h3>
          <p className="mt-1 text-2xl font-medium">
            {client.currentStep} <span className="text-base text-gray-400">/ {client.totalSteps}</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Duration</h3>
          <p className="mt-1 text-2xl font-medium">{client.duration}</p>
        </div>
      </div>

      {/* Tasks */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium">Tasks</h2>
        <p className="mt-1 text-sm text-gray-500">
          {completedCount} of {tasks.length} completed
        </p>
        <ul className="mt-4 space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50/50"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  taskCompletion[task.id]
                    ? "border-black bg-black"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {taskCompletion[task.id] && (
                  <svg
                    width={12}
                    height={12}
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
                  taskCompletion[task.id] ? "text-gray-400 line-through" : ""
                }
              >
                {task.title}
              </span>
              {task.dueDate && (
                <span className="ml-auto text-xs text-gray-400">
                  {task.dueDate}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Activity timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium">Activity</h2>
        <ul className="mt-4 space-y-4">
          <li className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-black" />
              <div className="w-px flex-1 bg-gray-200" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">Client added to {client.programName}</p>
              <p className="text-xs text-gray-500">Magic link sent to email</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              <div className="w-px flex-1 bg-gray-200" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">Welcome email delivered</p>
              <p className="text-xs text-gray-500">{client.lastCheckIn === "—" ? "Pending" : client.lastCheckIn}</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium">Last active</p>
              <p className="text-xs text-gray-500">{client.lastActive}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
