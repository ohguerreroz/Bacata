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
        const counterElement = document.getElementById('clap-counter');

        const CLAP_THRESHOLD = 200;
        const CLAP_DELAY = 5000; // 5 segundos entre aplausos
        let clapCount = 0;
        let lastClapTime = 0;
        let clapCooldown = false;

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

        function detectClap() {
            analyser.getByteFrequencyData(dataArray);
            const peak = Math.max(...dataArray);

            const now = Date.now();
            if (peak > CLAP_THRESHOLD && !clapCooldown) {
                if (clapCount === 0 || now - lastClapTime >= CLAP_DELAY) {
                    clapCount++;
                    counterElement.textContent = `Aplausos: ${clapCount}`;
                    lastClapTime = now;
                    clapCooldown = true;

                    setTimeout(() => {
                        clapCooldown = false;
                    }, CLAP_DELAY);

                    if (clapCount >= 2) {
                        setTimeout(() => {
                            window.location.href = "s3.html";
                        }, 500);
                    }
                }
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
