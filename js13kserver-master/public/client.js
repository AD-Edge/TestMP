"use strict";

(function () {

    let socket, //Socket.IO client
        buttons, //Button elements
        message, //Message element
        score, //Score element
        points = { //Game points
            draw: 0,
            win: 0,
            lose: 0
        };

    /**
     * Disable all button
     */
    function disableButtons() {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute("disabled", "disabled");
        }
    }

    /**
     * Enable all button
     */
    function enableButtons() {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].removeAttribute("disabled");
        }
    }

    /**
     * Set message text
     * @param {string} text
     */
    function setMessage(text) {
        message.innerHTML = text;
    }

    /**
     * Set score text
     * @param {string} text
     */
    function displayScore(text) {
        score.innerHTML = [
            "<h2>" + text + "</h2>",
            "Won: " + points.win,
            "Lost: " + points.lose,
            "Draw: " + points.draw
        ].join("<br>");
    }

    /**
     * Binde Socket.IO and button events
     */
    function bind() {

        socket.on("start", () => {
            enableButtons();
            setMessage("Round " + (points.win + points.lose + points.draw + 1));
        });

        socket.on("win", () => {
            points.win++;
            displayScore("You win!");
        });

        socket.on("lose", () => {
            points.lose++;
            displayScore("You die!");
        });

        socket.on("draw", () => {
            points.draw++;
            displayScore("Draw! ?");
        });

        socket.on("end", () => {
            //isableButtons();
            setMessage("Player has left, number of players: -");
        });

        socket.on("connect", () => {
            //disableButtons();
            setMessage("Number of players: -" );
        });

        socket.on("disconnect", () => {
            disableButtons();
            setMessage("Connection lost!");
        });

        socket.on("error", () => {
            disableButtons();
            setMessage("Connection error!");
        });

        for (let i = 0; i < buttons.length; i++) {
            ((button, move) => {
                button.addEventListener("click", function (e) {
                    //disableButtons();
                    socket.emit("move", move);
                }, false);
            })(buttons[i], i + 1);
        }
    }

    /**
     * Client module init
     */
    function init() {
        socket = io({ upgrade: false, transports: ["websocket"] });
        buttons = document.getElementsByTagName("button");
        message = document.getElementById("message");
        score = document.getElementById("score");
        //disableButtons();
        bind();
    }

    window.addEventListener("load", init, false);

})();
