import React from 'react';
import { CheckCircle2, Clock, ListTodo, AlertTriangle, Flame, Layers } from 'lucide-react';

const StatCards = ({ tasks = [] }) => {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'Todo').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const highPriority = tasks.filter((t) => t.priority === 'High' && t.status !== 'Completed').length;

  const now = new Date();
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'Completed') return false;
    return new Date(t.dueDate) < now;
  }).length;

  const stats = [
    {
      title: 'Total Tasks',
      value: total,
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      title: 'To Do',
      value: todo,
      icon: ListTodo,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
    {
      title: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'High Priority',
      value: highPriority,
      icon: Flame,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
    {
      title: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl bg-slate-900/70 border ${stat.border} backdrop-blur-sm shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{stat.title}</span>
              <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
