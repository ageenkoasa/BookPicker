/**
 * Звук шуршания карты, генерируемый через Web Audio API.
 */
const Sound = {
	playCard() {
		try {
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			if (!AudioContext) return;
			const ctx = new AudioContext();

			const bufferSize = ctx.sampleRate * 0.35;
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const data = buffer.getChannelData(0);
			let b0 = 0,
				b1 = 0,
				b2 = 0,
				b3 = 0,
				b4 = 0,
				b5 = 0,
				b6 = 0;

			for (let i = 0; i < bufferSize; i++) {
				const white = Math.random() * 2 - 1;
				b0 = 0.99886 * b0 + white * 0.0555179;
				b1 = 0.99332 * b1 + white * 0.0750759;
				b2 = 0.969 * b2 + white * 0.153852;
				b3 = 0.8665 * b3 + white * 0.3104856;
				b4 = 0.55 * b4 + white * 0.5329522;
				b5 = -0.7616 * b5 - white * 0.016898;
				data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
				data[i] *= 0.11;
				b6 = white * 0.115926;
			}

			const noiseNode = ctx.createBufferSource();
			noiseNode.buffer = buffer;

			const filter = ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.setValueAtTime(1200, ctx.currentTime);
			filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);

			const gainNode = ctx.createGain();
			gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.32);

			noiseNode.connect(filter);
			filter.connect(gainNode);
			gainNode.connect(ctx.destination);
			noiseNode.start();
		} catch (e) {
			console.log("Audio not supported:", e);
		}
	},
};
