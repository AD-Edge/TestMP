"use strict";

/**
 * User sessions
 * @param {Array} users
 */
const users = [];

/**
 * Find opponent for a user
 * @param {User} user
 */
								//reuse this for combat round kickoff
function findOpponent(user) {
	for (let i = 0; i < users.length; i++) {
		if (
			user !== users[i] &&
			users[i].opponent === null
		) {
			new Game(user, users[i]).start();
		}
	}
}

function updateUserCount() {
	for (let i = 0; i < users.length; i++) {
		users[i].updateCount();
	}
}

/**
 * Remove user session 
 * @param {User} user
 */
function removeUser(user) {
	users.splice(users.indexOf(user), 1);
}

/**
 * Game class
 */
class Game {

	/**
	 * @param {User} user1
	 * @param {User} user2
	 */
	constructor(user1, user2) {
		this.user1 = user1;
		this.user2 = user2;
	}

	/**
	 * Start new game
	 */
	start() {
		this.user1.start(this, this.user2);
		this.user2.start(this, this.user1);
	}

	/**
	 * Is game ended
	 * @return {boolean}
	 */
	ended() {
		return this.user1.guess !== GUESS_NO && this.user2.guess !== GUESS_NO;
	}

	/**
	 * Final score
	 */
	score() {
		if (
			this.user1.guess === GUESS_ROCK && this.user2.guess === GUESS_SCISSORS ||
			this.user1.guess === GUESS_PAPER && this.user2.guess === GUESS_ROCK ||
			this.user1.guess === GUESS_SCISSORS && this.user2.guess === GUESS_PAPER
		) {
			this.user1.win();
			this.user2.lose();


		} else if (
			this.user2.guess === GUESS_ROCK && this.user1.guess === GUESS_SCISSORS ||
			this.user2.guess === GUESS_PAPER && this.user1.guess === GUESS_ROCK ||
			this.user2.guess === GUESS_SCISSORS && this.user1.guess === GUESS_PAPER
		) {
			this.user2.win();
			this.user1.lose();


		} else {
			this.user1.draw();
			this.user2.draw();
		}
	}

}

/**
 * User session class
 */
class User {

	/**
	 * @param {Socket} socket
	 */
	constructor(socket) {
		this.socket = socket;
		this.game = null;
		this.opponent = null;
		this.guess = GUESS_NO;
	}

	/**
	 * Set guess value
	 * @param {number} guess
	 */
	setGuess(move) {

		if(move == 1) {
			console.log("Move Up: " + move);
		} else if (move == 2) {
			console.log("Move Left: " + move);
		} else if (move == 3) {
			console.log("Move Right: " + move);
		} else if (move == 4) {
			console.log("Move Down: " + move);
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

	/**
	 * Start new game
	 * @param {Game} game
	 * @param {User} opponent
	 */
	start(game, opponent) {
		this.game = game;
		this.opponent = opponent;
		this.guess = GUESS_NO;
		this.socket.emit("start");
	}

	/**
	 * Terminate game
	 */
	end() {
		this.game = null;
		this.opponent = null;
		this.guess = GUESS_NO;
		this.socket.emit("end");
	}

	/**
	 * Trigger win event
	 */
	win() {
		this.socket.emit("win", this.opponent.guess);
	}

	/**
	 * Trigger lose event
	 */
	lose() {
		this.socket.emit("lose", this.opponent.guess);
	}

	/**
	 * Trigger draw event
	 */
	draw() {
		this.socket.emit("draw", this.opponent.guess);
	}

	updateCount() {
		this.socket.emit("updateCount", users.length);
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
		users.push(user);
		findOpponent(user);
		updateUserCount();

		socket.on("disconnect", () => {
			console.log("Disconnected: " + socket.id);
			console.log("Currently connected: " + users.length + " users");

			removeUser(user);
			updateUserCount()

			if (user.opponent) {
				user.opponent.end();
				findOpponent(user.opponent);
			}
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
			if (user.setGuess(move) && user.game.ended()) {
			// 	user.game.score();
			// 	user.game.start();
			// 	storage.get('games', 0).then(games => {
			// 		storage.set('games', games + 1);
			// 	});
			}
		});

		console.log("Connected: " + socket.id);
		console.log("Currently connected: " + users.length + " users");
	},

	stat: (req, res) => {
		storage.get('games', 0).then(games => {
			res.send(`<h1>Rounds played: ${games}</h1>`);
		});
	}

};
