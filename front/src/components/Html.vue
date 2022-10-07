<script>
import VueWithCompiler from "vue/dist/vue";

import htmlimage from "./HtmlImage";
import htmllink from "./HtmlLink";

export default {
  name: "Html",
  props: {
    html: {
      type: String,
      default: "<p></p>"
    }
  },
  data() {
    return {
      templateRender: undefined,
      options: {
        url: 'src'
      }
    };
  },
  components: { htmlimage, htmllink },
  watch: {
    html: {
      handler (val, olVal) {
        this.updateRender(val);
      },
      deep: true,
    },
  },
  created() {
    this.updateRender( this.packagingRender( this.html) );
  },
  methods: {
    updateRender(nodes) {
      const compiled = VueWithCompiler.compile( nodes );

      this.templateRender = compiled.render;
      this.$options.staticRenderFns = [];

      for (const staticRenderFunction of compiled.staticRenderFns) {
        this.$options.staticRenderFns.push(staticRenderFunction);
      }
    },
    /**
     * 包装HTML
     * 并且在渲染前对预制dom进行编译
     * @param html
     * @returns {*|string}
     */
    packagingRender (html) {
      let _html = `<div>${html}</div>`;

      const vDom = new DOMParser().parseFromString(_html, "text/html"),
          imgs = vDom.getElementsByTagName("img"),
          links = vDom.getElementsByTagName("a"),
          p = vDom.getElementsByTagName("p"),
          br = vDom.getElementsByTagName("br");

      // ==================== 处理自定义HTML

      if (imgs && imgs.length > 0) {
        for (let i = 0; i < imgs.length; i++) {
          let eleImg = document.createElement('htmlimage');
          eleImg.setAttribute("src", imgs[i].src);

          imgs[i].parentNode.replaceChild(eleImg, imgs[i]);
        }
      }

      if (links && links.length > 0) {
        let _links = Array.from(links); // deep copy
        for (let i = 0; i < _links.length; i++) {
          let eleLink = document.createElement('htmllink');
          eleLink.setAttribute("text", _links[i].innerText);
          eleLink.setAttribute("href", _links[i].href);

          _links[i].parentNode.replaceChild(eleLink,_links[i]);
        }
      }

      if (p && p.length > 0) {
        let _p = Array.from(p); // deep copy
        for (let i = 0; i < _p.length; i++) {
          // 解析HR, 分割线
          let calcStringCount = 0;

          for (let j = 0; j < _p[i].innerText.length; j++) {
            if (_p[i].innerText[j] == "-" || _p[i].innerText[j] == "=") {
              calcStringCount += 1;
            }
          }

          if (calcStringCount == _p[i].innerText.length && calcStringCount >= 4)
            _p[i].innerHTML = `<div class="hr ivu-divider ivu-divider-horizontal"></div>`;
        }
      }

      if (br && br.length > 0)
        for (let i = 0; i < br.length; i++) {
          // br[i].remove();
        }

      // ==================== 拼接标签
      let vDomString = vDom.getElementsByTagName("body")[0]?.innerHTML ?? "";

      return vDomString;
    },
  },
  render() {
    return this.templateRender();
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
    width: calc(100% + 20px);
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