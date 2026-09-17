import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Users,
  Sparkles,
  QrCode,
  Share2,
  Copy,
  Play,
  CheckCircle,
  AlertCircle,
  Shield,
  Smartphone,
  Flame,
  BookOpen,
  Bell
} from 'lucide-react';
import { Player, GameState } from '../types';
import { RoleCompendiumModal } from './RoleCompendiumModal';
import { notificationManager } from '../utils/notifications';

interface LobbyScreenProps {
  roomState: GameState;
  players: Player[];
  currentPlayer: Player;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  roomState,
  players,
  currentPlayer,
  onStartGame,
  onLeaveRoom,
}) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    notificationManager.getPermissionStatus()
  );

  const handleRequestPushPermission = async () => {
    const granted = await notificationManager.requestPermission(
      roomState.roomCode,
      currentPlayer.id
    );
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      notificationManager.testNotification();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}?room=${roomState.roomCode}`;
      QRCode.toDataURL(url, {
        width: 190,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      })
        .then(setQrCodeData)
        .catch(console.error);
    }
  }, [roomState.roomCode]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}?room=${roomState.roomCode}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = currentPlayer.isHost;
  const canStart = players.length >= 3;

  return (
    <div className="max-w-md mx-auto w-full space-y-5">
      {/* Lobby Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Lobby de la Fiesta en Vivo</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Sala de Espera Móvil</h2>
        <p className="text-xs text-neutral-400">
          Invita a tus amigos a escanear el QR o ingresar el código desde sus celulares.
        </p>
      </div>

      {/* Room Code + QR Box */}
      <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 text-center space-y-4 shadow-xl">
        <div className="flex items-center justify-center gap-3">
          <div className="text-2xl sm:text-3xl font-mono font-black text-rose-400 tracking-widest bg-neutral-950 px-4 py-2 rounded-2xl border border-neutral-800">
            {roomState.roomCode}
          </div>
          <button
            onClick={handleCopyLink}
            className="p-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-2xl border border-neutral-700 transition"
            title="Copiar enlace directo"
          >
            {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {qrCodeData && (
          <div className="inline-block p-2 bg-white rounded-2xl shadow-lg">
            <img src={qrCodeData} alt="QR de acceso" className="w-36 h-36 mx-auto" />
          </div>
        )}

        <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-rose-400" />
          <span>Cada jugador juega desde la pantalla de su propio celular</span>
        </div>
      </div>

      {/* Button to open Roles & Instructions Guide while waiting in Lobby */}
      <button
        id="lobby-open-guide-btn"
        onClick={() => setIsCompendiumOpen(true)}
        className="w-full py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 hover:border-rose-500/50 text-neutral-200 font-bold text-xs flex items-center justify-between transition shadow-lg group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20 transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-white text-xs font-bold">Guía de Roles & Instrucciones</div>
            <div className="text-[10px] text-neutral-400 font-normal">
              Conoce los 25 roles, códigos de 4 dígitos y balanceo (7 a 25 jug.)
            </div>
          </div>
        </div>
        <span className="text-[11px] font-bold text-rose-400">Ver 📖</span>
      </button>

      {/* Role Compendium Modal */}
      <RoleCompendiumModal
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
      />

      {/* Push Notifications Activation Prompt */}
      {notificationPermission !== 'granted' && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Notificaciones & Vibración</div>
              <div className="text-[11px] text-neutral-400">
                Vibra al ser asesinado o en ruleta
              </div>
            </div>
          </div>
          <button
            onClick={handleRequestPushPermission}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition active:scale-95 shadow shrink-0"
          >
            Activar
          </button>
        </div>
      )}

      {/* Players List */}
      <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <Users className="w-4 h-4 text-rose-400" />
            <span>Amigos Unidos ({players.length})</span>
          </div>
          <span className="text-[11px] text-neutral-400">
            {players.length < 3 ? 'Mínimo 3 jugadores' : '¡Listos para jugar!'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
          {players.map((p) => (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                p.id === currentPlayer.id
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-neutral-950/80 border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{p.avatar}</span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{p.name}</span>
                    {p.id === currentPlayer.id && (
                      <span className="text-[10px] text-rose-400 font-normal">(Tú)</span>
                    )}
                    {p.isHost && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Anfitrión
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500">Conectado y listo</div>
                </div>
              </div>

              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Host Action or Waiting Message */}
      <div className="space-y-2">
        {isHost ? (
          <button
            id="start-game-btn"
            onClick={() => {
              setStarting(true);
              onStartGame();
            }}
            disabled={!canStart || starting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {starting
                ? 'Repartiendo Roles e IA...'
                : canStart
                ? 'Iniciar Partida (Repartir Roles e IA)'
                : `Faltan ${3 - players.length} jugadores para comenzar`}
            </span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
            ⏳ Esperando a que el anfitrión presione <strong className="text-white">Iniciar Partida</strong>...
          </div>
        )}

        <button
          onClick={onLeaveRoom}
          className="w-full py-2 text-center text-xs text-neutral-500 hover:text-neutral-300 transition"
        >
          Salir de la Sala
        </button>
      </div>
    </div>
  );
};
