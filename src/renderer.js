const videoElement = document.getElementById('camera');
const canvasElement = document.getElementById('canvas');
const captureButton = document.getElementById('capture-btn');
const statusMessage = document.getElementById('status-message');

// Access camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
    } catch (err) {
        console.error('Error accessing camera:', err);
        statusMessage.textContent = 'Error accessing camera: ' + err.message;
    }
}

// Capture photo
captureButton.addEventListener('click', async () => {
    // Draw video frame to canvas
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const context = canvasElement.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Convert to data URL
    const dataUrl = canvasElement.toDataURL('image/png');

    // Send to main process
    try {
        statusMessage.textContent = 'Saving photo...';
        const result = await window.electronAPI.savePhoto(dataUrl);
        
        if (result.success) {
            statusMessage.textContent = 'Photo saved! Sending to printer...';
            console.log('Photo saved at:', result.filePath);
            
            // Print the photo
            const printResult = await window.electronAPI.printPhoto(result.filePath);
            if (printResult.success) {
                statusMessage.textContent = 'Photo sent to printer!';
            } else {
                statusMessage.textContent = 'Printing failed.';
            }
        } else {
            statusMessage.textContent = 'Failed to save photo: ' + result.error;
        }
    } catch (err) {
        console.error('Error process:', err);
        statusMessage.textContent = 'Error: ' + err.message;
    }
});

startCamera();
