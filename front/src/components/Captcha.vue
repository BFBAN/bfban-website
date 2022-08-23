<template>
  <div class="captcha-view" @click="refreshCaptcha">
    <span v-if="!content" class="tip">Click me</span>
    <div v-else v-html="content"></div>
    <div class="count" v-show="captchaTime.lock">{{ captchaTime.count }}s</div>
  </div>
</template>

<script>
import {http, api} from '../assets/js/index'

export default {
  name: "Captcha",
  data() {
    return {
      hash: "",
      content: "",
      captchaTime: {
        fun: null,
        count: 0,
        lock: false,
      },
    }
  },
  created() {
    // this.refreshCaptcha();
  },
  destroyed() {
    clearInterval(this.captchaTime.fun);
    this.captchaTime.fun = null;
  },
  methods: {
    // 刷新验证码
    refreshCaptcha() {
      if (this.captchaTime.count > 0) return;

      http.get(api["captcha"], {
        params: {
          t: Math.random()
        }
      }).then(res => {
        if (res.data.success === 1) {
          this.hash = res.data.data["hash"];
          this.content = res.data.data["content"];
        }
      }).finally((res) => {
        this.capthcaTimeout(60);
      });
    },
    capthcaTimeout(num) {
      const that = this;
      let fun;
      if (that.captchaTime.lock) return;
      that.captchaTime.count = num;
      fun = setInterval(function () {
        if (that.captchaTime.count <= 0) {
          clearInterval(fun);
          that.captchaTime.lock = false;
          return;
        }
        that.captchaTime.count -= 1;
      }, 1000);
      that.captchaTime.lock = true;
    }
  },
  computed: {
    // 是否有验证码
    isCaptcha() {
      return this.hash && this.content;
    }
  }
}
</script>

<style scoped lang="less">
.captcha-view {
  overflow: hidden;
  position: relative;

  .count {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 1s;
    font-size: 10px;
    transform: scale(.7);
    color: #000;
    padding: 0 2px;
    border: 1px solid #000;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    top: 2px;
    right: 2px;
  }

  .tip {
    font-size: 12px;
    margin: 0 5px;
  }
}
</style>