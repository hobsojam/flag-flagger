// Feedback tones are synthesized with the Web Audio API rather than shipped
// as audio files — this keeps the feature at zero bytes of bundled assets
// and sidesteps any licensing question around sourcing sound clips.

interface ToneStep {
  frequency: number
  duration: number
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext
  if (!Ctor) return null
  audioContext ??= new Ctor()
  // Browsers suspend contexts created without a preceding user gesture, but
  // playTones is only ever called from inside an answer-click handler, so
  // resuming here is safe and just a formality on most browsers.
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

function playTones(steps: ToneStep[], waveform: OscillatorType) {
  const ctx = getAudioContext()
  if (!ctx) return

  let startTime = ctx.currentTime
  for (const { frequency, duration } of steps) {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = waveform
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.15, startTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
    startTime += duration
  }
}

export function playCorrectSound() {
  playTones(
    [
      { frequency: 880, duration: 0.09 },
      { frequency: 1318.5, duration: 0.14 },
    ],
    'sine',
  )
}

export function playIncorrectSound() {
  playTones(
    [
      { frequency: 300, duration: 0.16 },
      { frequency: 220, duration: 0.2 },
    ],
    'sine',
  )
}
