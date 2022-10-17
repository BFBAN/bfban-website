/**
 * 公共函数
 * TODO v1 遗留方法，大部分迁移到[assets/js/util.js]下
 */


import _ from "lodash";

function formatNewLine(str) {
  return str.replace(/\r\n|\r|\n/g, '<br />');
}

function formatLink(str) {
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

function formatImageLink(str) {
  return str.replace(/([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif))/ig, src => `<img src="${src}" />`);
}

function formatTextarea(val) {
  let str = val;

  str = formatNewLine(str);
  str = formatLink(str);
  // str = formatImageLink(str);
  return str;
}


function trimAllWhitespace(str) {
  return str.replace(/\s+/g, '');
}

function testWhitespace(str) {
  return /\s+/.test(str);
}

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

// num seconds
function waitForAction(num = 3) {
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

function getUTCTimeStamp() {
  const now = new Date();
  const utcTimeStamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
      now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

  return utcTimeStamp;
}

function defaultImgProviderSrcToProxy(str) {
  // some images cannot load under http due to default image provider we used cannot be accessed with https
  // replace it with a https proxy
  const proxySrc = "https://bfban.glass-panel.workers.dev/bfban.bamket";
  const reg = /src="http:\/\/bfban.bamket.com/g;
  return str.replace(reg, "src=\"" + proxySrc);
}

function replaceImgSrcToDataSrc(str) {
  const reg = /\s+(src)=/gi;
  return str.replace(reg, ' data-src=');
}

function detectLanguage(lang) {
  return ['zh-CN', 'en-US', 'ja-JP', 'ru-RU', 'tr-TR'].filter(el => el.indexOf(lang) !== -1)[0];
}

export {
  defaultImgProviderSrcToProxy,
  replaceImgSrcToDataSrc,
  formatTextarea,
  formatNewLine,
  formatLink,
  trimAllWhitespace,
  testWhitespace,
  getCsrfToken,
  waitForAction,
  getUTCTimeStamp,
  detectLanguage,
};
