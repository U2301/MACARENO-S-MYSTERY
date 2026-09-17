import React, { useState, useEffect } from 'react';
import { Skull, Plus, LogIn, AlertCircle, Smartphone, Flame } from 'lucide-react';

interface JoinScreenProps {
  onCreateRoom: (name: string, avatar: string, pin: string, customCode?: string) => void;
  onJoinRoom: (roomCode: string, name: string, avatar: string, pin: string) => void;
  errorMessage?: string | null;
}

const AVATARS = ['👑', '🕵️', '🕶️', '🗡️', '🎭', '🤫', '🩺', '🛡️', '📷', '🍕', '🐴', '🤖', '🍺', '🐀', '🥖'];

export const JoinScreen: React.FC<JoinScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  errorMessage,
}) => {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [pin, setPin] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Check URL search params for ?room=FIESTA-84
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setRoomCode(roomParam.toUpperCase());
        setMode('join');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Por favor ingresa tu nombre o apodo.');
      return;
    }
    if (pin.length !== 4) {
      setFormError('Ingresa un PIN de 4 dígitos para proteger tu pantalla.');
      return;
    }

    if (mode === 'join') {
      if (!roomCode.trim()) {
        setFormError('Ingresa el código de la sala.');
        return;
      }
      onJoinRoom(roomCode.toUpperCase().trim(), name.trim(), avatar, pin);
    } else {
      onCreateRoom(name.trim(), avatar, pin, roomCode.trim() || undefined);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center mx-auto shadow-xl">
          <Skull className="w-8 h-8 text-rose-400" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Macareno's Mystery
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Misterio y deducción social presencial con Árbitro IA
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-neutral-900 p-1 rounded-2xl border border-neutral-800">
        <button
          type="button"
          onClick={() => {
            setMode('join');
            setFormError(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'join'
              ? 'bg-rose-600 text-white shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Unirse a Sala</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('create');
            setFormError(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'create'
              ? 'bg-rose-600 text-white shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Sala</span>
        </button>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4 shadow-xl text-left"
      >
        {/* Room Code */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            {mode === 'join' ? 'Código de Sala' : 'Código Personalizado (Opcional)'}
          </label>
          <input
            type="text"
            placeholder="ej. FIESTA-84"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm font-mono text-white tracking-widest outline-none focus:border-rose-500 font-bold uppercase"
          />
        </div>

        {/* Player Name */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Tu Nombre o Apodo
          </label>
          <input
            type="text"
            placeholder="ej. Luisda, León, Uriel..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-rose-500 font-medium"
          />
        </div>

        {/* Avatar Picker */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Elige tu Icono
          </label>
          <div className="flex flex-wrap gap-2 p-2 bg-neutral-950 rounded-2xl border border-neutral-800">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                  avatar === av
                    ? 'bg-rose-600/30 border-2 border-rose-500 scale-110'
                    : 'hover:bg-neutral-900 border border-transparent'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Secret 4-digit PIN */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              PIN Privado (4 dígitos)
            </label>
            <span className="text-[10px] text-neutral-500">Para proteger tu rol</span>
          </div>
          <input
            type="password"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-center text-xl tracking-[0.5em] font-mono text-white outline-none focus:border-rose-500"
          />
        </div>

        {/* Error message */}
        {(formError || errorMessage) && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError || errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-950/40 transition active:scale-95"
        >
          {mode === 'join' ? 'Entrar al Juego' : 'Crear Sala y Convertirse en Anfitrión'}
        </button>
      </form>
    </div>
  );
};
