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
        // Stop any existing streams
        if (stream) {
            stopStream(stream);
        }

        // Capture screen and audio
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        handleStream(stream);
    } catch (err) {
        console.error('Error: ' + err);
        alert('Permission denied: Unable to access screen recording');
    }
}

function handleStream(capturedStream) {
    if (!capturedStream) {
        console.error('Error: Unable to capture stream');
        alert('Error: Unable to capture stream');
        return;
    }
    stream = capturedStream;
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = saveRecording;
    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    // Optional: Display the captured stream in a video element
    videoElement.srcObject = stream;
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    if (stream) {
        stopStream(stream); // Stop the screen sharing
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

function stopStream(stream) {
    let tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    stream = null; // Clear the reference to the stream
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
    document.body.removeChild(a);
    recordedChunks = [];
    stream = null; // Clear the stream reference after saving
}
