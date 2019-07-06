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
    label: '隐身',
  },
  {
    value: 'wallhack',
    label: '透视',
  },
  {
    value: 'aimbot',
    label: '自瞄',
  },
  {
    value: 'oneShotKill',
    label: '秒杀',
  },
  {
    value: 'gadgetModify',
    label: '改装备',
  },
  {
    value: 'damageChange',
    label: '改伤',
  },
  {
    value: 'shootingThroughWalls',
    label: '子弹穿墙',
  },
];

// return string
function convertCheatMethods(str = '') {
  const s = str || '';

  const tmpArr = [];
  _.each(s.split(','), (val) => {
    _.each(cheatMethodsGlossary, (v, i) => {
      if (v.value === val) {
        tmpArr.push(v.label);
      }
    });
  });

  return tmpArr.sort().reverse().join(' ');
}

const cheaterStatus = [
  // value 100 表示全部
  {
    value: '0',
    label: '未处理',
  },
  {
    value: '5',
    label: '回复讨论中',
  },
  {
    value: '6',
    label: '等待管理确认',
  },
  {
    value: '1',
    label: '认为石锤',
  },
  {
    value: '2',
    label: '嫌疑再观察',
  },
  {
    value: '3',
    label: '认为没开挂',
  },
  {
    value: '4',
    label: '回收站',
  },
];

const gameName = [
  {
    value: 'bf1',
    label: '战地1',
  },
  {
    value: 'bfv',
    label: '战地v',
  },
];

function getCheaterStatusLabel(value) {
  const o = _.find(cheaterStatus, (v, k) => v.value === value);
  return o ? o.label : '';
}

function getGameLabel(value) {
  const o = _.find(gameName, (v, k) => v.value === value);
  return o ? o.label : '';
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

function replaceImgSrcToDataSrc(str) {
  const reg = /\s+(src)=/gi;
  return str.replace(reg, ' data-src=');
}

export {
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
};
