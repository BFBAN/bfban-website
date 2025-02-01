<template>
  <div>
    <slot></slot>
    <Modal v-model="updataPlane" width="60%">
      <br>
      <Steps :current="currentIndex" v-if="currentIndex != -5">
        <template v-if="currentType == 'url'">
          <Step :title="$t('textarea.steps.url.0')"></Step>
          <Step :title="$t('textarea.steps.url.1')"></Step>
        </template>
        <template v-else-if="currentType == 'upload'">
          <Step :title="$t('textarea.steps.upload.0')"></Step>
          <Step :title="$t('textarea.steps.upload.1')"></Step>
          <Step :title="$t('textarea.steps.upload.2')"></Step>
        </template>
        <template v-else-if="currentType == 'media'">
          <Step :title="$t('textarea.steps.upload.0')"></Step>
          <Step :title="$t('textarea.steps.upload.1')"></Step>
        </template>
      </Steps>

      <div v-show="currentIndex == 0">
        <Select v-model="currentType" style="margin: 40px 0 0 0">
          <Option :value="i" v-for="(i, index) in uploadWidgetTypeArray" :key="index">
            {{ $t('textarea.type.' + i) }}
          </Option>
        </Select>

        <template v-if="currentType == 'url'">
          <div class="see-mode">
            <Input size="large" v-model="insertValue" placeholder="http(s)://"></Input>
          </div>
        </template>

        <template v-if="currentType == 'upload'">
          <Upload
              class="upload-mode"
              action=""
              accept="image/*"
              multiple
              paste
              type="drag"
              :headers="headers"
              :data="extraData"
              :max-size="imgMaxSize"
              :with-credentials="withCredentials"
              :show-upload-list="showUploadList"
              :before-upload="handleBeforeSelectFile">
            <div class="upload-mode-content">
              <Icon type="ios-cloud-upload" size="52"></Icon>
            </div>
          </Upload>

          <Alert type="warning">
            {{ $t("report.info.uploadPic2") }}
            <a target="_blank" href="https://sm.ms">https://sm.ms</a>，{{ $t("report.info.uploadPic3") }}
          </Alert>

          <span class="hint">{{ $t("report.info.uploadPic1") }}</span>
          <span class="hint">{{ $t("report.info.uploadPic4") }}</span>
        </template>

        <template v-if="currentType == 'media'">
          <div class="media-card">
            <template v-if="media.data.length > 0">
              <Form label-position="top">
                <Card dis-hover v-for="(file, file_index) in media.data" :key="file_index" style="margin-bottom: 10px">
                  <Row :gutter="30">
                    <Col flex="1">
                      <Row>
                        <Col span="12">
                          {{ file.filename }}
                        </Col>
                        <Col span="6">
                          {{ file.size }}
                        </Col>
                        <Col span="6">
                          <Time :time="file.createTime"></Time>
                        </Col>
                      </Row>
                    </Col>
                    <Col>
                      <Button href="javascript:void(0)" @click="selectMediaFile(file_index)" :loading="file.load">
                        {{ $t('basic.button.insert') }}
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Form>
            </template>
            <Empty v-else></Empty>
            <Spin size="large" fix v-show="media.load"></Spin>
          </div>
        </template>
      </div>

      <div v-show="currentIndex == 1">
        <template v-if="currentFileType.indexOf('image') >= 0">
          <div class="see-mode" v-if="ignore">
            <img :src="vueCropper.img">
          </div>
          <vue-Cropper
              v-else
              class="cropper-mode"
              ref="cropper"
              :centerBox="true"
              :mode="'cover'"
              :img="vueCropper.img"
              :outputSize="vueCropper.size"
              :outputType="vueCropper.outputType"
              :autoCrop="vueCropper.autoCrop"
          ></vue-Cropper>
        </template>
        <div v-else>
          <div class="see-mode">
            不支持编辑
          </div>
        </div>
      </div>

      <div v-if="currentIndex == 2">
        <div class="see-mode" v-if="currentFileType.indexOf('image') >= 0">
          <img :src="insertValue" height="100%"/>
        </div>
        <div class="see-mode" v-else>
          <div>{{ currentFileType }}</div>
          <p><a :href="insertValue" target="_blank">{{ insertValue }}</a></p>
        </div>
      </div>

      <!-- 操作面板 S -->
      <div slot="footer">
        <Row :gutter="20" type="flex" align="middle">
          <Col>
            <Button @click="onPanelChange">{{ $t('basic.button.cancel') }}</Button>
          </Col>
          <template v-if="currentIndex == 0">
            <Col flex="1">
              <Button @click="currentIndex = 2; currentFileType = 'image'"
                      type="primary"
                      v-if="currentType == 'url'"
                      :disabled="!insertValue">{{ $t('basic.button.next') }}
              </Button>
            </Col>
          </template>
          <template v-if="currentIndex == 1">
            <Col flex="1">
              <Checkbox v-model="ignore">{{ $t('textarea.originalImage') }}</Checkbox>
            </Col>
            <Col>
              <Button @click="currentIndex-=1">{{ $t('basic.button.prev') }}</Button>
              <Button @click="onBeforeUpload"
                      type="primary"
                      :loading="updataIcon"
                      :disabled="updataIcon">{{ $t('basic.button.next') }}
              </Button>
            </Col>
          </template>
          <Col flex="1" v-else-if="currentIndex == 2 || currentIndex == -5">
            <Button @click="currentIndex = 0">{{ $t('basic.button.reset') }}</Button>
            <Button type="primary"
                    @click="onFinish"
                    :loading="insertLoad"
                    :disabled="!insertValue">{{ $t('basic.button.commit') }}
            </Button>
          </Col>
        </Row>
      </div>
      <!-- 操作面板 E -->
    </Modal>
  </div>
</template>

<script>
import {api, http, http_token, upload} from "../assets/js"

import Empty from "@/components/Empty";
import {VueCropper} from 'vue-cropper'
import uuid from "uuid";

export default {
  name: 'UploadWidget',
  props: {
    uploadWidgetTypeArray: {
      type: Array,
      default() {
        return ['url', 'upload', 'media'];
      }
    },
  },
  components: {Empty, VueCropper},
  watch: {
    'currentType': {
      handler(val, olVal) {
        if (val == 'media')
          this.getMediaList()
      },
      deep: true,
    }
  },
  data() {
    return {
      currentIndex: 0,
      currentFileType: '',
      currentType: 'url',
      insertValue: '',
      updataPlane: false,
      updataIcon: false,

      // view updata
      headers: {
        'x-csrf-token': '',
      },
      imgMaxSize: 2014,
      vodMaxSize: 30720,
      extraData: {
        token: ''
      },
      withCredentials: false,
      showUploadList: false,

      // vueCropper
      vueCropper: {
        img: "",
        size: .6,
        outputType: "jpg",
        autoCrop: true
      },
      insertLoad: false,
      ignore: false,

      // media
      media: {
        load: false,
        detail: {},
        data: [],
        limit: 40,
        skip: 1
      }
    }
  },
  created() {
    this.http = http_token.call(this);

    this.currentType = this.uploadWidgetTypeArray[0];
  },
  methods: {
    /**
     * 最后确认
     */
    onFinish() {
      this.$emit('finish', this.insertValue);
      this.onPanelChange();
    },
    /**
     * 上传
     * 之前处理
     */
    async onBeforeUpload() {
      const that = this;
      let file;

      if (this.ignore) {
        // 原图
        file = await that.dataURLtoFile(this.vueCropper.img,  `${this.filename(this.vueCropper.name)}.${this.vueCropper.outputType}`);

        await that.onAfterUpload(file);
      } else {
        // 裁剪
        this.$refs.cropper.getCropBlob(async blob => {
          blob.lastModifiedDate = new Date();
          blob.name = `${this.filename(blob.name)}.${this.vueCropper.outputType}`;

          this.updataIcon = true;
          file = new File([blob], that.currentFileType, {
            type: blob.type
          });

          await that.onAfterUpload(file);
        });
      }
    },
    /**
     * 上传
     * 之后上传
     * @param file
     * @returns {Promise<void>}
     */
    async onAfterUpload(file) {
      const that = this;
      this.updataIcon = true;

      // 上传
      await upload.on(file).then(res => {
        if (res && res.code >= 1) {
          this.currentIndex += 1;
          this.insertValue = res.url;
        }
      }).catch(err => {
        that.currentIndex = 0;
        that.$Message.error(err.message)
      }).finally(() => {
        that.updataIcon = false;
      });
    },
    /**
     * 选择文件
     * @file type is new File
     */
    async handleBeforeSelectFile(file) {
      const that = this;

      if (file.length <= 1) return ;

      let reader = new FileReader();
      reader.readAsDataURL(file);

      this.currentFileType = file.type;

      // file() -> blob()
      reader.addEventListener('loadend', function () {
        that.vueCropper.img = reader.result;
        that.vueCropper.name = file.name;
        that.currentIndex += 1;
      });

      // 不使用upload组件的内置上传
      return false;
    },
    /**
     * util
     * 将base64转换为文件
     * @param dataurl
     * @param filename
     * @returns {File}
     */
    async dataURLtoFile(dataurl, filename) {
      let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type: mime});
    },
    /**
     * util
     * 生成文件名
     * 临时作用
     * @returns {*}
     */
    filename(name) {
      return uuid.v4({'name': name, "generationTime": new Date().getTime()});
    },
    /**
     * 获取媒体列表
     */
    getMediaList() {
      this.http.get(api["service_myFiles"], {
        params: {
          limit: this.media.limit,
          skip: this.media.skip - 1,
        }
      }).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.media.data = d.data;
        }
      });
    },
    /**
     * 查询文件详情
     */
    async queryMediaDetail(name) {
      this.media.load = true;
      let res = await http.get(api["service_file"], {
        params: {
          filename: name,
          explain: true
        }
      });
      this.currentFileType = res.data.data.mimeType;
      this.media.load = false;
      return res;
    },
    /**
     * 从媒体库插入
     * @param index
     */
    async selectMediaFile(index) {
      if (this.media.data[index].load) return;

      this.media.data[index].load = true;
      let res = await this.queryMediaDetail(this.media.data[index].filename);

      if (res.data.success == 1) {
        this.insertValue = `https://bfban.gametools.network/api/service/file?filename=${this.media.data[index].filename}`;
        this.currentIndex = 2;
        this.media.data[index].load = false;
        return;
      }

      this.media.data[index].load = false;
      this.currentIndex = 0;
      this.$Message.error(res.data.code);
    },
    /**
     * 重置表单
     */
    onReset() {
      this.currentIndex = 0;
      this.insertValue = '';
      this.currentFileType = '';
      if (this.uploadWidgetTypeArray.length > 0)
        this.currentFileType = this.uploadWidgetTypeArray[0];
    },
    /**
     * 面板改变通知
     */
    onPanelChange() {
      this.updataPlane = !this.updataPlane;
      this.onReset();
      this.$emit("change", this.updataPlane);
    }
  },
}
</script>

<style scoped lang="less">
.upload-mode {
  margin: 20px 0;
  width: 100%;
  height: 100%;

  .upload-mode-content {
    min-height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.media-card {
  margin-top: 10px;
  height: 300px;
  overflow: auto
}

.cropper-mode {
  width: calc(100% + 32px) !important;
  height: 320px !important;
  margin: 10px -16px -16px -16px
}

.see-mode {
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.05);
  margin: 10px -16px -16px -16px;
  padding: 0 20px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    height: 100%;
    padding: 20px 0;
  }

  input {
    width: calc(100% - 120px) !important;
    margin: 0 60px;
  }
}
</style>
