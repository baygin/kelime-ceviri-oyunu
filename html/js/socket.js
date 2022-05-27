const Socket = {
    _socket: null,
    _socket_address: "localhost",
    _socket_port: 3001,
    Init() {
        this._socket = io(`ws://${this._socket_address}:${this._socket_port}`);
        this.InitEvents();
    },
    InitEvents() {
        this.IAmOnline();
        this.NewOnline();
        this.NewOffline();
        this.WhoAreOnline();
        this.Question();
        this.EditedNickName();
        this.NewAnswer();
        this.AllAnswers();
        this.RoundResult();
    },
    SendAnswer() {
        this._socket.emit("answer", {
            answer: GameUI.GetReply(),
            uuid: localStorage.uuid,
        });
        GameUI.ClearReply();
    },
    EditNickName(NewNickName) {
        this._socket.emit("editnick", NewNickName);
    },
    EditedNickName() {
        this._socket.on("editednick", (message) => {
            GameUI.EditedNickName(message);
        });
    },
    IAmOnline() {
        this._socket.emit("iamonline", {
            nickname: localStorage.nickname,
            uuid: localStorage.uuid,
        });
    },
    NewOnline() {
        this._socket.on("newonline", function (message) {
            message.online.count = message.count;
            GameUI.AddNewOnline(message.online);
        });
    },
    NewOffline() {
        this._socket.on("newoffline", function (message) {
            GameUI.RemoveOffline(message);
        });
    },
    WhoAreOnline() {
        this._socket.on("whoareonline", function (message) {
            GameUI.WhoAreOnline(message);
        });
    },
    Question() {
        this._socket.on("question", (message) => {
            GameUI.Question(message);
        });
    },
    NewAnswer() {
        this._socket.on("newanswer", (message) => {
            GameUI.NewAnswer(message);
        });
    },
    AllAnswers() {
        this._socket.on("allanswers", (message) => {
            GameUI.AllAnswers(message);
        });
    },
    RoundResult() {
        this._socket.on("result", (message) => {
            GameUI.RoundResult(message);
        });
    },
};
