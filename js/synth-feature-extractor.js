
function Synth (windowSize, waveformType, freq)
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
      synth.osc      = audioCtx.createOscillator();
      synth.gainNode = audioCtx.createGain();
      synth.filter   = audioCtx.createBiquadFilter();
      synth.gainNode.gain.value = 0;

      synth.waveform = waveformType;
      if (waveformType === 0)
        synth.osc.type = 'sine';
      else if (waveformType === 1)
        synth.osc.type = 'square';
      else if (waveformType === 2)
        synth.osc.type = 'sawtooth';

      synth.centreFrequency = freq;
      synth.osc.frequency.value = synth.centreFrequency; // value in hertz

      synth.filter.type = 'lowpass';
      synth.filter.frequency.value = 2000;

      synth.osc                .connect (synth.filter);
      synth.filter             .connect (synth.gainNode);
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
      synth.synthPitchOnRamp = 0.6;
      synth.trigger = function (force)
      {
        synth.releaseTime = force * 2.6 + 0.4;
        //synth.setFrequency (((position.x + 100.0) / 200.0) * 400.0 + 100.0);
        synth.time = 0.0;
        synth.isPlaying = true;
        var now = audioCtx.currentTime;

        // var f = synth.osc.frequency;
        // f.cancelScheduledValues (now);
        // var originalF = f.value;
        // f.setValueAtTime (now, synth.centreFrequency)
        // f.linearRampToValueAtTime (f.value - 500.0, now + synth.synthPitchOnRamp);

        var g = synth.gainNode.gain;
        g.cancelScheduledValues(now);
        g.linearRampToValueAtTime (0.9, now + synth.attackTime);
        g.exponentialRampToValueAtTime(0.000001, now + synth.attackTime + synth.releaseTime);
        g.setValueAtTime (0.0, now + synth.attackTime + synth.releaseTime + 0.001);
      }

      synth.release = function()
      {
        var now = audioCtx.currentTime;
        var g = synth.gainNode.gain;
        g.cancelScheduledValues        (now);
        g.exponentialRampToValueAtTime (0.000001, now + synth.releaseTime);
        g.setValueAtTime               (0.0, now + synth.releaseTime + 0.001);
        synth.isPlaying = false;
      }

      synth.changeFrequency = function (amt)
      {
        var f = synth.osc.frequency;
        var fNow = f.value;
        var now = audioCtx.currentTime;
        f.cancelScheduledValues (now);
        f.linearRampToValueAtTime (fNow + amt, now + 0.9);
      }

      synth.setFrequency = function (newFreq)
      {
        var f = synth.osc.frequency;
        var fNow = f.value;
        var now = audioCtx.currentTime;
        f.cancelScheduledValues (now);
        f.linearRampToValueAtTime (newFreq, now + 0.9);
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
