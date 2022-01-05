const fs = require('fs');
const mail = require('@sendgrid/mail');

// temp key for Borsi
mail.setApiKey('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');

class Application {
  constructor() {
    this.setLanguage('sk');
  }

  setLanguage(language) {
    if (['sk', 'hu', 'en'].includes(language)) {
      this.language = language;
      this.setPage('main');
    }
  }

  setPage(page) {
    this.closeKbd();

    if (page.match(/^[a-z_]+$/)) {
      let header, html;
      switch (page) {
        case 'main':
          header = 'empty';
          break;
        case 'game':
          header = 'game';
          break;
        default:
          header = 'content';
          break;
      }
      html = fs.readFileSync(`${__dirname}/headers/${this.language}/${header}.html`);
      document.querySelector('#header').innerHTML = html;
      html = fs.readFileSync(`${__dirname}/contents/${this.language}/${page}.html`);
      document.querySelector('#content').innerHTML = html;

      for (let element of document.querySelectorAll('.nav-link')) {
        element.classList.remove('active');
      }
      try {
        document.querySelector(`.nav-link.${page}`).classList.add('active');
      } catch { }

      msysInitSzalagok();

      if (page == 'game') {
        let json = fs.readFileSync(`${__dirname}/assets/config_${this.language}.json`);
        document.querySelector('#heraldika-config').innerHTML = json;
        msysInitHeraldika();
      }
    }
  }

  sendMail(to, attachment) {
    this.closeKbd();

    const msg = {
      to: to,
      from: 'info@littlebit.hu',
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