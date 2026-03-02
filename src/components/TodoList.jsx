import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TodoItem from './TodoItem';
import { Plus, ListTodo, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [addingTask, setAddingTask] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchTodos();

            // Subscribe to real-time changes
            const subscription = supabase
                .channel('public:todos')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'todos',
                    filter: `user_id=eq.${user.id}`
                },
                    () => {
                        // Re-fetch to keep it simple and ensure order
                        fetchTodos();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [user]);

    const fetchTodos = async () => {
        try {
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .order('is_complete', { ascending: true })
                .order('inserted_at', { ascending: false });

            if (error) throw error;
            setTodos(data);
        } catch (err) {
            toast.error('Error loading tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        setAddingTask(true);
        try {
            const { error } = await supabase
                .from('todos')
                .insert([
                    { task: newTask.trim(), user_id: user.id, is_complete: false }
                ]);

            if (error) throw error;
            toast.success('Task added');
            setNewTask(''); // Clear input
            fetchTodos();
        } catch (err) {
            toast.error('Failed to add task');
            console.error(err);
        } finally {
            setAddingTask(false);
        }
    };

    const handleUpdate = (updatedTodo) => {
        setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
    };

    const handleDelete = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    // Stats calculate
    const totalTasks = todos.length;
    const completedTasks = todos.filter(t => t.is_complete).length;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Dashboard / Stats Widget */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-8 p-5 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Your Progress</h2>
                        <p className="text-blue-200/70 text-sm">
                            {completedTasks} of {totalTasks} tasks completed
                        </p>
                    </div>
                    <motion.div
                        key={progressPercent}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-black text-white"
                    >
                        {progressPercent}%
                    </motion.div>
                </div>

                <div className="w-full bg-neutral-900/50 rounded-full h-2 mt-4 relative overflow-hidden">
                    <div
                        className="bg-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </motion.div>

            {/* Add Task Input */}
            <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                onSubmit={addTodo}
                className="relative mb-8 group"
            >
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full pl-6 pr-14 py-4 bg-neutral-900/40 border border-neutral-700/50 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-neutral-800/80 transition-all shadow-inner"
                />
                <button
                    type="submit"
                    disabled={!newTask.trim() || addingTask}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed group-focus-within:shadow-lg"
                >
                    {addingTask ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                </button>
            </motion.form>

            {/* Task List */}
            <div className="space-y-1">
                {todos.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 0.5, scale: 1 }}
                        className="text-center py-12 flex flex-col items-center justify-center"
                    >
                        <ListTodo size={48} className="text-neutral-600 mb-4" />
                        <p className="text-neutral-400">No tasks yet. Add one above!</p>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {todos.map((todo) => (
                            <motion.div
                                key={todo.id}
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                layout
                            >
                                <TodoItem
                                    todo={todo}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
