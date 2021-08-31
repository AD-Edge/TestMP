"use strict";

/**
 * User sessions
 * @param {Array} users
 */
const users = [];
const zones = [];

/**
 * Find opponent for a user
 * @param {User} user
 */
								//reuse this for combat round kickoff
// function findOpponent(user) {
// 	for (let i = 0; i < users.length; i++) {
// 		if (
// 			user !== users[i] &&
// 			users[i].opponent === null
// 		) {
// 			new Game(user, users[i]).start();
// 		}
// 	}
// }

//To create NEW user, or remove OLD
function configUser(user, val) {
	for (let i = 0; i < users.length; i++) {
		if (user !== users[i]) {
			
			if(val == 0) { //Removal
				users[i].setUser(user.socket.id, val, 0 , 0, 0);
				
			} else if (val == 1) { //Addition
				//give prev user new user
				users[i].setUser(user.socket.id, val, user.x, user.y, user.attRad); 
				// also give new user preexisting user
				user.setUser(users[i].socket.id, val, users[i].x, users[i].y, user.attRad); 
				
			}		
		}
	}

	//post setup
	if(val == 0) {
		removeUser(user);
		console.log("removal of user: " + user.socket.id);
	} else if (val == 1) {
		users.push(user);
		console.log("addition of user: " + user.socket.id);
	}
}

/**
 * Remove user session 
 * @param {User} user
 */
function removeUser(user) {
	users.splice(users.indexOf(user), 1);
}

function updateUserLocation(user) {
	var pos = user.returnLoc();
	
	for (let i = 0; i < users.length; i++) {
		if (user !== users[i]) {
			console.log("sending updated coords to " + users[i].socket.id + 
			" for " + user.socket.id + " : " + pos[0] + ', ' + pos[1]);

			users[i].updateUserLoc(user.socket.id, pos[0], pos[1]);
		}
	}
}

function initiateCombat(usr) { 
	//check if already in a zone 
	for (let i = 0; i < users.length; i++) {
		if (usr == users[i]) {
			users[i].sendCombat(usr.socket.id);	//for now just send to initiating client
		}
	}

	//if so, add to zone 

	//else create new zone
	const cmbt = new Zone(usr.x, usr.y);
	zones.push(cmbt);
	console.log("New Combat Zone Initiated by " + 
		usr.socket.id + " at " + usr.x + ", " + usr.y + " with radius " + usr.attRad);
}

//updates connected count
function updateConnectedCount() {
	for (let i = 0; i < users.length; i++) {
		users[i].updateCount();
	}
}

//set new client start location/setup
function setRandomStart(user) {
	var randX = Math.floor(getRandomArbitrary(1, 39));
	var randY = Math.floor(getRandomArbitrary(1, 19));
	console.log("spawn loc X:" + randX + ', Y:' + randY);

	if (randX != null && randY != null) {
		user.updateLoc(randX, randY);
	} else {
		console.log("ERROR, RANDOM LOCATION GENERATED NULL");
	}
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * User Session Class
 */
class User {

	/**
	 * @param {Socket} socket
	 */
	constructor(socket) {
		this.socket = socket;
		this.game = null;
		this.guess = GUESS_NO;
		this.x = 0;
		this.y = 0;
		this.attRad = 5;
	}

	/**
	 * Set move value
	 * @param {number} move
	 */
	setMove(move) {

		if(move == 1) {
			//console.log("Move Up: " + move);
			this.y--;
			this.updateLoc(this.x, this.y); //update client
			updateUserLocation(this); //update everyone
		} else if (move == 2) {
			//console.log("Move Left: " + move);
			this.x--;
			this.updateLoc(this.x, this.y);
			updateUserLocation(this);
		} else if (move == 3) {
			console.log("Combat Engage: " + move);
			this.combat = true;
			initiateCombat(this);
		} else if (move == 4) {
			//console.log("Move Right: " + move);
			this.x++;
			this.updateLoc(this.x, this.y);
			updateUserLocation(this);
		} else if (move == 5) {
			//console.log("Move Down: " + move);
			this.y++;
			this.updateLoc(this.x, this.y);
			updateUserLocation(this);
		} else {
			console.log("Unknown input: " + move);
		}
		// if (
		// 	!this.opponent ||
		// 	guess <= GUESS_NO ||
		// 	guess > GUESS_SCISSORS
		// ) {
		// 	return false;
		// }
		// this.guess = guess;
		return true;
	}

	//Return users location coords
	returnLoc() {
		return [this.x, this.y];
	}

	/**
	 * Start new game
	 * @param {Game} game
	 * @param {User} opponent
	 */
	// start(game, opponent) {
	// 	this.game = game;
	// 	//this.opponent = opponent;
	// 	this.guess = GUESS_NO;
	// 	this.socket.emit("start");
	// }

	//connection count 
	updateCount() {
		this.socket.emit("updateCount", users.length);
	}

	//setup new user
	setUser(id, val, x, y, rad) {
		console.log("...sending... setUser " + id + " x::" + x + ", y::" + y);
		this.socket.emit("setUser", id, val, x, y, rad);
	}

	//update client location
	updateLoc(x, y) {
		this.x = x;
		this.y = y; 
		this.socket.emit("updateLoc", this.socket.id, this.x, this.y);
	}
	
	//update location of opponent users
	updateUserLoc(id, x, y) {
		this.socket.emit("updateUserLoc", id, x, y);
	}

	//Sends combat zone to user
	sendCombat(id) {
		this.socket.emit("sendCombat", id);
	}

}


/**
 * Combat Zone Class
 */
class Zone {

	constructor(x, y) {
		this.x = 0;
		this.y = 0;
	}

	setZone(x, y) {

	}

}

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = {

	io: (socket) => {
		//Create new user 
		const user = new User(socket);
		//users.push(user);
		
		//findOpponent(user);
		setRandomStart(user);

		configUser(user, 1); //add new
		updateConnectedCount();
		


		socket.on("disconnect", () => {
			console.log("Disconnected: " + socket.id);
			
			//removeUser(user);
			configUser(user, 0); //remove
			updateConnectedCount()
			
			console.log("Currently connected: " + users.length + " users \n");
			// if (user.opponent) {
			// 	user.opponent.end();
			// 	findOpponent(user.opponent);
			// }
		});

		// socket.on("updateCount", () => {
		// 	console.log("User has connected, currently connected: " + users.length + " users");

		// });

		// socket.on("guess", (guess) => {
		// 	console.log("Guess: " + socket.id);
		// 	if (user.setGuess(guess) && user.game.ended()) {
		// 		user.game.score();
		// 		user.game.start();
		// 		storage.get('games', 0).then(games => {
		// 			storage.set('games', games + 1);
		// 		});
		// 	}
		// });

		socket.on("move", (move) => {
			console.log("Move Player: " + socket.id);
			//var uer = users.find( ({ id }) => socket.id === socket.id );

			for(var i=0; i<users.length; i++) {
				//console.log(uer);
				if(users[i].socket.id == socket.id) {
					users[i].setMove(move);
					return;
				}
			}
			
		});

		console.log("Connected: " + socket.id);
		console.log("Currently connected: " + users.length + " users \n");
	},

	stat: (req, res) => {
		storage.get('games', 0).then(games => {
			res.send(`<h1>Rounds played: ${games}</h1>`);
		});
	}

};
