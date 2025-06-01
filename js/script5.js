async function initSpeechRecognition() {
    // Verificar compatibilidad del navegador
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Tu navegador no soporta la Web Speech API');
        return;
    }

    // Acceder al micrófono
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Silenciar cualquier video de fondo
    const video = document.querySelector('video');
    if (video) {
        video.muted = true;
    }

    // Configurar el analizador de audio para visualización
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

    // Configurar reconocimiento de voz
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    const statusEl = document.getElementById('status');

    recognition.onstart = () => {
        statusEl.textContent = "Escuchando...";
    };

    recognition.onresult = function (event) {
        const results = event.results[event.results.length - 1];

        for (let i = 0; i < results.length; i++) {
            const transcript = results[i].transcript.trim().toLowerCase();
            console.log("Alternativa:", transcript);

            // Detectar palabra clave
            if (transcript === "bacata" || transcript === "bacatá") {
                statusEl.textContent = "Detectado: bacata";
                window.location.href = "https://ohguerreroz.github.io/Bacata/";
                return;
            }
        }

        // No hacer nada si no se reconoce la palabra clave
    };

    recognition.onerror = function (event) {
        console.error("Error en reconocimiento de voz:", event.error);
        statusEl.textContent = "Error: " + event.error;
    };

    recognition.onend = function () {
        // Reiniciar automáticamente
        recognition.start();
    };

    recognition.start();
}

// Ejecutar al cargar
initSpeechRecognition();
