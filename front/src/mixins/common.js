import ajax from '@/mixins/ajax';

function checkIdExist({ id }) {
  return ajax({
    method: 'post',
    url: '/checkGameIdExist',
    data: {
      id,
    },
  });
}

function convertGameName(name) {
  let gameName;

  switch (name) {
    case '战地1':
      gameName = 'bf1';
      break;
    case '战地4':
      gameName = 'bf4';
      break;
    case '战地v':
      gameName = 'bfv';
      break;
  }

  return gameName;
}

function checkReportFormData(form) {
  if (!trimAllWhitespace(form.originId)) {
    this.$Message.error('请填写举报游戏ID');
    return false;
  } if (!form.gameName) {
    this.$Message.error('选择游戏');
    return false;
  } if (form.checkbox.length === 0) {
    this.$Message.error('选择作弊方式');
    return false;
  } if (form.captcha.length !== 4) {
    this.$Message.error('正确填写验证码');
    return false;
  } if (trimAllWhitespace(form.description).length === 0) {
    this.$Message.error('论述必填');
    return false;
  }
}

const cheatMethodsGlossary = [
  {
    value: 'stealth',
    "zh-CN": '隐身',
    "en-US": 'Stealth',
    "ja-JP": 'ステルス',
  },
  {
    value: 'wallhack',
    "zh-CN": '透视',
    "en-US": 'Wallhack',
    "ja-JP": '視点',
  },
  {
    value: 'aimbot',
    "zh-CN": '自瞄',
    "en-US": 'Aimbot',
    "ja-JP": '自己照準',
  },
  {
    value: 'oneShotKill',
    "zh-CN": '秒杀',
    "en-US": 'Oneshot kill',
    "ja-JP": 'スパイク',
  },
  {
    value: 'gadgetModify',
    "zh-CN": '改装备',
    "en-US": 'Modified gadget',
    "ja-JP": '機器の交換',
  },
  {
    value: 'damageChange',
    "zh-CN": '改伤',
    "en-US": 'Damagemodifier',
    "ja-JP": '怪我を変える',
  },
  {
    value: 'shootingThroughWalls',
    "zh-CN": '子弹穿墙',
    "en-US": 'Shooting through walls',
    "ja-JP": '壁を突き抜ける弾丸',
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

const cheaterStatus = [
  // value 100 表示全部
  {
    value: '0',
    "zh-CN": '未处理',
    "en-US": 'Processing',
    "ja-JP": '未処理',
  },
  {
    value: '5',
    "zh-CN": '回复讨论中',
    "en-US": 'Under discussion',
    "ja-JP": 'ディスカッションに返信する',
  },
  {
    value: '6',
    "zh-CN": '等待管理确认',
    "en-US": 'Waiting for management cofirmation',
    "ja-JP": '管理者の確認を待っています',
  },
  {
    value: '1',
    "zh-CN": '认为石锤',
    "en-US": 'Confirmed hacker',
    "ja-JP": 'ストーンハンマーだと思う',
  },
  {
    value: '2',
    "zh-CN": '嫌疑再观察',
    "en-US": 'Suspicious player',
    "ja-JP": '再び容疑者',
  },
  {
    value: '3',
    "zh-CN": '认为没开挂',
    "en-US": 'Innocent clean player',
    "ja-JP": '開いていないと思う',
  },
  {
    value: '4',
    "zh-CN": '回收站',
    "en-US": 'Trash',
    "ja-JP": 'ごみ箱',
  },
];

const gameName = [
  {
    value: 'bf1',
    "zh-CN": '战地1',
    "en-US": 'Battlefield 1',
    "ja-JP": 'バトルフィールド1',
  },
  {
    value: 'bfv',
    "zh-CN": '战地v',
    "en-US": 'Battlefield 5',
    "ja-JP": 'バトルフィールドV',
  },
];

function getCheaterStatusLabel(value, locale) {
  const o = _.find(cheaterStatus, (v, k) => v.value === value);
  return o ? o[locale] : '';
}

function getGameLabel(value, locale) {
  const o = _.find(gameName, (v, k) => v.value === value);
  return o ? o[locale] : '';
}

function formatNewLine(str) {
  return str.replace(/\r\n|\r|\n/g, '<br />');
}

function formatLink(str) {
  // https://stackoverflow.com/a/8943487/875788
  return str.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, (url) => {
    if (/(jpg|jpeg|png|gif)$/ig.test(url)) return url;
    const hostname = new URL(url).hostname;
    if (hostname.indexOf('bfban.com') !== -1) {
      return `<a href="${url}">${url}</a>`;
    }
    return `<a target="_blank" href="${url}">${url}</a>`;
  });
}

function formatImageLink(str) {
  return str.replace(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/ig, src => `<img src="${src}" />`);
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
  return str.replace(reg, "src=\""+proxySrc);
}

function replaceImgSrcToDataSrc(str) {
  const reg = /\s+(src)=/gi;
  return str.replace(reg, ' data-src=');
}

function detectLanguage(lang) {
  return ['zh-CN', 'en-US', 'ja-JP'].filter(el => el.indexOf(lang) !== -1)[0];
}


export {
  defaultImgProviderSrcToProxy,
  replaceImgSrcToDataSrc,
  checkIdExist,
  convertGameName,
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
