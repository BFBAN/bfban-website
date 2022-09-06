/**
 * 简单的储存
 */

import time from "./date";

export default  class Storage{
  THAT = this;
  STORAGENAME = 'bfban.';
  DATE = new time();

  constructor(data = {name}) {
    this.STORAGENAME = data.name;
  }

  session ()  {
      return {
        set: (name, value) => {
          let data = {value, time: this.DATE.now()};
          sessionStorage.setItem(this.STORAGENAME + name, JSON.stringify(data));
          return {code: 0, data};
        },
        get: (name) => {
          let data = JSON.parse(
              sessionStorage.getItem(this.STORAGENAME + name)
          );
          let result = {code: 0, data};
          if (data == null || data == '' || data == undefined) {
            result = {code: -1}
          }
          return result;
        }
      }
  }

  local () {
    return {
      set: this.set,
      get: this.get,
      rem: this.rem
    }
  }

  /**
   * 写入
   */
  set (name, value) {
    let data = {value, time: this.DATE.now()}
    localStorage.setItem(this.STORAGENAME + name, JSON.stringify(data));

    return {code: 0, data};
  }

  /**
   * 读取
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
