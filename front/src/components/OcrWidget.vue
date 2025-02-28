<template>
  <div class="ocr-widget">
    <span @click="ocrModal.show = true">
      <slot></slot>
    </span>
    <Modal title="OCR"
           footer-hide
           v-model="ocrModal.show"
           :mask-closable="false"
           :styles="{top: '50%', transform: 'translateY(-50%)'}">
      <Steps :current="ocrModal.Steps" size="small">
        <Step></Step>
        <Step></Step>
        <Step></Step>
      </Steps>

      <template v-if="ocrModal.Steps == 0">
        <br>
        <Upload  multiple
                 type="drag"
                 action=""
                 accept="image/*"
                 :before-upload="onSelect">
          <div style="padding: 20px 0">
            <Icon type="md-document" size="52"></Icon>
          </div>
        </Upload>
      </template>

      <template v-if="ocrModal.Steps >= 1">
        <div style="position: relative">
          <vue-Cropper
              class="orc-cropper-mode"
              ref="cropper"
              :canScale="ocrModal.Steps == 1"
              :canMove="ocrModal.Steps == 1"
              :canMoveBox="ocrModal.Steps == 1"
              :fixedBox="ocrModal.Steps == 2"
              :centerBox="true"
              :mode="'cover'"
              :info="false"
              :img="ocrModal.image"
              :outputSize="vueCropper.size"
              :outputType="vueCropper.outputType"
              :autoCrop="vueCropper.autoCrop"
          ></vue-Cropper>

          <Spin fix v-if="ocrModal.readOrcLoad" class="ocr-readLoad">
            <p v-if="ocrModal.logger.status">{{ ocrModal.logger.status }}</p>
            <Progress :percent="ocrModal.logger.progress * 100" :stroke-width="20" text-inside style="width: 300px"/>
          </Spin>
        </div>
      </template>

      <template v-if="ocrModal.Steps == 1">
        <Row>
          <Col flex="1">
            <Button @click="ocrModal.Steps -= 1">{{ $t('basic.button.prev') }}</Button>
          </Col>
          <Col>
            <Button @click="fs" :loading="ocrModal.readOrcLoad">{{ $t('basic.button.next') }}</Button>
          </Col>
        </Row>
      </template>

      <template v-if="ocrModal.Steps == 2">
        <Card :padding="0" dis-hover class="ocr-edit-string" v-if="ocrModal.value.length > 0">
          <span v-for="(i, index) in ocrModal.value" :key="index">{{ i }}</span>
        </Card>
        <Card :padding="0" dis-hover class="ocr-edit-string" v-else>
          <span>Not Name</span>
        </Card>

        <Input v-model="ocrModal.value"></Input>

        <Row style="margin-top: 15px">
          <Col flex="1">
            <Button @click="ocrModal.Steps -= 1" :disabled="ocrModal.readOrcLoad">{{ $t('basic.button.prev') }}</Button>
          </Col>
          <Col>
            <Button @click="onSubmit" :disabled="ocrModal.value.length <= 0">{{ $t('basic.button.commit') }}</Button>
          </Col>
        </Row>
      </template>
    </Modal>
  </div>
</template>

<script>
import {createWorker} from 'tesseract.js';
import {VueCropper} from 'vue-cropper'

export default {
  name: "OrcWidget",
  props: {
    data: {
      type: Object,
      "default": {}
    }
  },
  data() {
    return {
      // vueCropper
      vueCropper: {
        size: 1,
        outputType: "jpg",
        autoCrop: true
      },

      ocrModal: {
        Steps: 0,
        show: false,
        readOrcLoad: false,
        file: null,
        value: "",
        logger: {progress: .4, status: "read load"},
        image: ""
      },
      worker: null,
    }
  },
  components: {VueCropper},
  created() {
    const that = this;
    this.worker = createWorker({
      errorHandler: err => {
        this.$Message.error(err.toString());
        this.onClear();
      },
      logger: m => {
        that.ocrModal.logger = m;
      }
    });
  },
  methods: {
    onClear(config = {show: true, image: true}) {
      this.ocrModal.Steps = 0;
      this.ocrModal.value = "";
      if (config.image)
        this.ocrModal.image = "";
      if (config.show)
        this.ocrModal.show = false;
    },
    onSelect(file) {
      const that = this;

      this.onClear();
      this.ocrModal.file = file;

      const reader = new FileReader();
      reader.onloadend = () => {
        that.ocrModal.image = reader.result;
        that.ocrModal.show = true;
      };
      reader.readAsDataURL(this.ocrModal.file);

      this.ocrModal.Steps += 1;

      return false;
    },
    onSubmit() {
      this.$emit("ok", Object.assign(this.data, {value: this.ocrModal.value}));
      this.onClear();
    },
    async fs() {
      const that = this;
      this.ocrModal.readOrcLoad = true;

      await this.worker.load();
      // Ocr Mode https://tessdata.projectnaptha.com
      // https://github.com/naptha/tessdata/tree/gh-pages/3.02
      await this.worker.loadLanguage('eng+chi_sim+chi_tra');
      await this.worker.initialize('eng+chi_sim+chi_tra');
      await this.worker.setParameters({
        tessjs_create_box: '1',
      });

      this.$refs.cropper.getCropData(async base64 => {
        const data = await that.worker.recognize(base64);

        if (data.data.text.toString().length <= 0) {
          that.$Message.error("Failed to recognize anything");
          that.ocrModal.readOrcLoad = false;
          that.ocrModal.Steps = 0;
          return;
        }

        setTimeout(function () {
          that.ocrModal.value = data.data.text ?? '';
          that.ocrModal.Steps += 1;

          that.ocrModal.readOrcLoad = false;
        }, 1000);
      });
    },
  }
}
</script>

<style lang="less" scoped>
.ocr-widget {
  user-select: none;
}

.ocr-readLoad {
  margin: 0 -16px !important;
  width: calc(100% + 16px * 2) !important;
}

.orc-cropper-mode {
  margin: 15px -16px 15px -16px;
  width: calc(100% + 16px * 2) !important;
  height: 180px !important;

  .crop-info {
    display: none !important;
  }
}

.ocr-edit-string {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 10px 10px 8px 10px;
  border-radius: 3px;

  span {
    font-size: 2rem;
    padding-bottom: 10px;
    padding-top: 10px;
    margin: 0 3px;
    border-bottom-width: 2px;
    border-bottom-style: solid;
  }
}
</style>
