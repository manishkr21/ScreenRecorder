// Variables
let mediaRecorder;
let recordedChunks = [];
let stream; // Keep a reference to the stream
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoElement = document.getElementById('videoElement');

// Event listeners
startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);

// Start recording function
async function startRecording() {
    try {
        // Capture screen and audio
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });

        // Capture audio from microphone
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        handleStream(combinedStream);
    } catch (err) {
        console.error('Error: ' + err);
        alert('Permission denied: Unable to access screen recording');
    }
}

function handleStream(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = saveRecording;
    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
}

// Stop recording function
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        stopStream(stream); // Stop the screen sharing
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

function stopStream(stream) {
    let tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
}

// Handle data available after recording
function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

// Save recorded video as a file
function saveRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    // Create anchor element to trigger download
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);

    a.href = url;
    a.download = 'recorded_video.webm'; // Set filename for downloaded file
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    recordedChunks = [];
}
