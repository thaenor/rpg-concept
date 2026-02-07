export class MidiHandler {
    constructor() {
        // Create an AudioContext (The conductor of our browser orchestra)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
    }

    playSequence(notes) {
        if (!notes || !Array.isArray(notes)) return;

        // Ensure the audio context is running (browsers sometimes suspend it until user interaction)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;

        notes.forEach(noteData => {
            const note = noteData.note || 60;
            const velocity = (noteData.velocity || 100) / 127; // Normalize velocity 0-1
            const duration = (noteData.duration || 500) / 1000; // Convert ms to seconds
            const delay = (noteData.delay || 0) / 1000; // Convert ms to seconds

            const startTime = now + delay;
            this.playNote(note, velocity, duration, startTime);
        });
    }

    playNote(midiNote, velocity, duration, startTime) {
        // Oscillator: Creates the sound wave (Triangle wave sounds like a flute/NES game)
        const oscillator = this.audioCtx.createOscillator();
        oscillator.type = 'triangle';

        // Convert MIDI note number to Frequency (Hz)
        // Formula: f = 440 * 2^((d - 69)/12)
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        oscillator.frequency.value = frequency;

        // Gain Node: Controls volume (Envelope)
        const gainNode = this.audioCtx.createGain();

        // Connect the plumbing: Oscillator -> Gain -> Speakers
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // -- Volume Envelope (ADSR-ish) --

        // Attack: Fade in quickly to avoid clicking
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(velocity * 0.5, startTime + 0.05);

        // Decay/Sustain: Fade out slightly
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        // Start and Stop
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
}
