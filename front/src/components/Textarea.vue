<template>
  <div style="position: relative">
    <quill-editor
        class="editor"
        ref="myTextEditor"
        :style="`height:${height}`"
        :content="editorContent"
        :options="editorOption"
        :disabled="disabled"
        :maxlength="maxlength"
        @change="onEditorChange"
        @ready="onEditorReady"
        useCustomImageHandler/>
    <Row :gutter="10" v-if="showMaxlengthLabel" style="margin: 0px 10px">
      <Col flex="1">
        <template v-if="editorContent != null && editorContent.length >= maxlength">
          <Alert show-icon type="error">{{ $t('textarea.textOverflowHint') }}</Alert>
        </template>
      </Col>
      <Col>
        <Tooltip :placement="'left-start'" :content="$t('textarea.textHelpHint')" max-width="300" :transfer="true">
          <Icon type="md-help-circle" style="margin-right: 5px;"/>
          <template v-if="editorContent != null && editorContent.length == maxlength">
            <b style="color: darkred">{{ editorContent.length || 0 }}</b>
          </template>
          <template
              v-else-if="editorContent != null && editorContent.length >= maxlength / 2 && editorContent.length < maxlength">
            <span style="color: goldenrod">{{ editorContent.length || 0 }}</span>
          </template>
          <template v-else-if="editorContent != null">{{ editorContent.length || 0 }}</template>
          <template v-else>0</template>
          /{{ maxlength }}
        </Tooltip>
      </Col>
    </Row>

    <UploadWidget ref="uploadWidget"
                  @finish="onInsert"></UploadWidget>
  </div>
</template>

<script>
import {regular, http_token} from "../assets/js"

import UploadWidget from './UploadWidget';

import Quill from "quill";
import {quillEditor} from 'vue-quill-editor'
import atPeople from 'quill-mention-people';
import quillEmoji from 'quill-emoji'
import ImageBlot from '../assets/js/quill-module-image'

import 'quill-emoji/dist/quill-emoji.css'
import 'quill-mention-people/index.css'
import EmojiBlot from "@/assets/js/quill-module-emoji";

export default {
  props: {
    index: null,
    showMaxlengthLabel: {
      type: Boolean,
      default: false,
    },
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
  components: {quillEditor, UploadWidget},
  data() {
    return {
      // editorContent
      editorContent: "",
      editorOption: {
        placeholder: this.placeholder,
        modules: {
          "emoji-shortname": {
            fuse: {
              shouldSort: true,
              threshold: 0.1,
              location: 1,
              distance: 200,
              maxPatternLength: 32,
              minMatchCharLength: 1,
              keys: ["shortname"]
            },
          },
          "emoji-toolbar": true,
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
                this.$refs['uploadWidget'].onPanelChange();
                this.$refs['uploadWidget'].currentIndex = 0;
                this.$refs['uploadWidget'].currentFileType = '';
                this.$refs['uploadWidget'].updataIcon = false;
              }
            }
          }
        },
      },
    }
  },
  created() {
    this.http = http_token.call(this);

    if (this.content)
      this.editorContent = this.content;

    Quill.register({'formats/emoji': EmojiBlot}, true);
    Quill.register(ImageBlot, true) //
    // Quill.register('modules/atPeople',atPeople);
  },
  methods: {
    /**
     * 上传控件开关事件
     * @param value
     */
    onPanelChange(value) {
      this.updataPlane = value;
    },
    /**
     * 处理富文本粘贴事件
     * @param node
     * @param Delta
     * @returns {*}
     */
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
    async onInsert(insertValue) {
      try {
        const quill = this.quill;
        const range = quill.getSelection(true);

        this.insertLoad = true;

        if (await regular.authImage(insertValue) == false) {
          this.$Message.error('Image unavailable :(');
          this.insertLoad = false;
          return;
        }

        quill.insertEmbed(
            range.index,
            'image' ?? this.$refs['uploadWidget'].currentFileType,
            insertValue,
        );

        // 关闭mode
        this.updataPlane = false;
        this.insertLoad = false;

        // 调整光标到最后
        quill.setSelection(range.index + 1);
      } catch (err) {
        this.$Message.error(err);
        this.$refs['uploadWidget'].updataIcon = false;
        this.insertLoad = false;
      }
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
      this.editorContent = "";
      if (this.disabled && !data.html) return;

      this.editorContent = this.onContentOverflowProcessing(data.html, true);
      this.$emit("input", this.editorContent);
    },
    /**
     * 文本溢出处理
     * @param {string} content
     * @param {boolean} isShowHint
     * @returns {string}
     */
    onContentOverflowProcessing(content, isShowHint = false) {
      const quill = this.quill;
      let laterContent = "";
      if (content != null && content.length > this.maxlength) {
        laterContent = content.substring(0, this.maxlength);
        quill.deleteText(this.maxlength + 1, quill.getLength());
        quill.update()
      } else {
        laterContent = content;
      }
      return laterContent;
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
  height: calc(100% - 48px) !important;
}

.editor .ql-container.ql-snow img {
  width: 100%;
  display: block;
  border: 1px solid;
  border-radius: 3px;
  margin: 10px 0;
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
</style>
