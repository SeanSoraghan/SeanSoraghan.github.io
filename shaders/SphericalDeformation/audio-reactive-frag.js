uniform float time;
uniform float centroid;
uniform float rms;

varying float azimuth;
varying float inclination;
varying vec3 norm;
varying vec3 vert;
const float pi = 3.14159265359;

void main() 
{ 
	vec3 col = vec3 (0.0);
	vec3 eye = vec3 (0.0, 0.0, 100.0);
	vec3 ray = normalize (eye - vert);
	float diffuse = dot (ray, norm);// * 0.01;

	float logRMS      = clamp (log (rms      * 9.0 + 1.0), 0.0, 1.0);
	float logCentroid = clamp (log (centroid * 9.0 + 1.0), 0.0, 1.0);
	float c 		  = clamp (centroid, 0.0, 1.0); 

	float azi = clamp (azimuth, 0.0, 1.0);
	float inc = clamp (inclination, 0.0, 1.0);

	float highlight = pow (1.0 - diffuse, 5.0) * c;// * logCentroid;
	float dist      = distance (vec3 (0.0), vert);
	
	float innerShadowing = dist / 50.0;

	col += diffuse /* * innerShadowing*/ + clamp (highlight, 0.0, 1.0) ;
	col *= vec3 (0.3, 0.7, 1.0);

	gl_FragColor = vec4 (col, 1.0); 
}