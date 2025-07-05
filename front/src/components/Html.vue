<script>
import VueWithCompiler from "vue/dist/vue";
import Vue from "vue";

import htmlimage from "@/components/HtmlImage";
import htmllink from "@/components/HtmlLink";
import htmllinkcard from "@/components/HtmlLinkCard";
import htmlvideo from "@/components/HtmlVideo";
import htmlplayercard from "@/components/HtmlPlayerCard";
import htmlfloor from "@/components/HtmlFloor";
import htmlemoji from "@/components/HtmlEmoji"
import timeview from "@/components/TimeView"
import privilegestag from "@/components/PrivilegesTag";
import htmluser from "@/components/HtmlUser.vue"
import emoteitem from "@/components/EmoteItem.vue"

import "@/assets/css/signature.less"

export default {
  name: "Html",
  props: {
    html: {
      type: String,
      default: ""
    },
    extensionData: Object,
    version: {
      type: String,
      default: "v2"
    },
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
        'hr': 0,
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
  components: {
    htmlimage,
    htmllink,
    htmllinkcard,
    htmlvideo,
    htmlplayercard,
    htmlfloor,
    htmlemoji,
    timeview,
    htmluser,
    emoteitem,
    privilegestag,
  },
  watch: {
    html: {
      handler(val) {
        for (const dataKey in this.extensionData) {
          this[dataKey] = this.extensionData[dataKey];
        }
        this.updateRender(this.packagingRender(val));
        this.$forceUpdate();
      },
      immediate: true,
    },
    mode: {
      handler() {
        if (!this.templateRender) return;
        this.updateRender(this.packagingRender(this.html));
      },
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
      const _htmlVersion = {'v1': 'ql-editor', 'v2': 'tiptap'}
      let _html = `<div class="${_htmlVersion[this.version]}">${html}</div>`;
      let vDomString;
      const vDom = new DOMParser().parseFromString(_html, "text/html"),
          div = vDom.getElementsByTagName("div"),
          video = vDom.getElementsByTagName("video"),
          img = vDom.getElementsByTagName("img"),
          link = vDom.getElementsByTagName("a"),
          p = vDom.getElementsByTagName("p"),
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
          vDomString = `<div class="ql-input"><Input readonly :border="false" type="textarea" :autosize="true" :value="this.html"></Input></div>`;
          break;
        case "text": {
          let text = vDom.getElementsByTagName("body")[0].innerHTML.replaceAll(/<[^>]*>/g, '');
          vDomString = `<div class="ql-input"><Input readonly :border="false" type="textarea" :autosize="true" value="${text}"></Input></div>`;
        }
          break;
        case "renderer":
        default: {

          // ==================== 处理自定义HTML

          // 纯文本，无内置标签
          if (div && div.length > 0) {
            let _divs = Array.from(div); // deep copy

            for (let i = 0; i < _divs.length; i++) {
              /// 标准链接 =>
              /// 排除标签a|htmllink|img|video|iframe、排除标签属性内链接、排除标签内的链接
              const urlRegex = /(?<!<(a|htmllink|img|video|iframe)[^>]*)(?<!\{signature:)(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&;//=]*))(?![^<]*<\/htmllink|a>)/g;              // const urlRegex = /(?<!<(a|htmllink|img|video|iframe)[^>]*)(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&;//=]*))(?![^<]*<\/htmllink|a>)/g;
              _divs[i].innerHTML = _divs[i].innerHTML.replace(urlRegex, `<htmllink text='${encodeURI('$&')}' href='${encodeURI('$&')}'></htmllink>`);

              // 解析HR, 分割线
              const dividerRegex = /-{3,}|<hr\s*\/?>/g;
              _divs[i].innerHTML = _divs[i].innerHTML.replace(dividerRegex, `<Divider class="hr" dashed></Divider>`);

              // 缩语
              const csRegex = /\{([^:]+):([^}]+)\}/g;
              _divs[i].innerHTML = _divs[i].innerHTML.replace(csRegex, (match, key, value) => {
                switch (key) {
                  case "user":
                    return `<htmluser :id="${value}"></htmluser>`;
                  case "player":
                    return `<htmlplayercard :id="${value.toString()}"></htmlplayercard>`;
                  case "router":
                    return `<router-link :to="{path: '${value}'}">${value}</router-link>`
                  case "floor":
                    return `<htmlfloor id="${value}"></htmlfloor>`;
                  case "privilege":
                    return `<privilegestag data="${value.toString().split(',')}"></privilegestag>`;
                  case "signature":
                    return `<span class="signature-box"><htmlimage :original="true" src="${value}"/></span>`;
                  case "icon":
                    return `<Icon type='${value}'></Icon>`;
                }
                return ``;
              })

              // 标签
              const emojiRegex = /\[([^|]+)\|([^\]]+)\]/g;
              _divs[i].innerHTML = _divs[i].innerHTML.replace(emojiRegex, (match, key, value) => {
                const fullValue = `${key}|${value}`;
                return `<emoteitem id="${fullValue}">[${fullValue}]</emoteitem>`;
              })
            }
          }

          if (img && img.length > 0) {
            let _imgs = Array.from(img); // deep copy
            let eleImgType = ["htmlimage"];
            let eleImgTypeIndex = 0;

            for (let i = 0; i < _imgs.length; i++) {
              let eleImg = document.createElement(eleImgType[eleImgTypeIndex]);

              switch (eleImgTypeIndex.toString()) {
                case '0':
                  eleImg.setAttribute("src", _imgs[i].src);
                  this.images.push(_imgs[i].src);
                  break;
              }

              _imgs[i].parentNode.replaceChild(eleImg, _imgs[i]);
            }

            if (eleImgTypeIndex === 0) {
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

          if (link && link.length > 0) {
            let _links = Array.from(link); // deep copy
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
              /// 标准链接 =>
              // if (_p[i] && _p[i].innerText) {
              //   const urlRegex = /(?<!<[a|htmllink|img|video|iframe][^>]*)(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&;//=]*))(?![^<]*<\/htmllink|a>)/g;
              //   _p[i].innerHTML = _p[i].innerHTML.replace(urlRegex, `<htmllink text='${encodeURI('$&')}' href='${encodeURI('$&')}'></htmllink>`);
              // }

              // 邮箱
              if (_p[i] && _p[i].innerText) {
                const emailRegex = /(?<!<a|htmllink[^>]*)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}(?![^<]*<\/htmllink|a>)/gi;
                _p[i].innerHTML = _p[i].innerHTML.replace(emailRegex, `<htmllink text='$&' href='mailto:$&'></htmllink>`);
              }

              // 时间
              if (_p[i] && _p[i].innerText) {
                const dateTimeRegex = /(?<!<img|a[^>]*)(\d{4}-\d{2}-\d{2}( |&nbsp;)?(\d{1,2}(:\d{1,2})?(:\d{2})?)?)(?![^<]*<\/img|a>)/gi;
                _p[i].innerHTML = _p[i].innerHTML.replace(dateTimeRegex, `<timeview time="$&">$&</timeview>`);
              }
            }
          }

          vDomString = vDom.getElementsByTagName("body")[0]?.innerHTML ?? "";
        }
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
  p:first-child,
  p:last-child {
    margin: 0;
  }

  p {
    font-size: 12px;
  }

  p:empty {
    height: 1rem;
  }

  span, p, a, h1, h2, h3, h4, h5, h6 {
    line-height: initial;
  }

  p, a, h1, h2, h3, h4, h5, h6 {
    margin: 3px 0;
  }

  hr, .hr {
    opacity: .5;
    width: calc(100% + 30px) !important;
    margin: 10px -15px 10px -15px !important;
  }

  .ql-input {
    margin: -1px;
    width: calc(100% + 2px);
  }

  .ql-input, .ql-input textarea {
    border-right-color: transparent !important;
    background-color: transparent !important;
  }
}
</style>
