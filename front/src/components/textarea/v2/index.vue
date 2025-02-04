<script>
import {application, http_token} from "@/assets/js";
import {Extension} from '@tiptap/core';
import {Editor, EditorContent} from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import lodash from "lodash";

import EPlaceholder from '@tiptap/extension-placeholder'
import UploadWidget from "@/components/UploadWidget.vue";
import InputLinkWidget from "@/components/InputLinkAttrWidget.vue";
import InputContractedSyntaxWidget from "@/components/inputContractedSyntaxWidget.vue";
import EmoteView from "@/components/EmoteView.vue"
import Empty from "@/components/Empty.vue";

import LinkWidget from "./link";
import ImageWidget from "./image"
import HRWidget from "./hr";
import ContractedSyntax from "./contractedSyntax"
import EmoteWidget from "./emote"

import HtmlWidget from "@/components/HtmlWidget.vue";


const PlainTextPaste = Extension.create({
  // addPasteRules() {
  //   return [
  //     {
  //       regex: /.*/, // 匹配所有内容
  //       handler: ({match, range}) => {
  //         const plainText = match[0].replace(/<[^>]*>/g, '');
  //
  //         return {
  //           insert: {
  //             type: 'text',
  //             text: plainText,
  //           },
  //         };
  //       },
  //     },
  //   ];
  // },
});

export default new application({
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
    toolbar: {
      type: Array,
      default: () => ['ordered', 'bullet', 'bold', 'italic', 'underline', 'hr', 'link', 'image', 'cs', 'emote']
    }
  },
  components: {
    HtmlWidget,
    Empty,
    InputLinkWidget,
    InputContractedSyntaxWidget,
    UploadWidget,
    EmoteView,
    EditorContent,
  },
  data() {
    return {
      tiptap: null,
      isPreviewView: false,
      isOpenEmoji: false,
      editorContent: ''
    }
  },
  created() {
    this.http = http_token.call(this);

    if (this.content)
      this.editorContent = this.content;
  },
  mounted() {
    const that = this;
    this.tiptap = new Editor({
      content: this.editorContent,
      enablePasteRules: ['code'],
      injectCSS: false,
      editorProps: {},
      extensions: [
        StarterKit.configure({
          horizontalRule: false,
          codeBlock: false,
          heading: false,
        }),
        EPlaceholder.configure({
          placeholder: this.placeholder,
        }),

        // 格式
        LinkWidget,
        HRWidget,
        ImageWidget,
        EmoteWidget,
        PlainTextPaste,

        // 缩语
        ContractedSyntax,
      ],
      onCreate({editor}) {
        editor.options.keyboardShortcuts = {};
      },
      onUpdate({editor}) {
        const html = editor.getHTML();

        that.onEditorChange(html);
      },
    })
    this.tiptap.options.keyboardShortcuts = {};
  },
  beforeDestroy() {
    this.tiptap.destroy()
  },
  methods: {
    /**
     * 图片-工具栏
     */
    onImage() {
      this.$refs.uploadWidget.onPanelChange();
    },
    /**
     * 链接-工具栏
     */
    onLink() {
      const selection = this.editor.state.selection;
      const from = selection.from;
      const to = selection.to;

      if (from !== to) {
        // 文本选择编辑
        let allText = this.editor.getText();
        let selectedText = allText.substring(from, to);
        this.$refs.linkWidget.openPanel(null, selectedText, 'commit');
      } else {
        // 新建
        this.$refs.linkWidget.openPanel("", "", 'insert');
      }
    },
    /**
     * 缩语-工具栏
     */
    onContractedSyntax() {
      if (this.$refs.contractedSyntaxWidget)
        this.$refs.contractedSyntaxWidget.openPanel();
    },
    /**
     * 标签-工具栏
     */
    onEmote() {
      if (this.$refs.emoteWidget && !this.editor.isFocused) {
        this.$refs.emoteWidget.openPanel();
        this.isOpenEmoji = true;
      }
    },
    /**
     * 分割线-工具栏
     */
    onHr() {
      this.editor.commands.insertHr();
    },

    /**
     * 更新富文本
     * @param val
     */
    updateContent(val) {
      this.tiptap.commands.setContent(val);
      this.editorContent = this.tiptap.getHTML();
    },
    /**
     * 插入新链接
     */
    onInsertLink(href, text) {
      this.editor.commands.insertLink(href, text);
    },
    /**
     * 插入缩语
     */
    onInsertContractedSyntax(val) {
      this.editor.commands.insertContractedSyntax({csType: val.type, csValue: val.value});
    },
    /**
     * 插入标签
     * @param val
     */
    onInsertEmote(type, val) {
      this.editor.commands.insertEmote({id: `${type}|${val.name}`});
      this.isOpenEmoji = false;
    },
    /**
     * 插入新图像
     */
    async onInsertImage(insertValue) {
      try {
        if (insertValue)
          this.editor.commands.insertImage(insertValue);
      } catch (err) {
        this.$Message.error(err);
        this.$refs.uploadWidget.updataIcon = false;
        this.insertLoad = false;
      }
    },


    /**
     * 编辑器触发事件
     * @param data
     */
    onEditorChange(data) {
      this.editorContent = data;
      this.$emit("input", data);
    },
  },
  computed: {
    editor() {
      return this.tiptap;
    },
    toolbarAs() {
      return lodash.flatMap(this.toolbar, item => {
        if (typeof item == 'string') return item;
        return item.map(obj => obj.list || obj || '')
      });
    }
  }
})
</script>

<template>
  <div v-if="tiptap" class="container html-widget-box">
    <div class="control-group editor-toolbar">
      <Row :gutter="20" type="flex" align="middle">
        <Col>
          <div :style="isPreviewView ? 'opacity: .1;pointer-events:none' : ''">
            <Button @click="editor.chain().focus().toggleBold().run()"
                    class="btn"
                    v-if="toolbarAs.indexOf('bold') >= 0"
                    :disabled="!editor.can().chain().focus().toggleBold().run()"
                    :class="{'is-active ql-active': editor.isActive('bold') }">
              <svg viewBox="0 0 18 18">
                <path class="ql-stroke"
                      d="M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z"></path>
                <path class="ql-stroke"
                      d="M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z"></path>
              </svg>
            </Button>
            <Button @click="editor.chain().focus().toggleItalic().run()"
                    class="btn"
                    v-if="toolbarAs.indexOf('italic') >= 0"
                    :disabled="!editor.can().chain().focus().toggleItalic().run()"
                    :class="{ 'is-active ql-active': editor.isActive('italic') }">
              <svg viewBox="0 0 18 18">
                <line class="ql-stroke" x1="7" x2="13" y1="4" y2="4"></line>
                <line class="ql-stroke" x1="5" x2="11" y1="14" y2="14"></line>
                <line class="ql-stroke" x1="8" x2="10" y1="14" y2="4"></line>
              </svg>
            </Button>
            <Button @click="editor.chain().focus().toggleStrike().run()"
                    class="btn"
                    v-if="toolbarAs.indexOf('strike') >= 0"
                    :disabled="!editor.can().chain().focus().toggleStrike().run()"
                    :class="{ 'is-active': editor.isActive('strike') }">
              <svg viewBox="0 0 18 18">
                <path class="ql-stroke" d="M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3"></path>
                <rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="12" x="3" y="15"></rect>
              </svg>
            </Button>

            <Divider type="vertical"
                     v-if="toolbarAs.indexOf('bullet') >= 0 && toolbarAs.indexOf('ordered') >= 0 && toolbarAs.indexOf('hr') >= 0"></Divider>

            <Button @click="editor.chain().focus().toggleBulletList().run()"
                    v-if="toolbarAs.indexOf('bullet') >= 0"
                    :class="{'btn': true, 'is-active ql-active': editor.isActive('bulletList') }">
              <svg viewBox="0 0 18 18">
                <line class="ql-stroke" x1="6" x2="15" y1="4" y2="4"></line>
                <line class="ql-stroke" x1="6" x2="15" y1="9" y2="9"></line>
                <line class="ql-stroke" x1="6" x2="15" y1="14" y2="14"></line>
                <line class="ql-stroke" x1="3" x2="3" y1="4" y2="4"></line>
                <line class="ql-stroke" x1="3" x2="3" y1="9" y2="9"></line>
                <line class="ql-stroke" x1="3" x2="3" y1="14" y2="14"></line>
              </svg>
            </Button>
            <Button @click="editor.chain().focus().toggleOrderedList().run()"
                    v-if="toolbarAs.indexOf('ordered') >= 0"
                    class="btn"
                    :class="{ 'is-active ql-active': editor.isActive('orderedList') }">
              <svg viewBox="0 0 18 18">
                <line class="ql-stroke" x1="7" x2="15" y1="4" y2="4"></line>
                <line class="ql-stroke" x1="7" x2="15" y1="9" y2="9"></line>
                <line class="ql-stroke" x1="7" x2="15" y1="14" y2="14"></line>
                <line class="ql-stroke ql-thin" x1="2.5" x2="4.5" y1="5.5" y2="5.5"></line>
                <path class="ql-fill"
                      d="M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z"></path>
                <path class="ql-stroke ql-thin"
                      d="M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156"></path>
                <path class="ql-stroke ql-thin"
                      d="M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109"></path>
              </svg>
            </Button>
            <Button @click="onHr"
                    v-if="toolbarAs.indexOf('hr') >= 0"
                    class="btn"
                    :class="{ 'is-active ql-active': editor.isActive('HR') }"
                    :disabled="editor.isActive('HR')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"
                      d="M400 256H112"/>
              </svg>
            </Button>

            <Divider type="vertical" v-if="toolbarAs.indexOf('link') >= 0 && toolbarAs.indexOf('image') >= 0"></Divider>

            <Button @click="onEmote"
                    class="btn"
                    :disabled="isOpenEmoji"
                    v-if="toolbarAs.indexOf('emote') >= 0 && isAdmin">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <circle cx="184" cy="232" r="24"/>
                <path
                    d="M256.05 384c-45.42 0-83.62-29.53-95.71-69.83a8 8 0 017.82-10.17h175.69a8 8 0 017.82 10.17c-11.99 40.3-50.2 69.83-95.62 69.83z"/>
                <circle cx="328" cy="232" r="24"/>
                <circle cx="256" cy="256" r="208" fill="none" stroke="currentColor" stroke-miterlimit="10"
                        stroke-width="32"/>
              </svg>
            </Button>
            <Button @click="onLink(editor.isActive('Link'))" class="btn"
                    v-if="toolbarAs.indexOf('link') >= 0"
                    :class="{ 'is-active ql-active': editor.isActive('Link') }">
              <svg viewBox="0 0 18 18">
                <line class="ql-stroke" x1="7" x2="11" y1="7" y2="11"></line>
                <path class="ql-even ql-stroke"
                      d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"></path>
                <path class="ql-even ql-stroke"
                      d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"></path>
              </svg>
            </Button>
            <Button @click="onImage" class="btn"
                    v-if="toolbarAs.indexOf('image') >= 0">
              <svg viewBox="0 0 18 18">
                <rect class="ql-stroke" height="10" width="12" x="3" y="4"></rect>
                <circle class="ql-fill" cx="6" cy="7" r="1"></circle>
                <polyline class="ql-even ql-fill" points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"></polyline>
              </svg>
            </Button>
            <Button @click="onContractedSyntax" class="btn"
                    v-if="toolbarAs.indexOf('cs') >= 0 && isAdmin">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <circle cx="256" cy="256" r="26"/>
                <circle cx="346" cy="256" r="26"/>
                <circle cx="166" cy="256" r="26"/>
                <path fill="none" class="ql-even ql-fill" stroke="currentColor" stroke-linecap="round"
                      stroke-linejoin="round" stroke-width="32"
                      d="M160 368L32 256l128-112M352 368l128-112-128-112"/>
              </svg>
            </Button>
          </div>
        </Col>
        <Col flex="1"></Col>
        <Col>
          <Button @click="isPreviewView = !isPreviewView" class="btn">
            <Icon :type="isPreviewView ? 'ios-create-outline' : 'ios-create'"/>
          </Button>
          <Divider type="vertical"></Divider>
          <template v-if="isPreviewView">
            <Tag>Preview View Mode</Tag>
          </template>
          <template v-if="!isPreviewView">
            <Button class="btn"
                    @click="editor.chain().focus().undo().run()"
                    :disabled="!editor.can().chain().focus().undo().run()">
              <Icon type="md-undo" size="16"/>
            </Button>
            <Button class="btn"
                    @click="editor.chain().focus().redo().run()"
                    :disabled="!editor.can().chain().focus().redo().run()">
              <Icon type="md-redo" size="16"/>
            </Button>
          </template>
        </Col>
      </Row>
    </div>

    <slot></slot>
    <template v-if="!isPreviewView">
      <editor-content
          class="editor html-widget-size-default timeline-description"
          ref="tiptapTextEditor"
          :style="`min-height:${height}`"
          :editor="tiptap"
          v-model="editorContent"
          @on-change="onEditorChange"/>
    </template>
    <div v-if="isPreviewView">
      <HtmlWidget :html="editorContent" :isDisableFullScreen="true" :rendererType="['renderer']"
                  class="timeline-description textarea-none-padding"
                  v-if="editorContent"></HtmlWidget>
      <Card v-else shadow dis-hover>
        <Empty :not-hint="false"></Empty>
      </Card>
    </div>

    <slot name="footer"></slot>

    <Row :gutter="10" class="editor-footer" v-if="showMaxlengthLabel && !isPreviewView">
      <Col flex="1">
        <template v-if="editorContent != null && editorContent.length > maxlength">
          <Alert show-icon type="error">{{ $t('textarea.textOverflowHint') }}</Alert>
        </template>
        <slot name="footer-left"/>
      </Col>
      <Col>
        <a href="//announcement.bfban.com/docs/openApi/front/renderer_format" target="_blank">
          <Icon type="md-help-circle"></Icon>
        </a>
        <Divider type="vertical"></Divider>
        <Tooltip :placement="'left-start'" :content="$t('textarea.textHelpHint')" max-width="300" :transfer="true">
          <Icon type="md-code" style="margin-right: 5px;"/>
          <template v-if="editorContent != null && editorContent.length > maxlength">
            <b style="color: darkred">{{ editorContent.length || 0 }}</b>
          </template>
          <template
              v-else-if="editorContent != null && editorContent.length > maxlength / 2 && editorContent.length < maxlength">
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
    <InputLinkWidget ref="linkWidget" @finish="onInsertLink"></InputLinkWidget>
    <InputContractedSyntaxWidget ref="contractedSyntaxWidget"
                                 @finish="onInsertContractedSyntax"></InputContractedSyntaxWidget>
    <EmoteView ref="emoteWidget" :editor="tiptap"
               @finish="onInsertEmote"
               @close="() => isOpenEmoji = false"></EmoteView>
  </div>
</template>

<style lang="less">
.tiptap {
  font-family: "Ionicons", sans-serif;
  padding: 0 15px;

  :first-child {
    margin-top: 0;
  }

  &:focus-visible {
    outline: none !important;
    border: none !important;
  }

  :first-child {
    margin-top: 0;
  }

  img {
    width: 100%;
    display: block;
  }

  /* List styles */

  ul,
  ol {
    padding-left: 1.5em;
    margin: 0 1rem 1.25rem 0.4rem;

    ::marker {
      unicode-bidi: isolate;
      font-variant-numeric: tabular-nums;
      text-transform: none;
      text-indent: 0px !important;
      text-align: start !important;
      text-align-last: start !important;
    }

    li p {
      outline: none;
      margin-top: 0.1em;
      margin-bottom: 0.1em;
    }
  }

  /* Placeholder (at the top) */

  p.is-editor-empty:first-child::before {
    white-space: break-spaces;
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    line-height: 1.5;
    pointer-events: none;
    opacity: .8;
  }

  p .ProseMirror-separator {
    display: none;
  }
}

.editor-toolbar {
  margin: 0;
  padding: 8px;
  min-height: 46px;

  svg .ql-stroke {
    fill: none;
    stroke-width: 1.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: #383838 !important;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    display: inline-block;
    padding: 3px 4px;
    margin-left: 1px;
    width: 28px;
    height: 28px;
  }
}

.textarea-none-padding {
  margin: 0 !important;
  padding: 0 !important;
}

.editor-toolbar .btn > span {
  background: none;
  border: none;
  cursor: pointer;
  display: contents;
  float: left;
  height: 28px;
  padding: 3px 5px;
  width: 28px;
}

.editor-footer {
  padding: 5px 15px;
}
</style>
