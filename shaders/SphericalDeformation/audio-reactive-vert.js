uniform float time;
uniform float centroid;
uniform float rms;
uniform float freq;
uniform int   waveform;
varying vec3  norm;
varying vec3  vert;
varying float azimuth;
varying float inclination;
const float pi = 3.14159265359;

mat2 getRotationMatrix (in float angle)
{
	return mat2 (cos (angle), -sin(angle), sin (angle), cos (angle));
}

void main() 
{
	float r = sqrt (pow (position.x, 2.0) + pow (position.y, 2.0) + pow (position.z, 2.0));
	inclination = acos (position.z / r) / 2.0*pi;

	float addMultX = float(position.x<0.0);
	float addMultY = float(position.x>0.0)*float(position.y<0.0);

	azimuth 	  = (atan (position.y / position.x) + pi*addMultX + pi*2.0*addMultY) / (2.0*pi);

	
	

	float logRMS = clamp (log(rms*9.0 + 1.0), 0.0, 1.0);
	float logCentroid =  clamp (log (centroid * 9.0 + 1.0), 0.0, 1.0);

	float birdsEyeAngle = 0.2 * pi * 2.0;// * logRMS;
	mat2 birdsEyeRotation = getRotationMatrix (birdsEyeAngle);
	
	vec3 rotatedPos = vec3 (position.x, birdsEyeRotation * position.yz);
	vec3 rotatedNorm = vec3 (normal.x, birdsEyeRotation * normal.yz);

	float directionAngle = time;
	mat2  directionRotation = getRotationMatrix (time * 0.1);

	rotatedPos = vec3 (directionRotation * rotatedPos.xy, rotatedPos.z);
	rotatedNorm = vec3 (directionRotation * rotatedNorm.xy, rotatedNorm.z);
	// vec2 newXZPos = rotation * rotatedPos.xz;
	// vec2 newXZNorm = rotation * rotatedNorm.xz;
	// rotatedPos = vec3 (newXZPos.x, rotatedPos.y, newXZPos.y);
	// rotatedNorm = vec3 (newXZNorm.x, rotatedNorm.y, newXZNorm.y);

	
	float normedF = clamp (freq / 3000.0, 0.0, 1.0);
	float movementAnimation = -time*10.0 * normedF;// * logRMS;//logRMS;
	//float azimuthFreq = floor(time + (abs(azimuth) * 12.0 * (logCentroid * 0.5 + 0.5)) / (pi * 2.0)) * (pi / 2.0);
	float f = clamp (normedF * 0.5 + 0.5, 0.5, 1.0) * 200.0;
	float aziFreq = movementAnimation + f * azimuth;
	float incFreq = movementAnimation * 2.0 + abs(inclination) * 5.0;

	float aziSawT = 1.0 -  mod (aziFreq, pi * 2.0) / pi * 2.0;
	float aziSinW = sin (aziFreq);
	float aziSquareW = sign (aziSinW);
	float aziPulseWidth = 0.1;
	float aziPulseW = float(aziSawT < aziPulseWidth * pi * 2.0);//mod (azimuthFreq, pi * 2.0);
	
	float incSawT = 1.0 -  mod (incFreq, pi * 2.0) / pi * 2.0;
	float incSinW = sin (incFreq);
	float incSquareW = sign (incSinW);
	float incPulseWidth = 0.1;
	float incPulseW = float(incSawT < incPulseWidth * pi * 2.0);

	float waveType = float (waveform == 0) * incSinW + float (waveform == 1) * incSquareW + float (waveform == 2) * incSawT;

	float azimuthAmp = logRMS * 5.0;//(logRMS * 0.1 + 0.9) * 5.0;
	float inclinationAmp = logRMS * 2.0 * (1.0 - inclination);//logCentroid;

	vec3 extruded = rotatedPos + rotatedNorm * waveType * inclinationAmp;  
							   //+ rotatedNorm * (waveType) * azimuthAmp;
							   

	norm = rotatedNorm;
	vert = extruded;

	gl_Position = projectionMatrix * modelViewMatrix * vec4 (extruded, 1.0); 
}