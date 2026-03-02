import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Check, Clock, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export default function TodoItem({ todo, onDelete, onUpdate }) {
    const [loading, setLoading] = useState(false);

    const toggleComplete = async () => {
        setLoading(true);
        try {
            const newStatus = !todo.is_complete;
            const { data, error } = await supabase
                .from('todos')
                .update({ is_complete: newStatus })
                .eq('id', todo.id)
                .select()
                .single();

            if (error) throw error;

            // Trigger confetti on completion
            if (newStatus) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#10b981', '#ffffff']
                });
            }

            onUpdate(data);
        } catch (err) {
            toast.error('Failed to update task');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteTodo = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', todo.id);

            if (error) throw error;
            onDelete(todo.id);
            toast.success('Task deleted');
        } catch (err) {
            toast.error('Failed to delete task');
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className={`group flex items-center justify-between p-4 mb-3 rounded-xl border transition-all duration-300 ${todo.is_complete ? 'bg-neutral-800/30 border-neutral-800' : 'bg-neutral-800/80 border-neutral-700 hover:border-neutral-600'}`}>
            <div className="flex items-center gap-3 w-full">
                <button className="text-neutral-500 hover:text-neutral-300 cursor-grab active:cursor-grabbing hidden sm:block">
                    <GripVertical size={16} />
                </button>

                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={toggleComplete}
                    disabled={loading}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.is_complete
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-neutral-500 text-transparent hover:border-emerald-400'
                        }`}
                >
                    <motion.div
                        initial={false}
                        animate={{ scale: todo.is_complete ? 1 : 0, opacity: todo.is_complete ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        <Check size={14} className="opacity-100" />
                    </motion.div>
                </motion.button>

                <div className="flex flex-col ml-1 flex-grow">
                    <span className={`text-base transition-colors ${todo.is_complete ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                        {todo.task}
                    </span>
                    <span className="text-xs text-neutral-500 flex items-center mt-1">
                        <Clock size={12} className="mr-1" />
                        {new Date(todo.inserted_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={deleteTodo}
                disabled={loading}
                className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all focus:opacity-100 disabled:opacity-50"
            >
                <Trash2 size={18} />
            </motion.button>
        </div>
    );
}
