<template>
  <div>
    <quill-editor
        class="editor"
        ref="myTextEditor"
        :style="`height:${height}`"
        :content="editorContent"
        :options="editorOption"
        @change="onEditorChange"
        @blur="onEditorBlur"
        @ready="onEditorReady"
        useCustomImageHandler />


    <Modal v-model="updataPlane" width="60%">
      <br>
      <Steps :current="currentindex" v-if="currentindex != -5">
        <Step :title="$t('profile.media.steps.0')"></Step>
        <Step :title="$t('profile.media.steps.1')" v-if="currentType == 1"></Step>
        <Step :title="$t('profile.media.steps.2')"></Step>
      </Steps>

      <div v-show="currentindex == 0">
        <Select v-model="currentType" style="margin: 40px 0 0 0">
          <Option value="0">{{ $t('profile.media.types.0') }}</Option>
          <Option value="1">{{ $t('profile.media.types.1') }}</Option>
<!--          <Option value="2">{{ $t('profile.media.title') }}</Option>-->
        </Select>

        <template v-if="currentType == '0'">
          <div class="see-mode">
            <Input v-model="insertValue" placeholder="http(s)://"></Input>
          </div>
        </template>

        <template v-if="currentType == '1'">
          <Upload
              class="upload-mode"
              action=""
              accept="image/*"
              multiple
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
            <a target="_blank"  href="https://sm.ms">https://sm.ms</a>，{{ $t("report.info.uploadPic3") }}
          </Alert>

          <span class="hint">{{ $t("report.info.uploadPic1") }}</span>
          <span class="hint">{{ $t("report.info.uploadPic4") }}</span>
        </template>

        <template v-if="currentType == '2'">
          <MediaPage></MediaPage>
        </template>
      </div>

      <div v-show="currentindex == 1">
        <template v-if="currentFileType.indexOf('image') >= 0">
          <div class="see-mode" v-if="ignore" >
            <img :src="vueCropper.img">
          </div>
          <vue-Cropper
              v-else
              class="cropper-mode"
              ref="cropper"
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

      <div v-if="currentindex == 2">
        <div class="see-mode" v-if="currentFileType.indexOf('image') >= 0" >
          <img :src="insertValue">
        </div>
        <div class="see-mode" v-else>
          <div>{{currentFileType}}</div>
          <p><a :href="insertValue" target="_blank">{{ insertValue }}</a></p>
        </div>
      </div>

      <!-- 操作面板 S -->
      <div slot="footer">
        <Row type="flex" align="middle">
          <Col>
              <Button @click="updataPlane = false">取消</Button>
          </Col>
          <template v-if="currentindex == 0">
            <Col flex="1">
              <Button @click="currentindex = 2; currentFileType = 'image'"
                      type="primary"
                      v-if="currentType == 0 || currentType == 2"
                      :disabled="!insertValue">下一步</Button>
            </Col>
          </template>
          <template v-if="currentindex == 1">
            <Col flex="1">
              <Checkbox v-model="ignore">原图</Checkbox>
            </Col>
            <Col>
              <Button @click="currentindex-=1">上一步</Button>
              <Button @click="onUpload"
                      type="primary"
                      :loading="updataIcon"
                      :disabled="updataIcon">下一步</Button>
            </Col>
          </template>
          <Col flex="1" v-else-if="currentindex == 2 || currentindex == -5">
            <Button @click="currentindex = 0">重置</Button>
            <Button type="primary"
                    @click="onInsert"
                    :disabled="!insertValue">插入</Button>
          </Col>
        </Row>
      </div>
      <!-- 操作面板 E -->
    </Modal>
  </div>
</template>

<script>
import { http } from "../assets/js"
import { upload } from '@/assets/js/tools'

import { quillEditor } from 'vue-quill-editor'
import { VueCropper }  from 'vue-cropper'

import MediaPage from "../../src/views/account/media";

export default {
  props: {
    index: null,
    height: {
      type: String,
      default: '200px'
    },
    placeholder: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      default: "",
    },
    toolbar: null
  },
  components: { quillEditor, VueCropper, MediaPage },
  data() {
    return {
      currentindex: 0,
      currentFileType: '',
      currentType: '1',
      insertValue: '',
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
      updataPlane: false,
      ignore: false,

      // editorContent
      editorContent : "",
      editorOption: {
        placeholder: this.placeholder,
        modules: {
          toolbar: {
            container: this.toolbar || [[{ 'list': 'ordered' }, { 'list': 'bullet' }], ['bold'], ["link", "image"]],
            handlers: {
              image: () => {
                this.updataPlane = true;
                this.currentindex = 0;
                this.currentFileType = '';
                this.updataIcon = false;
              }
            }
          }
        },
      }
    }
  },
  methods: {
    /**
     * 插入
     */
    onInsert () {
      const quill = this.quill;
      const range = quill.getSelection(true);

      quill.insertEmbed(range.index, this.currentFileType, this.insertValue);

      // 关闭mode
      this.updataPlane = false;

      // 调整光标到最后
      quill.setSelection(range.index + 1);
    },
    /**
     * 上传
     */
    async onUpload () {
      const that = this;
      let file;

      if (this.ignore) {
        // 原图
        file = that.dataURLtoFile(this.vueCropper.img, this.filename());
      } else {
        // 裁剪
        this.$refs.cropper.getCropBlob(async blob => {
          blob.lastModifiedDate = new Date();
          blob.name = this.filename();

          this.updataIcon = true;
          file = new File([blob], that.currentFileType, {
            type: blob.type
          });
        });
      }

      // 上传
      this.insertValue = await upload(file).then(() => {
        this.currentindex += 1;
      }).catch(() => {
        this.currentindex = 0;
      }).finally(() => {
        this.updataIcon = false;
      });
    },
    /**
     * 选择文件
     * @file type is new File
     */
    async handleBeforeSelectFile (file) {
      const that = this;
      let reader = new FileReader();
          reader.readAsDataURL(file);

      this.currentFileType = file.type;

      // file() -> blob()
      reader.addEventListener('loadend', function () {
        that.vueCropper.img = reader.result;
        that.currentindex +=1;
      });

      // 不使用upload组件的内置上传
      return false;
    },
    /**
     * 编辑器初始
     */
    onEditorReady () {

    },
    /**
     * 编辑器触发事件
     * @param quill
     * @param html
     * @param text
     */
    onEditorChange(data) {
      this.editorContent = data.html;
    },
    onEditorBlur (data) {
      this.$emit("input", this.editorContent);
    },
    /**
     * util
     * 将base64转换为文件
     * @param dataurl
     * @param filename
     * @returns {File}
     */
    async dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
    },
    /**
     * util
     * 生成文件名
     * 临时作用
     * @returns {*}
     */
    filename (blob) {
      return `${new Date().getTime()}${Math.floor(Math.random() * new Date().getTime())}`;
    }
  },
  computed: {
    editor() {
      return this.$refs.myTextEditor.quill;
    }
  },
  mounted() {
    this.quill = this.editor;
  }
}
</script>

<style lang="less">
.editor .ql-container.ql-snow {
  font-family: "Ionicons";
  height: calc(100% - 45px) !important;
}

.ql-snow .ql-tooltip.ql-editing a {
  opacity: .9;
}

.ql-snow .ql-tooltip.ql-editing a,
.ql-snow .ql-tooltip.ql-editing a:hover {
  color: initial;
}

.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  font-size: 18px;
  content: "\f374";
}

.ql-snow .ql-tooltip a.ql-action::after {
  font-size: 18px;
  content: "\f374";
}

.ql-snow .ql-tooltip a.ql-remove::before {
  font-size: 20px;
  content: "\F448";
}

.ql-snow .ql-tooltip input[type=text] {
  border: none;
  outline: none;
}

.ql-snow .ql-tooltip::before,
.ql-snow .ql-tooltip[data-mode=link]::before {
  display: none !important;
}

.ql-editor.ql-blank::before {
  opacity: .1;
  font-style: normal;
}

.ql-toolbar.ql-snow, .quill-editor {
  background-color: inherit !important;
}

.upload-mode {
  margin: 20px 0;
  width: 100%;
  height: 100%;
}

.upload-mode .upload-mode-content {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper-mode {
  width: calc(100% + 32px) !important;
  height: 320px !important;
  margin: 10px -16px -16px -16px
}

.see-mode {
  overflow: hidden;
  background-color: rgba(0,0,0, 0.05);
  margin: 10px -16px -16px -16px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.see-mode img {
  height: 100%;
  padding: 20px 0;
}

.see-mode input {
  width: calc(100% - 120px) !important;
  margin: 0 60px;
}
</style>
