const fs = require('fs');
const mail = require('@sendgrid/mail');
let ifr;

// temp key for Borsi
mail.setApiKey('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');

class Application {

  constructor() {
    this.setLanguage('sk');
    this.game = 'Urfiak_haza';
  }

  setGame(game) {
    console.log(game);
    if (game == 'castle') {
      this.game = 'Urfiak_haza';
    }
    if (game == 'room') {
      this.game = 'Sajat_szoba';
    }
    this.setPage('game');
  }

  setLanguage(language) {
    if (['hu', 'en', 'sk'].includes(language)) {
      this.language = language;
      this.setHeader('cc');
      this.setPage('main');
    }
  }

  setHeader(name) {
    if (name == 'cc') {
      let html = fs.readFileSync(__dirname + '/headers/cc.html').toString();
      document.querySelector('#header').innerHTML = html;
      document.querySelector('.' + this.language).classList.add('active');
    }
    if (['hu', 'en', 'sk'].includes(name)) {
      let html = fs.readFileSync(__dirname + '/headers/' + name + '.html').toString();
      document.querySelector('#header').innerHTML = html;
    }
    if (['huGame', 'enGame', 'skGame'].includes(name)) {
      let html = fs.readFileSync(__dirname + '/headers/' + name + '.html').toString();
      document.querySelector('#header').innerHTML = html;
    }
  }

  setPage(name) {
    this.closeKbd();

    if (name == 'main') {
      this.setHeader('cc');
      let html = fs.readFileSync(__dirname + '/contents/' + this.language + '/' + name + '.html').toString();
      document.querySelector('#content').innerHTML = html;
    } else {
      document.querySelector('.container').classList.remove('container-clean');
      if (name.match(/^[a-zA-Z0-9]+$/)) {
        this.setHeader(this.language);
        let html = fs.readFileSync(__dirname + '/contents/' + this.language + '/' + name + '.html').toString();
        document.querySelector('#content').innerHTML = html;
      }
    }

    if (name.includes("game")) {
      this.setHeader(this.language + "Game");
      if (name == "game") {
        let json = fs.readFileSync(`${__dirname}/assets/config_${this.language}.json`);
        document.querySelector('#inventarium-config').innerHTML = json;
      }
    }



    ifr = document.getElementById("gameFrame")?.contentWindow;
    window.addEventListener("click", e => {
      // console.log(e);
      ifr?.postMessage("hello");
    })
    msysInitInventarium();

    let invList = [];
    window.addEventListener("message", e => {
      const inv = document.getElementById("inventariumList");
      invList = JSON.parse(e.data);
      // console.log(invList);
      inv.innerHTML = "";
      generateInvListDOM();

      // let home3DView = ifr.document.querySelector("#home-3D-view");
      // if (home3DView) {

      // var image = home3DView.toDataURL("image/png").replace("image/png", "image/octet-stream");
      // window.location.href = image;
      // }
    })

    const generateInvListDOM = function () {
      if (invList.length === 0) return;
      const inv = document.getElementById("inventariumList");
      invList.forEach(el => {
        const element = document.createElement("div");
        element.innerText = el.name + el.desc + el.info + el.img;
        const imgEl = document.createElement("img");
        imgEl.src = "../" + el.img;
        element.append(imgEl);
        inv.append(element);
      });
    }
  }

  sendMail(to, attachment) {
    this.closeKbd();

    const msg = {
      to: to,
      from: 'info@littlebit.hu',
      subject: { 'sk': 'Inventár - Borsi', 'hu': 'Inventáriumok - Borsi', 'en': 'Inventories - Borsi' }[this.language],
      html: '[attachment]',
      attachments: [
        {
          filename: 'attachment.png',
          type: 'image/png',
          content: attachment,
          disposition: 'attachment'
        }
      ]
    }
    mail.send(msg);
  }

  closeKbd() {
    for (let el of ['.email-field', '.motto-field']) {
      try {
        let kbd = $(el).getkeyboard();
        kbd.options.alwaysOpen = false;
        kbd.close();
      } catch { }
    }
    try {
      let kbds = $('.ui-keyboard');
      for (let i = 0; i < kbds.length; i++) {
        try {
          let kbd = $(kbds[i]).getkeyboard();
          kbd.options.alwaysOpen = false;
          kbd.close();
        } catch (e) {
          console.log(e);
          console.log('Closing keyboard nr. ' + i + ' failed');
        }
      }
    } catch { }

    try {
      $('.email-field-container').removeClass('-show');
    } catch { }
  }
}
