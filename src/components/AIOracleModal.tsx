import React, { useState } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, HelpCircle, Flame } from 'lucide-react';

interface AIOracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAI: (query: string) => Promise<string>;
}

export const AIOracleModal: React.FC<AIOracleModalProps> = ({
  isOpen,
  onClose,
  onAskAI,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<
    { q: string; a: string; time: string }[]
  >([
    {
      q: '¿Qué sabes de esta fiesta?',
      a: 'Sé que las sombras susurran entre los vivos, que Jackie no para de comer y que nadie olvida lo que pasó en Cancún. Mantén los ojos abiertos.',
      time: '22:00',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const qText = textToSend || query;
    if (!qText.trim() || loading) return;

    setLoading(true);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      const reply = await onAskAI(qText.trim());
      setConversation((prev) => [...prev, { q: qText.trim(), a: reply, time }]);
      setQuery('');
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        { q: qText.trim(), a: 'La conexión con el más allá se ha interrumpido momentáneamente.', time },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    '¿Quién anda con actitud de mandilón?',
    '¿Se detectaron migajas sospechosas?',
    '¿Algún rumor sobre el 7-Eleven o la pizza?',
    'Dame una pista críptica sobre el asesino',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-end sm:justify-center p-3 sm:p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Árbitro IA & Dios de la Fiesta</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[10px] text-neutral-400">
                Alimentado por Gemini 3.8 con el lore del grupo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              disabled={loading}
              className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-950 hover:bg-purple-950/40 border border-neutral-800 hover:border-purple-500/40 text-neutral-300 transition shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 text-xs">
          {conversation.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              {/* Question */}
              <div className="flex justify-end">
                <div className="bg-rose-600 text-white rounded-2xl rounded-br-none px-3 py-2 max-w-[85%] font-medium">
                  {item.q}
                </div>
              </div>
              {/* Answer */}
              <div className="flex justify-start">
                <div className="bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-2xl rounded-bl-none px-3.5 py-2.5 max-w-[90%] space-y-1 leading-relaxed">
                  <div className="flex items-center gap-1 text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Árbitro IA ({item.time})
                  </div>
                  <div>{item.a}</div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-neutral-400 text-xs p-2">
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
              <span>Consultando a las entidades de la fiesta...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 pt-3 border-t border-neutral-800 mt-2"
        >
          <input
            type="text"
            placeholder="Pregúntale al Árbitro IA..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-medium"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
