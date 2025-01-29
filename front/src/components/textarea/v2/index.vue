<script>
import {http_token} from "@/assets/js";
import {Extension} from '@tiptap/core';
import {Editor, EditorContent} from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import EPlaceholder from '@tiptap/extension-placeholder'
import ELink from '@tiptap/extension-link';
import EHorizontalRule from '@tiptap/extension-horizontal-rule';
import UploadWidget from "@/components/UploadWidget.vue";
import lodash from "lodash";

const Hr = EHorizontalRule.extend({name: 'HR'}).configure({
      pluginKey: 'hr',
      HTMLAttributes: {
        class: 'hr ivu-divider ivu-divider-horizontal ivu-divider-default ivu-divider-dashed',
      },
    }),
    Link = ELink.extend({name: 'Link'}).configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      protocols: ['https', 'http', 'mailto'],
      HTMLAttributes: {
        class: 'link',
      },
    }),
    PlainTextPaste = Extension.create({
      name: 'plainTextPaste',
      addPasteRules() {
        return [
          {
            regex: /.*/, // 匹配所有内容
            handler: ({ match, range }) => {
              const plainText = match[0].replace(/<[^>]*>/g, '');

              return {
                insert: {
                  type: 'text',
                  text: plainText,
                },
              };
            },
          },
        ];
      },
    });

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
    toolbar: {
      type: Array,
      default: () => ['ordered', 'bullet', 'bold', 'italic', 'underline', 'hr', 'link', 'image']
    }
  },
  components: {
    UploadWidget,
    EditorContent,
  },
  data() {
    return {
      tiptap: null,
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
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
        },
      },
      extensions: [
        StarterKit,
        EPlaceholder.configure({
          pluginKey: 'placeholder',
          placeholder: this.placeholder,
          considerAnyAsEmpty: false,
          showOnlyWhenEditable: true,
          showOnlyCurrent: true,
          includeChildren: false,
        }),
        Link,
        Hr,
        PlainTextPaste,
      ],
      onUpdate({editor}) {
        that.onEditorChange(editor.getHTML())
      },
    })
  },
  beforeDestroy() {
    this.tiptap.destroy()
  },
  methods: {
    /**
     * 图片-工具栏
     */
    onImage() {
      this.$refs['uploadWidget'].onPanelChange();
      this.$refs['uploadWidget'].currentIndex = 0;
      this.$refs['uploadWidget'].currentFileType = '';
      this.$refs['uploadWidget'].updataIcon = false;
    },
    /**
     * 链接-工具栏
     */
    onLink(status) {
      // unset link
      if (status) {
        this.editor.chain().focus().unsetLink().run()
        return
      }

      const previousUrl = this.editor.getAttributes('link').href
      const url = window.prompt('URL', previousUrl)

      // update link
      this.editor.chain().focus().extendMarkRange('link').setLink({href: url}).run()
    },
    /**
     * 分割线-工具栏
     */
    onHr() {
      this.editor.commands.setHorizontalRule();
    },
    /**
     * 编辑器触发事件
     * @param data
     */
    onEditorChange(data) {
      this.$emit("input", data);
    },
    /**
     * 更新富文本
     * @param val
     */
    updateContent(val) {
      this.tiptap.commands.setContent(val)
      return this.tiptap.getHTML()
    },
    /**
     * 插入图像
     */
    async onInsertImage(insertValue) {
      try {
        this.editor.commands.setImage({src: insertValue});
      } catch (err) {
        this.$Message.error(err);
        this.$refs['uploadWidget'].updataIcon = false;
        this.insertLoad = false;
      }
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
}
</script>

<template>
  <div v-if="tiptap" class="container">
    <div class="control-group ql-snow ql-toolbar editor-toolbar">
      <Row :gutter="20" type="flex" align="middle">
        <Col>
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
                  :class="{ 'is-active ql-active': editor.isActive('hr') }">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
              <path
                  d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"/>
            </svg>
          </Button>

          <Divider type="vertical" v-if="toolbarAs.indexOf('link') >= 0 && toolbarAs.indexOf('image') >= 0"></Divider>

          <ButtonGroup>
            <Button @click="onLink(editor.isActive('link'))" class="btn"
                    v-if="toolbarAs.indexOf('link') >= 0"
                    :class="{ 'is-active ql-active': editor.isActive('link') }">
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
          </ButtonGroup>
        </Col>
        <Col flex="1"></Col>
        <Col>
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
        </Col>
      </Row>
    </div>

    <slot></slot>

    <editor-content
        class="editor"
        ref="tiptapTextEditor"
        :style="`min-height:${height}`"
        :editor="tiptap"
        v-model="editorContent"
        @on-change="onEditorChange"/>

    <slot name="footer"></slot>

    <Row :gutter="0" class="editor-footer" v-if="showMaxlengthLabel">
      <Col flex="1">
        editor: v2(beta)
        <template v-if="editorContent != null && editorContent.length >= maxlength">
          <Alert show-icon type="error">{{ $t('textarea.textOverflowHint') }}</Alert>
        </template>
        <slot name="footer-left"/>
      </Col>
      <Col>
        <Tooltip :placement="'left-start'" :content="$t('textarea.textHelpHint')" max-width="300" :transfer="true">
          <Icon type="md-help-circle" style="margin-right: 5px;"/>
          <template v-if="editorContent != null && editorContent.length === maxlength">
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

<style lang="less">
.tiptap {
  font-family: "Ionicons";
  padding: 0 15px;

  &:focus-visible,
  :first-child {
    outline: none !important;
    border: none !important;
  }

  :first-child {
    line-height: 1.5;
    margin-top: 0;
  }

  /* List styles */

  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      outline: none;
      line-height: 1.5;
      margin-top: 0.1em;
      margin-bottom: 0.1em;
    }
  }

  /* Heading styles */

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */

  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  a:hover,
  a:active {
    text-decoration: underline;
  }

  a {
    opacity: .8;
    text-decoration: underline;
    text-decoration-style: dashed;
  }

  a:before {
    user-select: none;
    content: "\F3D1";
  }

  p {
    line-height: 1.5;
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  /* Placeholder (at the top) */

  p.is-editor-empty:first-child::before {
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  /* Placeholder (on every new line) */

  p.is-empty:first-child::before {
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    opacity: .8;
  }
}

.editor-toolbar {
  margin: 0;
}

.editor-toolbar .btn > span {
  background: none;
  border: none;
  cursor: pointer;
  display: contents;
  float: left;
  height: 24px;
  padding: 3px 5px;
  width: 28px;
}

.editor-footer {
  padding: 5px 15px;
}
</style>
