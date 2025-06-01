async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const canvas = document.getElementById('waveform');
        const ctx = canvas.getContext('2d');
        const timerElement = document.getElementById('shout-timer');

        const SHOUT_THRESHOLD = 200;
        const REQUIRED_DURATION = 3000; // 3 segundos
        let shoutStartTime = null;

        function drawWaveform() {
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            const width = canvas.width;
            const sliceWidth = width / dataArray.length;
            let x = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const y = dataArray[i] / 255.0 * canvas.height;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.strokeStyle = '#00ff00';
            ctx.stroke();
            requestAnimationFrame(drawWaveform);
        }

        function detectShout() {
            analyser.getByteFrequencyData(dataArray);
            const peak = Math.max(...dataArray);

            if (peak > SHOUT_THRESHOLD) {
                if (shoutStartTime === null) {
                    shoutStartTime = Date.now();
                }
                const elapsed = Date.now() - shoutStartTime;
                timerElement.textContent = (elapsed / 1000).toFixed(1) + "s";

                if (elapsed >= REQUIRED_DURATION) {
                    window.location.href = "s4.html";
                }
            } else {
                shoutStartTime = null;
                timerElement.textContent = "0.0s";
            }

            requestAnimationFrame(detectShout);
        }

        drawWaveform();
        detectShout();
    } catch (error) {
        console.error("Error accediendo al micrófono:", error);
    }
}

initAudio();
