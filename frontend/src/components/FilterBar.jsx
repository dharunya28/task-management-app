import React from 'react';
import { Search, Plus, Filter, ArrowUpDown, X } from 'lucide-react';

const FilterBar = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  onAddTask,
}) => {
  return (
    <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center backdrop-blur-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search tasks by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-sm rounded-lg pl-10 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="All" className="bg-slate-900">All Statuses</option>
            <option value="Todo" className="bg-slate-900">To Do</option>
            <option value="In Progress" className="bg-slate-900">In Progress</option>
            <option value="Completed" className="bg-slate-900">Completed</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="All" className="bg-slate-900">All Priorities</option>
            <option value="Low" className="bg-slate-900">Low Priority</option>
            <option value="Medium" className="bg-slate-900">Medium Priority</option>
            <option value="High" className="bg-slate-900">High Priority</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="newest" className="bg-slate-900">Newest First</option>
            <option value="oldest" className="bg-slate-900">Oldest First</option>
            <option value="dueDate" className="bg-slate-900">Due Date</option>
          </select>
        </div>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer ml-auto lg:ml-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
