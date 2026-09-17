import React, { useState } from 'react';
import { Send, Users, Lock, MessageSquare, Sparkles, Ghost, ShieldAlert, Bot, HelpCircle, Moon } from 'lucide-react';
import { ChatMessage, Player, GamePhase } from '../types';

interface ChatSystemProps {
  currentPlayer: Player;
  players: Player[];
  messages: ChatMessage[];
  currentPhase?: GamePhase;
  onSendMessage: (
    receiverId: string | null,
    content: string,
    asChameleon?: boolean,
    targetDisguiseName?: string
  ) => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  currentPlayer,
  players,
  messages,
  currentPhase,
  onSendMessage,
}) => {
  // activeChannel: 'general', 'confidential', or player.id for 1-to-1
  const [activeChannel, setActiveChannel] = useState<'general' | 'confidential' | string>('general');
  const [inputContent, setInputContent] = useState('');
  const [isChameleonDisguiseActive, setIsChameleonDisguiseActive] = useState(false);

  // Dead players who can be impersonated by El Camaleón
  const deadPlayers = players.filter((p) => !p.isAlive);
  const [disguiseTarget, setDisguiseTarget] = useState(deadPlayers[0]?.name || '');
  const isChameleon = currentPlayer.role === 'El Camaleón' && !currentPlayer.camaleonUsed && deadPlayers.length > 0;

  // Confidential messages for this player (Photographer reports, Chismoso whispers, Bribe clues, etc.)
  const confidentialMessages = messages.filter((m) => m.receiverId === currentPlayer.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    if (activeChannel === 'confidential') {
      // In confidential channel, messages go to general or AI
      onSendMessage(null, inputContent.trim(), false);
    } else {
      const targetReceiver = activeChannel === 'general' ? null : activeChannel;
      const targetDisguise = isChameleonDisguiseActive ? (disguiseTarget || deadPlayers[0]?.name) : undefined;
      onSendMessage(targetReceiver, inputContent.trim(), isChameleonDisguiseActive, targetDisguise);
    }

    setInputContent('');
    setIsChameleonDisguiseActive(false);
  };

  const handleInsertMention = (text: string) => {
    setInputContent((prev) => {
      if (prev.includes(text)) return prev;
      return `${text} ${prev}`.trim();
    });
  };

  // Filter messages for current view
  const visibleMessages = messages.filter((m) => {
    if (activeChannel === 'general') {
      // Show general broadcast messages AND confidential whispers sent specifically to currentPlayer
      return m.receiverId === null || m.receiverId === currentPlayer.id;
    } else if (activeChannel === 'confidential') {
      // Only confidential whispers intended strictly for this player
      return m.receiverId === currentPlayer.id;
    } else {
      // 1-on-1 between currentPlayer and activeChannel target
      return (
        (m.senderId === currentPlayer.id && m.receiverId === activeChannel) ||
        (m.senderId === activeChannel && m.receiverId === currentPlayer.id)
      );
    }
  });

  const activeTargetPlayer = players.find((p) => p.id === activeChannel);

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[530px]">
      {/* Channels Nav */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-950/70 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          id="chat-tab-general"
          onClick={() => setActiveChannel('general')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
            activeChannel === 'general'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          General Fiesta
        </button>

        {/* Dedicated Confidential Reports Channel */}
        <button
          id="chat-tab-confidential"
          onClick={() => setActiveChannel('confidential')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
            activeChannel === 'confidential'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-indigo-950/40 text-indigo-300 hover:text-white border border-indigo-800/60'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Informes Secretos</span>
          {confidentialMessages.length > 0 && (
            <span className="px-1.5 py-0.2 bg-indigo-500 text-white text-[10px] font-mono rounded-full font-bold">
              {confidentialMessages.length}
            </span>
          )}
        </button>

        <span className="text-neutral-700 text-xs">|</span>

        {players
          .filter((p) => p.id !== currentPlayer.id)
          .map((p) => {
            const hasUnread = messages.some(
              (m) => m.senderId === p.id && m.receiverId === currentPlayer.id
            );
            return (
              <button
                key={p.id}
                id={`chat-tab-${p.id}`}
                onClick={() => setActiveChannel(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 relative ${
                  activeChannel === p.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>{p.name}</span>
                {!p.isAlive && <span className="text-[10px] text-red-400 font-mono">✝</span>}
                {hasUnread && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
      </div>

      {/* Active Channel Header */}
      <div className="px-4 py-2 bg-neutral-950/40 border-b border-neutral-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-neutral-300 font-medium">
          {activeChannel === 'general' ? (
            <>
              <Users className="w-4 h-4 text-rose-400" />
              <span>Canal Público de la Fiesta</span>
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                IA activa
              </span>
            </>
          ) : activeChannel === 'confidential' ? (
            <>
              <Lock className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-indigo-300">
                Buzón Confidencial (Pistas, Fotos y Revelaciones)
              </span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>
                Chat Privado 1 a 1 con <strong>{activeTargetPlayer?.name}</strong>
              </span>
              {!activeTargetPlayer?.isAlive && (
                <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 text-[10px] border border-red-800">
                  Jugador Eliminado
                </span>
              )}
            </>
          )}
        </div>

        {/* Camaleón Special Ability Toggle in General Chat */}
        {activeChannel === 'general' && isChameleon && (
          <div className="flex items-center gap-1.5">
            {currentPhase && currentPhase !== 'Noche' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 flex items-center gap-1 font-mono">
                <Moon className="w-3 h-3 text-purple-400" />
                Suplantación solo en Noche
              </span>
            ) : (
              <>
                {isChameleonDisguiseActive && deadPlayers.length > 1 && (
                  <select
                    value={disguiseTarget || deadPlayers[0]?.name}
                    onChange={(e) => setDisguiseTarget(e.target.value)}
                    className="bg-purple-950 border border-purple-700 text-purple-200 text-[10px] rounded-lg px-2 py-0.5 outline-none font-bold"
                  >
                    {deadPlayers.map((d) => (
                      <option key={d.id} value={d.name}>
                        Voz de {d.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setIsChameleonDisguiseActive(!isChameleonDisguiseActive)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition ${
                    isChameleonDisguiseActive
                      ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                      : 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  {isChameleonDisguiseActive ? 'Suplantación Activa' : 'Suplantar Identidad'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {visibleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p>No hay mensajes en esta conversación aún.</p>
            <p className="text-[11px] text-neutral-600 mt-1">
              {activeChannel === 'general'
                ? 'Habla con tus amigos o invoca al @Árbitro IA para que intervenga en la partida.'
                : activeChannel === 'confidential'
                ? 'Aquí aparecerán las fotos del Fotógrafo, cotejos del Chismoso y pistas del forense.'
                : 'Pacta una alianza secreta o pregunta coartadas en privado.'}
            </p>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const isMe = msg.senderId === currentPlayer.id;
            const isChameleonSender = msg.isChameleon;
            const isSystem = msg.isSystem && !msg.isAI;
            const isAIArbitrator = msg.isAI || msg.senderName.includes('ÁRBITRO IA') || msg.senderName === 'ÁRBITRO IA';
            const isConfidentialForMe = msg.receiverId === currentPlayer.id;

            // Confidential whisper box (Solo para tus ojos)
            if (isConfidentialForMe) {
              return (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-100 my-2 shadow-lg shadow-indigo-950/30 animate-in fade-in"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-black text-indigo-300 uppercase tracking-wide">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      [CONFIDENCIAL - SOLO PARA TI] {msg.senderName}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-indigo-100 font-medium">{msg.content}</p>
                </div>
              );
            }

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-center text-xs text-neutral-300 my-2"
                >
                  <span className="font-semibold text-rose-400 mr-1.5">[SISTEMA]</span>
                  {msg.content}
                </div>
              );
            }

            // Special AI Arbitrator message bubble
            if (isAIArbitrator) {
              return (
                <div
                  key={msg.id}
                  className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-100 my-2 shadow-lg shadow-amber-950/20"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-black text-amber-300 tracking-wide uppercase">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-amber-400/70 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-50">{msg.content}</p>
                </div>
              );
            }

            // Chameleon identity rendering:
            // If I am the author of the disguise: show subtle feedback (Tú, voz suplantada)
            // If ANYONE ELSE views it: looks 100% genuine as the dead person's message with a ghost indicator!
            const authorDisplayName = isChameleonSender
              ? isMe
                ? `👻 ${msg.chameleonDisguiseName || 'Alma'} (Tú, voz suplantada)`
                : `👻 ${msg.chameleonDisguiseName || msg.senderName}`
              : msg.senderName;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe && !isChameleonSender ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-0.5 px-1">
                  <span
                    className={`font-semibold ${
                      isChameleonSender && isMe ? 'text-purple-300 font-bold' : ''
                    }`}
                  >
                    {authorDisplayName}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    isMe && !isChameleonSender
                      ? 'bg-rose-600 text-white rounded-tr-sm'
                      : isChameleonSender && isMe
                      ? 'bg-purple-950/70 text-purple-100 border border-purple-600/50 rounded-tl-sm'
                      : 'bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick AI mention bar in general chat */}
      {activeChannel === 'general' && (
        <div className="px-3 py-1.5 bg-neutral-950/90 border-t border-neutral-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-neutral-500 text-[10px] uppercase font-bold shrink-0">Invocar:</span>
          <button
            type="button"
            onClick={() => handleInsertMention('@Árbitro IA')}
            className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold flex items-center gap-1 shrink-0 transition"
          >
            <Bot className="w-3 h-3" />
            @Árbitro IA
          </button>
          <button
            type="button"
            onClick={() => handleInsertMention('¿Quién es el más sospechoso?')}
            className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 shrink-0 transition"
          >
            ¿Quién es sospechoso?
          </button>
          <button
            type="button"
            onClick={() => handleInsertMention('¿Quién comió pizza en el Seven?')}
            className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 shrink-0 transition"
          >
            🍕 Pizza en el Seven
          </button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 bg-neutral-950/80 border-t border-neutral-800 flex gap-2">
        <input
          type="text"
          placeholder={
            isChameleonDisguiseActive
              ? `Escribiendo como ${disguiseTarget || deadPlayers[0]?.name || 'Alma'} (Suplantación)...`
              : activeChannel === 'general'
              ? 'Escribe a la fiesta o menciona @Árbitro IA...'
              : activeChannel === 'confidential'
              ? 'Pregunta confidencial al Árbitro...'
              : `Susurro privado a ${activeTargetPlayer?.name}...`
          }
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          disabled={!inputContent.trim()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Enviar
        </button>
      </form>
    </div>
  );
};
