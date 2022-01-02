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
      if (name.match(/^[a-z0-9]+$/)) {
        this.setHeader(this.language);
        let html = fs.readFileSync(__dirname + '/contents/' + this.language + '/' + name + '.html').toString();
        document.querySelector('#content').innerHTML = html;
      }
    }
    msysInitSzalagok();
    msysInitInventarium();
  }

}