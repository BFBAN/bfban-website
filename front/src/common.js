
function checkIdExist({gameName, id}) {
  return axios({
    method: 'post',
    url: '/checkGameIdExist',
    data: {
      gameName,
      id,
    },
  })
}

function convertGameName(name) {
  let gameName;

  switch (name) {
    case "战地1":
      gameName = 'bf1';
      break;
    case "战地4":
      gameName = 'bf4';
      break;
    case "战地v":
      gameName = 'bfv';
      break;
  }

  return gameName;
}

function checkReportFormData(form) {
  if (!form.gameName) {
    this.$Message.error('选择游戏');
    return false;
  } else
  if (form.checkbox.length === 0) {
    this.$Message.error('选择作弊方式');
    return false;
  } else
  if (form.captcha.length !== 4) {
    this.$Message.error('正确填写验证码');
    return false;
  }
}

const cheaterStatus = [
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
    label: '石锤',
  },
  {
    value: '2',
    label: '嫌疑再观察',
  },
  {
    value: '3',
    label: '没有问题不是挂',
  },
  {
    value: '4',
    label: '回收站',
  },
];

const gameName = [
  {
    value: 'bf1',
    label: '战地1'
  },
  {
    value: 'bfv',
    label: '战地v',
  }
];

function getCheaterStatusLabel(value) {
  let o = _.find(cheaterStatus, (v, k) => {
    return v.value === value;
  });
  return o ? o.label : '';
}

function getGameLabel(value) {
  let o = _.find(gameName, (v, k) => {
    return v.value === value;
  });
  return o ? o.label : '';
}

function formatNewLine(str) {
  return str.replace(/\r\n|\r|\n/g, "<br />");
}

function formatLink(str) {
  // https://stackoverflow.com/a/8943487/875788
  return str.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, function(url) {
    let hostname = new URL(url).hostname;
    if (hostname.indexOf('bfban.com') !== -1) {
      return `<a href="${url}">${url}</a>`
    } else {
      return `<a target="_blank" href="${url}">${url}</a>`
    }
  });
}

function formatTextarea(val) {
  let str = val;

  str = formatNewLine(str);
  str = formatLink(str);
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

export {
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
};
