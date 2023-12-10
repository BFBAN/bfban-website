/**
 * 公共函数
 * TODO v1 遗留方法，大部分迁移到[assets/js/util.js]下
 */

function formatNewLine(str) {
  return str.replace(/\r\n|\r|\n/g, '<br />');
}

function formatTextarea(val) {
  let str = val;

  str = formatNewLine(str);
  return str;
}

function trimAllWhitespace(str) {
  return str.replace(/\s+/g, '');
}

function testWhitespace(str) {
  return /\s+/.test(str);
}

export {
  formatTextarea,
  formatNewLine,
  trimAllWhitespace,
  testWhitespace,
};
