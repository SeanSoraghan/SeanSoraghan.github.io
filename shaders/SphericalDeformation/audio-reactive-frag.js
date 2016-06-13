uniform float time;
uniform float centroid;
uniform float rms;

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
	float logCentroid = log (centroid * 9.0 + 1.0);
	float highlight = pow (1.0 - diffuse, 2.0);// * logCentroid;
	float dist = distance (vec3 (0.0), vert);
	
	float innerShadowing = dist / 50.0;

	col += diffuse * innerShadowing + highlight;
	col *= vec3 (0.3, 0.5, 0.4);

	gl_FragColor = vec4 (col, 1.0); 
}