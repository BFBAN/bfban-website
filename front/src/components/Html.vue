<template>
  <div v-html="processedHtml"></div>
</template>

<script>
export default {
  name: "Html",
  props: {
    html: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      msg: 'hello'
    }
  },
  computed: {
    processedHtml() {
      let el = new DOMParser().parseFromString(this.html, "text/html"),
          imgs = el.getElementsByTagName("img"),
          links = el.getElementsByTagName("a"),
          p = el.getElementsByTagName("p"),
          br = el.getElementsByTagName("br");

      if (imgs && imgs.length > 0) {
        for (let i = 0; i < imgs.length; i++) {
          let eleImg = document.createElement('a');
              eleImg.className = "img";
              eleImg.target = "_new";
              eleImg.href = imgs[i].src;
          let lable = imgs[i];

          imgs[i].title = imgs[i].src;

          lable.parentNode.replaceChild(eleImg, lable)
          eleImg.appendChild(lable)

          imgs[i].onerror = function () {
            imgs[i] = require("@/assets/images/logo.png")
          }
        }
      }


      if (links && links.length > 0) {
        for (let i = 0; i < links.length; i++) {
          let eleLink = document.createElement('u');
          let lable = links[i];

          lable.style = "padding: 0 1px";
          lable.title = lable.href;

          lable.parentNode.replaceChild(eleLink, lable)
          eleLink.appendChild(lable)
        }
      }

      if (p && p.length > 0) {
        for (let i = 0; i < p.length; i++) {
          // 移除空白分段
          if (p[i].innerText.length <= 0 || p[i].innerHTML.length <= 0)
            p[i].remove();

          // 解析HR, 分割线
          let calcStringCount = 0;

          for (let j = 0; j < p[i].innerText.length; j++) {
            if (p[i].innerText[j] == "-") {
              calcStringCount+=1;
            }
          }

          if (calcStringCount == p[i].innerText.length)
            p[i].innerHTML = `<div class="hr ivu-divider ivu-divider-horizontal"></div>`;
        }
      }

      if (br && br.length > 0)
        for (let i = 0; i < br.length; i++) {
          // br[i].remove();
        }

      return el.body.innerHTML;
    },
  },
}
</script>

<style lang="less">
.timeline-description {
  p:first-child,
  p:last-child {
    margin: 0;
  }
  p {
    margin: 3px 0;
  }

  .img {
    position: relative;
    width: calc(100% + 20px);
    margin: 10px -10px 10px -10px;
    overflow: hidden;

    img {
      width: 100%;
    }
  }

  hr, .hr {
    opacity: .5;
    margin: 20px 0;
    margin: 10px -10px 10px -10px;
  }

  a {
    opacity: .6;
  }
  a:hover {
    opacity: 1;
    border-radius: 3px;
  }
}
</style>