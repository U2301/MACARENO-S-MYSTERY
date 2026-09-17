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

type NotificationListener = (payload: PushNotificationPayload) => void;

class NotificationManager {
  private listeners: Set<NotificationListener> = new Set();
  private isBrowserSupported: boolean = false;
  private isVibrationSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isBrowserSupported = 'Notification' in window;
      this.isVibrationSupported = 'vibrate' in navigator;
    }
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isBrowserSupported) return 'unsupported';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isBrowserSupported) return false;
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('macareno_notifs_granted', permission === 'granted' ? 'true' : 'false');
      return permission === 'granted';
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
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

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public trigger(payload: PushNotificationPayload): void {
    if (!this.isEnabled()) return;

    // 1. Physical Phone Vibration
    if (this.isVibrationSupported && this.isVibrationEnabled()) {
      try {
        const pattern = VIBRATION_PATTERNS[payload.type] || VIBRATION_PATTERNS.general;
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

    // 3. Web Push Notification (System Tray / Lock Screen if permitted)
    if (this.isBrowserSupported && Notification.permission === 'granted') {
      try {
        const notif = new Notification(payload.title, {
          body: payload.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: payload.id || 'macareno_' + Date.now(),
        });

        // Close after 7 seconds
        setTimeout(() => notif.close(), 7000);
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
