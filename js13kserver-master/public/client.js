"use strict";

(function () {

    let socket, //Socket.IO client
        buttons, //Button elements
        message, //Message element
        connect,
        score, //Score element
        points = { //Game points
            draw: 0,
            win: 0,
            lose: 0
        },
        count;

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
    function setMessageConnect(text) {
        connect.innerHTML = text;
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
            setMessage("[Combat Round " + (points.win + points.lose + points.draw + 1) + "]");
            setMessageConnect("Currenly Online Players: " + count);
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
            displayScore("Draw! wat?");
        });

        socket.on("updateCount", (arg) => {
            //points.draw++;
            console.log("connected: " + arg);
            count = arg;
            setMessageConnect("Currenly Online Players: " + count);
        });

        socket.on("end", () => {
            //isableButtons();
            setMessageConnect("Currently Online Players: " + count);
        });

        socket.on("connect", () => {
            //disableButtons();
            setMessage("[Session Connected]" );
            setMessageConnect("Currenly Online Players: " + count)
        });

        socket.on("disconnect", () => {
            disableButtons();
            setMessage("[Connection lost]");
            setMessageConnect("Currenly Online Players: n/a")
        });

        socket.on("error", () => {
            disableButtons();
            setMessage("[Connection error]");
            setMessageConnect("Currenly Online Players: n/a")
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
        connect = document.getElementById("connect");
        score = document.getElementById("score");
        count = 0;
        //disableButtons();
        bind();
    }

    window.addEventListener("load", init, false);

})();
