function SynthVisualiser (w, h, shadersLoadedCallback, synth)
{
    initialiseMembers (this, w, h);
    initialiseDemo (this, synth);
    var t = this;

    function animate()
    {
        requestAnimationFrame (animate);
        t.updateUniforms();
        t.renderer.render (t.scene, t.camera);
    }

    animate();

    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize()
    {
        var w = window.innerWidth / t.w;
        var h = window.innerHeight / t.h;
        var dim = Math.min (w, h);
        w = dim;
        h = dim;
        t.camera.aspect = w / h;
        t.camera.updateProjectionMatrix();
        t.renderer.setSize ( w, h );
        t.uniforms.resolution.value = new THREE.Vector2 (w, h);
    }

    function initialiseMembers (threeDemo, w, h, shadersLoadedCallback)
    {
        threeDemo.shadersLoadedCallback = shadersLoadedCallback;
        threeDemo.w        = w;
        threeDemo.h        = h;
        threeDemo.scene    = {};
        threeDemo.camera   = {};
        threeDemo.renderer = {};
        threeDemo.uniforms = {};
    }

    function initialiseDemo (threeDemo, synth) {

        initialiseScene (threeDemo, synth);
        initShaders (threeDemo, synth);
        threeDemo.updateUniforms = function()
        {
            threeDemo.uniforms.time.value += 0.1;
            threeDemo.uniforms.centroid.value = synth.centroid;
            threeDemo.uniforms.rms.value = synth.rms;
            threeDemo.uniforms.waveform.value = synth.waveform;
        }
    }

    function initialiseScene (threeDemo, synth)
    {
        threeDemo.scene = new THREE.Scene();
        threeDemo.renderer = new THREE.WebGLRenderer ({antialias:true});
        var w = window.innerWidth / threeDemo.w;
        var h = window.innerHeight / threeDemo.h;
        var dim = Math.min (w, h);
        w = dim;
        h = dim;
        threeDemo.renderer.setSize (w, h);
        threeDemo.renderer.setClearColor( 0x00, 1);

        var threelist = document.getElementById ('threecontainer');
        var listItem = document.createElement ('div');
        listItem.class = "list-item";
        listItem.appendChild (threeDemo.renderer.domElement);

        listItem.addEventListener ('mousedown', function()
        {
            synth.trigger();
        }, false);

        // document.body.appendChild (threeDemo.renderer.domElement);
        threelist.appendChild (listItem);
        threeDemo.camera = new THREE.PerspectiveCamera (45, w / h, 0.1, 20000);
        threeDemo.camera.position.set (0,0,300);
        threeDemo.scene.add (threeDemo.camera); 
    }

    function initShaders (threeDemo, synth)
    {
        var w = window.innerWidth / threeDemo.w;
        var h = window.innerHeight / threeDemo.h;
        var dim = Math.min (w, h);
        w = dim;
        h = dim;
        threeDemo.uniforms = 
        {
            time: {type: 'f', value: 0.0},
            resolution: {type: 'v2', value: new THREE.Vector2 (w, h)},
            centroid: {type: 'f', value: synth.centroid},
            rms: {type: 'f', value: synth.rms},
            waveform: {type: 'i', value: synth.waveform}
        };
        SHADER_LOADER.load 
        (
            function (data)
            {
                shadersLoadedCallback (data, threeDemo);
            }
        );
    }
}

//var container = document.getElementById ('threejsCanvas');
    //document.body.appendChild (container);
    // Set up the scene, camera, and renderer as global variables.