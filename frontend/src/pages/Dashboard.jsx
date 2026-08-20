import React, { useState, useEffect, useMemo } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import FilterBar from '../components/FilterBar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { PlusCircle, Loader2, Sparkles, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering & Search State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (statusFilter !== 'All' && task.status !== statusFilter) return false;
        // Priority filter
        if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
        // Search filter (title or description)
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description ? task.description.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
      });
  }, [tasks, search, statusFilter, priorityFilter, sortBy]);

  // Create or Update Task Handler
  const handleSaveTask = async (taskData) => {
    try {
      setModalLoading(true);
      if (editingTask) {
        // Update existing task
        const response = await API.put(`/tasks/${editingTask._id}`, taskData);
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? response.data : t)));
      } else {
        // Create new task
        const response = await API.post('/tasks', taskData);
        setTasks((prev) => [response.data, ...prev]);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      alert(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setModalLoading(false);
    }
  };

  // Status toggle handler
  const handleStatusChange = async (task, newStatus) => {
    try {
      const response = await API.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? response.data : t)));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setModalLoading(true);
      await API.delete(`/tasks/${deletingTask._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== deletingTask._id));
      setIsDeleteModalOpen(false);
      setDeletingTask(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero / Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Task Dashboard</span>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Keep track of your productivity, deadlines, and priorities.
            </p>
          </div>
        </div>

        {/* Real-time Stat Cards */}
        <StatCards tasks={tasks} />

        {/* Filter and Search Bar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onAddTask={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
        />

        {/* Error message */}
        {error && (
          <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-medium">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          /* Task Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={(taskToEdit) => {
                  setEditingTask(taskToEdit);
                  setIsTaskModalOpen(true);
                }}
                onDelete={(taskToDelete) => {
                  setDeletingTask(taskToDelete);
                  setIsDeleteModalOpen(true);
                }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto mt-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No tasks found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
              {search || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : "You don't have any tasks yet. Create your first task to start organizing your workflow!"}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setPriorityFilter('All');
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        isLoading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleConfirmDelete}
        taskTitle={deletingTask?.title || ''}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default Dashboard;
