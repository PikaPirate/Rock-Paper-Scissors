/** Server-ish stuff
 * 
 */


var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var nsp = io.of('/placeholder');
var newNsp = null;
var connections = 0;
var ready = 0;
var socketResponses = [];

app.use(express.static('public'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.post('/', function(req, res){
	var roomId = req.body;
	roomId = roomId.value;
	newNsp = io.of('/' + roomId.toString());
	console.log(nsp);
	res.status(200).send("Success");
	
	newNsp.on('connection', function(socket){
		connections++;
		console.log('user connected');
		
		if(connections == 2)
		{
			newNsp.emit("init");
		}
		
		if(connections > 2)
		{
			console.log("too many users");
			socket.disconnect(true);
		}
		
		  socket.on('disconnect', function(){
			  	connections--;
			    console.log('user disconnected');
			  });
		  
		  socket.on('ready', function(value){
			  
			  if(ready == 0)
			  {
				socketResponses = [];  
			  }
			  
			  ready++;
			  console.log("[Socket" + socket.id + "ready: " + ready + " connected: " + connections);
			  socketResponses.push({'socket': socket.id, 'value': value});
			  
			  if(ready == connections)
			  {
				  sendResultToSockets(socketResponses);
				  ready = 0;
			  }
		  });
		  
		  
		  function sendResultToSockets(socketResponses)
		  {
			console.log("emit: " + nsp);
			newNsp.emit('result', socketResponses);
		  }
	});
}); //handle post request

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
}); //handle get request

http.listen(3000, function(){
	console.log('listening on *:3000');
});
	
nsp.on('connection', function(socket){
	connections++;
	console.log('user connected');
	
	if(connections == 2)
	{
		nsp.emit("init");
	}
	
	if(connections > 2)
	{
		console.log("too many users");
		socket.disconnect(true);
	}
	
	  socket.on('disconnect', function(){
		  	connections--;
		    console.log('user disconnected');
		  });
	  
	  socket.on('ready', function(value){
		  
		  if(ready == 0)
		  {
			socketResponses = [];  
		  }
		  
		  ready++;
		  console.log("[Socket" + socket.id + "ready: " + ready + " connected: " + connections);
		  socketResponses.push({'socket': socket.id, 'value': value});
		  
		  if(ready == connections)
		  {
			  sendResultToSockets(socketResponses);
			  ready = 0;
		  }
	  });
	  
	  
	  function sendResultToSockets(socketResponses)
	  {
		console.log("emit: " + nsp);
	  	nsp.emit('result', socketResponses);
	  }
});

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




