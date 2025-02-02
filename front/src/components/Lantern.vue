<template>
  <div class="lantern-widget-box" v-if="nowTime >= new Date('2024 12-31').getTime() && nowTime <= new Date('2025 2-4').getTime()">
    <div class="lan-header">
      <div class="container">🎆 2025
        <HtmlLink href="https://en.wikipedia.org/wiki/Chinese_New_Year" text="New Year"></HtmlLink>
        🎆
      </div>
    </div>
    <div class="lantern-box">
      <div v-for="(i, index) in ['left', 'right']" :key="index" :class="`lantern ${i}-lantern`">
        <!-- 顶部绳索 -->
        <div class="lantern-rope lantern-top-rope "></div>
        <!-- 提手 -->
        <div class="lantern-handle lantern-top-handle"></div>
        <!-- 中间部分 -->
        <div class="lantern-center">新年</div>
        <!-- 下提手 -->
        <div class="lantern-handle lantern-bottom-handle"></div>
        <!-- 绳 -->
        <div class="lantern-bottom">
          <div class="lantern-rope lantern-bottom-rope"></div>
          <!-- 灯穗 -->
          <div class="lantern-panicle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --lantern-yellow: #ecaa2f;
}

.lantern-widget-box:hover {
  .lan-header {
    transition: all 0.25s;
    padding: 15px 0;
    text-align: center;
    display: flex;
    height: 55px !important;

    > * {
      width: auto;
      height: auto;
    }
  }
}

.lantern-widget-box {
  margin-bottom: 5px;

  .lan-header {
    position: absolute;
    z-index: 200;
    min-height: 3px;
    display: flex;
    top: 0;
    left: 0;
    right: 0;
    background-color: red;
    border-bottom: 3px solid var(--lantern-yellow);
    color: #fff;
    height: 3px;

    > * {
      width: 0;
      height: 0;
      overflow: hidden;
    }
  }

  .lan-header:after {
    content: "";
    width: 50px;
    height: 12px;
    position: absolute;
    z-index: 1;
    left: calc(50% - 25px);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    bottom: -12px;
    display: block;
    background-color: var(--lantern-yellow);
  }
}

.lantern-box {
  pointer-events: none;
  position: absolute;
  width: 100%;
  display: flex;
  top: 0;
  left: 0;
  right: 0;

  & > * {
    position: absolute;
    z-index: -1;
    top: 0px;
  }

  .left-lantern {
    left: 40px;
  }

  .right-lantern {
    right: 40px;
  }
}

@media screen and (min-width: 1350px) {
  .lantern-widget-box {
    min-width: 1024px;
    max-width: 100%;
  }
}

@media screen and (max-width: 1740px) {
  .lantern-box {
    .left-lantern {
      left: 0px !important;
    }

    .right-lantern {
      right: 0px !important;
    }
  }
}

@media screen and (max-width: 1350px) {
  .lantern-widget-box {
    .left-lantern,
    .right-lantern {
      display: none !important;
    }
  }
}

.lantern {
  min-width: 120px !important;
  margin: 0 5px;
  animation: lantern 1.5s infinite ease-in-out alternate;
  transform-origin: center -100px;
}

.lantern-rope {
  width: 3px;
  background-color: var(--lantern-yellow);
  margin: 0 auto;
}

.lantern-top-rope {
  height: 100px;
}

.lantern-bottom-rope {
  height: 20px;
}

.lantern-handle {
  width: 40%;
  height: 8px;
  background-color: var(--lantern-yellow);
  position: relative;
  z-index: 1;
}

.lantern-top-handle {
  border-radius: 5px 5px 0 0;
  margin: 0 auto -2px auto;
}

.lantern-bottom-handle {
  border-radius: 0 0 5px 5px;
  margin: -2px auto 0 auto;
}

.lantern-center {
  width: 100%;
  height: 70px;
  background-color: red;
  border-radius: 50px;
  position: relative;
  font-size: 18px;
  color: var(--lantern-yellow);
  display: flex;
  justify-content: center;
  align-items: center;
  writing-mode: vertical-lr;
  font-weight: 700;
  box-shadow: 0 0 40px -10px red;
}

.lantern-center::before, .lantern-center::after {
  top: 0;
  content: '';
  position: absolute;
  display: block;
  width: 75%;
  height: 100%;
  border: solid 2px var(--lantern-yellow);
  border-radius: 50%;
  left: 0;
  right: 0;
  margin: 0 auto;
}

.lantern-center::before {
  width: 75%;
}

.lantern-center::after {
  width: 35%;
}

.lantern-panicle {
  width: 12px;
  height: 50px;
  margin: 0 auto;
  background: linear-gradient(to bottom, #f00, #e36d00 3px, #fbd342 5px, #e36d00 8px, #e36d00 12px, #f00 16px, rgba(255, 0, 0, .8) 26px, rgba(255, 0, 0, .6));
}

@keyframes lantern {
  from {
    transform: rotate(-3deg);
  }

  to {
    transform: rotate(3deg);
  }
}
</style>

<script>
import HtmlLink from "@/components/HtmlLink.vue";

export default {
  components: {HtmlLink},
  computed: {
    nowTime() {
      return new Date().getTime();
    }
  }
}
</script>
