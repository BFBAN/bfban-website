<script>
import VueWithCompiler from "vue/dist/vue";
import Vue from "vue";

import htmlimage from "./HtmlImage";
import htmllink from "./HtmlLink";
import htmllinkcard from "./HtmlLinkCard";
import htmlvideo from "./HtmlVideo";
import htmlplayercard from "./HtmlPlayerCard";
import htmlfloor from "./htmlFloor";
import htmlemoji from "./HtmlEmoji"
import privilegestag from "./PrivilegesTag";
import {regular} from "@/assets/js";

export default {
  name: "Html",
  props: {
    html: {
      type: String,
      default: ""
    },
    extensionData: Object,
    mode: {
      type: String,
      default: "renderer"
    }
  },
  data() {
    return {
      templateRender: undefined,
      templateRenderWorkProgress: false,
      images: [],
      targetNames: {
        'body': 0,
        'html': 0,
        'ol': 0,
        'ul': 0,
        'li': 0,
        'video': 0,
        'div': 0,
        'img': 0,
        'a': 0,
        'pre': 0,
        'p': 0,
        'span': 0,
        'b': 0,
        'br': 0,
        'strong': 0,
        'code': 0,
        'h1': 0,
        'h2': 0,
        'h3': 0,
        'q': 0,
        'em': 0,
        'u': 0,
        'emoji': 0
      },
      options: {
        url: 'src'
      }
    };
  },
  components: {htmlimage, htmllink, htmllinkcard, htmlvideo, htmlplayercard, htmlfloor, privilegestag, htmlemoji},
  watch: {
    html: {
      handler(val, oldVal) {
        for (const dataKey in this.extensionData) {
          this[dataKey] = this.extensionData[dataKey];
        }
        this.updateRender(this.packagingRender(val));
      },
    },
    mode: {
      handler(val) {
        if (this.templateRender && this.templateRender == undefined) return;
        this.updateRender(this.packagingRender(this.html));
      }
    },
    deep: true,
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
      let _html = `<div class="ql-editor">${html}</div>`;
      let vDomString;
      const vDom = new DOMParser().parseFromString(_html, "text/html"),
          video = vDom.getElementsByTagName("video"),
          imgs = vDom.getElementsByTagName("img"),
          links = vDom.getElementsByTagName("a"),
          p = vDom.getElementsByTagName("p"),
          br = vDom.getElementsByTagName("br"),
          pres = vDom.getElementsByTagName("pre");

      // 过滤标签
      for (let i = 0; i < vDom.getElementsByTagName('*').length; i++) {
        let target = vDom.getElementsByTagName('*')[i];
        if (this.targetNames[target.tagName.toLowerCase()] != 0) {
          target.remove()
        }
      }

      this.templateRenderWorkProgress = true;

      switch (this.mode) {
        case "code":
          vDomString = `<div><Input style="margin: -1px; width: calc(100% + 2px)" readonly type="textarea" :autosize="true" :value="this.html"></Input></div>`;
          break;
        case "text":
          vDomString = `<div class="ql-editor"><p>${vDom.getElementsByTagName("body")[0]?.innerText}</p></div>`;
          break;
        case "renderer":
        default:
          // ==================== 处理自定义HTML

          if (imgs && imgs.length > 0) {
            let _imgs = Array.from(imgs); // deep copy
            let eleImgType = ["htmlimage", "htmlemoji"];
            let eleImgTypeIndex = 0;

            for (let i = 0; i < _imgs.length; i++) {
              if (_imgs[i].src.indexOf(';base64,') >= 0) eleImgTypeIndex = 1;

              let eleImg = document.createElement(eleImgType[eleImgTypeIndex]);

              switch (eleImgTypeIndex.toString()) {
                case '0':
                  eleImg.setAttribute("src", _imgs[i].src);
                  this.images.push(_imgs[i].src);
                  break;
                case '1':
                  eleImg.setAttribute("data-name", `${_imgs[i].title}` || '');
                  eleImg.setAttribute("data-src", _imgs[i].src || '');
                  eleImg.setAttribute("data-style", _imgs[i].style.cssText || '');
                  break;
              }

              _imgs[i].parentNode.replaceChild(eleImg, _imgs[i]);
            }

            if (eleImgTypeIndex == 0) {
              // upDate attr images
              let _htmlimage = vDom.getElementsByTagName(eleImgType[eleImgTypeIndex]);
              for (let i = 0; i < _htmlimage.length; i++) {
                _htmlimage[i].setAttribute("images", this.images);
                _htmlimage[i].setAttribute("index", i);
              }
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
              let hrefString = new URL(_links[i].href)
              let eleLink;

              if (
                  hrefString.searchParams.getAll('isWidget')[0] &&
                  (hrefString.protocol.indexOf('http') || hrefString.protocol.indexOf('https'))
              ) {
                /// 卡片 =>
                eleLink = document.createElement('htmllinkcard');
                eleLink.setAttribute("href", encodeURI(hrefString));
              } else {
                /// 标准 =>
                eleLink = document.createElement('htmllink');
                let _linkExtend = Vue.component("HtmlLinkCom", {
                  template: _links[i].innerText,
                  // data () {
                  //   return this.extensionData;
                  // }
                });

                eleLink.setAttribute("text", encodeURI(new _linkExtend().$options.template));
                eleLink.setAttribute("href", encodeURI(_links[i].href));
              }

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
                    case "user":
                      _p[i].innerHTML = `<span><a href="/account/${p_data[1]}">@${p_data[1]}</a></span>`;
                      break;
                    case "player":
                      _p[i].innerHTML = `<htmlplayercard :id="${p_data[1].toString()}"></htmlplayercard>`;
                      break;
                    case "router":
                      _p[i].innerHTML = _p[i].innerHTML
                          .replaceAll(`{${str}}`, `<u><router-link :to="{path: '${p_data[1]}'}">${p_data[1]}</router-link></u>`);
                      break;
                    case "floor":
                      var p_value = p_data[1];
                      _p[i].innerHTML = `<htmlfloor id="${p_value}"></htmlfloor>`;
                      break;
                    case "privilege":
                      var p_value_privileges = p_data[1].split(',').toString();
                      if (p_data[1])
                        _p[i].innerHTML = _p[i].innerHTML
                            .replaceAll(`{${str}}`, `<privilegestag data="${p_value_privileges}"></privilegestag>`);
                      break;
                    case "icon":
                      if (p_data[1]) {
                        _p[i].innerHTML = _p[i].innerHTML
                            .replaceAll(`{${str}}`, `<Icon type='${p_data[1]}'></Icon>`);
                      }
                      break;
                    case "egg":
                      _p[i].innerHTML = _p[i].innerHTML
                          .replaceAll(`{${str}}`, `<Icon type='md-egg'></Icon>`);
                      break;
                  }
              }

              // 可疑链接
              // 将可疑的文本链接转换为链接widget
              if (_p[i] && _p[i].innerText) {
                if (regular.check("link", _p[i].innerHTML).code == 0) {
                  _p[i].innerHTML = _p[i].innerHTML.replaceAll('\n', '\n\b');

                  let p_textToLinkArray = regular.getCheckText("link", _p[i].innerText);

                  if (p_textToLinkArray)
                    for (let j = 0; j < p_textToLinkArray.length; j++) {
                      let p_textToLinkItemURL = new URL(p_textToLinkArray[j]);

                      if (
                          p_textToLinkItemURL.searchParams.getAll("isWidget")[0] &&
                          (p_textToLinkItemURL.protocol.indexOf('http') || p_textToLinkItemURL.protocol.indexOf('https'))
                      ) {
                        /// 卡片 =>
                        _p[i].innerHTML = _p[i].innerHTML.replaceAll(p_textToLinkArray[j], `<htmllinkcard href="${encodeURI(p_textToLinkArray[j])}"></htmllinkcard>`)
                      } else {
                        /// 链接 =>
                        _p[i].innerHTML = _p[i].innerHTML.replaceAll(p_textToLinkArray[j], `<htmllink text="${encodeURI(p_textToLinkArray[j])}" href="${encodeURI(p_textToLinkArray[j])}"></htmllink>`)
                      }
                    }
                }
              }

              // 解析HR, 分割线
              if (_p[i] && _p[i].innerText) {
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
          }

          vDomString = vDom.getElementsByTagName("body")[0]?.innerHTML ?? "";
          break;
      }

      // ==================== 拼接标签

      this.templateRenderWorkProgress = false;

      if (window.TrustedHTML && vDomString instanceof window.TrustedHTML) vDomString = "<p class='ql-editor'>⚠️ Unreliable DOM, we blocked it, <a href='//web.dev/trusted-types/'>(link)</a></p>"

      return vDomString;
    },
  },
  render() {
    return this.templateRender();
  },
}
</script>

<style lang="less">
.html-widget-toolbar {
  line-height: 1 !important;
}

.timeline-description {
  line-height: initial;
  word-break: break-word;
  word-wrap: break-word;
  margin: 10px 0;

  p:first-child,
  p:last-child {
    margin: 0;
  }

  p {
    font-size: 12px;
  }

  span, p, a, h1, h2, h3, h4, h5, h6 {
    line-height: initial;
    margin: 3px 0;
  }

  hr, .hr {
    opacity: .5;
    width: calc(100% + 30px) !important;
    margin: 10px -15px 10px -15px !important;
  }
}
</style>
