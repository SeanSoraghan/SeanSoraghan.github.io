uniform float time;

varying vec3 norm;
varying vec3 vert;
void main() 
{
	float r = sqrt (pow (position.x, 2.0) + pow (position.y, 2.0) + pow (position.z, 2.0));
	float inclination = acos (position.z / r);
	float azimuth 	  = atan (position.y / position.x);

	float azimuthAmp = 2.5;
	float inclinationAmp = 0.5;
	float inclinationAmpEnv = (sin (time * 0.15) * 3.0);
	float azimuthAmpEnv = (sin (time * 0.1) * 0.5 + 0.5);
	vec3 extruded = position + normal * sin (azimuth * 20.0 + time * azimuth) * azimuthAmp * azimuthAmpEnv
							 + normal * sin (inclination * 5.0 + time) * (inclinationAmp + inclinationAmpEnv); 

	norm = normal;
	vert = extruded;

	gl_Position = projectionMatrix * modelViewMatrix * vec4 (extruded, 1.0); 
}