import { soundManager } from './audio';
import { PushNotificationPayload, PushNotificationType } from '../types';

// Vibration patterns (in milliseconds)
const VIBRATION_PATTERNS: Record<PushNotificationType, number[]> = {
  emergency: [350, 150, 350, 150, 450],
  murder: [500, 150, 500],
  wheel: [250, 100, 250],
  phase: [300, 100, 300],
  whisper: [120, 80, 120],
  broadcast: [300, 120, 300, 120, 400],
  general: [200, 100, 200],
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type NotificationListener = (payload: PushNotificationPayload) => void;

class NotificationManager {
  private listeners: Set<NotificationListener> = new Set();
  private isBrowserSupported: boolean = false;
  private isVibrationSupported: boolean = false;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private currentSubscribedRoom: string | null = null;
  private currentSubscribedPlayer: string | null = null;
  private wakeLockSentinel: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isBrowserSupported = 'Notification' in window;
      this.isVibrationSupported = 'vibrate' in navigator;
      this.initServiceWorker();
      this.initVisibilityListener();
    }
  }

  private async initServiceWorker() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        this.swRegistration = reg;
        console.log('ServiceWorker registered with scope:', reg.scope);
      } catch (err) {
        console.warn('ServiceWorker registration error:', err);
      }
    }
  }

  private initVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', async () => {
        // If user returns to tab and screen wake lock is enabled, re-acquire lock
        if (document.visibilityState === 'visible' && this.isWakeLockEnabled()) {
          this.requestWakeLock();
        }
      });
    }
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isBrowserSupported) return 'unsupported';
    return Notification.permission;
  }

  public async requestPermission(roomCode?: string, playerId?: string): Promise<boolean> {
    if (!this.isBrowserSupported) return false;
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('macareno_notifs_granted', permission === 'granted' ? 'true' : 'false');

      if (permission === 'granted' && roomCode && playerId) {
        await this.syncPushSubscription(roomCode, playerId);
      }
      return permission === 'granted';
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }

  public async syncPushSubscription(roomCode: string, playerId: string): Promise<boolean> {
    if (typeof window === 'undefined' || !this.isBrowserSupported) return false;
    if (Notification.permission !== 'granted') return false;

    try {
      if (!('serviceWorker' in navigator)) return false;
      const reg = this.swRegistration || (await navigator.serviceWorker.ready);
      this.swRegistration = reg;

      if (!('pushManager' in reg)) {
        console.warn('PushManager not supported on this browser.');
        return false;
      }

      // Check if already subscribed to same room & player
      if (
        this.currentSubscribedRoom === roomCode &&
        this.currentSubscribedPlayer === playerId
      ) {
        return true;
      }

      // Fetch VAPID public key
      const keyRes = await fetch('/api/push/vapid-public-key');
      if (!keyRes.ok) return false;
      const { publicKey } = await keyRes.json();
      if (!publicKey) return false;

      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // Register subscription on server for this room and player
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerId,
          subscription,
        }),
      });

      this.currentSubscribedRoom = roomCode;
      this.currentSubscribedPlayer = playerId;
      console.log('WebPush successfully subscribed for room:', roomCode);
      return true;
    } catch (err) {
      console.warn('Sync push subscription error:', err);
      return false;
    }
  }

  public isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const pref = localStorage.getItem('macareno_notifs_enabled');
    return pref !== 'false';
  }

  public setEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('macareno_notifs_enabled', enabled ? 'true' : 'false');
  }

  public isVibrationEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const pref = localStorage.getItem('macareno_vibrate_enabled');
    return pref !== 'false';
  }

  public setVibrationEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('macareno_vibrate_enabled', enabled ? 'true' : 'false');
  }

  public isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const pref = localStorage.getItem('macareno_sound_enabled');
    return pref !== 'false';
  }

  public setSoundEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('macareno_sound_enabled', enabled ? 'true' : 'false');
  }

  // Screen Wake Lock methods (keeps phone screen on during live rounds)
  public isWakeLockSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  public isWakeLockEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('macareno_wakelock_enabled') === 'true';
  }

  public setWakeLockEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('macareno_wakelock_enabled', enabled ? 'true' : 'false');
    if (enabled) {
      this.requestWakeLock();
    } else {
      this.releaseWakeLock();
    }
  }

  public async requestWakeLock(): Promise<boolean> {
    if (!this.isWakeLockSupported()) return false;
    try {
      if (this.wakeLockSentinel) return true;
      this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      this.wakeLockSentinel.addEventListener('release', () => {
        this.wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Wake Lock failed:', err);
      return false;
    }
  }

  public async releaseWakeLock(): Promise<void> {
    if (this.wakeLockSentinel) {
      try {
        await this.wakeLockSentinel.release();
      } catch (e) {}
      this.wakeLockSentinel = null;
    }
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public trigger(payload: PushNotificationPayload): void {
    if (!this.isEnabled()) return;

    const pattern = VIBRATION_PATTERNS[payload.type] || VIBRATION_PATTERNS.general;

    // 1. Physical Phone Vibration
    if (this.isVibrationSupported && this.isVibrationEnabled()) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        console.warn('Vibration error:', err);
      }
    }

    // 2. Audio Chime
    if (this.isSoundEnabled()) {
      try {
        if (payload.type === 'emergency') {
          soundManager.playEmergencyAlarm();
        } else if (payload.type === 'murder') {
          soundManager.playMurderStinger();
        } else if (payload.type === 'phase') {
          soundManager.playPhaseTransition(payload.title.toLowerCase().includes('noche'));
        } else {
          soundManager.playNotificationChime();
        }
      } catch (err) {
        console.warn('Sound error:', err);
      }
    }

    // 3. System Notification (ServiceWorker notification if available, fallback to Notification API)
    if (this.isBrowserSupported && Notification.permission === 'granted') {
      try {
        if (this.swRegistration && 'showNotification' in this.swRegistration) {
          this.swRegistration.showNotification(payload.title, {
            body: payload.body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            vibrate: pattern,
            tag: payload.id || 'macareno_' + Date.now(),
            data: { url: window.location.href },
          } as any);
        } else {
          const notif = new Notification(payload.title, {
            body: payload.body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: payload.id || 'macareno_' + Date.now(),
          });
          setTimeout(() => notif.close(), 7000);
        }
      } catch (err) {
        console.warn('Browser system notification failed:', err);
      }
    }

    // 4. In-App Notification Subscribers (Toast / Floating Banner)
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });
  }

  public testNotification(): void {
    this.trigger({
      id: 'test_' + Date.now(),
      type: 'broadcast',
      title: '🔔 Notificación de Prueba',
      body: '¡Tu celular vibrará y sonará cuando ocurran eventos en la fiesta de Macareno!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }
}

export const notificationManager = new NotificationManager();
