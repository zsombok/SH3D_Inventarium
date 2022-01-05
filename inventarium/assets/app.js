const fs = require('fs');

class Application {

  constructor() {
    this.setLanguage('hu');
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
  }

  setPage(name) {
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
    // msysInitSzalagok();
    msysInitInventarium();

    let inv = document.getElementById("inventarium");
    let ifr = document.getElementById("gameFrame")?.contentWindow;
    window.addEventListener("click", e => {
      ifr?.postMessage("start");
    }
    );

    window.addEventListener("message", e => {
      console.log("incoming message");
      console.log(e);
    })
  }

  sendMail(to, attachment) {
    this.closeKbd();

    const msg = {
      to: to,
      from: 'info@littlebit.hu',
      //TODO: tárgyat cserélni
      subject: { 'sk': 'Erb Rodiny - Borsi', 'hu': 'Címer - Borsi', 'en': 'Coat Of Arms - Borsi' }[this.language],
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
