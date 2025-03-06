<template>
  <Card dis-hover :padding="0" class="img">
    <div class="img-box" :class="[
        imageStatus === 0 ? 'img-loading': '',
        imageStatus === -1 ? 'img-error' : '',
    ]">
      <div class="img-toolbar" v-if="imageStatus === 1">
        <Row>
          <Col>
            <a class="user-select-none" href="javascript:void(0)" @click="onRotating(-90)">
              <Icon type="md-redo" size="15" style="transform: rotate(-180deg)"/>
            </a>
            <Divider type="vertical"></Divider>
            <a class="user-select-none" href="javascript:void(0)" @click="onRotating(90)">
              <Icon type="md-redo" size="15"/>
            </a>
            <Divider type="vertical" v-if="rotateValue != 0"></Divider>
            <a v-if="rotateValue != 0" class="user-select-none" type="dashed" href="javascript:void(0)"
               @click="onRotating(0)">
              <Icon type="md-refresh" size="15"/>
            </a>
          </Col>
          <Col flex="1" class="img-title">
            <span>{{ src }}</span>
          </Col>
          <Col v-if="src" class="user-select-none">
            <a type="dashed" :href="src" target="_new">
              <Icon type="md-link"/>
            </a>
          </Col>
        </Row>
      </div>

      <template v-if="imageStatus === 0">
        <Badge class="user-select-none">
          <Icon type="md-refresh" slot="count" class="spin-icon-load" size="20"/>
          <Icon type="md-images" size="50"/>
        </Badge>
        <img class="user-select-none" style="display: none" :src="src" :alt="src" @error="onError" @load="(e) => onLoad(e, src)"/>
        <p class="img-box-url">
          <html-link :isPoptip="false" :href="src"></html-link>
        </p>
      </template>
      <template v-else-if="imageStatus === 1">
        <picture @click="onClickEdit">
          <source :srcset="src" media="(orientation: portrait)"/>
          <img id="image" @click="show" :usemap="`#${src}-image-map`" :src="src" :alt="src" class="img-tag user-select-none" draggable="false" :style="`transform: rotate(${rotateValue}deg)`"/>
          <map :name="`${src}-image-map`" class="img-map"></map>
        </picture>
      </template>
      <template v-else-if="imageStatus === -1">
        <Badge class="user-select-none">
          <Icon type="md-alert" slot="count" class="status" size="20"/>
          <Icon type="md-images" size="50"/>
        </Badge>
        <p class="img-box-url">
          <html-link :isPoptip="false" :href="src"></html-link>
        </p>
      </template>
    </div>
  </Card>
</template>

<script>
import 'viewerjs/dist/viewer.css'

import VueViewer from 'v-viewer'
import Vue from "vue";
import HtmlLink from "@/components/HtmlLink.vue";
import Tesseract from "tesseract.js";

Vue.use(VueViewer);

export default {
  components: {HtmlLink},
  props: {
    src: {
      type: String,
      default: ""
    },
    index: {
      type: String,
      default: "0"
    },
    images: {
      type: String,
      default: ""
    },
    isRecognize: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      load: false,
      rotateValue: 0,
      imageStatus: 0,
      viewImages: [],
    }
  },
  watch: {
    images: {
      handler(val) {
        this.viewImages = val.split(",");
      },
      deep: true
    },
  },
  created() {
    this.viewImages = this.images.split(",");
  },
  methods: {
    onLoad(e, src) {
      this.imageStatus = 1;
      this.onImageRecognize(e, src);
    },
    onError() {
      this.imageStatus = -1;
    },
    onRotating(value) {
      if (this.rotateValue >= 360 || this.rotateValue <= -360 || value == 0) {
        this.rotateValue = 0;
        return;
      }
      this.rotateValue += value
    },
    openUrl() {
      if (this.imageStatus === -1) {
        if (this.src)
          window.open(this.src);
      }
    },
    show() {
      if (this.imageStatus <= 0) return;

      this.$viewerApi({
        options: {
          toolbar: false,
          button: false,
          navbar: false,
          keyboard: false,
          fullscreen: true,
          initialViewIndex: Number(this.index),
        },
        images: this.viewImages,
      })
    },
    /**
     * 编辑模式-单击触发
     */
    onClickEdit() {
      if (this.isEdit)
        this.$emit('click-image')
    },
    /**
     * 图像识别
     * @param e
     * @param src
     */
    async onImageRecognize(e, src) {
      if (!this.isRecognize) return;

      const image = e.target;
      const imageMap = document.querySelector(`map[name="${src}-image-map"]`);

      Tesseract.recognize(image, 'eng+chi_sim+chi_tra').then(({data: {text, lines}}) => {
        lines.forEach(line => {
          line.words.forEach(word => { // 遍历每个单词
            const {bbox} = word;
            const rect = image.getBoundingClientRect();
            const x = bbox.x0 + rect.left;
            const y = bbox.y0 + rect.top;
            const width = bbox.x1 - bbox.x0;
            const height = bbox.y1 - bbox.y0;

            const span = document.createElement('span');
            span.style.left = `${x}px`;
            span.style.top = `${y}px`;
            span.style.width = `${width}px`;
            span.style.height = `${height}px`;
            span.textContent = word.text; // 设置单词文本

            if (imageMap)
              imageMap.appendChild(span);
          });
        });
      }).catch(err => {
        console.error('识别失败:', err);
      });
    }
  }
}
</script>

<style>
.img-map span {
  outline: 1px solid red;
  position: absolute;
  cursor: text;
  opacity: .5;
}

.img-map span:hover {
  opacity: 1;
}
</style>

<style lang="less" scoped>
@import "@/assets/css/icon.less";

.img {
  white-space: normal !important;
  position: relative;
  width: 100%;
  margin: 10px auto;
  overflow: hidden;
  min-height: 80px;
  cursor: pointer;

  img {
    width: 100%;
    display: block;
  }

  .img-toolbar {
    cursor: auto;
    padding: 5px 10px;
    position: relative;
    z-index: 11;
  }

  .img-title {
    padding: 0 20px;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .img-box-url {
    padding: 0 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    line-clamp: 2;
  }

  .img-loading,
  .img-error {
    text-align: center;
    padding: 20px 0;
  }

  .img-error .status {
    color: darkred;
  }

  .img-hover {
    border-radius: 0 !important;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all .25s;
    opacity: 0;
  }

  picture {
    position: relative;
  }
}

.img:hover {
  .img-hover {
    opacity: .5;
  }
}
</style>
