function ThreeScene()
{
	this.updateUniforms = function()
    {   
        for (var i = this.objects.length - 1; i >= 0; i--) 
        	this.objects[i].updateUniforms();
    }

	this.triggerAllActors = function()
	{
		for (var i = this.objects.length - 1; i >= 0; i--) 
		{
        	this.objects[i].trigger();
		}
	}

	initialiseMembers (this);
    initialiseScene   (this);
    var t = this;

    function onWindowResize()
    {
        var w = window.innerWidth;
        var h = window.innerHeight;
        t.camera.aspect = w / h;
        t.camera.updateProjectionMatrix();
        t.renderer.setSize ( w, h );
    }

	function initialiseMembers (scene)
    {
        scene.scene    = {};
        scene.camera   = {};
        scene.renderer = {};
        scene.objects  = [];
        scene.mouseDown = false;
    }

    function triggerAllActors (scene)
    {
    	for (var i = scene.objects.length - 1; i >= 0; i--) 
        {
        	console.log(scene.objects[i]);
        	scene.objects[i].trigger();
        }
    }

    function initialiseScene (scene)
    {
        scene.scene = new THREE.Scene();
        scene.renderer = new THREE.WebGLRenderer ({antialias:true});
        var w = window.innerWidth;// / scene.w;
        var h = window.innerHeight;// / scene.h;
        // var dim = Math.min (w, h);
        // w = dim;
        // h = dim;
        scene.renderer.setSize (w, h);
        scene.renderer.setClearColor( 0x00, 1);

        // var threeContainer = document.getElementById ('threescenecontainer');
        // var sceneDoc = document.createElement ('div');
        // sceneDoc.appendChild (scene.renderer.domElement);

        scene.renderer.domElement.addEventListener ('mousedown', function()
        {
            //synth.trigger();
            scene.triggerAllActors();
            scene.mouseDown = true;
            //check sphere colisions
        }, false);

        scene.renderer.domElement.addEventListener ('mousemove', function()
        {
            //check movement vector
        })

        scene.renderer.domElement.addEventListener ('mouseup', function()
        {
            //trigger selected sphere
        }, false);

        // document.body.appendChild (threeDemo.renderer.domElement);
        //threeContainer.appendChild (sceneDoc);
        document.body.appendChild (scene.renderer.domElement);
        scene.camera = new THREE.PerspectiveCamera (45, w / h, 0.1, 20000);
        scene.camera.position.set (0,0,300);
        scene.scene.add (scene.camera); 
    }

    function animate()
    {
        requestAnimationFrame (animate);
        t.updateUniforms();
        t.renderer.render (t.scene, t.camera);
    }

    animate();

    window.addEventListener( 'resize', onWindowResize, false );
}