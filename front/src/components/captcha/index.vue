<script>
import TurnstileCaptchaWidget from "./turnstile.vue";
import SvgCaptchaWidget from "./svg.vue"


/**
 * 验证器
 * svg:
 * 返回结构: {content: '', hash: '', captchaType: 'svg'}
 * 取值: this.$refs.captcha.hash
 *
 * turnstile:
 * 返回结构: {response: '', captchaType: 'turnstile'}
 * 取值: <Captcha @getCaptchaData="(value) => value" />
 */
export default {
  name: 'Captcha',
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
    },
    type: {
      type: String,
      default: 'turnstile'
    }
  },
  components: {TurnstileCaptchaWidget, SvgCaptchaWidget},
  methods: {
    /**
     * 重置验证器
     */
    refreshCaptcha() {
      switch (this.type) {
        case "turnstile":
          this.$refs.turnstileCaptchaRef.onRenderTurnstile();
          break;
        case "svg":
          this.$refs.svgCaptchaRef.refreshCaptcha();
          break;
        default:
          throw "Unknown captcha type";
      }
    },
    /**
     * 验证器完成回调
     * @param string|map value
     */
    doneVerifies(value) {
      let result = {captchaType: this.type};

      switch (this.type) {
        case "turnstile":
          result = {...result, response: value};
          break;
        case "svg":
          result = {...result, content: this.$refs.content, hash: this.$refs.hash};
          break;
        default:
          throw "Unknown captcha type";
      }

      this.$emit('getCaptchaData', result);
    }
  }
}
</script>

<template>
  <div class="captcha"
       :style="`height: ${height}`">
    <TurnstileCaptchaWidget ref="turnstileCaptchaRef"
                            v-if="type === 'turnstile'"
                            :id="id"
                            :disable="disable"
                            @callbackDoneVerifies="doneVerifies"></TurnstileCaptchaWidget>
    <SvgCaptchaWidget ref="svgCaptchaRef"
                      v-if="type === 'svg'"
                      :id="id"
                      :seconds="seconds"
                      :disable="disable"
                      @callbackDoneVerifies="doneVerifies"></SvgCaptchaWidget>
  </div>
</template>

<style scoped lang="less">

</style>
