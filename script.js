let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;
let isPlaying = false;

document.getElementById('toggleButton').addEventListener('click', function() {
    if (!isPlaying) {
        oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(document.getElementById('pitchSlider').value, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        isPlaying = true;
    } else {
        oscillator.stop();
        isPlaying = false;
    }
});

document.getElementById('pitchSlider').addEventListener('input', function() {
    if (oscillator) {
        oscillator.frequency.setValueAtTime(this.value, audioContext.currentTime);
    }
});
