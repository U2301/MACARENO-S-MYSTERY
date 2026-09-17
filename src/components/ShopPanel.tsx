import React, { useState } from 'react';
import {
  Coins,
  Shield,
  Search,
  Scale,
  Pizza,
  Radio,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Gift
} from 'lucide-react';
import { Player, SHOP_ITEMS, ShopItem } from '../types';

interface ShopPanelProps {
  player: Player;
  players: Player[];
  onBuyItem: (itemId: string) => Promise<{ success: boolean; message?: string }>;
  onTransferCoins: (targetPlayerId: string, amount: number) => Promise<{ success: boolean; message?: string }>;
}

export const ShopPanel: React.FC<ShopPanelProps> = ({
  player,
  players,
  onBuyItem,
  onTransferCoins,
}) => {
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(5);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const availableFriends = players.filter((p) => p.id !== player.id);

  const handlePurchase = async (item: ShopItem) => {
    if (player.coins < item.cost) {
      setFeedback({ type: 'error', text: 'No tienes suficientes monedas del Seven.' });
      return;
    }

    setBuyingId(item.id);
    setFeedback(null);
    try {
      const res = await onBuyItem(item.id);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message || `¡Has adquirido ${item.name}!` });
      } else {
        setFeedback({ type: 'error', text: res.message || 'Error al procesar la compra.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Fallo de conexión al comprar.' });
    } finally {
      setBuyingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetId) {
      setFeedback({ type: 'error', text: 'Selecciona a qué amigo transferir monedas.' });
      return;
    }
    if (transferAmount <= 0 || transferAmount > player.coins) {
      setFeedback({ type: 'error', text: 'Cantidad de monedas inválida o insuficiente.' });
      return;
    }

    setFeedback(null);
    try {
      const res = await onTransferCoins(transferTargetId, transferAmount);
      if (res.success) {
        const targetFriend = players.find((p) => p.id === transferTargetId);
        setFeedback({
          type: 'success',
          text: `Le transferiste ${transferAmount} monedas a ${targetFriend?.name || 'tu amigo'}.`,
        });
      } else {
        setFeedback({ type: 'error', text: res.message || 'Error en la transferencia.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Error al transferir monedas.' });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Wallet Balance Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                Mercado Negro & Fichas del Seven
              </div>
              <div className="text-xl font-black text-white font-mono flex items-center gap-1.5">
                <span>{player.coins || 0}</span>
                <span className="text-xs text-amber-300 font-sans font-normal">Monedas</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-neutral-400 block">¿Cómo ganar más?</span>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
              <TrendingUp className="w-3 h-3" />
              Completa misiones
            </span>
          </div>
        </div>

        {/* Current Active Power-ups */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
          {player.hasBulletproofVest && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
              <Shield className="w-3 h-3" />
              Chaleco Activo
            </span>
          )}
          {(player.doubleVotesAvailable || 0) > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/50 border border-purple-500/40 text-[10px] font-bold text-purple-300">
              <Scale className="w-3 h-3" />
              Voto Doble x{player.doubleVotesAvailable}
            </span>
          )}
          {!player.hasBulletproofVest && !(player.doubleVotesAvailable || 0) && (
            <span className="text-[10px] text-neutral-500">
              Sin mejoras activas. Compra artículos abajo para ganar ventaja.
            </span>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Secret Clues Purchased */}
      {player.purchasedClues && player.purchasedClues.length > 0 && (
        <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Tus Pistas Secretas Compradas</span>
          </div>
          <div className="space-y-1.5 text-xs text-neutral-300">
            {player.purchasedClues.map((clue, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] leading-relaxed">
                🕵️ <em>"{clue}"</em>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop Catalog */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
          <span>Artículos Disponibles</span>
          <span className="text-[10px] text-neutral-500">Mercancía clandestina</span>
        </h3>

        <div className="space-y-2.5">
          {SHOP_ITEMS.map((item) => {
            const canAfford = (player.coins || 0) >= item.cost;
            const isVest = item.id === 'vest';
            const isVestAlreadyOwned = isVest && player.hasBulletproofVest;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-neutral-700 transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl shrink-0 p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                    {item.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                  <span className="text-xs font-mono font-black text-amber-400">
                    🪙 {item.cost}
                  </span>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford || buyingId === item.id || isVestAlreadyOwned}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-35 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow shrink-0"
                  >
                    {isVestAlreadyOwned
                      ? 'Puesto'
                      : buyingId === item.id
                      ? 'Comprando...'
                      : 'Comprar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer Coins to Friends */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Transferir Monedas a un Amigo
          </h3>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Soborna a alguien, paga la pizza o financia a un aliado de tu bando compartiendo tus monedas.
        </p>

        <form onSubmit={handleTransferSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                Amigo Destino
              </label>
              <select
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-amber-500"
              >
                <option value="">Elegir amigo...</option>
                {availableFriends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.avatar} {f.name} ({f.isAlive ? 'Vivo' : 'Alma'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min={1}
                max={player.coins || 0}
                value={transferAmount}
                onChange={(e) => setTransferAmount(parseInt(e.target.value) || 1)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!transferTargetId || player.coins <= 0}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 disabled:opacity-40 text-neutral-200 text-xs font-bold uppercase tracking-wider border border-neutral-700 transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Enviar Fichas</span>
          </button>
        </form>
      </div>
    </div>
  );
};
