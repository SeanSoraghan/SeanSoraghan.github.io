//from https://github.com/cwilso/metronome/blob/master/js/metronome.js

function Clock()
{
	this.scheduleAheadTime = 0.1; 
	this.lookahead         = 25.0;
	this.timerWorker       = new Worker ("clockWorker.js");

	this.tempo             = 120.0;

	this.current16thNote   = 0;
	this.nextNoteTime      = 0.0;
	this.noteResolution    = 0; 
	this.notesInQueue      = [];

	this.crotchetCallback   = function() { };//console.log ("crotchet"); };
	this.quaverCallback     = function() { };//console.log ("quaver"); };
	this.semiquaverCallback = function() { };//console.log ("semiquaver"); };
	this.dottedCallback		= function() { };//console.log ("dotted"); };
	this.fiveCallback		= function() { };//console.log ("five"); };
	this.nextNote = function() 
	{
	    var secondsPerBeat = 60.0 / this.tempo;   
	    this.nextNoteTime += 0.25 * secondsPerBeat;

	    this.current16thNote ++;    // Advance the beat number, wrap to zero

	    if (this.current16thNote == 6*4*5) 
	        this.current16thNote = 0;
	}

	this.scheduleNote = function (beatNumber, time) 
	{
	    // push the note on the queue, even if we're not playing.
	    this.notesInQueue.push ( { note: beatNumber, time: time } );
	    this.semiquaverCallback();
	    
	    if ( (beatNumber%2 === 0) )
	        this.quaverCallback();

	    if ( (beatNumber%3 === 0) )
	    	this.dottedCallback();

	    if ( (beatNumber%4 === 0) )
	        this.crotchetCallback();

	    if ( (beatNumber%5 === 0) )
	    	this.fiveCallback();

	    
	}

    this.timerWorker.onmessage = function (e) 
    {
        if (e.data == "tick") 
        {
            scheduler();
        }
        else
            console.log("message: " + e.data);
    };

    this.startClock = function()
    {
    	this.timerWorker.postMessage ("start");
    }

    this.timerWorker.postMessage ( {"interval": this.lookahead} );

    var t = this;

	function scheduler()
	{
		while (t.nextNoteTime < audioCtx.currentTime + t.scheduleAheadTime ) 
		{
        	t.scheduleNote (t.current16thNote, t.nextNoteTime);
        	t.nextNote();
    	}
	}
}