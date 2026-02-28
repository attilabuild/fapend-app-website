"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MOCK_CLIENTS,
  MOCK_TASKS,
  MOCK_MESSAGES,
  MOCK_FLOWS,
  type ClientStage,
} from "@/lib/mockData";

const STAGE_COLORS: Record<ClientStage, string> = {
  Onboarding: "bg-blue-100 text-blue-800",
  Active: "bg-green-100 text-green-800",
  "At Risk": "bg-amber-100 text-amber-800",
  Completed: "bg-gray-100 text-gray-700",
};

function needsAttention(client: (typeof MOCK_CLIENTS)[0]): boolean {
  return client.stage === "At Risk" || !!client.stuck || (client.daysInactive ?? 0) >= 3;
}

function getUpcomingTasks() {
  return MOCK_CLIENTS.flatMap((client) =>
    (MOCK_TASKS[client.id] ?? [])
      .filter((t) => !t.completed)
      .map((t) => ({
        clientId: client.id,
        clientName: client.name,
        task: t.title,
        due: t.dueDate ?? "—",
      }))
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [showAddClient, setShowAddClient] = useState(false);
  const [addStep, setAddStep] = useState<"form" | "success">("form");

  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [selectedFlow, setSelectedFlow] = useState(MOCK_FLOWS[0]?.id ?? "");
  const [magicLink, setMagicLink] = useState("");

  useEffect(() => {
    if (searchParams.get("add") === "client") {
      setShowAddClient(true);
    }
  }, [searchParams]);

  const upcomingTasks = getUpcomingTasks();
  const metrics = {
    active: MOCK_CLIENTS.filter((c) => c.stage === "Active").length,
    atRisk: MOCK_CLIENTS.filter((c) => c.stage === "At Risk").length,
    onboarding: MOCK_CLIENTS.filter((c) => c.stage === "Onboarding").length,
    completed: MOCK_CLIENTS.filter((c) => c.stage === "Completed").length,
    needsAttention: MOCK_CLIENTS.filter(needsAttention).length,
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const token = Math.random().toString(36).slice(2, 10);
    const link = `${window.location.origin}/portal/${token}`;
    setMagicLink(link);
    setAddStep("success");
  };

  const closeModal = () => {
    setShowAddClient(false);
    setAddStep("form");
    setNewClientName("");
    setNewClientEmail("");
    setSelectedFlow(MOCK_FLOWS[0]?.id ?? "");
    setMagicLink("");
    window.history.replaceState({}, "", "/dashboard");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(magicLink);
  };

  return (
    <div className="space-y-6">
      {/* Needs attention banner */}
      {metrics.needsAttention > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm">
            !
          </span>
          <div>
            <p className="text-sm font-medium text-amber-900">
              {metrics.needsAttention} client{metrics.needsAttention > 1 ? "s" : ""} need{metrics.needsAttention === 1 ? "s" : ""} attention
            </p>
            <p className="text-xs text-amber-700">
              Inactive or at-risk clients require a follow-up.
            </p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Onboarding</h3>
          <p className="mt-1 text-2xl font-medium">{metrics.onboarding}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="mt-1 text-2xl font-medium">{metrics.active}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-medium text-amber-700">At Risk</h3>
          <p className="mt-1 text-2xl font-medium text-amber-900">{metrics.atRisk}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="mt-1 text-2xl font-medium">{metrics.completed}</p>
        </div>
      </div>

      {/* Client List */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-medium">All clients</h2>
          <button
            onClick={() => setShowAddClient(true)}
            className="h-9 rounded-full bg-black px-5 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            + Add client
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Attention
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_CLIENTS.map((client) => {
                const attention = needsAttention(client);
                return (
                  <tr
                    key={client.id}
                    className={`hover:bg-gray-50/50 ${attention ? "bg-amber-50/40" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.programName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[client.stage]}`}
                      >
                        {client.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {client.lastActive}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-black"
                            style={{
                              width: `${
                                client.totalSteps
                                  ? ((client.currentStep ?? 0) / client.totalSteps) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {client.duration}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {attention && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Needs attention
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="inline-flex h-8 items-center rounded-full border border-gray-200 px-4 text-xs font-medium transition-colors hover:bg-gray-50"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-column: Tasks + Messages */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-medium">Upcoming tasks</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Check-ins, follow-ups, notes per client
          </p>
          <ul className="mt-4 space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.slice(0, 5).map((item, i) => (
                <li
                  key={`${item.clientId}-${item.task}-${i}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.task}</p>
                    <p className="text-xs text-gray-500">{item.clientName}</p>
                  </div>
                  <span className="text-xs text-gray-400">{item.due}</span>
                </li>
              ))
            ) : (
              <li className="py-6 text-center text-sm text-gray-500">
                No upcoming tasks
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-medium">Messages</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Quick messages from clients
          </p>
          <ul className="mt-4 space-y-3">
            {MOCK_MESSAGES.map((msg) => (
              <li
                key={msg.id}
                className="rounded-lg border border-gray-100 p-3 hover:bg-gray-50/50"
              >
                <p className="text-sm font-medium">{msg.from}</p>
                <p className="mt-1 text-sm text-gray-600">{msg.text}</p>
                <p className="mt-1 text-xs text-gray-400">{msg.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add client modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            {addStep === "form" ? (
              <>
                <h3 className="text-lg font-medium">Add client</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter client info and assign a coaching flow. They&#39;ll receive a magic onboarding link.
                </p>
                <form onSubmit={handleAddClient} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Client name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Jane Doe"
                      className="h-12 w-full rounded-xl border border-gray-200 px-4 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="h-12 w-full rounded-xl border border-gray-200 px-4 text-base outline-none placeholder:text-gray-400 focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="flow" className="block text-sm font-medium text-gray-700 mb-1">
                      Coaching flow
                    </label>
                    <select
                      id="flow"
                      value={selectedFlow}
                      onChange={(e) => setSelectedFlow(e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-gray-400"
                    >
                      {MOCK_FLOWS.map((flow) => (
                        <option key={flow.id} value={flow.id}>
                          {flow.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="h-12 flex-1 rounded-full border border-gray-200 text-sm font-medium transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-12 flex-1 rounded-full bg-black text-sm font-medium text-white transition-all hover:opacity-90"
                    >
                      Add & send link
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Client added</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {newClientName} will receive an onboarding email at {newClientEmail}. Share this magic link directly:
                  </p>
                  <div className="mt-4 flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <input
                      type="text"
                      readOnly
                      value={magicLink}
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                    <button
                      onClick={copyLink}
                      className="shrink-0 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition-all hover:opacity-90"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={closeModal}
                    className="h-12 flex-1 rounded-full border border-gray-200 text-sm font-medium transition-colors hover:bg-gray-50"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => {
                      setAddStep("form");
                      setNewClientName("");
                      setNewClientEmail("");
                      setMagicLink("");
                    }}
                    className="h-12 flex-1 rounded-full bg-black text-sm font-medium text-white transition-all hover:opacity-90"
                  >
                    Add another
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-8" />
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
