<template>
  <div>
    <quill-editor
        class="editor"
        ref="myTextEditor"
        :style="`height:${height}`"
        :content="editorContent"
        :options="editorOption"
        :disabled="disabled"
        :maxlength="maxlength"
        @change="onEditorChange"
        @blur="onEditorBlur"
        @ready="onEditorReady"
        useCustomImageHandler/>
    <p style="text-align: right; padding-right: 10px" v-if="maxlength">
      {{ editorContent.length || 0 }}/{{ maxlength }}</p>

    <Modal v-model="updataPlane" width="60%">
      <br>
      <Steps :current="currentindex" v-if="currentindex != -5">
        <template v-if="currentType == 0">
          <Step :title="$t('textarea.steps.url.0')"></Step>
          <Step :title="$t('textarea.steps.url.1')"></Step>
        </template>
        <template v-else-if="currentType == 1">
          <Step :title="$t('textarea.steps.upload.0')"></Step>
          <Step :title="$t('textarea.steps.upload.1')"></Step>
          <Step :title="$t('textarea.steps.upload.2')"></Step>
        </template>
        <template v-else-if="currentType == 2">
          <Step :title="$t('textarea.steps.upload.0')"></Step>
          <Step :title="$t('textarea.steps.upload.1')"></Step>
        </template>
      </Steps>

      <div v-show="currentindex == 0">
        <Select v-model="currentType" style="margin: 40px 0 0 0">
          <Option value="0">{{ $t('textarea.type.url') }}</Option>
          <Option value="1">{{ $t('textarea.type.upload') }}</Option>
          <Option value="2">{{ $t('textarea.type.media') }}</Option>
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
            <a target="_blank" href="https://sm.ms">https://sm.ms</a>，{{ $t("report.info.uploadPic3") }}
          </Alert>

          <span class="hint">{{ $t("report.info.uploadPic1") }}</span>
          <span class="hint">{{ $t("report.info.uploadPic4") }}</span>
        </template>

        <template v-if="currentType == '2'">
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

      <div v-show="currentindex == 1">
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

      <div v-if="currentindex == 2">
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
            <Button @click="updataPlane = false">{{ $t('basic.button.cancel') }}</Button>
          </Col>
          <template v-if="currentindex == 0">
            <Col flex="1">
              <Button @click="currentindex = 2; currentFileType = 'image'"
                      type="primary"
                      v-if="currentType == 0"
                      :disabled="!insertValue">{{ $t('basic.button.next') }}
              </Button>
            </Col>
          </template>
          <template v-if="currentindex == 1">
            <Col flex="1">
              <Checkbox v-model="ignore">{{ $t('textarea.originalImage') }}</Checkbox>
            </Col>
            <Col>
              <Button @click="currentindex-=1">{{ $t('basic.button.prev') }}</Button>
              <Button @click="onBeforeUpload"
                      type="primary"
                      :loading="updataIcon"
                      :disabled="updataIcon">{{ $t('basic.button.next') }}
              </Button>
            </Col>
          </template>
          <Col flex="1" v-else-if="currentindex == 2 || currentindex == -5">
            <Button @click="currentindex = 0">{{ $t('basic.button.reset') }}</Button>
            <Button type="primary"
                    @click="onInsert"
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
import {http, regular, upload, print, api, http_token} from "../assets/js"

import Quill from "quill";
import {quillEditor} from 'vue-quill-editor'
import {VueCropper} from 'vue-cropper'
import atPeople from 'quill-mention-people';

import Empty from "@/components/Empty";

import 'quill-mention-people/index.css'

export default {
  props: {
    index: null,
    maxlength: {
      type: Number,
      default: 0
    },
    height: {
      type: String,
      default: '200px'
    },
    placeholder: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      default: "",
    },
    toolbar: null
  },
  components: {Empty, quillEditor, VueCropper},
  watch: {
    'currentType': {
      handler(val, olVal) {
        if (val == 2)
          this.getMediaList()
      },
      deep: true,
    }
  },
  data() {
    return {
      currentindex: 0,
      currentFileType: '',
      currentType: '0',
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
      insertLoad: false,
      ignore: false,

      // editorContent
      editorContent: "",
      editorOption: {
        placeholder: this.placeholder,
        modules: {
          clipboard: {
            // 粘贴版，处理粘贴时候带图片
            matchers: [[Node.ELEMENT_NODE, this.handlePaste]],
          },
          // https://github.com/merrylmr/quill-mention-people
          // atPeople:{
          //   list:[
          //     {id:1,name:'admin'},
          //     {id:2,name:'test'},
          //   ],
          //   atOneMemberAction (item) {
          //     console.log(item);
          //   }
          // },
          toolbar: {
            container: this.toolbar || [[{'list': 'ordered'}, {'list': 'bullet'}], ['bold'], ["link", "image"]],
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
      },

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

    if (this.content)
      this.editorContent = this.content;

    // Quill.register('modules/atPeople',atPeople);
  },
  methods: {
    handlePaste(node, Delta) {
      let ops = []
      Delta.ops.forEach(op => {
        // 如果粘贴了图片，这里会是一个对象，所以可以这样处理
        if (op.attributes && typeof op.attributes.link === 'string') {
          ops.push({
            insert: op.attributes.link,
          })
        } else if (op.insert && typeof op.insert === 'string') {
          ops.push({
            insert: op.insert,
          })
        }
      })
      Delta.ops = ops;
      return Delta;
    },
    /**
     * 更新富文本
     * @param val
     */
    updateContent(val) {
      if (val && this.maxlength ? val.length < this.maxlength : true)
        this.editorContent = val;
    },
    /**
     * 插入
     */
    async onInsert() {
      try {
        const quill = this.quill;
        const range = quill.getSelection(true);

        this.insertLoad = true;

        if (await regular.authImage(this.insertValue) == false) {
          this.$Message.error('Image unavailable :(');
          this.insertLoad = false;
          return;
        }

        quill.insertEmbed(range.index, 'image' ?? this.currentFileType, this.insertValue);

        // 关闭mode
        this.updataPlane = false;
        this.insertLoad = false;

        // 调整光标到最后
        quill.setSelection(range.index + 1);
      } catch (err) {
        console.log(err);
        this.$Message.error(err);
        this.updataIcon = false;
        this.insertLoad = false;
      }
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
        file = await that.dataURLtoFile(this.vueCropper.img, this.filename());

        await that.onAfterUpload(file);
      } else {
        // 裁剪
        this.$refs.cropper.getCropBlob(async blob => {
          blob.lastModifiedDate = new Date();
          blob.name = this.filename();

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
          this.currentindex += 1;
          this.insertValue = res.url;
        }
      }).catch(err => {
        that.currentindex = 0;
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
      let reader = new FileReader();
      reader.readAsDataURL(file);

      this.currentFileType = file.type;

      // file() -> blob()
      reader.addEventListener('loadend', function () {
        that.vueCropper.img = reader.result;
        that.currentindex += 1;
      });

      // 不使用upload组件的内置上传
      return false;
    },
    /**
     * 编辑器初始
     */
    onEditorReady() {

    },
    /**
     * 编辑器触发事件
     * @param quill
     * @param html
     * @param text
     */
    onEditorChange(data) {
      const maxlength = this.maxlength;
      if (
          data.html &&
          maxlength ? data.html.length < maxlength : true &&
              !this.disabled
      )
        this.editorContent = data.html;
    },
    onEditorBlur(data) {
      const maxlength = this.maxlength;

      if (
          data.html &&
          maxlength ? data.html.length < maxlength : true &&
              !this.disabled
      ) {
        this.$emit("input", this.editorContent);
      }
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
    filename() {
      return `${new Date().getTime()}${Math.floor(Math.random() * new Date().getTime())}`;
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
        this.insertValue = res.data.data.downloadURL;
        this.currentindex = 2;
        this.media.data[index].load = false;
        return;
      }

      this.media.data[index].load = false;
      this.currentindex = 0;
      this.$Message.error(res.data.code);
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
  opacity: .6;
  font-style: normal;
}

.ql-toolbar.ql-snow, .quill-editor {
  background-color: inherit !important;
}

.media-card {
  margin-top: 10px;
  height: 300px;
  overflow: auto
}

.upload-mode {
  margin: 20px 0;
  width: 100%;
  height: 100%;

  .upload-mode-content {
    min-height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
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
