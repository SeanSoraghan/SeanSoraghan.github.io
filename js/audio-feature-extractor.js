var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
analyser = audioCtx.createAnalyser();
//---------------------------------------------------------------------------

var windowSize = 1024;
analyser.fftSize = windowSize;
var numBins = analyser.frequencyBinCount;
var timeDomain = new Uint8Array(numBins);
var timeDomainF = new Float32Array(numBins);
var freqDomain = new Uint8Array(numBins);
analyser.getByteTimeDomainData(timeDomain);
analyser.getFloatTimeDomainData(timeDomainF);
analyser.getByteFrequencyData(freqDomain);
var decibelRange = analyser.maxDecibels - analyser.minDecibels;



// USE ONAUDIOPROCESS, dont analyse from the render loop (obvs)...
var audioProcessingNode = audioCtx.createScriptProcessor(windowSize);
// analyser.connect(audioProcessingNode);
// Spectral Analysis--------------------------------------------------------
// var nyquist = context.sampleRate/2;
// var index = Math.round(frequency/nyquist * freqDomain.length);
// return freqDomain[index];
var centroid = 0.0;
var rms = 0.0;
function getSpectralCentroid ()
{
  var nyquist = audioCtx.sampleRate/2;
  var binFrequencyRange = nyquist / numBins;
  var binFrequencyRangeHalfStep = binFrequencyRange / 2.0;
  var magnitudeSum = 0.0;
  var weightedMagnitudeSum = 0.0;
  var centreFrequency = 0.0;
  for(var i = 0; i < numBins; i++) 
  {
    //centreFrequency = i * binFrequencyRange + binFrequencyRangeHalfStep;
    var magnitude = (freqDomain[i]);// - analyser.minDecibels) * decibelRange;
    magnitudeSum = magnitudeSum + magnitude;
    weightedMagnitudeSum = weightedMagnitudeSum +/*centreFrequency*/ (i + 1.0) * magnitude;
  }
  var centroidBins = weightedMagnitudeSum / magnitudeSum;
  //Normalised
  centroid = centroidBins / numBins;
}
//---------------------------------------------------------------------------
// Time Domain Analysis------------------------------------------------------
function getRMS()
{
  var ampSum = 0.0;
  for (var sample = 0; sample < numBins; sample++)
  {
    var amp = timeDomainF[sample];
    ampSum += Math.pow(amp, 2.0);
  }
  av = ampSum / numBins;
  rms = Math.sqrt(av);
}
//---------------------------------------------------------------------------
// Audio callback -----------------------------------------------------------
audioProcessingNode.onaudioprocess = function(audioProcessingEvent) 
{
    analyser.getFloatTimeDomainData(timeDomainF);
    analyser.getByteFrequencyData(freqDomain);
    getSpectralCentroid();
    getRMS();
}

//---------------------------------------------------------------------------
//https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioSourceNode
// navigator.getUserMedia = (navigator.getUserMedia ||
//                       navigator.webkitGetUserMedia ||
//                       navigator.mozGetUserMedia ||
//                       navigator.msGetUserMedia);

// if (navigator.getUserMedia) {
//   console.log('getUserMedia supported.');
//   navigator.getUserMedia (
//     // constraints: audio and video for this app
//     {
//        audio: true
//     },

//     // Success callback
//     function(stream) {
//       var source = audioCtx.createMediaStreamSource(stream);
//       source.connect(analyser);
//       analyser.connect(audioProcessingNode);
//       audioProcessingNode.connect(audioCtx.destination);
//     },

//     // Error callback
//     function(err) {
//        console.log('The following gUM error occured: ' + err);
//     }
//   );
// } else {
//     console.log('getUserMedia not supported on your browser!');
// }