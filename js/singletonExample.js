var WAVESDEMO = WAVESDEMO || (function()
{
    var scene, camera, renderer, uniforms;

    init();
    animate();

    function init (w, h) {

        initScene (w, h);
        initShaders (w, h);
    }

    function initScene (w, h)
    {
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(w, h);
        document.body.appendChild(renderer.domElement);
        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 20000);
        camera.position.set(0,0,300);
        scene.add(camera);    
    }

    function initShaders (w, h)
    {

        var planeGeometry = new THREE.PlaneGeometry (w, h);
          uniforms = 
        {
            time: {type: 'f', value: 0.0},
            resolution: {type: 'v2', value: new THREE.Vector2 (w, h)}
        };

        SHADER_LOADER.load 
        (
            function (data)
            {
                var shadVert = data.shader.vertex;
                var shadFrag = data.shader.fragment;
                var shaderMat = new THREE.ShaderMaterial 
                (
                    {
                        uniforms: uniforms, attributes: {}, 
                        vertexShader: shadVert,
                        fragmentShader: shadFrag
                    }
                );
                var fragPlane = new THREE.Mesh ( planeGeometry, shaderMat ); 
                scene.add (fragPlane);
            }
        );
    }
    function animate() 
    {
        requestAnimationFrame(animate);
        updateUniforms();
        renderer.render(scene, camera);
    }
    function updateUniforms()
    {
        uniforms.time.value += 0.1;
    }
    return {
        addView : function (w, h, vert, frag) 
        {
            init (w, h);
        }
    };
}());

function Apple (type) {
    this.type = type;
    this.color = "red";
    this.getInfo = function() {
        return this.color + ' ' + this.type + ' apple';
    };
}