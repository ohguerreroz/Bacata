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
        const CLAP_THRESHOLD = 150;
        let lastClapTime = 0;

        function drawWaveform() {
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            const width = canvas.width;
            const sliceWidth = width / dataArray.length;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                const y = (dataArray[i] / 255.0) * canvas.height;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            ctx.strokeStyle = '#00ff00';
            ctx.stroke();
            requestAnimationFrame(drawWaveform);
        }

        function detectClap() {
            analyser.getByteFrequencyData(dataArray);
            const peak = Math.max(...dataArray);
            const now = Date.now();

            if (peak > CLAP_THRESHOLD && now - lastClapTime > 500) {
                window.location.href = "s1.html";
                lastClapTime = now;
            }

            requestAnimationFrame(detectClap);
        }

        drawWaveform();
        detectClap();
    } catch (error) {
        console.error("Error accediendo al micrófono:", error);
    }
}

initAudio();
