# İngilizce - Türkçe kelime çeviri oyunu
İngilizce çalıştığım bir gün "çeviri oyunu yapsam nasıl olur acaba" düşüncesiyle ortaya çıkmış, Socket.io kullanımı konusunda tecrübe edinmek için geliştirdiğim basit bir oyun. 

# Kurulum

## HTTP Sunucusu

Kurulum için öncelikle bir **HTTP** sunucusuna ihtiyaç duyacağız. Ben test etmek için **Visual Code** eklentisi olan **[LiveServer](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)** kullanacağım. **[LiveServer](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)** eklentisi bize **HTTP** sunucusu sağlıyor fakat normalde **VSCode**'un açıldığı klasörü **root** olarak belirliyor. **HTTP** sunucusunun **root** yolunu site dosyalarımızın bulunduğu `/html` olarak değiştirmek için **.vscode** klasöründeki **settings.json** dosyasının içerisinde aşağıdaki tanımlamayı yaptım. 

`
    {
        "liveServer.settings.root": "/html"
    }
`

**HTTP** sunucusu olarak **Nginx** kullanmak isterseniz `/nginx` klasöründeki config dosyasına kendinize göre düzenleyebilirsiniz.  

## Socket Sunucusu

Oyuncu verilerinin anlık olarak birbirleriyle iletişime geçebilmesi için Socket.io kullanarak geliştirdiğim sunucuyu çalıştırmamız gerekiyor. İlk önce server klasörünün içerisinde `npm install` veya `yarn` (şiddetle **yarn** tavsiye edilir) komutlarından birini çalıştırmalıyız. Bu komut, gerekli **node.js** paketlerinin kurulumunu gerçekleştirecek. Sunucuyu başlatmadan önce host ve port ayarlarını değiştirmek isterseniz `/server/app.js` dosyasının 10. satırını güncelleyebilirsiniz.

`
const [Host, Port] = ["localhost", 3001];
`

Sunucuyu başlatmak için `node app.js` komutunu çalıştırıyoruz.

## Ön tarafta yapılandırma

`/html/js/socket.js` dosyasındaki Socket objesinin **_socket_address** ve **_socket_port** değişkenlerini sunucu bilgilerimize göre güncelliyoruz.

`
    const Socket = {
        _socket_address: "localhost",
        _socket_port: 3001,
    }
`

## Kullanıcı adı değiştirme

![Kullanıcı adı değiştirme](https://user-images.githubusercontent.com/34795266/170782193-57058370-1fd8-453a-ac3f-ccf682a99081.gif)

## Cevap girme

![Cevap girme](https://user-images.githubusercontent.com/34795266/170782070-8706afdc-7b7b-4307-8af3-7f137709e619.gif)

## Çevrimiçi kullanıcılar

![Çevrimiçi kullanıcılar](https://user-images.githubusercontent.com/34795266/170782159-050a15fc-0027-4260-bfee-bb38a5259112.gif)
