import confetti from "canvas-confetti";

const PALETTE = ["#e94560", "#4ecca3", "#4fc3f7", "#f9a825"];

/** Confetti para acerto no quiz — intensidade cresce com streak. */
export function celebrateQuizCorrect(streak: number) {
  confetti({
    particleCount: 40 + Math.min(streak * 10, 60),
    spread: 70,
    origin: { y: 0.6 },
    colors: PALETTE,
  });
}

/** Confetti grand finale quando o quiz é completado. */
export function celebrateQuizComplete() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors: PALETTE,
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(200 * particleRatio),
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.15, { spread: 150, startVelocity: 45 });
}
