<script>
import VueWithCompiler from "vue/dist/vue";
import Vue from "vue";

import htmlimage from "./HtmlImage";
import htmllink from "./HtmlLink";
import htmlvideo from "./HtmlVideo";
import htmlplayercard from "./HtmlPlayerCard";
import {regular} from "@/assets/js";

export default {
  name: "Html",
  props: {
    html: {
      type: String,
      default: ""
    },
    data: Object
  },
  data() {
    return {
      templateRender: undefined,
      options: {
        url: 'src'
      }
    };
  },
  components: {htmlimage, htmllink, htmlvideo, htmlplayercard},
  watch: {
    html: {
      handler(val, olVal) {
        for (const dataKey in this.data) {
          this[dataKey] = this.data[dataKey];
        }
        this.updateRender(this.packagingRender(val));
      },
      deep: false,
    },
  },
  created() {
    this.updateRender(this.packagingRender(this.html));
  },
  methods: {
    updateRender(nodes) {
      const compiled = VueWithCompiler.compile(nodes);

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
    packagingRender(html) {
      let _html = `<div>${html}</div>`;

      const vDom = new DOMParser().parseFromString(_html, "text/html"),
          video = vDom.getElementsByTagName("video"),
          imgs = vDom.getElementsByTagName("img"),
          links = vDom.getElementsByTagName("a"),
          p = vDom.getElementsByTagName("p"),
          br = vDom.getElementsByTagName("br"),
          pres = vDom.getElementsByTagName("pre");

      // ==================== 处理自定义HTML

      if (imgs && imgs.length > 0) {
        let _imgs = Array.from(imgs); // deep copy
        for (let i = 0; i < _imgs.length; i++) {
          let eleImg = document.createElement('htmlimage');
          eleImg.setAttribute("src", _imgs[i].src);

          _imgs[i].parentNode.replaceChild(eleImg, _imgs[i]);
        }
      }

      if (video && video.length > 0) {
        let _video = Array.from(video); // deep copy
        for (let i = 0; i < _video.length; i++) {
          let eleImg = document.createElement('htmlvideo');
          eleImg.setAttribute("src", _video[i].src);

          _video[i].parentNode.replaceChild(eleImg, _video[i]);
        }
      }

      if (pres && pres.length > 0) {
        let _pres = Array.from(pres); // deep copy
        for (let i = 0; i < _pres.length; i++) {
          let elePre = document.createElement('p');
          elePre.innerHTML = _pres[i].innerHTML;

          _pres[i].after(elePre);
          _pres[i].remove();
        }
      }

      if (links && links.length > 0) {
        let _links = Array.from(links); // deep copy
        for (let i = 0; i < _links.length; i++) {
          let eleLink = document.createElement('htmllink');
          let _data = this.data;
          let _linkExtend = Vue.component("HtmlLinkCom", {
            template: _links[i].innerText,
            data() {
              return _data
            }
          });

          eleLink.setAttribute("text", new _linkExtend().$options.template);
          eleLink.setAttribute("href", _links[i].href);

          _links[i].parentNode.replaceChild(eleLink, _links[i]);
        }
      }

      if (p && p.length > 0) {
        let _p = Array.from(p); // deep copy
        for (let i = 0; i < _p.length; i++) {
          // 缩语
          if (_p[i] && _p[i].innerText && _p[i].innerText.match(/{(\S*)\}/)) {
            let str = _p[i].innerText.match(/{(\S*)\}/)[1];
            let p_data = str.split(':');
            if (p_data[0])
              switch (p_data[0]) {
                case "player":
                  _p[i].innerHTML = `<htmlplayercard :id="${p_data[1].toString()}"></htmlplayercard>`;
                  break;
                case "router":
                  _p[i].innerHTML = _p[i].innerHTML
                      .replaceAll(`{${str}}`, `<u><router-link :to="{path: '${p_data[1]}'}">${p_data[1]}</router-link></u>`)
                  // _p[i].innerHTML = ;
                  break;
                case "floor":
                  var p_key = p_data[0];
                  var p_value = p_data[1];
                  _p[i].innerHTML = `<Card dis-hover><a href='#floor-${p_value}'>${p_value}</a></Card>`;
                  break;
              }
          }

          // 可疑链接
          // 将可疑的文本链接转换为链接widget
          if (_p[i] && _p[i].innerText) {
            if (regular.check("link", _p[i].innerHTML).code == 0) {
              _p[i].innerHTML = _p[i].innerHTML.replaceAll('\n', '\n\b');

              let p_textToLinkArray = regular.getCheckText("link", _p[i].innerText);
              for (let j = 0; j < p_textToLinkArray.length; j++) {
                _p[i].innerHTML = _p[i].innerHTML.replaceAll(p_textToLinkArray[j], `<htmllink text="${p_textToLinkArray[j]}" href="${p_textToLinkArray[j]}"></htmllink>`)
              }
            }
          }

          // 解析HR, 分割线
          let calcStringCount = 0;

          for (let j = 0; j < _p[i].innerText.length; j++) {
            if (_p[i].innerText[j] == "-") {
              calcStringCount += 1;
            }
          }

          if (calcStringCount == _p[i].innerText.length && calcStringCount >= 4)
            _p[i].innerHTML = `<Divider class="hr" dashed />`;
        }
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
  word-break: break-all;

  p:first-child,
  p:last-child {
    margin: 0;
  }

  span, p, h1, h2, h3, h4, h5, h6 {
    line-height: initial;
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
    width: calc(100% + 20px) !important;
    margin: 10px -10px 10px -10px !important;
  }
}
</style>