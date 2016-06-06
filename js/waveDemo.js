function ThreeJSDemo (w, h, shadersLoadedCallback, updateSynthCallback)
{
    initialiseMembers (this, w, h);
    initialiseDemo (this, updateSynthCallback);
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

    function initialiseDemo (threeDemo) {

        initialiseScene (threeDemo);
        initShaders (threeDemo);
        threeDemo.updateUniforms = function()
        {
            threeDemo.uniforms.time.value += 0.1;
            
            if (updateSynthCallback != undefined)
                updateSynthCallback (threeDemo.uniforms.time.value);
        }
    }

    function initialiseScene (threeDemo)
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
        // document.body.appendChild (threeDemo.renderer.domElement);
        threelist.appendChild (listItem);
        threeDemo.camera = new THREE.PerspectiveCamera (45, w / h, 0.1, 20000);
        threeDemo.camera.position.set (0,0,300);
        threeDemo.scene.add (threeDemo.camera); 
    }

    function initShaders (threeDemo)
    {
        var w = window.innerWidth / threeDemo.w;
        var h = window.innerHeight / threeDemo.h;
        var dim = Math.min (w, h);
        w = dim;
        h = dim;
        threeDemo.uniforms = 
        {
            time: {type: 'f', value: 0.0},
            resolution: {type: 'v2', value: new THREE.Vector2 (w, h)}
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