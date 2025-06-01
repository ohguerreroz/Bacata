async function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Tu navegador no soporta la Web Speech API');
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const canvas = document.getElementById('waveform');
    const ctx = canvas.getContext('2d');

    function drawWaveform() {
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const y = (dataArray[i] / 255.0) * canvas.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
        }

        ctx.strokeStyle = '#00ff00';
        ctx.stroke();
        requestAnimationFrame(drawWaveform);
    }

    drawWaveform();

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    const statusEl = document.getElementById('status');

    recognition.onstart = () => {
        statusEl.textContent = "Escuchando... habla claramente.";
    };

    recognition.onresult = function(event) {
        const results = event.results[event.results.length - 1];

        for (let i = 0; i < results.length; i++) {
            const transcript = results[i].transcript.trim().toLowerCase();
            console.log("Alternativa:", transcript);

            if (transcript.includes("bacata")) {
                statusEl.textContent = "Detectado: bacata";
                window.location.href = "s5.html";
                return;
            } else if (transcript.includes("bacatá")) {
                statusEl.textContent = "Detectado: bacata";
                window.location.href = "https://ohguerreroz.github.io/Bacata/";
                return;
            }
        }

        statusEl.textContent = "No se reconoció una palabra válida, intenta de nuevo.";
    };

    recognition.onerror = function(event) {
        console.error("Error en reconocimiento de voz:", event.error);
        statusEl.textContent = "Error: " + event.error;
    };

    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}

initSpeechRecognition();
