
//__().sine({id:"sin1", frequency:400}).dac(0.5);
__().sine({id:"sin2", frequency:800}).dac(0.01);
//__().sine({id:"sin3", frequency:1000}).dac(0.5);
__().sine({id:"sin4", frequency:500}).dac(0.5);
__().lfo({id:"lfo1", gain:100}).connect("#sin1");
__().lfo({id:"lfo2", gain:300}).connect("#sin2");


//__("lfo,sine").start();

function updateMicro1 (time)
{
	var animate1 = Math.sin(time*0.3)*0.5 + 0.5;
	//t.frequency(500*animate);
	__("#lfo1").frequency(30*animate1);

	var animate2 = (Math.sin(time*0.2)*0.5 + 0.5) * 0.5;
	__("#lfo2").frequency(15*animate2);
	var f = __("#sin2").frequency.value;
	__("#sin4").frequency(f);
}
//change the frequency in the first
//var s = __("#sin2");
//alert(s.getParams());
//t.frequency(300);
//__("microsynth").volume(0.5).start();
//change the frequency in the second
//__("#micro2").frequency(600);

//set the gain in both and start them
