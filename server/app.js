const express = require("express");
const app = express();
const Tureng = require("tureng");
const randomWords = require("random-words");
const Timer = require("time-counter");
const http = require("http");
const { Server } = require("socket.io");
const http_server = http.createServer(app);

const [Host, Port] = ["localhost", 3001];

Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

const Game = {
    _onlines: {},
    _default_game_time: 15,
    _default_new_game_time: 10,
    _correct_list: [],
    _current_question: null,
    _current_question_information: null,
    _all_answers: {},
    _left_second: 0,
    _countdown: null,

    Init() {
        this.InitCountdown();
        return this;
    },
    InitCountdown() {
        this._countdown = new Timer({
            direction: "down",
            startValue: `0:${this._default_game_time}`,
        });

        this._countdown.on("change", (second) => {
            this._left_second = second;

            if (second == "0:00") {
                this.GameOver();
            }
        });
    },
    StartCountdown() {
        this._countdown.start();
    },
    NewGame() {
        console.log("Yeni oyun başlatıldı!");

        this._all_answers = {};
        this._correct_list = [];

        const word = randomWords();
        var turkish = new Tureng(word, "entr");

        turkish.Translate((response) => {
            this._current_question = response;

            this._current_question_information = {
                voice: response.VoiceURLs && response.VoiceURLs[0],
                word: word,
            };

            if (!response) {
                return this.NewGame();
            }

            for (const index in this._current_question.Translations) {
                this._correct_list.push(
                    this._current_question.Translations[index].TermTR.split(
                        " ["
                    )[0]
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                );
            }

            this._current_question_information.leftSecond =
                this._default_game_time;

            Socket._io.emit("question", this._current_question_information);

            this.StartCountdown();
        });
    },
    GameOver() {
        var result = {};
        for (const index in this._all_answers) {
            if (
                this._correct_list.includes(
                    this._all_answers[index].answer
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                )
            ) {
                this._all_answers[index].correct = true;
            }
        }

        result.allAnswers = this._all_answers;
        result.correct = this._correct_list;

        Socket._io.emit("result", result);

        setTimeout(() => {
            this.NewGame();
        }, this._default_new_game_time * 1000);
    },
};

const Socket = {
    _io: null,
    Init() {
        this._io = new Server(http_server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        this._io.on("connection", (socket) => {
            socket.on("iamonline", (message) => {
                this.IamOnline(socket, message);
            });

            socket.on("editnick", (message) => {
                this.EditNickName(socket, message);
            });

            socket.on("answer", (message) => {
                this.NewAnswer(socket, message);
            });

            socket.on("disconnect", () => {
                this.NewOffline(socket);
            });
        });
    },
    IamOnline(socket, message) {
        Game._onlines[socket.id] = message;

        socket.broadcast.emit("newonline", {
            online: Game._onlines[socket.id],
            count: Object.size(Game._onlines),
        });

        socket.emit("whoareonline", {
            all: Game._onlines,
            count: Object.size(Game._onlines),
        });

        if (Game._current_question_information) {
            const question = Game._current_question_information;
            question.leftSecond = Game._left_second
                ? Game._left_second.split(":")[1]
                : 0;

            socket.emit("question", question);
            socket.emit("allanswers", Game._all_answers);
        }
    },
    EditNickName(socket, message) {
        Game._onlines[socket.id].nickname = message;

        socket.emit("editednick", Game._onlines[socket.id]);
        socket.broadcast.emit("editednick", Game._onlines[socket.id]);
    },
    NewOffline(socket) {
        socket.broadcast.emit("newoffline", {
            uuid: Game._onlines[socket.id]?.uuid,
            count: Object.size(Game._onlines) - 1,
        });
        delete Game._onlines[socket.id];
    },
    NewAnswer(socket, message) {
        if (Game._all_answers[message.uuid] === undefined) {
            Game._all_answers[message.uuid] = Game._onlines[socket.id];
            Game._all_answers[message.uuid].answer =
                message.answer.toLocaleLowerCase("tr");
            Game._all_answers[message.uuid].socket = socket.id;
            Game._all_answers[message.uuid].correct = false;

            socket.emit("newanswer", Game._all_answers[message.uuid]);
            socket.broadcast.emit("newanswer", Game._all_answers[message.uuid]);
        }
    },
};

Socket.Init();

Game.Init().NewGame();

http_server.listen(Port, () => {
    console.log(`Sunucu ${Host}:${Port} adresinde başlatıldı!`);
});
