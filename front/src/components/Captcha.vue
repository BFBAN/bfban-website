<template>
  <div class="captcha-view"
       @click="refreshCaptcha"
       :style="`cursor: ${captchaTime.count <= 0 ? 'pointer' : 'not-allowed'};height: ${height}`">
    <span v-if="!content" class="tip">
      <template v-if="!disable">
        {{ $t('captcha.get') }}
        <span v-if="postload">
          <Icon type="md-refresh spin-icon-load" size="20"/>
        </span>
      </template>
      <div v-else style="min-width: 80px">
        <Icon type="md-close" size="20"/>
      </div>
    </span>
    <div v-else v-html="content"
         :class="`${captchaTime.count <= 0 ? 'disable': ''}`">
    </div>
    <transition name="fade">
      <div v-show="content && captchaTime.count <= 0" class="captcha-view-icon">
        <Icon v-if="disable" type="md-close" size="20"/>
        <Icon v-else type="md-refresh" size="20" :class="[postload ? 'spin-icon-load' : '']"/>
      </div>
    </transition>
    <div class="count" v-show="captchaTime.count > 0">{{ captchaTime.count }}s</div>
  </div>
</template>

<script>
import {http, api, storage} from '../assets/js/index'

export default {
  name: "Captcha",
  props: {
    id: {
      type: String,
      default: '0',
    },
    disable: {
      type: Boolean,
      default: false,
    },
    seconds: {
      type: Number,
      default: 60
    },
    height: {
      type: String,
      default: '40px'
    }
  },
  data() {
    return {
      postload: false,
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
        [`${this.id}_${this.$route.name}`]: this.seconds
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
            value: this.seconds,
          }
        }
      }

      if (this.disable || this.postload || this.captchaTime.lock) return;

      this.postload = true;

      http.get(api["captcha"], {
        params: {
          t: Math.random()
        }
      }).then(res => {
        if (res.data.success === 1) {
          // 储存验证码hash
          that.capthcaHash = Object.assign({
            [that.$route.name]: 0
          });

          this.hash = res.data.data["hash"];
          this.content = res.data.data["content"];

          if (Object.keys(captcha.data.value).indexOf(this.$route.name) >= 0) {
            // 会话持久对应时间加载
            this.captchaTime.count = captcha.data.value[this.$route.name];
          }


          this.capthcaTimeout(this.captchaTime.count || this.seconds)
          return;
        }

        this.$Message.error(res.data.code);
      }).finally(res => {
        setTimeout(function () {
          that.postload = false;
        }, 800)
      });
    },
    /**
     * 计时器
     * @param num
     */
    capthcaTimeout(num) {
      const that = this;
      let fun;

      if (that.captchaTime.lock) return false;

      that.captchaTime.count = num;

      fun = setInterval(function () {
        if (that.captchaTime.count <= 0) {
          clearInterval(fun);
          that.captchaTime.lock = false;
          return;
        }
        that.captchaTime.count -= 1;

        that.capthcaHash = Object.assign({
          [`${that.id}_${that.$route.name}`]: that.captchaTime.count
        });
        storage.session().set("captcha", that.capthcaHash);
      }, 1000);

      that.captchaTime.lock = true;
      return true;
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

<style lang="less">
@import "@/assets/css/icon.less";

.captcha-view {
  overflow: hidden;
  position: relative;
  display: flex;
  justify-items: center;
  align-items: center;
  margin: 0 5px;

  .captcha-view-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
  }

  .disable {
    filter: blur(2px);
    transition: all .24s;
    opacity: .4;
  }

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
