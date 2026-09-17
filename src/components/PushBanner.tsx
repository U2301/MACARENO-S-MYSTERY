import React, { useEffect, useState } from 'react';
import { Bell, Skull, Sparkles, Moon, Sun, AlertTriangle, MessageSquare, X, Smartphone } from 'lucide-react';
import { PushNotificationPayload } from '../types';

interface PushBannerProps {
  notification: PushNotificationPayload | null;
  onDismiss: () => void;
  onClick?: () => void;
}

export const PushBanner: React.FC<PushBannerProps> = ({ notification, onDismiss, onClick }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 6500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification?.id]);

  if (!notification || !visible) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />;
      case 'murder':
        return <Skull className="w-5 h-5 text-rose-400" />;
      case 'wheel':
        return <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />;
      case 'phase':
        return notification.title.toLowerCase().includes('noche') ? (
          <Moon className="w-5 h-5 text-purple-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-400" />
        );
      case 'whisper':
        return <MessageSquare className="w-5 h-5 text-sky-400" />;
      case 'broadcast':
      default:
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'emergency':
        return 'border-red-500/70 bg-red-950/90 shadow-red-950/60';
      case 'murder':
        return 'border-rose-500/70 bg-neutral-950/95 shadow-rose-950/60';
      case 'wheel':
        return 'border-amber-500/70 bg-amber-950/90 shadow-amber-950/60';
      case 'phase':
        return 'border-purple-500/70 bg-purple-950/90 shadow-purple-950/60';
      case 'whisper':
        return 'border-sky-500/70 bg-sky-950/90 shadow-sky-950/60';
      default:
        return 'border-emerald-500/70 bg-neutral-900/95 shadow-emerald-950/60';
    }
  };

  return (
    <div className="fixed top-3 left-3 right-3 z-50 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-top-4 duration-300">
      <div
        className={`p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all cursor-pointer ${getBorderColor()}`}
        onClick={() => {
          if (onClick) onClick();
        }}
      >
        <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black uppercase tracking-wider text-white truncate">
              {notification.title}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono shrink-0">
              {notification.timestamp}
            </span>
          </div>
          <p className="text-xs text-neutral-200 mt-0.5 leading-snug line-clamp-2">
            {notification.body}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
            setTimeout(onDismiss, 200);
          }}
          className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-neutral-400 hover:text-white transition shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
