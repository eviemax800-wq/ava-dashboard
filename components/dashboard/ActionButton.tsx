'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  action: string;
  label: string;
  icon: LucideIcon;
  params?: any;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function ActionButton({
  action,
  label,
  icon: Icon,
  params,
  variant = 'primary',
  size = 'md',
  onSuccess,
  onError,
}: ActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleClick() {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        onSuccess?.(result);

        // Reset after 3 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Action failed');
        onError?.(result);

        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error');
      onError?.(error);

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  }

  const variantStyles = {
    primary: 'bg-violet-500 hover:bg-violet-600 text-white',
    secondary: 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        onClick={handleClick}
        disabled={loading}
        className={`
          flex items-center gap-2 rounded-lg font-medium transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
        `}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : status === 'error' ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
        <span>
          {loading ? 'Running...' : status === 'success' ? 'Done!' : status === 'error' ? 'Failed' : label}
        </span>
      </motion.button>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xs ${
            status === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
