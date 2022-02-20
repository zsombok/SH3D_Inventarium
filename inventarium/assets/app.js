const fs = require('fs');
// const mail = require('@sendgrid/mail');
const { ipcRenderer } = require('electron');
const nodemailer = require('nodemailer');
let ifr;

class Application {

  constructor() {
    this.setLanguage('sk');
    this.game = 'Urfiak_haza';
  }

  setGame(game) {
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

    msysInitInventarium();

    let invList = [];
    window.addEventListener("message", e => {
      const inv = document.getElementById("inventariumList").querySelector(".list");
      invList = JSON.parse(e.data);
      inv.innerHTML = "";
      generateInvListDOM();
      const totEl = document.getElementById("inventariumList").querySelector(".total");
      totEl.innerText = generateTotalText();
    })

    const generateTotalText = function () {
      const texts = msysIntervarium.TextSlider.config.texts;
      const whole = Math.floor(invList.total);
      const decimals = Math.round((invList.total - whole) * 100);
      return texts.total + " " + whole + " " + texts.forint + " " + decimals + " " + texts.denar;
    }

    const generateInvListDOM = function () {
      if (invList.furnitureArray.length === 0) return;
      const inv = document.getElementById("inventariumList").querySelector(".list");

      invList.furnitureArray.forEach(el => {
        const liItem = document.createElement("div");
        liItem.classList.add("listItem");
        const imgEl = document.createElement("img");
        imgEl.src = el.img;
        liItem.append(imgEl);

        const infos = document.createElement("div");
        infos.classList.add("infos");
        liItem.append(infos);

        const title = document.createElement("div");
        title.innerText = el.name;
        title.classList.add("title");
        infos.append(title);
        const info = document.createElement("div");
        info.innerText = el.desc;
        info.classList.add("info");
        infos.append(info);
        const price = document.createElement("div");
        price.innerText = el.info;
        price.classList.add("price");
        infos.append(price);
        const quantityContainer = document.createElement("div");
        quantityContainer.classList.add("quantityContainer");
        const quantity = document.createElement("div");
        quantity.innerText = el.quantity;
        quantity.classList.add("quantity");
        quantityContainer.append(quantity);
        liItem.append(quantityContainer);
        inv.append(liItem);
      });
    }
  }

  sendMail(emails) {
    this.closeKbd();

    console.log(emails);

    async function main() {
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      let testAccount = await nodemailer.createTestAccount();

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "mail.silicium.eu",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "muzeum@rakoczino.eu",
          pass: "b0leeuvs7aop",
        },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: { 'sk': 'Inventár - Borsi', 'hu': 'Inventáriumok - Borsi', 'en': 'Inventories - Borsi' }[app.language] + "<muzeum@rakoczino.eu>", // sender address
        to: "zsombokd@gmail.com", // list of receivers
        subject: { 'sk': 'Inventár - Borsi', 'hu': 'Inventáriumok - Borsi', 'en': 'Inventories - Borsi' }[app.language], // Subject line
        text: "",
        attachments: [{
          filename: `${emails.split('@')[0]}-inventarium.png`,
          path: `${__dirname}/saved_images/${app.findLastSavedImage()}`,
        }]
      });
    }

    main().catch(console.error);

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

  findLastSavedImage() {
    let img = 0;

    fs.readdirSync(`${__dirname}/saved_images/`).forEach(file => {
      let current = file.split(".")[0];
      if (Number.parseInt(current) > img) {
        img = current
      }
    });

    return img.toString() + ".png";
  }
}
