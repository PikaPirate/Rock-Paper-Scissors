
class ClientConnection
{
	constructor(roomCode){
		this.socket = io('/' + roomCode.toString());
	}
	
	status()
	{
		var s = this.socket;
		console.log(s.connected);
		
		return s.connected;
	}
	
	emit(eventName, eventValue)
	{
		var s = this.socket;
		s.emit(eventName, eventValue);
	}
	
	handleEvent(eventName){
		
	}
}