import React, { useState } from 'react';
import { Lock, Smartphone, ShieldCheck, UserCheck, KeyRound, AlertCircle } from 'lucide-react';
import { Player } from '../types';

interface LoginModalProps {
  players: Player[];
  currentLoggedInPlayer: Player | null;
  onLogin: (playerId: string, pin: string) => boolean;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  players,
  currentLoggedInPlayer,
  onLogin,
  onLogout,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || '');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    const success = onLogin(selectedPlayerId, pinInput.trim());
    if (success) {
      setPinInput('');
      setErrorMsg(null);
    } else {
      setErrorMsg('PIN incorrecto. Consulta tu clave privada o usa el valor de prueba.');
    }
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full border border-neutral-800 bg-neutral-900 rounded-3xl p-6 sm:p-7 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-7 h-7 text-rose-400" />
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">Acceso Privado al Móvil</h3>
        <p className="text-xs text-neutral-400 mt-1 mb-5">
          Para que nadie vea tu rol secreto ni tus mensajes por error o mala fe, ingresa con tu PIN de 4 dígitos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              ¿Quién eres en la fiesta?
            </label>
            <select
              value={selectedPlayerId}
              onChange={(e) => {
                setSelectedPlayerId(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-rose-500 font-medium"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isAlive ? '' : '(✝ Eliminado)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Tu PIN Secreto
              </label>
              {selectedPlayer && (
                <span className="text-[10px] text-neutral-500 font-mono">
                  (PIN de prueba: {selectedPlayer.pin})
                </span>
              )}
            </div>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-center text-xl tracking-[0.5em] font-mono text-white outline-none focus:border-rose-500"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-600/40 text-rose-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-950/40 transition"
          >
            Desbloquear Mi Pantalla
          </button>
        </form>
      </div>
    </div>
  );
};
