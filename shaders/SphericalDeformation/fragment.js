uniform float time;
uniform vec2  resolution;

varying vec3 norm;
varying vec3 vert;
const float pi = 3.14159265359;

void main() 
{ 
	vec3 col = vec3 (0.0);
	vec3 eye = vec3 (0.0, 0.0, 100.0);
	vec3 ray = normalize (eye - vert);
	float diffuse = dot (ray, norm);// * 0.01;

	//float highlight = pow (1.0 - diffuse, 20.0);
	float dist = distance (vec3 (0.0), vert);
	float s = smoothstep (50.0, 60.0, dist);
	float b = (dist / 50.0);
	float r = 1.0 - (dist / 50.0);
	vec3 rgb = vec3(r, 0.0, b);
	//highlight *= (1.0 - s);
	
	float innerShadowing = dist / 50.0;

	col += diffuse * innerShadowing;// + highlight;
	col *= vec3 (0.3, 0.5, 0.4);
	//col.z += dist;
	gl_FragColor = vec4 (col, 1.0); 
}