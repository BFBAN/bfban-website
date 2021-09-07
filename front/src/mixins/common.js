import _ from "lodash";

class Common {
  cheatMethodsGlossary = {};
  cheaterStatus = {};
  gameName = {};

  constructor() {
    this.init();
  }

  async init() {
    const list = {
      cheatMethodsGlossary : await import('/src/assets/cheatMethodsGlossary.json'),
      cheaterStatus : await import('/src/assets/cheaterStatus.json'),
      gameName : await import('/src/assets/gameName.json')
    }
    this.cheaterStatus = list.cheaterStatus.child;
    this.gameName = list.gameName.child;
    this.cheatMethodsGlossary = list.cheatMethodsGlossary.child;
    // console.log(this.cheatMethodsGlossary)
    return this;
  }

  checkReportFormData(form) {
    if (!trimAllWhitespace(form.originId)) {
      this.$Message.error('请填写举报游戏ID');
      return false;
    }
    if (!form.gameName) {
      this.$Message.error('选择游戏');
      return false;
    }
    if (form.checkbox.length === 0) {
      this.$Message.error('选择作弊方式');
      return false;
    }
    if (form.captcha.length !== 4) {
      this.$Message.error('正确填写验证码');
      return false;
    }
    if (trimAllWhitespace(form.description).length === 0) {
      this.$Message.error('论述必填');
      return false;
    }
  }

  convertCheatMethods(str = '', locale) {
    const s = str || '';
    const tmpArr = [];
    _.each(s.split(','), (val) => {
      _.each(this.cheatMethodsGlossary, (v, i) => {
        if (v.value === val) {
          tmpArr.push(v[locale]);
        }
      });
    });
    return tmpArr.sort().reverse().join(' ');
  }

  getCheaterStatusLabel(value, locale = detectLanguage(navigator.language)) {
    const o = _.find(this.cheaterStatus, (v, k) => {
      return value === v.value || v.values.indexOf(value) >= 0;
    });
    return o ? o[locale] : '';
  }

  getGameLabel(value, locale = detectLanguage(navigator.language)) {
    const o = _.find(this.gameName, (v, k) => v.value == value);
    return o ? o[locale] : '';
  }

  formatNewLine(str) {
    return str.replace(/\r\n|\r|\n/g, '<br />');
  }

  formatLink(str) {
    // https://stackoverflow.com/a/8943487/875788
    return str.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig, (url) => {
      if (/(jpg|jpeg|png|gif)$/ig.test(url)) return url;
      const hostname = new URL(url).hostname;
      if (hostname.indexOf('bfban.com') !== -1) {
        return `<a href="${url}">${url}</a>`;
      }
      return `<a target="_blank" href="${url}">${url}</a>`;
    });
  }

  formatImageLink(str) {
    return str.replace(/([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif))/ig, src => `<img src="${src}" />`);
  }

  formatTextarea(val) {
    let str = val;

    str = formatNewLine(str);
    str = formatLink(str);
    str = this.formatImageLink(str);
    return str;
  }


  trimAllWhitespace(str) {
    return str.replace(/\s+/g, '');
  }

  testWhitespace(str) {
    return /\s+/.test(str);
  }

  getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  }

// num seconds
  waitForAction(num = 3) {
    const el = this;
    el.style = 'display: none;';
    const span = document.createElement('span');
    el.parentNode.insertBefore(span, el.nextSibling);

    let n = num;
    span.innerText = `等待 ${n} 秒后重试`;
    const si = setInterval(() => {
      if (n > 1) {
        n -= 1;
        span.innerText = `等待 ${n} 秒重试`;
      } else {
        el.style = '';
        span.innerText = '';
        clearInterval(si);
      }
    }, 1000);
  }

  getUTCTimeStamp() {
    const now = new Date();
    const utcTimeStamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
      now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

    return utcTimeStamp;
  }

  defaultImgProviderSrcToProxy(str) {
    // some images cannot load under http due to default image provider we used cannot be accessed with https
    // replace it with a https proxy
    const proxySrc = "https://bfban.glass-panel.workers.dev/bfban.bamket";
    const reg = /src="http:\/\/bfban.bamket.com/g;
    return str.replace(reg, "src=\"" + proxySrc);
  }

  replaceImgSrcToDataSrc(str) {
    const reg = /\s+(src)=/gi;
    return str.replace(reg, ' data-src=');
  }

  detectLanguage(lang) {
    return ['zh-CN', 'en-US', 'ja-JP', 'ru-RU', 'tr-TR'].filter(el => el.indexOf(lang) !== -1)[0];
  }
}

const {
  defaultImgProviderSrcToProxy,
  replaceImgSrcToDataSrc,
  checkReportFormData,
  getCheaterStatusLabel,
  getGameLabel,
  formatTextarea,
  formatNewLine,
  formatLink,
  trimAllWhitespace,
  testWhitespace,
  getCsrfToken,
  convertCheatMethods,
  waitForAction,
  getUTCTimeStamp,
  detectLanguage,
} = new Common();
const common = new Common();

export {
  common,
  defaultImgProviderSrcToProxy,
  replaceImgSrcToDataSrc,
  checkReportFormData,
  getCheaterStatusLabel,
  getGameLabel,
  formatTextarea,
  formatNewLine,
  formatLink,
  trimAllWhitespace,
  testWhitespace,
  getCsrfToken,
  convertCheatMethods,
  waitForAction,
  getUTCTimeStamp,
  detectLanguage,
};
