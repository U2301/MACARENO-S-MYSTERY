import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Skull,
  Bell,
  Sun,
  Moon,
  Users,
  MessageSquare,
  Smartphone,
  Radio,
  Flame,
  Target,
  CheckCircle2,
  Lock,
  LogOut,
  Trophy,
  AlertTriangle,
  Zap,
  Sparkles,
  Bot,
  Copy,
  CheckCircle,
  Coins
} from 'lucide-react';
import {
  Player,
  GameState,
  ChatMessage,
  GamePhase,
  RoleType,
  MurderReport,
  PushNotificationPayload
} from './types';
import { soundManager } from './utils/audio';
import { notificationManager } from './utils/notifications';
import { RoleCard } from './components/RoleCard';
import { ChatSystem } from './components/ChatSystem';
import { EmergencyModal } from './components/EmergencyModal';
import { HackerGlitchOverlay } from './components/HackerGlitchOverlay';
import { LoginModal } from './components/LoginModal';
import { JoinScreen } from './components/JoinScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { MissionsPanel } from './components/MissionsPanel';
import { AIOracleModal } from './components/AIOracleModal';
import { ShopPanel } from './components/ShopPanel';
import { EndGameScreen } from './components/EndGameScreen';
import { RoleCompendiumModal } from './components/RoleCompendiumModal';
import { MacarenoWheelModal } from './components/MacarenoWheelModal';
import { MacarenoWheelBanner } from './components/MacarenoWheelBanner';
import { PushBanner } from './components/PushBanner';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { GameTutorialModal } from './components/GameTutorialModal';
import { BookOpen, HelpCircle } from 'lucide-react';

export default function App() {
  // Session / Room state
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Modals & UI states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAIOracleOpen, setIsAIOracleOpen] = useState(false);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [currentBannerNotification, setCurrentBannerNotification] = useState<PushNotificationPayload | null>(null);

  // Wheel tracking states to prevent infinite loops & allow normal screen interaction
  const [dismissedWheelEventIds, setDismissedWheelEventIds] = useState<string[]>([]);
  const [dismissedWheelBannerIds, setDismissedWheelBannerIds] = useState<string[]>([]);
  const [userOpenedWheelModal, setUserOpenedWheelModal] = useState<boolean>(false);
  const [alreadySpunWheelEventIds, setAlreadySpunWheelEventIds] = useState<string[]>([]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'role' | 'missions' | 'shop' | 'chat'>('role');
  const [dismissedEndGame, setDismissedEndGame] = useState(false);

  const prevPhaseRef = useRef<GamePhase | null>(null);
  const prevEmergencyRef = useRef<boolean>(false);
  const lastHandledPushIdRef = useRef<string | null>(null);

  // Track notification permission status
  useEffect(() => {
    setNotificationPermission(notificationManager.getPermissionStatus());
  }, [isNotificationModalOpen]);

  // 1. Polling interval to sync room state with server
  useEffect(() => {
    if (!currentRoomCode) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/rooms/${currentRoomCode}`);
        if (res.ok) {
          const data = await res.json();
          setGameState(data.roomState);
          setPlayers(data.players);
          setChatMessages(data.chatMessages);

          // Update current player instance with latest data (e.g. if killed or roles assigned)
          if (currentPlayer) {
            const updatedMe = data.players.find((p: Player) => p.id === currentPlayer.id);
            if (updatedMe) setCurrentPlayer(updatedMe);
          }

          // Handle incoming push notifications from server
          if (data.roomState.latestPush && data.roomState.latestPush.id !== lastHandledPushIdRef.current) {
            lastHandledPushIdRef.current = data.roomState.latestPush.id;
            notificationManager.trigger(data.roomState.latestPush);
            setCurrentBannerNotification(data.roomState.latestPush);
          }

          // Sound triggers on phase transition
          if (prevPhaseRef.current && prevPhaseRef.current !== data.roomState.phase) {
            soundManager.playPhaseTransition(data.roomState.phase === 'Noche');
          }
          prevPhaseRef.current = data.roomState.phase;

          // Sound trigger on emergency
          if (!prevEmergencyRef.current && data.roomState.isEmergencyActive) {
            soundManager.playEmergencyAlarm();
          }
          prevEmergencyRef.current = data.roomState.isEmergencyActive;

          // Confetti on victory
          if (data.roomState.winner) {
            confetti({ particleCount: 100, spread: 80 });
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [currentRoomCode, currentPlayer?.id]);

  // Auto-show step-by-step tutorial on first game start
  useEffect(() => {
    if (gameState?.status === 'playing') {
      const seen = localStorage.getItem('macareno_tutorial_seen');
      if (!seen) {
        setIsTutorialOpen(true);
      }
    }
  }, [gameState?.status]);

  // 2. Action Helpers
  const sendRoomAction = async (actionType: string, payload: any = {}) => {
    if (!currentRoomCode || !currentPlayer) return { success: false };
    try {
      const res = await fetch(`/api/rooms/${currentRoomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayer.id,
          actionType,
          payload,
        }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Action error:', err);
      return { success: false, error: 'Error al comunicarse con el servidor' };
    }
  };

  // Handlers
  const handleCreateRoom = async (name: string, avatar: string, pin: string, customCode?: string) => {
    setJoinErrorMessage(null);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: name, avatar, pin, roomCode: customCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentRoomCode(data.roomCode);
        setCurrentPlayer(data.player);
        setGameState(data.roomState);
        setPlayers(data.players);
      } else {
        setJoinErrorMessage(data.error || 'No se pudo crear la sala.');
      }
    } catch (err) {
      setJoinErrorMessage('Error de red al crear la sala.');
    }
  };

  const handleJoinRoom = async (roomCode: string, name: string, avatar: string, pin: string) => {
    setJoinErrorMessage(null);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, name, avatar, pin }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentRoomCode(data.roomCode);
        setCurrentPlayer(data.player);
        setGameState(data.roomState);
        setPlayers(data.players);
      } else {
        setJoinErrorMessage(data.error || 'No se pudo ingresar a la sala.');
      }
    } catch (err) {
      setJoinErrorMessage('Error de red al unirse a la sala.');
    }
  };

  const handleStartGame = async () => {
    if (!currentRoomCode || !currentPlayer) return;
    try {
      const res = await fetch(`/api/rooms/${currentRoomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayer.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setGameState(data.roomState);
        setPlayers(data.players);
        setChatMessages(data.chatMessages);
        const me = data.players.find((p: Player) => p.id === currentPlayer.id);
        if (me) setCurrentPlayer(me);
        soundManager.playPhaseTransition(false);
      }
    } catch (err) {
      console.error('Start game error:', err);
    }
  };

  const handleRegisterKill = async (victimCode: string) => {
    const res = await sendRoomAction('kill', { victimCode });
    if (res.success) {
      soundManager.playMurderStinger();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.error || 'Código incorrecto.' };
  };

  const handleCallEmergency = () => {
    soundManager.playEmergencyAlarm();
    sendRoomAction('emergency');
  };

  const handleCastVote = (targetId: string, useDoubleVote?: boolean) => {
    soundManager.playTick();
    sendRoomAction('vote', { targetId, useDoubleVote });
  };

  const handleStartDefense = (accusedId: string) => {
    soundManager.playEmergencyAlarm();
    sendRoomAction('start_defense', { accusedId });
  };

  const handleSpinMacareno = () => {
    soundManager.playTick();
    sendRoomAction('spin_macareno_wheel');
    setUserOpenedWheelModal(true);
  };

  const handleCloseWheelModal = () => {
    if (gameState?.macarenoEvent?.id) {
      setDismissedWheelEventIds((prev) => [...prev, gameState.macarenoEvent!.id]);
      setAlreadySpunWheelEventIds((prev) => [...prev, gameState.macarenoEvent!.id]);
    }
    setUserOpenedWheelModal(false);
  };

  const handleDismissWheelForAll = async () => {
    await sendRoomAction('dismiss_macareno_wheel');
    handleCloseWheelModal();
  };

  const handleDismissWheelBanner = () => {
    if (gameState?.macarenoEvent?.id) {
      setDismissedWheelBannerIds((prev) => [...prev, gameState.macarenoEvent!.id]);
    }
  };

  const handleBroadcastPush = async (title: string, body: string): Promise<boolean> => {
    const res = await sendRoomAction('broadcast_push', { title, body });
    return Boolean(res.success);
  };

  const handleCollectMigajas = async () => {
    const res = await sendRoomAction('collect_migajas');
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
    }
  };

  const handleConcludeMeeting = (expelledPlayerId: string | null) => {
    sendRoomAction('conclude_meeting', { expelledPlayerId });
  };

  const handleAdvanceMission = (missionId: string) => {
    soundManager.playTick();
    sendRoomAction('advance_mission', { missionId });
  };

  const handleTriggerHackerPulse = () => {
    soundManager.playGlitch();
    sendRoomAction('hacker_emp');
  };

  const handleUseFotografo = async (targetId: string) => {
    const res = await sendRoomAction('fotografo_snap', { targetId });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playCameraClick();
    }
  };

  const handleAccelerateFotografo = async () => {
    const res = await sendRoomAction('fotografo_accelerate');
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
    }
  };

  const handleUseEscolta = async (targetId: string, targetCode?: string) => {
    const res = await sendRoomAction('escolta_protect', { targetId, targetCode });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playTick();
      return { success: true };
    }
    return { success: false, error: res.error || 'Código incorrecto' };
  };

  const handleConfirmEscoltaFaceToFace = async () => {
    const res = await sendRoomAction('escolta_confirm_face_to_face');
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
    }
  };

  const handleUseDetective = async (p1Id: string, p2Id: string) => {
    const res = await sendRoomAction('detective_investigate', { p1Id, p2Id });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playTick();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al investigar' };
  };

  const handleUseSommelier = async (targetId: string, targetCode: string) => {
    const res = await sendRoomAction('sommelier_toast', { targetId, targetCode });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
      return { success: true };
    }
    return { success: false, error: res.error || 'Código incorrecto al brindar' };
  };

  const handleUseBarman = async (targetId: string) => {
    const res = await sendRoomAction('barman_poison', { targetId });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playGlitch();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al verter veneno' };
  };

  const handleUseAbogado = async (targetId: string) => {
    const res = await sendRoomAction('abogado_shield', { targetId });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al emitir amparo' };
  };

  const handleUseCazadorVengeance = async (targetId: string) => {
    const res = await sendRoomAction('cazador_vengeance', { targetId });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playMurderStinger();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al disparar venganza' };
  };

  const handleUseChismoso = async (p1Id: string, p2Id: string) => {
    const res = await sendRoomAction('chismoso_compare', { p1Id, p2Id });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
      return { success: true, chismosoReport: res.chismosoReport };
    }
    return { success: false, error: res.error || 'Error al cotejar' };
  };

  const handleSubmitPeriodistaTheory = async (targetId: string, guessedRole: RoleType) => {
    const res = await sendRoomAction('periodista_investigate', { targetId, guessedRole });
    if (res.success) {
      if (res.player) setCurrentPlayer(res.player);
      if (res.isCorrect) soundManager.playSuccess();
      return { success: true, isCorrect: !!res.isCorrect };
    }
    return { success: false, error: res.error || 'Error al investigar teoría' };
  };

  const handleUseMedicoAntidote = async (targetId: string, targetCode: string) => {
    const res = await sendRoomAction('medico_antidote', { targetId, targetCode });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al inyectar antídoto' };
  };

  const handleUseAbogadoDefensor = async (targetId: string, targetCode: string) => {
    const res = await sendRoomAction('abogado_defensor_protect', { targetId, targetCode });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al firmar defensa legal' };
  };

  const handleUseTitiritero = async (targetId: string, assignedRole: RoleType) => {
    const res = await sendRoomAction('titiritero_madness', { targetId, assignedRole });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playGlitch();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al imponer locura' };
  };

  const handleSubmitAlibiCode = async (code: string) => {
    const res = await sendRoomAction('alibi_submit_code', { code });
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playSuccess();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al registrar coartada' };
  };

  const handlePadrinoSkipKill = async () => {
    const res = await sendRoomAction('padrino_skip_kill');
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playTick();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al activar acecho' };
  };

  const handleImpTransfer = async () => {
    const res = await sendRoomAction('imp_transfer');
    if (res.success && res.player) {
      setCurrentPlayer(res.player);
      soundManager.playMurderStinger();
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al traspasar mando' };
  };

  const handleRestartGame = async () => {
    if (!currentRoomCode || !currentPlayer) return;
    try {
      const res = await fetch(`/api/rooms/${currentRoomCode}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayer.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setGameState(data.roomState);
        setPlayers(data.players);
        if (data.chatMessages) setChatMessages(data.chatMessages);
        const me = data.players.find((p: Player) => p.id === currentPlayer.id);
        if (me) setCurrentPlayer(me);
        setDismissedEndGame(false);
        soundManager.playSuccess();
      }
    } catch (err) {
      console.error('Reset game error:', err);
    }
  };

  const handleSendMessage = (
    receiverId: string | null,
    content: string,
    asChameleon?: boolean,
    targetDisguiseName?: string
  ) => {
    sendRoomAction('send_message', { receiverId, content, asChameleon, targetDisguiseName });
  };

  const handleAskAI = async (query: string): Promise<string> => {
    const res = await sendRoomAction('ai_consult', { query });
    return res.reply || 'El Árbitro IA guarda silencio.';
  };

  const handleBuyItem = async (itemId: string) => {
    const res = await sendRoomAction('buy_item', { itemId });
    if (res.success) {
      if (res.player) setCurrentPlayer(res.player);
      if (res.roomState) setGameState(res.roomState);
      soundManager.playSuccess();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.error || 'Error al comprar.' };
  };

  const handleTransferCoins = async (targetPlayerId: string, amount: number) => {
    const res = await sendRoomAction('transfer_coins', { targetPlayerId, amount });
    if (res.success) {
      if (res.senderBalance !== undefined) {
        setCurrentPlayer((prev) => (prev ? { ...prev, coins: res.senderBalance } : prev));
      }
      soundManager.playTick();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.error || 'Error al transferir.' };
  };

  // If not joined to any room yet -> Show JoinScreen
  if (!currentRoomCode || !currentPlayer || !gameState) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center p-4">
        <JoinScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          errorMessage={joinErrorMessage}
        />
      </div>
    );
  }

  // If room is in 'lobby' -> Show LobbyScreen
  if (gameState.status === 'lobby') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center p-4">
        <LobbyScreen
          roomState={gameState}
          players={players}
          currentPlayer={currentPlayer}
          onStartGame={handleStartGame}
          onLeaveRoom={() => {
            setCurrentRoomCode(null);
            setCurrentPlayer(null);
            setGameState(null);
          }}
        />
      </div>
    );
  }

  // ACTIVE GAMEPLAY: 100% PURE CELLPHONE SCREEN
  const isHackerGlitchActive =
    gameState.hackerGlitchActiveUntil !== null &&
    gameState.hackerGlitchActiveUntil > Date.now() &&
    currentPlayer.team === 'Fiesta (Inocentes)';

  const hackerGlitchSecondsRemaining = gameState.hackerGlitchActiveUntil
    ? Math.max(0, Math.ceil((gameState.hackerGlitchActiveUntil - Date.now()) / 1000))
    : 0;

  const phaseMinutes = Math.floor(gameState.phaseTimeRemaining / 60);
  const phaseSeconds = gameState.phaseTimeRemaining % 60;
  const formattedPhaseTimer = `${phaseMinutes.toString().padStart(2, '0')}:${phaseSeconds
    .toString()
    .padStart(2, '0')}`;

  const isNight = gameState.phase === 'Noche';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans pb-24 selection:bg-rose-500/30 selection:text-rose-200">
      {/* End Game (Victory / Defeat) Full Screen */}
      {(gameState.winner || gameState.status === 'ended') && !dismissedEndGame && (
        <EndGameScreen
          currentPlayer={currentPlayer}
          players={players}
          gameState={gameState}
          isHost={currentPlayer.isHost}
          onRestartGame={handleRestartGame}
          onDismissToReview={() => setDismissedEndGame(true)}
        />
      )}

      {/* Floating Re-open End Game Button when dismissed to review chat */}
      {(gameState.winner || gameState.status === 'ended') && dismissedEndGame && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-bounce">
          <button
            onClick={() => setDismissedEndGame(false)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-2xl flex items-center justify-center gap-2 border border-white/20"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Ver Pantalla de Fin de Partida (Resultados)</span>
          </button>
        </div>
      )}

      {/* Hacker EMP Glitch Overlay for Innocents */}
      {isHackerGlitchActive && (
        <HackerGlitchOverlay timeRemainingSeconds={hackerGlitchSecondsRemaining} />
      )}

      {/* Emergency Assembly Modal */}
      {gameState.isEmergencyActive && (
        <EmergencyModal
          callerName={gameState.emergencyCallerName}
          timeRemaining={gameState.emergencyTimeRemaining}
          meetingRound={gameState.meetingRound}
          players={players}
          currentPlayer={currentPlayer}
          votes={gameState.votes}
          doubleVoteUsers={gameState.doubleVoteUsers}
          accusedPlayerId={gameState.accusedPlayerId}
          defenseTimerRemaining={gameState.defenseTimerRemaining}
          tribunalStage={gameState.tribunalStage}
          onCastVote={handleCastVote}
          onConcludeMeeting={handleConcludeMeeting}
          onStartDefense={handleStartDefense}
        />
      )}

      {/* Push Notification Banner (Top floating toast) */}
      <PushBanner
        notification={currentBannerNotification}
        onDismiss={() => setCurrentBannerNotification(null)}
        onClick={() => setIsNotificationModalOpen(true)}
      />

      {/* Floating Macareno Wheel Persistent Banner (when modal is closed/minimized but event is active) */}
      {Boolean(
        gameState.macarenoWheelActive &&
        gameState.macarenoEvent &&
        !(userOpenedWheelModal || !dismissedWheelEventIds.includes(gameState.macarenoEvent.id)) &&
        !dismissedWheelBannerIds.includes(gameState.macarenoEvent.id)
      ) && (
        <MacarenoWheelBanner
          event={gameState.macarenoEvent || null}
          timeRemaining={gameState.eventTimeRemaining}
          currentPlayer={currentPlayer}
          onOpenModal={() => setUserOpenedWheelModal(true)}
          onCollectMigajas={handleCollectMigajas}
          onDismiss={handleDismissWheelBanner}
        />
      )}

      {/* Macareno Random Wheel Modal */}
      <MacarenoWheelModal
        isOpen={Boolean(
          gameState.macarenoWheelActive &&
          gameState.macarenoEvent &&
          (userOpenedWheelModal || !dismissedWheelEventIds.includes(gameState.macarenoEvent.id))
        )}
        event={gameState.macarenoEvent || null}
        currentPlayer={currentPlayer}
        isHost={currentPlayer.isHost}
        timeRemaining={gameState.eventTimeRemaining}
        isAlreadySpun={Boolean(gameState.macarenoEvent && alreadySpunWheelEventIds.includes(gameState.macarenoEvent.id))}
        onCollectMigajas={handleCollectMigajas}
        onClose={handleCloseWheelModal}
        onForceSpin={handleSpinMacareno}
        onDismissForAll={handleDismissWheelForAll}
      />

      {/* Notification and Vibration Settings & Broadcast Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        isHost={currentPlayer.isHost}
        onBroadcastPush={handleBroadcastPush}
      />

      {/* AI Oracle & Árbitro Modal */}
      <AIOracleModal
        isOpen={isAIOracleOpen}
        onClose={() => setIsAIOracleOpen(false)}
        onAskAI={handleAskAI}
      />

      {/* Role Compendium & Guide Modal (Accessible anytime in-game) */}
      <RoleCompendiumModal
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
        initialRole={currentPlayer.role}
      />

      {/* Step-by-Step Game Tutorial Modal (Onboarding & Icon/Action Guide) */}
      <GameTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        currentPlayer={currentPlayer}
        onNavigateToCompendium={() => setIsCompendiumOpen(true)}
      />

      {/* Mobile Top Navigation Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{currentPlayer.avatar}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-none">{currentPlayer.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                    currentPlayer.isAlive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {currentPlayer.isAlive ? 'Vivo' : 'Alma'}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                SALA: {gameState.roomCode}
              </div>
            </div>
          </div>

          {/* Phase Cycle Badge + Timer + Wallet + Guide + Tutorial + AI */}
          <div className="flex items-center gap-1.5">
            {/* Step-by-step Tutorial & Icons Guide Button */}
            <button
              id="open-tutorial-header-btn"
              onClick={() => setIsTutorialOpen(true)}
              className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500/25 transition"
              title="Tutorial Paso a Paso: Iconos y Acciones"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
            </button>

            {/* Roles Guide & Instructions Button */}
            <button
              id="open-compendium-header-btn"
              onClick={() => setIsCompendiumOpen(true)}
              className="p-2 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-white hover:border-rose-500/40 transition"
              title="Guía de Roles e Instrucciones"
            >
              <BookOpen className="w-4 h-4 text-rose-400" />
            </button>

            {/* Coins wallet button */}
            <button
              id="open-shop-header-btn"
              onClick={() => setActiveMobileTab('shop')}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs hover:bg-amber-500/25 transition active:scale-95"
              title="Abrir Mercado del Seven"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>🪙 {currentPlayer.coins ?? 0}</span>
            </button>

            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-mono font-bold ${
                isNight
                  ? 'bg-purple-950/50 border-purple-800/60 text-purple-300'
                  : 'bg-amber-950/50 border-amber-800/60 text-amber-300'
              }`}
            >
              {isNight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{formattedPhaseTimer}</span>
            </div>

            {/* AI Árbitro Button */}
            <button
              id="open-ai-oracle-btn"
              onClick={() => setIsAIOracleOpen(true)}
              className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 hover:text-white transition relative"
              title="Consultar al Árbitro IA"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
            </button>

            {/* Cellphone Push Notifications & Vibration Button */}
            <button
              id="open-notifications-header-btn"
              onClick={() => setIsNotificationModalOpen(true)}
              className="p-2 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-white hover:border-emerald-500/40 transition relative"
              title="Notificaciones Celular y Vibración"
            >
              <Bell className="w-4 h-4 text-emerald-400" />
              {notificationPermission !== 'granted' && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-neutral-900 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 space-y-4 flex-1">
        {/* Winner Banner */}
        {gameState.winner && (
          <div className="p-4 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-center space-y-1">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
            <h3 className="text-sm font-black text-white uppercase">
              ¡Partida Ganada por: {gameState.winner}!
            </h3>
          </div>
        )}

        {/* Active Macareno Wheel Banner */}
        {gameState.macarenoWheelActive && gameState.macarenoEvent && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-950/40 to-neutral-900 border border-purple-500/40 flex items-start gap-2.5 shadow-lg">
            <span className="text-xl shrink-0 animate-bounce">🐱💀</span>
            <div className="text-xs flex-1">
              <div className="font-bold text-pink-300 flex items-center justify-between">
                <span>Ruleta de Macareno: {gameState.macarenoEvent.title}</span>
                <span className="text-[10px] font-mono text-amber-400">
                  ⏳ {gameState.eventTimeRemaining}s
                </span>
              </div>
              <p className="text-neutral-300 text-[11px] mt-0.5">
                {gameState.macarenoEvent.instructions}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setUserOpenedWheelModal(true)}
                  className="py-1 px-2.5 rounded-xl bg-purple-800/50 hover:bg-purple-700/60 border border-purple-500/40 text-purple-200 text-[10px] font-bold transition flex items-center gap-1"
                >
                  <span>🎡 Ver Ruleta</span>
                </button>
                {gameState.macarenoEvent.effectType === 'migajas' && !gameState.macarenoEvent.migajasCollected && (
                  <button
                    onClick={handleCollectMigajas}
                    className="py-1 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[10px] uppercase tracking-wider transition active:scale-95 flex items-center gap-1 shadow"
                  >
                    <span>🥖 ¡Barrer Migajas (+10 🪙)!</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Party Event Banner */}
        {gameState.activeEvent && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>{gameState.activeEvent.title}</span>
                <span className="text-[10px] font-mono text-amber-400">
                  ⏳ {gameState.eventTimeRemaining}s
                </span>
              </div>
              <p className="text-neutral-300 text-[11px] mt-0.5">
                {gameState.activeEvent.instructions}
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: Secret Role Card & Emergency Panic Button */}
        {activeMobileTab === 'role' && (
          <div className="space-y-4">
            <RoleCard
              player={currentPlayer}
              players={players}
              currentPhase={gameState.phase}
              murderHistory={gameState.murderHistory}
              hackerGlitchActiveUntil={gameState.hackerGlitchActiveUntil}
              onRegisterKill={(code) => handleRegisterKill(code)}
              onTriggerHackerPulse={handleTriggerHackerPulse}
              onUseChismoso={handleUseChismoso}
              onUseEscolta={handleUseEscolta}
              onConfirmEscoltaFaceToFace={handleConfirmEscoltaFaceToFace}
              onUseFotografo={handleUseFotografo}
              onAccelerateFotografo={handleAccelerateFotografo}
              onSubmitPeriodistaTheory={handleSubmitPeriodistaTheory}
              onUseDetective={handleUseDetective}
              onUseSommelier={handleUseSommelier}
              onUseBarman={handleUseBarman}
              onUseAbogado={handleUseAbogado}
              onUseCazadorVengeance={handleUseCazadorVengeance}
              onUseMedicoAntidote={handleUseMedicoAntidote}
              onUseAbogadoDefensor={handleUseAbogadoDefensor}
              onUseTitiritero={handleUseTitiritero}
              onSubmitAlibiCode={handleSubmitAlibiCode}
              onPadrinoSkipKill={handlePadrinoSkipKill}
              onImpTransfer={handleImpTransfer}
              onOpenTutorial={() => setIsTutorialOpen(true)}
            />

            {/* Panic Buzzer for Emergency Meeting */}
            <div className="rounded-3xl border border-red-950 bg-gradient-to-b from-red-950/25 to-neutral-900/90 p-5 text-center space-y-2 shadow-xl">
              <div className="flex items-center justify-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-red-300">
                  Sirena de Asamblea General
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                Convoca a todos a debatir si encontraste una baja o viste a alguien sospechoso.
              </p>
              <button
                id="emergency-panic-btn"
                onClick={handleCallEmergency}
                disabled={!currentPlayer.isAlive || currentPlayer.emergencyCallsLeft <= 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-950/50 transition active:scale-95"
              >
                {currentPlayer.isAlive
                  ? `🚨 Convocar Asamblea (${currentPlayer.emergencyCallsLeft} disponible)`
                  : 'Las almas en pena no pueden convocar asambleas'}
              </button>

              {/* Host Control to trigger Macareno Roulette on demand */}
              {currentPlayer.isHost && (
                <button
                  id="host-macareno-btn"
                  onClick={handleSpinMacareno}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 font-bold text-[11px] transition flex items-center justify-center gap-1.5"
                >
                  <span>🐱💀 Girar Ruleta de Macareno (Control Anfitrión)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 5 Lore Missions Panel */}
        {activeMobileTab === 'missions' && (
          <div className="space-y-4">
            <MissionsPanel
              missions={currentPlayer.missions || []}
              isAlive={currentPlayer.isAlive}
              onAdvanceMission={handleAdvanceMission}
            />

            {/* Collective Task Progress Bar */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-neutral-300">Meta Colectiva de la Fiesta</span>
                <span className="text-amber-400 font-mono">
                  {Math.round(gameState.collectiveTaskProgress)}% / 100%
                </span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, gameState.collectiveTaskProgress)}%` }}
                />
              </div>
              <p className="text-[10px] text-neutral-500">
                Si la fiesta completa el 100% de las tareas antes de que los asesinos igualen a los vivos, ¡los inocentes ganan la partida!
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Mercado Negro del Seven (Shop & Transfers) */}
        {activeMobileTab === 'shop' && (
          <ShopPanel
            player={currentPlayer}
            players={players}
            onBuyItem={handleBuyItem}
            onTransferCoins={handleTransferCoins}
          />
        )}

        {/* TAB 4: Secret Whispers & Party Chat */}
        {activeMobileTab === 'chat' && (
          <ChatSystem
            currentPlayer={currentPlayer}
            players={players}
            messages={chatMessages}
            currentPhase={gameState.phase}
            onSendMessage={handleSendMessage}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar for Cellphones */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur border-t border-neutral-800 px-3 py-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5">
          <button
            id="tab-role"
            onClick={() => setActiveMobileTab('role')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeMobileTab === 'role'
                ? 'bg-rose-600/20 text-rose-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Skull className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Mi Rol</span>
          </button>

          <button
            id="tab-missions"
            onClick={() => setActiveMobileTab('missions')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeMobileTab === 'missions'
                ? 'bg-amber-500/20 text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Misiones</span>
            {(currentPlayer.missions || []).some((m) => !m.completed) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-5" />
            )}
          </button>

          <button
            id="tab-shop"
            onClick={() => setActiveMobileTab('shop')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeMobileTab === 'shop'
                ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
              Tienda
              <span className="text-[9px] font-mono text-amber-400 font-bold">({currentPlayer.coins ?? 0})</span>
            </span>
          </button>

          <button
            id="tab-chat"
            onClick={() => setActiveMobileTab('chat')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeMobileTab === 'chat'
                ? 'bg-sky-500/20 text-sky-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Chat & IA</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
