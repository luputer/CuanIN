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

        // Lark-like: dua nada marimba, G5 → E5
        const notes = [
            { freq: 783.99, delay: 0 },     // G5
            { freq: 659.25, delay: 0.16 },  // E5
        ];

        notes.forEach(({ freq, delay }) => {
            // Layer 1: fundamental (triangle — lebih warm dari sine)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "triangle";
            osc1.frequency.value = freq;
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            gain1.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain1.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.008); // attack sangat cepat
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.45);

            // Layer 2: harmonic 2x (bell overtone)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.value = freq * 2;
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            gain2.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.008);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);

            // Layer 3: harmonic 3x tipis (shimmer)
            const osc3 = ctx.createOscillator();
            const gain3 = ctx.createGain();
            osc3.type = "sine";
            osc3.frequency.value = freq * 3;
            osc3.connect(gain3);
            gain3.connect(ctx.destination);
            gain3.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain3.gain.linearRampToValueAtTime(0.04, ctx.currentTime + delay + 0.008);
            gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);

            [osc1, osc2, osc3].forEach((osc, i) => {
                const stops = [0.5, 0.25, 0.15];
                osc.start(ctx.currentTime + delay);
                osc.stop(ctx.currentTime + delay + (stops[i] ?? 0.5));
            });
        });
    }, []);

    return { play };
}