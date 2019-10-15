/*"\nMonkey unplugs robot \
\nMonkey baffles alien \
\nAlien mutates dinosaur \ 
\nAlien disbelieves dragon \
\nDinosaur squashes monkey \
\nDinosaur crushes robot \
\nRobot shoots down dragon \
\nRobot's AI outsmarts alien \
\nDragon incinerates monkey \
\nDragon summons a meteor and kills dinosaur \"*/
 


var options = initOptions();
var defeatReasons = initReasons();

var roomCode = null;
var roomId = null;

var online = false;

var userChoice = "";
var opponentChoice = "";
var con = null;
var s = null;

var ready = false;
var retryCount = 0;

var yourWins = 0;
var theirWins = 0;


$(document).ready(function() {
	$(".container").hide();
	$(".loader").hide();

});


function startOfflineGame()
{
	$(".startup").hide();
	$(".container").show();
	online = false;
}

function createRoom()
{
	var roomId = prompt("Create room code:");
	
	if(roomId != null)
	{
		jQuery.ajax({
			url: "/",
			type: "post",
			data: {value: roomId},
			success: function(resp){
				if(roomId)
				{
					con = new ClientConnection(roomId);	
					s = con.socket; //TODO move to class
					online = true;
					startOnlineGame();
				}	
			}
		});	
	}
}

function joinRoom()
{
	roomCode = prompt("Enter room code:");
	
	if(roomCode != null)
	{
		con = new ClientConnection(roomCode);	
		s = con.socket; //TODO move to class
		online = true;
		startOnlineGame();
	}
}

function startOnlineGame()
{
	$(".startup").hide();
	$(".container").hide();
	$(".loader").show();
	
		s.on('connect', function(value){
			online = con.status();
			s.on('init', function(){
				$(".container").show();
				$(".loader").hide();
			});
			
			s.on('result', function(value){
				console.log("Event fired: " + s.id);
				
				if(value)
				{
					processResult(value);
				}
				//console.log(value);
			});
		
			function processResult(eventValue)
			{
				console.log(eventValue);
				for(var i = 0; i < eventValue.length; i++)
				{
					if(eventValue[i].socket == s.id)
					{
						console.log("set user");
						userChoice = eventValue[i].value;
					}
					else
					{
						console.log("set opp");
						opponentChoice = eventValue[i].value;
					}
				}
				
				var userInfo = getSelectionInfo(userChoice);
				var oppInfo = getSelectionInfo(opponentChoice);
				findWinner(userInfo, oppInfo);
			}
		});
		
		s.on('disconnect', function(value){
			online = con.status();
		});

}

function initOptions()
{
	var data = [];
	
	var monkey = {name: 'monkey', defeats:['robot', 'alien']};
	data.push(monkey);
	
	var alien = {name: 'alien', defeats:['dinosaur', 'dragon']};
	data.push(alien);
	
	var dinosaur = {name: 'dinosaur', defeats:['monkey', 'robot']};
	data.push(dinosaur);
	
	var robot = {name: 'robot', defeats:['dragon', 'alien']};
	data.push(robot);
	
	var dragon = {name: 'dragon', defeats:['monkey', 'dinosaur']};
	data.push(dragon);
	
	return data;
}

function initReasons()
{
	var data = [];
	
	var monkey = {name: 'monkey', 'robot': 'The monkey unplugs the robot','alien': 'The monkey\'s stupidity causes the alien to implode'};
	data.push(monkey);
	
	var alien = {name: 'alien', 'dinosaur': 'The alien uses science to mutate the dinosaur into... a thing?', 'dragon': 'The alien uses logic to prove that dragons aren\'t real'};
	data.push(alien);
	
	var dinosaur = {name: 'dinosaur', 'monkey': 'The dinosaur squashes the monkey', 'robot': 'The dinosaur uses brute force and crushes the robot'};
	data.push(dinosaur);
	
	var robot = {name: 'robot', 'dragon': 'The robot uses anti-plane missiles to shoot the dragon down', 'alien': 'The robot\'s superior AI scares the alien off'};
	data.push(robot);
	
	var dragon = {name: 'dragon', 'monkey': 'The dragon barbeques the monkey with fire breath', 'dinosaur':'The dragon uses magic and summons a second meteor, which causes the dinosaur\'s extinction'};
	data.push(dragon);
	
	return data;
}

function handleButton(selection)
{
	console.log("handleButton");
	if(!online)
	{
		var info = getSelectionInfo(selection);
		
		selectComputerChoice(info);		
	}
	else
	{
		emitResponse(selection);
	}

}

function getSelectionInfo(selection)
{
	for(i = 0; i < options.length; i++)
	{
		if(options[i].name == selection)
		{
			var info = options[i];
		}
	}
	return info;
}

function emitResponse(selection)
{
	if(con.status() != true)
	{
		console.log("wait for con");
		setTimeout(emitResponse, 1000);
	}
	else
	{
		console.log('ready to emit');
		$(".btn").prop('disabled', true);
		s.emit('ready', selection);
	}
}

function selectComputerChoice(userChoice)
{
	var rand = Math.floor(Math.random() * Math.floor(options.length));
	var compChoice = options[rand];
	findWinner(userChoice, compChoice);
}

function findWinner(userChoice, compChoice)
{
	var userStrength = userChoice.defeats;
	var compStrength = compChoice.defeats;
	var resultCaption = "";
	var winner = "";
	var loser = "";
	
	//$("#game-result").fadeOut(300, updateChoiceDisplay(userChoice.name, compChoice.name));
	//$("#game-result").fadeOut(300)
	
	for(var i = 0; i < userStrength.length; i++)
	{
		if(userChoice.name == compChoice.name)
		{
			resultCaption = "You draw";
			break;
		}
		
		if(userStrength[i] == compChoice.name)
		{
			//createVictoryDisplay("You win!", userChoice.name, compChoice.name);
			resultCaption = "You win!";
			yourWins++;
			winner = userChoice.name;
			loser = compChoice.name;
			break;
		}
		
		if(compStrength[i] == userChoice.name)
		{
			//createVictoryDisplay("You lose", compChoice.name, userChoice.name);
			resultCaption = "You lose";
			theirWins++;
			console.log(theirWins);
			winner = compChoice.name;
			loser = userChoice.name;
			break;
		}	
	}
	

	$("#game-result:visible").fadeOut(300).promise().done(function(){
		updateResultDisplay(resultCaption, userChoice.name, compChoice.name, winner, loser);
	});
}

function createVictoryDisplay(resultString, winnerStr, loserStr)
{
	
	var retPromise = new Promise(function (resolve, reject)
	{
		if(winnerStr)
		{
			for(var i = 0; i < defeatReasons.length; i++)
			{
				if(defeatReasons[i].name == winnerStr)
				{
					var resultObj = defeatReasons[i];
					break;
				}
			}
			
			if(resultObj)
			{
				if(resultObj[loserStr])
				{
					var returnString = resultString + '<br>' + resultObj[loserStr];
				}
			}
		}
		else
		{
			var returnString = resultString;
		}
		
		
		resolve(returnString);
	});
	return retPromise;
}


function updateResultDisplay(resultString, yourChoice, compChoice, winner, loser)
{	
	
	createVictoryDisplay(resultString, winner, loser).then(function(string){
		$(".appended").remove();
		$("#your-score").append('<span class="appended">' + yourWins + '</span>');
		$("#their-score").append('<span class="appended">' + theirWins + '</span>');
		$("#overall-result").html(string);	
		 $("#your-choice").append('<span class="appended">' + capitalise(yourChoice) + '</span>');
		 $("#comp-choice").append('<span class="appended">' + capitalise(compChoice) + '</span>');
		
		 $("#game-result").fadeIn(300);		
	});
	
	$(".btn").prop('disabled', false);

}

function capitalise(text)
{
	var returnStr = text.charAt(0).toUpperCase() + text.slice(1);
	return returnStr;
}

function showRules()
{
	alert("\nMonkey unplugs robot\nMonkey baffles alien\nAlien mutates dinosaur" +
			"\nAlien disbelieves dragon\nDinosaur squashes monkey" +
			"\nDinosaur crushes robot\nRobot shoots down dragon\nRobot AI outsmarts alien" +
			"\nDragon incinerates monkey\nDragon summons a meteor and kills dinosaur")

}
