/**
 * ShiTest Audio Engine
 * Provides synthesized realistic brass school bell chime (Web Audio API)
 * and regulated voice announcements (Web Speech API).
 */

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  constructor() {
    // Load mute preference from storage
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('shitest_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shitest_audio_muted', String(muted));
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Synthesize an authentic resonant brass gong / school bell chime
   * Uses 3 harmonic layers with distinct decay times and low-pass filter
   */
  public playBrassBell(type: 'single' | 'double' | 'triple' = 'single') {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playStrike = (delaySec: number = 0) => {
      const now = ctx.currentTime + delaySec;

      // Master gain for this strike
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(ctx.destination);

      // Strike transient impulse (sharp metallic click)
      const bufferSize = ctx.sampleRate * 0.05;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, now);
      noiseFilter.Q.setValueAtTime(3, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start(now);

      // Fundamental and resonant partials of a heavy brass bell:
      // ~780Hz (Strike tone), ~1180Hz (Tierce), ~1580Hz (Quint), ~2350Hz (Nominal)
      const partials = [
        { freq: 784, decay: 2.8, gain: 0.7 },
        { freq: 1175, decay: 2.1, gain: 0.5 },
        { freq: 1568, decay: 1.6, gain: 0.35 },
        { freq: 2349, decay: 0.9, gain: 0.2 },
      ];

      partials.forEach(({ freq, decay, gain }) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        // Add tiny frequency drop for realistic bell strike physics
        osc.frequency.setValueAtTime(freq * 1.02, now);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.05);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(gain * this.volume, now + 0.005);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decay);
      });
    };

    if (type === 'single') {
      playStrike(0);
    } else if (type === 'double') {
      playStrike(0);
      playStrike(0.65);
    } else {
      playStrike(0);
      playStrike(0.6);
      playStrike(1.2);
    }
  }

  /**
   * Speak announcement using Web Speech API (English only)
   */
  public speakAnnouncement(text: string) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const targetVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
        if (targetVoice) {
          utterance.voice = targetVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not permitted or unavailable:', e);
    }
  }

  /**
   * Real Board scheduled announcements
   */
  public playScheduleAnnouncement(
    announcementType: 'start' | '1hr' | '2hr' | '3hr' | '10min' | '5min' | 'end',
    _lang?: string
  ) {
    if (this.isMuted) return;

    switch (announcementType) {
      case 'start':
        this.playBrassBell('single');
        setTimeout(() => {
          this.speakAnnouncement('The examination has commenced. You have 3 hours and 15 minutes.');
        }, 1200);
        break;

      case '1hr':
        this.playBrassBell('single');
        setTimeout(() => {
          this.speakAnnouncement('One hour elapsed. 2 hours and 15 minutes remaining.');
        }, 1200);
        break;

      case '2hr':
        this.playBrassBell('single');
        setTimeout(() => {
          this.speakAnnouncement('Two hours elapsed. 1 hour and 15 minutes remaining.');
        }, 1200);
        break;

      case '3hr':
        this.playBrassBell('double');
        setTimeout(() => {
          this.speakAnnouncement('Three hours elapsed. Final 15 minutes remaining. Please start concluding your answers.');
        }, 1500);
        break;

      case '10min':
        this.playBrassBell('single');
        setTimeout(() => {
          this.speakAnnouncement('Warning: Only 10 minutes remaining in the examination.');
        }, 1200);
        break;

      case '5min':
        this.playBrassBell('double');
        setTimeout(() => {
          this.speakAnnouncement('Final 5 minutes. Check your 10-digit roll number on top of every page.');
        }, 1500);
        break;

      case 'end':
        this.playBrassBell('triple');
        setTimeout(() => {
          this.speakAnnouncement('Time is up. Stop writing and upload your handwritten notebook within the 7-minute window.');
        }, 1800);
        break;
    }
  }
}

export const soundManager = new AudioEngine();
