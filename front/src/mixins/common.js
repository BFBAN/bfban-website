import ajax from '@/mixins/ajax';
import _ from "lodash";

function moment() {
}

function checkIdExist({id}) {
  return ajax({
    method: 'post',
    url: '/checkGameIdExist',
    data: {
      id,
    },
  });
}

function checkReportFormData(form) {
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

const cheatMethodsGlossary = [
  {
    value: 'stealth',
    "zh-CN": '隐身',
    "en-US": 'Stealth',
    "ja-JP": '透明',
    "ru-RU": 'Стелс',
    "tr-TR": 'Görünmezlik',
  },
  {
    value: 'wallhack',
    "zh-CN": '透视',
    "en-US": 'Wallhack',
    "ja-JP": 'ウォールハック',
    "ru-RU": 'Валхак',
    "tr-TR": 'Wallhack',
  },
  {
    value: 'aimbot',
    "zh-CN": '自瞄',
    "en-US": 'Aimbot',
    "ja-JP": 'エイムボット',
    "ru-RU": 'Аимбот',
    "tr-TR": 'Aimbot',
  },
  {
    value: 'oneShotKill',
    "zh-CN": '秒杀',
    "en-US": 'Oneshot kill',
    "ja-JP": 'ワンショット',
    "ru-RU": 'Моментальное убийство',
    "tr-TR": 'Tek vuruş öldürme',
  },
  {
    value: 'gadgetModify',
    "zh-CN": '改装备',
    "en-US": 'Modified gadget',
    "ja-JP": 'ガジェットチート',
    "ru-RU": 'Модифицированный гаджет',
    "tr-TR": 'Farkli kit kullanma',
  },
  {
    value: 'damageChange',
    "zh-CN": '改伤',
    "en-US": 'Damagemodifier',
    "ja-JP": 'ダメージ変更',
    "ru-RU": 'Модифицированный урон',
    "tr-TR": 'Hasarı degiştirme',
  },
  {
    value: 'shootingThroughWalls',
    "zh-CN": '子弹穿墙',
    "en-US": 'Shooting through walls',
    "ja-JP": '壁抜き',
    "ru-RU": 'Стреляет через стены',
    "tr-TR": 'Duvar arkası vurma',
  },
];

// return string
function convertCheatMethods(str = '', locale) {
  const s = str || '';

  const tmpArr = [];
  _.each(s.split(','), (val) => {
    _.each(cheatMethodsGlossary, (v, i) => {
      if (v.value === val) {
        tmpArr.push(v[locale]);
      }
    });
  });

  return tmpArr.sort().reverse().join(' ');
}

['wallhack', 'aimbot', 'invisable', 'magicBullet',
  'damageChange', 'gadgetModify', 'teleport', 'attackServer']
const cheaterStatus = [
  // value 100 表示全部
  {
    value: 0,
    values: ['0', 'wallhack'],
    "zh-CN": '未处理',
    "en-US": 'Processing',
    "ja-JP": '未処理',
    "ru-RU": 'В процессе',
    "tr-TR": 'İşleniyor',
  },
  {
    value: 5,
    values: ['5', 'gadgetModify'],
    "zh-CN": '回复讨论中',
    "en-US": 'Under discussion',
    "ja-JP": '議論中',
    "ru-RU": 'Обсуждается',
    "tr-TR": 'Tartışılıyor',
  },
  {
    value: 6,
    values: ['6', 'teleport'],
    "zh-CN": '等待管理确认',
    "en-US": 'Waiting for management cofirmation',
    "ja-JP": '管理者の確認待ち',
    "ru-RU": 'Ожидает подтверждения менаджером',
    "tr-TR": 'Yönetici onayı bekleniyor',
  },
  {
    value: 1,
    values: ['1', 'guilt'],
    "zh-CN": '认为石锤',
    "en-US": 'Confirmed hacker',
    "ja-JP": 'チーター',
    "ru-RU": 'Подтверждённый хакер',
    "tr-TR": 'Onaylanmış hileci',
  },
  {
    value: 2,
    values: ['2', 'invisable'],
    "zh-CN": '嫌疑再观察',
    "en-US": 'Suspicious player',
    "ja-JP": '怪しいプレイヤー',
    "ru-RU": 'Подозрительный игрок',
    "tr-TR": 'Şüpheli oyuncu',
  },
  {
    value: 3,
    values: [ '3', 'magicBullet'],
    "zh-CN": '认为没开挂',
    "en-US": 'Innocent clean player',
    "ja-JP": '無実のプレイヤー',
    "ru-RU": 'Честный игрок',
    "tr-TR": 'Temiz oyuncu',
  },
  {
    value: 4,
    values: ['4', 'damageChange'],
    "zh-CN": '回收站',
    "en-US": 'Recycle Bin',
    "ja-JP": 'ごみ箱',
    "ru-RU": 'Мусор',
    "tr-TR": 'Çöp',
  },
  {
    value: 7,
    values: ['7', 'attackServer'],
    "zh-CN": '攻击服务器',
    "en-US": 'attackServer',
    "ja-JP": 'attackServer',
    "ru-RU": 'attackServer',
    "tr-TR": 'attackServer',
  },
];

const gameName = [
  {
    value: 'bf1',
    "zh-CN": '战地1',
    "en-US": 'Battlefield 1',
    "ja-JP": 'バトルフィールド1',
    "ru-RU": 'Battlefield 1',
    "tr-TR": 'Battlefield 1',
  },
  {
    value: 'bfv',
    "zh-CN": '战地v',
    "en-US": 'Battlefield 5',
    "ja-JP": 'バトルフィールドV',
    "ru-RU": 'Battlefield 5',
    "tr-TR": 'Battlefield 5',
  },
  {
    value: 'bf6',
    "zh-CN": '战地6',
    "en-US": 'Battlefield 6',
    "ja-JP": 'バトルフィールド6',
    "ru-RU": 'Battlefield 6',
    "tr-TR": 'Battlefield 6',
  },
];

function getCheaterStatusLabel(value, locale = detectLanguage(navigator.language)) {
  const o = _.find(cheaterStatus, (v, k) => {
    return value === v.value || v.values.indexOf(value) >= 0;
  });
  return o ? o[locale] : '';
}

function getGameLabel(value, locale = detectLanguage(navigator.language)) {
  const o = _.find(gameName, (v, k) => v.value == value);
  return o ? o[locale] : '';
}

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
  str = formatImageLink(str);
  return str;
}

function convertDatetimeToUserTimeZone(d) {
  const tz = moment.tz.guess();
  return moment(d).clone().tz(tz).format('YYYY-MM-DD HH:mm:ss');
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
  checkIdExist,
  checkReportFormData,
  cheaterStatus,
  gameName,
  getCheaterStatusLabel,
  getGameLabel,
  formatTextarea,
  formatNewLine,
  formatLink,
  convertDatetimeToUserTimeZone,
  trimAllWhitespace,
  testWhitespace,
  getCsrfToken,
  cheatMethodsGlossary,
  convertCheatMethods,
  waitForAction,
  getUTCTimeStamp,
  detectLanguage,
};
