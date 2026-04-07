import { useEffect, useState } from 'react';
import { fetchOrderStatusLog } from '../services/api';

const STEPS = [
  { key: 'pending', label: 'Booked' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
];

const TERMINAL = { cancelled: 'Cancelled', failed: 'Failed' };

export default function StatusTracker({ orderId, currentStatus, createdAt }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderStatusLog(orderId)
      .then(setLogs)
      .catch(() => setLogs([]));
  }, [orderId, currentStatus]);

  const isTerminal = currentStatus in TERMINAL;

  const stepIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const activeIdx = isTerminal ? -1 : stepIndex;

  const dateMap = {};
  dateMap['pending'] = createdAt;
  logs.forEach((log) => {
    dateMap[log.new_status] = log.created_at;
  });

  const fmt = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (isTerminal) {
    const color = currentStatus === 'cancelled' ? 'red' : 'gray';
    return (
      <div className={`bg-${color}-50 border border-${color}-200 rounded-2xl p-6 mb-8 text-center`}>
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-${color}-100 flex items-center justify-center`}>
          <svg className={`w-6 h-6 text-${color}-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className={`text-lg font-semibold text-${color}-800`}>
          Order {TERMINAL[currentStatus]}
        </h2>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500"
          style={{ width: `${Math.max(0, activeIdx) * 25}%` }}
        />

        {STEPS.map((step, i) => {
          const isDone = i <= activeIdx;
          const isCurrent = i === activeIdx;

          return (
            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
              >
                {isDone ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isDone ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {dateMap[step.key] && (
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {fmt(dateMap[step.key])}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
