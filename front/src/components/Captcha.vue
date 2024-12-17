<template>
  <div class="turnstile-wrapper">
    <div
        class="container"
        :class="{ blurred: isBlurred }"
        :style="{ pointerEvents: isBlurred ? 'none' : 'auto' }"
    >
      <div class="captcha">
        <div ref="turnstileContainer" class="turnstile-container"></div>
        <span class="captcha-text" @click="renderTurnstile">
          {{ $t('captcha.fresh') }}
        </span>
      </div>

    </div>
    <div v-if="isBlurred" class="click-to-show" @click="removeBlur">
      {{ $t('captcha.get') }}
    </div>
  </div>
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
        callback: (response) => {
          this.$emit('getCaptchaData', { response, captchaType: 'turnstile' });
        },
      });

      // 标记已渲染
      this.$refs.turnstileContainer.setAttribute('data-rendered', 'true');
    }
  }
}
</script>

<style scoped>
.turnstile-wrapper {
  display: flex;
  justify-content: flex-start; /* 左对齐 */
  align-items: flex-start; /* 顶部对齐 */
  padding: 10px;
  background-color: gainsboro;
  min-height: 100px;
  box-sizing: border-box;
}

.turnstile-container {
  display: inline-block;
}

/* 容器样式 */
.container {
  display: flex;

  justify-content: center;
  transition: filter 0.3s ease;
  position: relative; /* 相对定位容器 */
}

/* 虚化效果 */
.blurred {
  filter: blur(5px);
}

/* 点击提示文字样式 */
.click-to-show {
  position: absolute; /* 绝对定位在外层容器 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  cursor: pointer;
  border-radius: 5px;
  z-index: 10; /* 确保层级高于虚化容器 */
}
/* 验证码容器样式 */
.captcha {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.captcha-text {
  font-size: 12px;
  color: gray;
  margin-top: -10px;
}
</style>
