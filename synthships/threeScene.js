var pointIsInCircle = function (point, circCentre, circRadius)
{
	var x = Math.abs (point.x - circCentre.x);
	var y = Math.abs (point.y - circCentre.y);
	
	if (x < circRadius && y < circRadius)
		return true;

	var xsq = Math.pow (x, 2.0);
	var ysq = Math.pow (y, 2.0);
	var h = Math.sqrt (xsq + ysq);

	return h <= circRadius;
}

var projectMouseIntoWorld = function (mousePos, scene)
{
	var mouseInWorld = new THREE.Vector3();

	mouseInWorld.set
	(
	    (mousePos.x / window.innerWidth) * 2 - 1,
	    - (mousePos.y / window.innerHeight) * 2 + 1,
	    0.5 
	);

	scene.projector.unprojectVector (mouseInWorld, scene.camera);
	var dir = mouseInWorld.sub (scene.camera.position).normalize();
	var distance = - scene.camera.position.z / dir.z;
	var pos = scene.camera.position.clone().add (dir.multiplyScalar (distance));

	return pos;
}

function ThreeScene()
{
    this.highlightBoundaryBox = function()
    {
        this.lineOpacity = 1.0;
    }
    this.updateBoundaryBox = function()
    {
        this.lineOpacity -= 0.05;
        if (this.lineOpacity < 0.0)
            this.lineOpacity = 0.0;
        this.lineMaterial.color.r = this.lineOpacity;
        this.lineMaterial.color.g = this.lineOpacity;
        this.lineMaterial.color.b = this.lineOpacity;
    }
	this.updatePhysics = function()
	{
		for (var i = this.objects.length - 1; i >= 0; i--) 
		{
			var sphereActor = this.objects[i];
			sphereActor.updatePhysics();
		}
	}

	this.updateUniforms = function()
    {   
        for (var i = this.objects.length - 1; i >= 0; i--) 
        	this.objects[i].updateUniforms();
    }

	this.mouseClicked = function (mousePos)
	{
		
		var mouseInWorld = projectMouseIntoWorld (mousePos, this);

		for (var i = this.objects.length - 1; i >= 0; i--) 
		{
			var sphereActor = this.objects[i];
			if (pointIsInCircle (mouseInWorld, sphereActor.sphere.position, sphereActor.radius))
        		sphereActor.select();
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
        scene.scene     = {};
        scene.camera    = {};
        scene.renderer  = {};
        scene.projector = new THREE.Projector();
        scene.objects   = [];
        scene.mouseDown = false;
        scene.lineMaterial = {};
        scene.lineOpacity  = 0.0;
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
            var mousePos = new THREE.Vector2 (event.x, event.y);// event.position;
            scene.mouseClicked (mousePos);
            scene.mouseDown = true;
        }, false);

        scene.renderer.domElement.addEventListener ('mousemove', function()
        {
            //check movement vector
            var mousePos = new THREE.Vector2 (event.x, event.y);
           	var mouseInWorld = projectMouseIntoWorld (mousePos, scene);
           	for (var i = scene.objects.length - 1; i >= 0; i--) 
			{
				var actor = scene.objects[i];
				if (actor.selected)
					actor.updateMovementVector (mouseInWorld);
			}
        })

        scene.renderer.domElement.addEventListener ('mouseup', function()
        {
            //trigger selected sphere
            for (var i = scene.objects.length - 1; i >= 0; i--) 
			{
				var actor = scene.objects[i];
				// if (actor.selected)
				// 	actor.trigger();
                if (actor.selected)
                    actor.release();
			}

        }, false);

        // document.body.appendChild (threeDemo.renderer.domElement);
        //threeContainer.appendChild (sceneDoc);
        document.body.appendChild (scene.renderer.domElement);
        scene.camera = new THREE.PerspectiveCamera (45, w / h, 0.1, 20000);
        scene.camera.position.set (0,0,300);
        scene.scene.add (scene.camera); 

        scene.lineMaterial = new THREE.LineBasicMaterial ({ color: 0xffffff });
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(new THREE.Vector3(-105, -105, 0));
        lineGeometry.vertices.push(new THREE.Vector3(-105, 105, 0));
        lineGeometry.vertices.push(new THREE.Vector3(105, 105, 0));
        lineGeometry.vertices.push(new THREE.Vector3(105, -105, 0));
        lineGeometry.vertices.push(new THREE.Vector3(-105, -105, 0));
        var lineBox = new THREE.Line (lineGeometry, scene.lineMaterial);
        scene.scene.add (lineBox);
    }

    function animate()
    {
        requestAnimationFrame (animate);
        t.updateBoundaryBox();
        t.updateUniforms();
        t.updatePhysics();
        t.renderer.render (t.scene, t.camera);
    }

    animate();

    window.addEventListener( 'resize', onWindowResize, false );
}