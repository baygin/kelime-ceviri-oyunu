const GameUI = {
    _elements: {
        replyInput: $("[name=reply-input]"),
        replyButton: $(".reply-button"),
        onlineCount: $("#online-count"),
        onlineUsers: $(".online-users"),
        editNickName: $(".edit-nickname"),
        word: $(".word"),
        wordSpeech: $(".speech"),
        answers: $(".answers"),
        countdown: $("#countdown"),
        backgroundMusic: $("#background-music"),
        correctAnswers: $(".correct-answers .fields"),
    },
    GetReply() {
        return this._elements.replyInput.val();
    },
    ClearReply() {
        return this._elements.replyInput.val(null);
    },
    SetOnlineCount(count) {
        this._elements.onlineCount.text(+count);
    },
    IsUserOnline(uuid) {
        return $("#uuid_" + uuid).length > 0;
    },
    AddNewOnline(message) {
        this.SetOnlineCount(message.count);

        if (!this.IsUserOnline(message.uuid)) {
            this._elements.onlineUsers.append(`
                <label id="uuid_${message.uuid}"> 
                    <i class="fas fa-circle fa-xs online"></i>
                    ${message.nickname}
                </label>
            `);
        }
    },
    RemoveOffline(message) {
        this.SetOnlineCount(message.count);
        $("#uuid_" + message.uuid).remove();
    },
    WhoAreOnline(message) {
        const onlines = message.all;
        for (const index in onlines) {
            this.AddNewOnline({
                count: message.count,
                uuid: onlines[index].uuid,
                nickname: onlines[index].nickname,
            });
        }
    },
    EditedNickName(message) {
        console.log(message);
        $("#uuid_" + message.uuid).html(
            `
                <i class="fas fa-circle fa-xs online"></i>
                ${message.nickname}
            `
        );
    },
    PlayDing() {
        new Audio("/sound/ding.mp3").play();
    },
    SetCountdownText(second) {
        var text;
        if (second > 0) {
            $(".correct-answers").hide();
            text = `Cevaplamak için son ${second} saniye!`;
        } else {
            text = `Yeni kelime geliyor!..`;
        }
        this._elements.countdown.text(text);
    },
    SetLeftCounter(second) {
        second = +second;
        this.SetCountdownText(second);
        const interval = setInterval(() => {
            second > 0 ? second-- : clearInterval(interval);
            this.SetCountdownText(second);
        }, 1000);
    },
    SetWord(word, voice) {
        voice = voice || "/sound/silence.mp3";
        this._elements.word.text(word);
        this._elements.word.attr("sound", voice);
        this._elements.wordSpeech.attr("sound", voice);
    },
    ClearAnswers() {
        this._elements.answers.html(null);
    },
    Question(message) {
        this.PlayDing();
        this.SetLeftCounter(message.leftSecond);
        this.ClearAnswers();
        this.SetWord(message.word, message.voice);
    },
    CheckAnswer(uuid) {
        return $("#answer_" + uuid).length > 0;
    },
    NewAnswer(message) {
        if (this.CheckAnswer(message.uuid)) {
            return false;
        }
        var answer = `
            <div class="answer-item pointer" id="answer_${message.uuid}">
                <label class="username text-bold pointer">
                    ${message.nickname}:
                </label>
                <label class="answer text-bold pointer">
                    ${message.answer}
                    <i class="fas fa-circle-notch fa-spin pointer"></i> 
                </label> 
            </div>
        `;

        message.uuid == localStorage.uuid
            ? this._elements.answers.prepend(answer)
            : this._elements.answers.append(answer);
    },

    AllAnswers(message) {
        for (const index in message) {
            this.NewAnswer(message[index]);
        }
    },
    RoundResult(message) {
        var count = 10;
        var interval = setInterval(() => {
            if (count > 0) {
                count--;
                this.SetCountdownText(`Yeni kelimeye ${count} saniye kaldı!`);
            } else {
                clearInterval(interval);
            }
        }, 1000);

        const correct = message.correct;

        if (correct.length > 0) {
            this._elements.correctAnswers.html(null);

            for (let index = 0; index < 10; index++) {
                if (correct[index] != undefined) {
                    this._elements.correctAnswers.append(`
                        <label class="correct-answer-item">
                            ${correct[index]}
                        </label>
                    `);
                }
            }
            $(".correct-answers").show();
        }

        const answers = message.allAnswers;

        for (const index in answers) {
            $("#answer_" + answers[index].uuid).addClass(
                answers[index].correct == true ? "correct" : "wrong"
            );
            var itag = $("#answer_" + answers[index].uuid + " i")[0];
            itag.classList.remove("fa-spin");
            itag.classList.remove("fa-circle-notch");
            itag.classList.add(
                answers[index].correct == true ? "fa-check" : "fa-times"
            );
        }
    },
    InitElementEvents() {
        // Cevapla butonuna tıklandığında mesajın gönderilmesi
        this._elements.replyButton.click(() => Socket.SendAnswer());

        // Cevabın yazıldığı input'a enter basıldığında mesajın gönderilmesi
        this._elements.replyInput.on("keypress", (e) => {
            if (e.which === 13) {
                Socket.SendAnswer();
            }
        });

        // Kullanıcı adı değiştirme
        this._elements.editNickName.on("click", () => {
            var NewNickName = prompt(
                "Yeni kullanıcı adı",
                localStorage.nickname
            );
            if (
                General.IsUserNameValid(NewNickName) &&
                NewNickName &&
                NewNickName != "" &&
                NewNickName != undefined
            ) {
                Socket.EditNickName(NewNickName);
                localStorage.nickname = NewNickName;
            } else {
                alert(
                    "Hatalı kullanıcı adı, boşluk ve özel karakter kullanmayın!"
                );
            }
        });

        // Müziği Başlatıyoruz
        $(document).on("click", ".bg-music-play", (e) => {
            $(e.currentTarget).addClass("fa-volume-up bg-music-mute");
            $(e.currentTarget).removeClass("fa-volume-mute bg-music-play");

            this._elements.backgroundMusic.get(0).loop = true;
            this._elements.backgroundMusic.get(0).play();
        });

        // Müziği Durduruyoruz
        $(document).on("click", ".bg-music-mute", (e) => {
            $(e.currentTarget).addClass("fa-volume-mute bg-music-play");
            $(e.currentTarget).removeClass("fa-volume-up bg-music-mute");

            this._elements.backgroundMusic.get(0).pause();
        });

        // Kelimenin üsütüne veya ses işaretine tıklandığında
        // kelimenin İngilizce telafuz ses kaydını dinletiyoruz
        this._elements.word.add(this._elements.wordSpeech).click(function () {
            const SoundAddress = $(this).attr("sound");

            new Audio(SoundAddress).play();
        });
    },
};
