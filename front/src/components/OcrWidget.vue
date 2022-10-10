<template>
  <div>
    <Upload type="select" action="" :before-upload="onSelect">
      <slot></slot>
    </Upload>
    <Modal title="OCR"
           footer-hide
           v-model="ocrModal.show"
           :styles="{top: '20px'}">
      <Steps :current="ocrModal.Steps" size="small">
        <Step></Step>
        <Step></Step>
      </Steps>
      <template v-if="ocrModal.Steps == 0">
        <vue-Cropper
            class="orc-cropper-mode"
            ref="cropper"
            :img="ocrModal.image"
            :outputSize="vueCropper.size"
            :outputType="vueCropper.outputType"
            :autoCrop="vueCropper.autoCrop"
        ></vue-Cropper>

        <Spin fix v-if="ocrModal.readOrcLoad">
          <p>{{ (ocrModal.logger.progress * 100).toFixed(0) }}%</p>
        </Spin>

        <Row>
          <Col flex="1"></Col>
          <Col>
            <Button @click="fs">{{ $t('basic.button.next') }}</Button>
          </Col>
        </Row>
      </template>

      <template v-else-if="ocrModal.Steps == 1">
        <div class="ocr-edit-string" v-if="ocrModal.value.length > 0">
          <span v-for="(i, index) in ocrModal.value" :key="index">{{ i }}</span>
        </div>
        <div class="ocr-edit-string" v-else>
          <span>Not Name</span>
        </div>

        <Input v-model="ocrModal.value"></Input>

        <Row style="margin-top: 15px">
          <Col flex="1">
            <Button @click="ocrModal.Steps -= 1">{{ $t('basic.button.prev') }}</Button>
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
        logger: {progress: 0},
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
        if (m.progress <= 0) this.readOrcLoad = true;
        if (m.progress >= .80) this.readOrcLoad = false;
        that.ocrModal.logger = m;
      }
    });
  },
  methods: {
    onClear () {
      this.ocrModal.Steps = 0;
      this.ocrModal.value = "";
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
      return false;
    },
    onSubmit() {
      this.$emit("ok", Object.assign(this.data, {value: this.ocrModal.value}));
      this.onClear();
    },
    async fs() {
      await this.worker.load();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      this.$refs.cropper.getCropData(async base64 => {
        const {data: {text}} = await this.worker.recognize(base64);
        console.log(text);

        if (text.length <= 0) {
          this.$Message.error("Failed to recognize anything");
          return;
        }

        this.ocrModal.value = text;
        this.ocrModal.Steps += 1;
      });
    }
  }
}
</script>

<style lang="less" scoped>
.orc-cropper-mode {
  margin: 15px -16px 15px -16px;
  width: calc(100% + 16px * 2);
  height: 150px;
}

.ocr-edit-string {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 10px;
  background: #f2f2f2;
  padding: 10px 10px 8px 10px;
  border-radius: 3px;

  > span {
    font-size: 2rem;
    padding-bottom: 10px;
    padding-top: 10px;
    margin: 0 3px;
    border-bottom-width: 2px;
    border-bottom-style: solid;
  }
}
</style>