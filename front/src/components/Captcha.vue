<template>
  <div class="captcha-view" @click="refreshCaptcha" :style="`cursor: ${captchaTime.count <= 0 ? 'pointer' : 'not-allowed'};`">
    <span v-if="!content" class="tip">
      {{ $t('captcha.get') }}
    </span>
    <div v-else v-html="content" :style="captchaTime.count <= 0 ? 'opacity: .3' : ''"></div>
    <div class="count" v-show="captchaTime.lock">{{ captchaTime.count }}s</div>
  </div>
</template>

<script>
import {http, api, storage} from '../assets/js/index'
export default {
  name: "Captcha",
  data() {
    return {
      hash: "",
      content: "",
      capthcaHash: {},
      captchaTime: {
        fun: null,
        count: 0,
        lock: false,
      },
    }
  },
  created() {
    let captcha = storage.session().get('captcha');
    if (captcha) {
      this.capthcaHash = captcha.data;
    } else {
      storage.session().set(`captcha`, {
        [this.$route.name]: 30
      });
    }
  },
  destroyed() {
    clearInterval(this.captchaTime.fun);
    this.captchaTime.fun = null;
  },
  methods: {
    /**
     * 刷新验证码
     */
    async refreshCaptcha() {
      let captcha = await storage.session().get('captcha');
      let that = this;

      if (captcha.code <= 0) {
        captcha = {
          data: {
            value: 30,
          }
        }
      }

      if (this.captchaTime.count > 0) return;

      http.get(api["captcha"], {
        params: {
          t: Math.random()
        }
      }).then((res) => {
        if (res.data.success === 1) {
          // 储存验证码hash
          that.capthcaHash = Object.assign({
            [that.$route.name] : 0
          });

          this.hash = res.data.data["hash"];
          this.content = res.data.data["content"];
        }
      }).finally((res) => {
        if (Object.keys(captcha.data.value).indexOf(this.$route.name) >= 0) {
          // 会话持久对应时间加载
          this.captchaTime.count = captcha.data.value[this.$route.name];
        }

        this.capthcaTimeout(this.captchaTime.count || 30);
      });
    },
    /**
     * 计时器
     * @param num
     */
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

        that.capthcaHash = Object.assign({
          [that.$route.name] : that.captchaTime.count
        });
        storage.session().set("captcha", that.capthcaHash);
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
  animation: all .4s;

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