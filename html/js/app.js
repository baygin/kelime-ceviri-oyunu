// Sağ tık mevzusunu kapatıyorum
document.addEventListener("contextmenu", (event) => event.preventDefault());

const General = {
    // Rastgele karakter oluşturuyoruz
    Random: (length) => {
        var result = [];
        var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result.push(
                characters.charAt(Math.floor(Math.random() * charactersLength))
            );
        }
        return result.join("");
    },
    // Rastgele kullanıcı adı oluşturuyoruz
    CreateNickName: () => {
        return "Guest-" + General.Random(5);
    },
    // Kullanıcı adı geçerli mi kontrolü
    IsUserNameValid: (username) => {
        return /^[0-9a-zA-Z_.-]+$/.test(username);
    },
    CheckNickname() {
        if (!localStorage.nickname) {
            localStorage.nickname = this.CreateNickName();
        }
        if (!localStorage.uuid) {
            localStorage.uuid = this.Random(32);
        }
    },
};

$(document).ready(() => {
    General.CheckNickname();
    Socket.Init();
    GameUI.InitElementEvents();
});
