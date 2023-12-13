/**
 * 公共函数
 * TODO v1 遗留方法，大部分迁移到[assets/js/util.js]下
 */

function formatNewLine(str) {
  return str.replace(/\r\n|\r|\n/g, '<br />');
}

function formatImage(str) {
  const imgRegex = /<img src="(.*?)" \/>/g;
  const convertedText = str
      .replace(imgRegex, (match, src) => `<img src="${src}" />`);

  return convertedText;
}

function formatLink(str) {
  const linkRegex = /(?:^|\s)((?:http|https|ftp):\/\/[^\s<]+)/g;
  const convertedText = str
      .replace(linkRegex, (match, url) => ` <a href="${url}">${url}</a>`)

  return convertedText;
}

function formatTextarea(val) {
  let str = val;
  str = formatImage(str);
  str = formatLink(str);
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
