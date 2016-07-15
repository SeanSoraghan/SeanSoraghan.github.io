function SphereActor (shadersLoadedCallback, synth, mainScene, x, y)
{
    this.trigger = function()
    {
        this.synth.trigger();
    }

    initialiseMembers (this);
    initialiseActor   (this);

    function initialiseMembers (sphereActor)
    {
        sphereActor.sphere = {};
        sphereActor.uniforms = {};
        sphereActor.selected = false;
        sphereActor.synth = synth;
    }

    function initialiseActor (sphereActor) {

        initShaders (sphereActor, synth);
        sphereActor.updateUniforms = function()
        {   
            sphereActor.uniforms.time.value    += 0.1;
            sphereActor.uniforms.centroid.value = synth.centroid;
            
            if (sphereActor.uniforms.centroid.value < 0.0) 
                sphereActor.uniforms.centroid.value = 0.0;

            sphereActor.uniforms.rms.value      = synth.rms;
            sphereActor.uniforms.waveform.value = synth.waveform;
            sphereActor.uniforms.freq.value     = synth.osc.frequency.value; 
        }
    }

    function initShaders (sphereActor)
    {
        sphereActor.uniforms = 
        {
            time:       {type: 'f', value: 0.0},
            centroid:   {type: 'f', value: synth.centroid},
            rms:        {type: 'f', value: synth.rms},
            waveform:   {type: 'i', value: synth.waveform},
            freq:       {type: 'f', value: synth.osc.frequency.value}
        };

        SHADER_LOADER.load 
        (
            function (data)
            {
                shadersLoadedCallback (data, sphereActor, mainScene, x, y);
            }
        );

        
    }
}

//var container = document.getElementById ('threejsCanvas');
    //document.body.appendChild (container);
    // Set up the scene, camera, and renderer as global variables.