
function Synth (windowSize, waveformType)
{
  initialiseMembers (this, windowSize, waveformType);
  initialiseAudioProcessingCallback (this);

  function initialiseMembers (synth, windowSize, waveformType)
  {
      synth.analyser         = audioCtx.createAnalyser();
      synth.analyser.fftSize = windowSize;
      synth.numBins          = synth.analyser.frequencyBinCount;
      synth.timeDomain       = new Uint8Array(synth.numBins);
      synth.timeDomainF      = new Float32Array(synth.numBins);
      synth.freqDomain       = new Uint8Array(synth.numBins);

      synth.analyser.getByteTimeDomainData  (synth.timeDomain);
      synth.analyser.getFloatTimeDomainData (synth.timeDomainF);
      synth.analyser.getByteFrequencyData   (synth.freqDomain);

      synth.audioProcessingNode = audioCtx.createScriptProcessor(windowSize);

      //---------------Setup Oscillator------------------------------------------
      synth.osc = audioCtx.createOscillator();
      synth.gainNode = audioCtx.createGain();
      synth.gainNode.gain.value = 0;

      synth.waveform = waveformType;
      if (waveformType === 0)
        synth.osc.type = 'sine';
      else if (waveformType === 1)
        synth.osc.type = 'square';
      else if (waveformType === 2)
        synth.osc.type = 'sawtooth';

      synth.osc.frequency.value = 500; // value in hertz

      synth.osc                .connect (synth.gainNode);
      synth.gainNode           .connect (synth.analyser);
      synth.analyser           .connect (synth.audioProcessingNode);
      synth.audioProcessingNode.connect (audioCtx.destination);

      // Features--------------------------------------------------------;
      synth.centroid = 0.0;
      synth.rms = 0.0;

      // Start/stop  Interaction
      synth.isPlaying = false;
      synth.time = 0.0;
      synth.attackTime = 0.02;
      synth.releaseTime = 1.6;
      synth.trigger = function()
      {
        synth.time = 0.0;
        synth.isPlaying = true;
        var now = audioCtx.currentTime;
        var g = synth.gainNode.gain;
        g.cancelScheduledValues(now);
        g.linearRampToValueAtTime (0.99, now + synth.attackTime);
        g.exponentialRampToValueAtTime(0.000001, now + synth.attackTime + synth.releaseTime);
        g.setValueAtTime (0.0, now + synth.attackTime + synth.releaseTime + 0.001);
        //g.linearRampToValueAtTime(0, then + synth.attackTime + synth.releaseTime)
      }

      synth.release = function()
      {
        var now = audioCtx.currentTime;
        var g = synth.gainNode.gain;
        g.cancelScheduledValues(now);
        g.exponentialRampToValueAtTime(0.000001, now + synth.releaseTime);
        g.setValueAtTime (0.0, now + synth.releaseTime + 0.001);
        synth.isPlaying = false;
      }

      synth.osc.start();
  }

  // Audio callback -----------------------------------------------------------
  function initialiseAudioProcessingCallback (synth)
  {
    synth.audioProcessingNode.onaudioprocess = function(audioProcessingEvent) 
    {
      synth.analyser.getFloatTimeDomainData(synth.timeDomainF);
      synth.analyser.getByteFrequencyData(synth.freqDomain);
      getSpectralCentroid(synth);
      getRMS(synth);

      var inputBuffer = audioProcessingEvent.inputBuffer;
      var outputBuffer = audioProcessingEvent.outputBuffer;

      for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) 
      {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);
        for (var sample = 0; sample < inputBuffer.length; sample++) 
        {
          outputData[sample] = inputData[sample];       
        }
      }
    }
  }

  //-Spetral Analysis----------------------------------------------------------
  function getSpectralCentroid(synth)
  {
    var nyquist = audioCtx.sampleRate/2;
    var binFrequencyRange = nyquist / synth.numBins;
    var binFrequencyRangeHalfStep = binFrequencyRange / 2.0;
    var magnitudeSum = 0.0;
    var weightedMagnitudeSum = 0.0;
    var centreFrequency = 0.0;
    for(var i = 0; i < synth.numBins; i++) 
    {
      //centreFrequency = i * binFrequencyRange + binFrequencyRangeHalfStep;
      var magnitude = (synth.freqDomain[i]);// - analyser.minDecibels) * decibelRange;
      magnitudeSum = magnitudeSum + magnitude;
      weightedMagnitudeSum = weightedMagnitudeSum +/*centreFrequency*/ (i + 1.0) * magnitude;
    }
    var centroidBins = weightedMagnitudeSum / magnitudeSum;
    //Normalised
    synth.centroid = centroidBins / synth.numBins;
  }
  //---------------------------------------------------------------------------

  //-Time Domain Analysis------------------------------------------------------
  function getRMS(synth)
  {
    var ampSum = 0.0;
    for (var sample = 0; sample < synth.numBins; sample++)
    {
      var amp = synth.timeDomainF[sample];
      ampSum += Math.pow(amp, 2.0);
    }
    av = ampSum / synth.numBins;
    synth.rms = Math.sqrt(av);
  }
  //---------------------------------------------------------------------------



}

//sinOsc.start();
