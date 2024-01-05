<template>
  <div ref="confettiContainer" @dblclick="stopAnimation">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Confetti',
  props: {
    switch: {
      type: Boolean,
      default: true,
    },
    x: {
      type: [Number],
      default: 0
    },
    y: {
      type: [Number],
      default: 0
    },
    emojis: [Array],
    emojiCount: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      animation: []
    }
  },
  watch: {
    switch: {
      handler(val) {
        if (val && this.animation.length <= 0)
          this.generateConfetti()
      }
    }
  },
  mounted() {
    if (this.switch)
      this.generateConfetti();
  },
  methods: {
    /**
     * 停止动画
     */
    stopAnimation() {
      if (this.animation)
        for (let i = 0; i < this.animation.length; i++) {
          clearTimeout(this.animation[i])
        }
    },
    /**
     * 生成
     */
    generateConfetti() {
      var emojis = ["🎉", "🎊", "🎈", "🎁", "🎀"].concat(this.emojis || []);
      if (this.$refs.confettiContainer)
        for (let i = 0; i < this.emojiCount; i++) {
          this.animation.push(setTimeout(() => {
            var emoji = emojis[Math.floor(Math.random() * emojis.length)];
            var x = Math.floor(Math.random() * this.$refs.confettiContainer?.offsetWidth || 0) - this.x;
            var y = Math.floor(Math.random() * this.$refs.confettiContainer?.offsetHeight || 0) - this.y;
            var span = document.createElement("span");
            span.style.position = "absolute";
            span.style.left = `${x}px`;
            span.style.top = `${y}px`;
            span.style.fontSize = "30px";
            span.style.opacity = 0;
            span.style.transition = "all 0.5s";
            span.innerText = emoji;
            this.$refs.confettiContainer?.appendChild(span);

            setTimeout(() => {
              span.style.opacity = 1;
            }, 50);

            setTimeout(() => {
              span.style.opacity = 0;
              setTimeout(() => {
                span.remove();
              }, 100);
            }, 1000);
          }, i * 100));
        }
    }
  }
}
</script>
