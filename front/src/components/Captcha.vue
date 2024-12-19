<template>
  <Card class="captcha turnstile-wrapper" dis-hover :padding="0">
    <div class="ivu-card" :style="{ pointerEvents: isBlurred ? 'none' : 'auto' }">
      <div ref="turnstileContainer" class="turnstile-container"></div>
    </div>
    <div v-if="isBlurred" class="captcha-hint" @click="removeBlur">
      {{ $t('captcha.get') }}
    </div>
  </Card>
</template>

<script>
export default {
  name: 'Captcha',
  props: {
    sitekey: {
      type: String,
      default: '0x4AAAAAAA10y-7P5RclJ5Zm'
    }
  },
  data() {
    return {
      isBlurred: true
    };
  },
  methods: {
    removeBlur() {
      this.isBlurred = false; // 点击后取消虚化
      setTimeout(() => {
        this.initTurnstile(); // 加载 CAPTCHA
      }, 500)
    },
    initTurnstile() {
      // 检查是否已经加载脚本
      if (typeof window.turnstile !== 'undefined') {
        this.renderTurnstile();
        return;
      }

      const existingScript = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
      if (existingScript) {
        // 如果脚本已存在，等待其加载完成再渲染
        existingScript.addEventListener('load', () => {
          this.renderTurnstile();
        });
        return;
      }

      // 如果脚本不存在，动态添加脚本
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.renderTurnstile();
      };
      document.head.appendChild(script);
    },
    renderTurnstile() {
      if (!this.$refs.turnstileContainer) return;

      // 如果已经渲染过，则重置 Turnstile
      if (this.$refs.turnstileContainer.getAttribute('data-rendered') === 'true') {
        window.turnstile.reset(this.$refs.turnstileContainer);
        return;
      }

      // 渲染 Turnstile
      window.turnstile.render(this.$refs.turnstileContainer, {
        sitekey: this.sitekey,
        size: 'flexible',
        appearance: 'execute',
        callback: (response) => {
          this.$emit('getCaptchaData', {response, captchaType: 'turnstile'});
        },
      });

      // 标记已渲染
      this.$refs.turnstileContainer.setAttribute('data-rendered', 'true');
    },
  }
}
</script>

<style scoped>
.captcha.turnstile-wrapper {
  overflow: hidden;
  width: 180px;
  height: 38px !important;
  display: flex;
  box-sizing: border-box;
}

.captcha .turnstile-container {
  margin: -15px -61px;
  position: absolute;
  height: 65px !important;
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
  display: block;
  width: 100%;
}
</style>
