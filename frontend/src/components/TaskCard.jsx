import React from 'react';
import { Calendar, CheckCircle2, Clock, Circle, AlertCircle, Pencil, Trash2 } from 'lucide-react';

const priorityColors = {
  Low: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  Medium: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  High: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
};

const statusIcons = {
  Todo: Circle,
  'In Progress': Clock,
  Completed: CheckCircle2,
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isCompleted = task.status === 'Completed';
  const PriorityBadge = priorityColors[task.priority] || priorityColors.Medium;
  const StatusIcon = statusIcons[task.status] || Circle;

  // Format Due Date
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && dueDateObj < new Date() && !isCompleted;
  const formattedDueDate = dueDateObj
    ? dueDateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className={`group bg-slate-900/80 border ${
        isCompleted ? 'border-slate-800/80 opacity-75' : 'border-slate-800 hover:border-slate-700'
      } rounded-xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between backdrop-blur-sm hover:shadow-md`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Status selector button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const nextStatus =
                  task.status === 'Todo'
                    ? 'In Progress'
                    : task.status === 'In Progress'
                    ? 'Completed'
                    : 'Todo';
                onStatusChange(task, nextStatus);
              }}
              title="Click to advance status"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                task.status === 'Completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : task.status === 'In Progress'
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{task.status}</span>
            </button>
          </div>

          {/* Priority Badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${PriorityBadge.bg} ${PriorityBadge.text} ${PriorityBadge.border}`}
          >
            {task.priority} Priority
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-semibold mb-2 leading-snug ${
            isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Details */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-4 text-xs">
        {/* Due Date */}
        {formattedDueDate ? (
          <div
            className={`flex items-center gap-1.5 font-medium ${
              isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{formattedDueDate}</span>
            {isOverdue && <span className="text-[10px] text-rose-400 font-bold">(Overdue)</span>}
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">No due date</span>
        )}

        {/* Actions (Edit / Delete) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors cursor-pointer"
            title="Edit Task"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
