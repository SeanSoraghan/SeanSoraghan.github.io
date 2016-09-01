function SphereActor (shadersLoadedCallback, synth, mainScene, x, y)
{
    this.checkWorldCollisions = function()
    {
        if (this.sphere.position.x + this.radius > 100 || this.sphere.position.x - this.radius < -100)
        {
            this.movementVector.x *= -1;
            var pitchChange = Math.sign (this.movementVector.x);
            this.synth.changeFrequency (200 * pitchChange);
        }

        if (this.sphere.position.y + this.radius > 100 || this.sphere.position.y - this.radius < -100)
            this.movementVector.y *= -1;
        
        this.uniforms.rotation.value = Math.atan2 (this.movementVector.x, this.movementVector.y);
    }

    this.updatePhysics = function()
    {
        var twoDPos = new THREE.Vector2 (this.sphere.position.x, this.sphere.position.y);
        var animAmp = this.synth.rms * globalSpeed;
        var movementVec = new THREE.Vector2 (this.movementVector.x, this.movementVector.y);
        movementVec.multiplyScalar (animAmp);
        twoDPos.add (movementVec);
        this.sphere.position.x = twoDPos.x;
        this.sphere.position.y = twoDPos.y;

        this.checkWorldCollisions();


    }

    this.updateMovementVector = function (newLookPoint)
    {
        var twoDPos = new THREE.Vector2 (this.sphere.position.x, this.sphere.position.y);
        var newMovementVec = new THREE.Vector2 (newLookPoint.x, newLookPoint.y);
        newMovementVec.sub (twoDPos);
        var length  = newMovementVec.length() / Max_Vel_Magnitude;
        this.force  = THREE.Math.clamp (length, 0.0, 1.0);
        newMovementVec.normalize();
        this.movementVector.x = newMovementVec.x;
        this.movementVector.y = newMovementVec.y;
        this.uniforms.rotation.value = Math.atan2 (this.movementVector.x, this.movementVector.y);
    }

    this.trigger = function()
    {
        this.uniforms.directionIndicationIntensity.value = 1.0;
        if (this.moving)
            this.synth.trigger (this.force);
    }

    this.select = function()
    {
        this.selected = true;
        this.moving   = false;        
    }

    this.release = function()
    {
        this.selected = false;
        if (this.force > Min_Movement_Force)
            this.moving = true;
    }

    initialiseMembers (this);
    initialiseActor   (this);

    function initialiseMembers (sphereActor)
    {
        sphereActor.movementVector = new THREE.Vector2 (0, 1);
        sphereActor.rotationAngle = 0;
        sphereActor.radius = 0;
        sphereActor.sphere = {};
        sphereActor.uniforms = {};
        sphereActor.selected = false;
        sphereActor.moving   = false;
        sphereActor.force    = 0.0;
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

            sphereActor.uniforms.directionIndicationIntensity.value -= 0.01;
            if (sphereActor.uniforms.directionIndicationIntensity.value < 0.0)
                sphereActor.uniforms.directionIndicationIntensity.value = 0.0;

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
            rotation:   {type: 'f', value: 0.0}, 
            centroid:   {type: 'f', value: synth.centroid},
            rms:        {type: 'f', value: synth.rms},
            waveform:   {type: 'i', value: synth.waveform},
            freq:       {type: 'f', value: synth.osc.frequency.value},
            directionIndicationIntensity: {type: 'f', value: 0.0}
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