/**
 * 简单的储存
 */

import time from "./date";

export default  class Storage{
  STORAGENAME = 'bfban.';
  DATE = new time();

  constructor(data = {name}) {
    this.STORAGENAME = data.name;
  }

  /**
   * 设置
   */
  set (name, value) {
    let data = {value, time: this.DATE.now()}
    localStorage.setItem(this.STORAGENAME + name, JSON.stringify(data));

    return {code: 0, data};
  }

  /**
   * 获取
   */
  get (name) {
    let data = JSON.parse(
        localStorage.getItem(this.STORAGENAME + name)
    );
    let result = {code: 0, data};
    if (data == null || data == '' || data == undefined) {
      result = {code: -1}
    }
    return result;
  }

  /**
   * 移除
   * @param name
   */
  async rem (name) {
    localStorage.removeItem(this.STORAGENAME + name);
  }
}
