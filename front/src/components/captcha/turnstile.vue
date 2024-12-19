<template>
  <Card class="captcha turnstile-wrapper" dis-hover :padding="0">
    <div class="ivu-card" :style="{ pointerEvents: isShowGetCaptchaHint ? 'none' : 'auto' }">
      <div ref="turnstileContainer" class="turnstile-container"></div>
    </div>
    <div v-if="isShowGetCaptchaHint" class="captcha-hint" @click="oneGetCaptcha">
      <template v-if="!disable">
        {{ $t('captcha.get') }}
      </template>
      <template v-else>
        <Icon type="md-close" size="20"/>
      </template>
    </div>
  </Card>
</template>

<script>
const TurnstileConfig = {
  siteKey: '0x4AAAAAAA10y-7P5RclJ5Zm'
};

export default {
  props: {
    id: {
      type: String,
      default: '0',
    },
    disable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShowGetCaptchaHint: true
    };
  },
  methods: {
    /**
     * 首次人为触发
     */
    oneGetCaptcha() {
      if (this.disable) return;

      this.isShowGetCaptchaHint = false; // 点击后取消虚化
      setTimeout(() => {
        this.initTurnstile(); // 加载 CAPTCHA
      }, 500)
    },
    /**
     * 初始验证
     */
    initTurnstile() {
      // 检查是否已经加载脚本
      if (typeof window.turnstile !== 'undefined') {
        this.onRenderTurnstile();
        return;
      }

      const existingScript = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
      if (existingScript) {
        // 如果脚本已存在，等待其加载完成再渲染
        existingScript.addEventListener('load', () => {
          this.onRenderTurnstile();
        });
        return;
      }

      // 如果脚本不存在，动态添加脚本
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.onRenderTurnstile();
      };
      script.onerror = (e) => {
        this.$Message.error(this.$t(`basic.tip['captcha.error']`, {
          message: e || ""
        }));
      }

      document.head.appendChild(script);
    },
    /**
     * 获取验证码
     */
    onRenderTurnstile() {
      if (!this.$refs.turnstileContainer || this.disable) return;

      // 如果已经渲染过，则重置 Turnstile
      if (this.$refs.turnstileContainer.getAttribute('data-rendered') === 'true') {
        window.turnstile.reset(this.$refs.turnstileContainer);
        return;
      }

      // 渲染 Turnstile
      window.turnstile.render(this.$refs.turnstileContainer, {
        sitekey: TurnstileConfig.siteKey,
        size: 'flexible',
        appearance: 'execute',
        callback: (response) => {
          // callback event https://developers.cloudflare.com/turnstile/
          this.$emit('callbackDoneVerifies', response);
        },
      });

      // 标记已渲染
      this.$refs.turnstileContainer.setAttribute('data-rendered', 'true');
    },
  }
}
</script>

<style scoped lang="less">
@import "@/assets/css/icon.less";

.captcha.turnstile-wrapper {
  overflow: hidden;
  width: 120px;
  height: 40px !important;
  display: flex;
  box-sizing: border-box;
}

.captcha .turnstile-container {
  margin: -16px -61px;
  position: absolute;
  overflow: hidden;
  transform: scale(.6);
}

.captcha .turnstile-container > * {
  margin-bottom: -12px !important;
}

.captcha .captcha-hint {
  cursor: pointer;
  position: absolute;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  top: 0;
  bottom: 0;
}
</style>
