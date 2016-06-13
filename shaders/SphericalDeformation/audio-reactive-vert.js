uniform float time;
uniform float centroid;
uniform float rms;
uniform int   waveform;
varying vec3  norm;
varying vec3  vert;

const float pi = 3.14159265359;

void main() 
{
	float r = sqrt (pow (position.x, 2.0) + pow (position.y, 2.0) + pow (position.z, 2.0));
	float inclination = acos (position.z / r);
	float azimuth 	  = atan (position.y / position.x);

	
	

	float logRMS = log(rms*9.0 + 1.0);
	float logCentroid =  0.5;//log (rms * 9.0 + 1.0);

	float rotAngle = logRMS;
	mat2 rotation = mat2 (cos (rotAngle*0.2), -sin(rotAngle*0.2), sin (rotAngle*0.2), cos (rotAngle*0.2));
	
	vec3 rotatedPos = vec3 (position.x, rotation * position.yz);
	vec3 rotatedNorm = vec3 (normal.x, rotation * normal.yz);

	vec2 newXZPos = rotation * rotatedPos.xz;
	vec2 newXZNorm = rotation * rotatedNorm.xz;
	rotatedPos = vec3 (newXZPos.x, rotatedPos.y, newXZPos.y);
	rotatedNorm = vec3 (newXZNorm.x, rotatedNorm.y, newXZNorm.y);

	

	float movementAnimation = logRMS;
	//float azimuthFreq = floor(time + (abs(azimuth) * 12.0 * (logCentroid * 0.5 + 0.5)) / (pi * 2.0)) * (pi / 2.0);
	float azimuthFreq = movementAnimation*2.0 + abs(azimuth) * 15.0 * (logCentroid * 0.5 + 0.5);

	float sawT = 1.0 -  mod (azimuthFreq, pi * 2.0) / pi * 2.0;
	float squareW = sign (sin (azimuthFreq));
	float sinW = sin (azimuthFreq);
	float pulseWidth = 0.1;
	float pulseW = float(sawT < pulseWidth * pi * 2.0);//mod (azimuthFreq, pi * 2.0);
	
	float waveType = float (waveform == 0) * sinW + float (waveform == 1) * squareW + float (waveform == 2) * sawT;

	float azimuthAmp = 1.0;//(logRMS * 0.1 + 0.9) * 5.0;
	float inclinationAmp = 0.0;//logCentroid;

	float inclinationFreq = movementAnimation * 2.0 + abs(inclination) * 500.0;
	float noise = sin(inclinationFreq) + sin (inclinationFreq * 2.5);
	vec3 extruded = rotatedPos + rotatedNorm * (waveType) * azimuthAmp
							   + rotatedNorm * noise * inclinationAmp; 

	norm = rotatedNorm;
	vert = extruded;

	gl_Position = projectionMatrix * modelViewMatrix * vec4 (extruded, 1.0); 
}