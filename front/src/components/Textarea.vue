<template>
  <div style="position: relative">
    <quill-editor
        class="editor"
        ref="quillTextEditor"
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
                  @finish="onInsertImage"></UploadWidget>
  </div>
</template>

<script>
import {regular, http_token} from "../assets/js"

import UploadWidget from './UploadWidget';

import Quill from "quill";
import {quillEditor} from 'vue-quill-editor'
import {Emoji, emojis} from '@nutrify/quill-emoji-mart-picker';
import ImageBlot from '../assets/js/quill-module-image'

import emojiJsonList from '../../public/config/emoji.json'
import Regular from "@/assets/js/regular";

export default {
  props: {
    index: null,
    showMaxlengthLabel: {
      type: Boolean,
      default: false,
    },
    maxlength: {
      type: Number,
      default: 500
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
          'emoji-module': {
            emojiData: emojis,
            customEmojiData: emojiJsonList.child,
            preventDrag: true,
            showTitle: true,
            indicator: ':',
            convertEmoticons: true,
            convertShortNames: true,
          },
          clipboard: {
            matchVisual: false,
            matchers: [
              [
                Node.ELEMENT_NODE, this.handlePasteLink,
                Node.ELEMENT_NODE, this.handlePasteImage,
              ],
            ],
          },
          toolbar: {
            container: this.toolbar || [[{'list': 'ordered'}, {'list': 'bullet'}], ['bold', 'italic', 'underline', 'hr'], ['link', 'image']],
            handlers: {
              image: () => {
                this.$refs['uploadWidget'].onPanelChange();
                this.$refs['uploadWidget'].currentIndex = 0;
                this.$refs['uploadWidget'].currentFileType = '';
                this.$refs['uploadWidget'].updataIcon = false;
              },
              hr: () => {
                const quill = this.quill;
                const range = quill.getSelection(true);
                quill.insertText(range.index, '\n');
                quill.insertText(range.index + 1, '-----');
                quill.insertText(range.index + 6, '\n');

                quill.setSelection(range.index + 7);
              },
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

    Quill.register(ImageBlot, true) //
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
     * 处理富文本-粘贴-图像
     * @param node
     * @param Delta
     * @returns {*}
     */
    handlePasteImage(node, Delta) {
      let ops = []
      Delta.ops.forEach(op => {
        // 如果粘贴了图片，这里会是一个对象，所以可以这样处理
        if (op.attributes && typeof op.attributes.link === 'string') {
          ops.push({
            insert: op.attributes.link,
          })
        }
      })
      Delta.ops = ops;
      return Delta;
    },
    /**
     * 处理富文本-粘贴-链接
     * @param node
     * @param Delta
     * @returns {*}
     */
    handlePasteLink(node, Delta) {
      let ops = []
      Delta.ops.forEach(op => {
        if (op.insert && typeof op.insert === 'string') {
          // 将文本中的URL转换为<a>标签
          const insert = op.insert
          const replacedUrlText = insert.replace(regular.REGULARTYPE.link.v, function (match) {
            return `${match}`
          })
          if (regular.check('link', replacedUrlText).code == 0)
            ops.push({insert: replacedUrlText, attributes: {link: replacedUrlText}})
          else
            ops.push({insert: replacedUrlText})
        } else if (op.insert.image && typeof op.insert === 'object') {
          // 插入图像
          ops.push(op)
        }
      })
      Delta.ops = ops
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
     * 插入图像
     */
    async onInsertImage(insertValue) {
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
        console.error(err)
      }
    },
    /**
     * 插入表情
     * @param emoji
     */
    insertEmoji(emoji) {
      try {
        Emoji.insertEmoji(this.quill, {emoji: emoji});
      } catch (err) {
        console.error(err)
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

      // Remove the following line feed
      const leadingPattern = /^(<p><br><\/p>)+/;
      const trailingPattern = /(<p><br><\/p>)+$/;
      laterContent = laterContent.replace(leadingPattern, '').replace(trailingPattern, '');

      return laterContent;
    }
  },
  computed: {
    editor() {
      return this.$refs.quillTextEditor.quill;
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
  border-radius: 3px;
  margin: 10px 0;
}

.editor .ql-container.ql-snow img.ql-emoji {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 0;
  margin-top: 0rem;
  margin-bottom: -0.21rem;
  vertical-align: baseline;
  cursor: default;
}

.editor .ql-hr {
  background: no-repeat scroll 50% 50% transparent !important;
  background-image: url("./../../src/assets/images/hr.svg") !important;
  text-align: center;
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

.ql-editor a::before {
  content: "\f3d1";
}

.html-widget-box .ql-editor a::before {
  content: "" !important;
  display: none !important;
}

.ql-toolbar.ql-snow, .quill-editor {
  background-color: inherit !important;
}
</style>
