// hooks/shared/useNotificationSound.ts
import { useRef, useCallback } from "react";

export function useNotificationSound() {
    const audioCtx = useRef<AudioContext | null>(null);

    const play = useCallback(() => {
        if (typeof window === "undefined") return;

        if (!audioCtx.current) {
            audioCtx.current = new AudioContext();
        }

        const ctx = audioCtx.current;

        // Double ding mirip Lark
        const dings = [
            { freq: 1318.5, delay: 0 },    // E6 — ding pertama
            { freq: 1046.5, delay: 0.18 }, // C6 — ding kedua (lebih rendah)
        ];

        dings.forEach(({ freq, delay }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Tambahin slight reverb feel pakai dua oscillator
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            // Main tone
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + delay + 0.01); // attack cepat
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6);

            // Harmonic tipis buat kesan "bell-like"
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime + delay); // oktaf atas
            gain2.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.01);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);

            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 0.7);

            osc2.start(ctx.currentTime + delay);
            osc2.stop(ctx.currentTime + delay + 0.4);
        });
    }, []);

    return { play };
}