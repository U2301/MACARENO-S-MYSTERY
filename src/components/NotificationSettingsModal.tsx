import React, { useState, useEffect } from 'react';
import {
  Bell,
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sparkles
} from 'lucide-react';
import { notificationManager } from '../utils/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost?: boolean;
  onBroadcastPush?: (title: string, body: string) => Promise<boolean>;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  isHost,
  onBroadcastPush,
}) => {
  const [permission, setPermission] = useState<string>('default');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [tested, setTested] = useState<boolean>(false);

  // Host broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermission(notificationManager.getPermissionStatus());
      setSoundEnabled(notificationManager.isSoundEnabled());
      setVibrateEnabled(notificationManager.isVibrationEnabled());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await notificationManager.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      notificationManager.testNotification();
      setTested(true);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    notificationManager.setSoundEnabled(next);
  };

  const handleToggleVibrate = () => {
    const next = !vibrateEnabled;
    setVibrateEnabled(next);
    notificationManager.setVibrationEnabled(next);
  };

  const handleTestNotification = () => {
    notificationManager.testNotification();
    setTested(true);
    setTimeout(() => setTested(false), 3000);
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim() || !onBroadcastPush) return;
    setIsSending(true);
    const ok = await onBroadcastPush(broadcastTitle.trim(), broadcastBody.trim());
    setIsSending(false);
    if (ok) {
      setBroadcastSuccess(true);
      setBroadcastTitle('');
      setBroadcastBody('');
      setTimeout(() => setBroadcastSuccess(false), 3000);
    }
  };

  const PRESETS = [
    { title: '🚨 ¡Atención Inmediata!', body: 'Todos al centro de la sala para reunión urgente.' },
    { title: '🍕 ¡Llegó la Comida!', body: 'Pizzas y botanas listas en la mesa del comedor.' },
    { title: '🤫 Silencio Absoluto', body: 'Alguien en la fiesta va a declarar o confesar.' },
    { title: '⚡ ¡Revisen sus Celulares!', body: 'Hay nuevas pistas e informes en sus bandejas.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Notificaciones Celular</h3>
              <p className="text-[11px] text-neutral-400">Vibración y avisos push para no perderte nada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission Banner */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-neutral-300" />
              <span className="text-xs font-bold text-neutral-200">Avisos en Pantalla Bloqueada:</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                permission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : permission === 'denied'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {permission === 'granted'
                ? 'Activadas'
                : permission === 'denied'
                ? 'Bloqueadas'
                : 'Pendiente'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Permite que tu celular vibre y te avise cuando haya una baja, cuando empiece la noche o cuando gire la ruleta de Macareno.
          </p>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              <Bell className="w-4 h-4" />
              Permitir Notificaciones en este Teléfono
            </button>
          )}
        </div>

        {/* Device Toggles */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleToggleVibrate}
            className={`p-3 rounded-2xl border flex items-center justify-between transition ${
              vibrateEnabled
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4" />
              <span className="text-xs font-bold">Vibración</span>
            </div>
            <span className="text-[10px] font-mono font-bold">
              {vibrateEnabled ? 'SÍ' : 'NO'}
            </span>
          </button>

          <button
            onClick={handleToggleSound}
            className={`p-3 rounded-2xl border flex items-center justify-between transition ${
              soundEnabled
                ? 'bg-sky-950/30 border-sky-500/40 text-sky-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-xs font-bold">Sonidos</span>
            </div>
            <span className="text-[10px] font-mono font-bold">
              {soundEnabled ? 'SÍ' : 'NO'}
            </span>
          </button>
        </div>

        {/* Test Trigger Button */}
        <button
          onClick={handleTestNotification}
          className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>{tested ? '¡Vibrando y sonando! ✨' : 'Probar Notificación y Vibración'}</span>
        </button>

        {/* HOST BROADCASTER SECTION */}
        {isHost && onBroadcastPush && (
          <div className="pt-3 border-t border-neutral-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Radio className="w-4 h-4" />
              <span>Control Anfitrión: Enviar Alerta a Todos los Celulares</span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((pr, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setBroadcastTitle(pr.title);
                    setBroadcastBody(pr.body);
                  }}
                  className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left transition"
                >
                  <div className="text-[11px] font-bold text-white truncate">{pr.title}</div>
                  <div className="text-[9px] text-neutral-400 truncate">{pr.body}</div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="Título del aviso (ej: 🍕 ¡Llegó la pizza!)"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <textarea
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                rows={2}
                placeholder="Mensaje que vibrará en todos los teléfonos..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {broadcastSuccess && (
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs text-center font-bold">
                ✓ ¡Alerta enviada y vibrando en todos los celulares!
              </div>
            )}

            <button
              onClick={handleSendBroadcast}
              disabled={!broadcastTitle.trim() || !broadcastBody.trim() || isSending}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Enviando a celulares...' : 'Disparar Alerta a Todos'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
