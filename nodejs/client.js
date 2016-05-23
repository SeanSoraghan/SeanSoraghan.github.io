var http    = require ('http');
var request = require ('request');

var stage1form = 
{
	userid						: 1,
	gender						: 0,
	age							: 20,
	musicalExperience 			: 2,
	musicalProductionExperience	: 4,
	sample						: 2,
	preferredVis				: 1
}

request.post 
( 
	{url: 'http://127.0.0.1:8010/stage1/answer', form: stage1form}, 
	function optionalCallback (err, httpResponse, body) 
	{
		if (err)
		{
			return console.error ('failed to send data:', err);
		}
		console.log ('sent data. server response: ', body);
	}
);

var stage2form = 
{
	userid						: 1,
	gender						: 0,
	age							: 20,
	musicalExperience 			: 2,
	musicalProductionExperience : 4,
	visualisationStrategy		: 2,
	strategyPreferred			: 0,
	sample						: 30,
	correct						: 0
}

request.post 
( 
	{url: 'http://127.0.0.1:8010/stage2/answer', form: stage2form}, 
	function optionalCallback (err, httpResponse, body) 
	{
		if (err)
		{
			return console.error ('failed to send data:', err);
		}
		console.log ('sent data. server response: ', body);
	}
);

var deleteDataForm = 
{
	stage   : 'users',
	password: 'please'
}

request.post
(
	{url: 'http://127.0.0.1:8010/delete-data', form: deleteDataForm},
	function optionalCallback (err, httpResponse, body)
	{
		if (err)
		{
			return console.error ('failed to post request: ', err);
		}
		console.log ('posted request. server response: ', body);
	}
)