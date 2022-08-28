<template>
  <div>
    <vue-editor :editorOptions="editorOption"
                useCustomImageHandler
                @imageAdded="handleImageAdded"/>
  </div>
</template>

<script>
import {http} from "../assets/js"

import { VueEditor } from "vue2-editor/dist/vue2-editor.core.js";

export default {
  props: {
    index: null,
    content: {
      type: String,
      default: "",
    }
  },
  components: { VueEditor },
  data() {
    return {
      editorContent : "",
      editorOption: {
        // theme: 'snow',
        placeholder: this.editorContent,
        modules: {
          "emoji-toolbar": true,
          "emoji-shortname": true,
          toolbar: {
            container: ["link", "image", "video"],
            handlers: {
              image: (value) => {
                if (value) {
                  this.uploadType = 'image';
                  this.modal1 = true;
                } else {
                  this.quill.format("image", false)
                }
              },
              video: (value) => {
                if (value) {
                  this.uploadType = 'video';
                  this.modal2 = true;
                } else {
                  this.quill.format("video", false)
                }
              },
            }
          }
        },
      }
    }
  },
  ready () {

  },
  methods: {
    /**
     * 编辑器触发事件
     * @param quill
     * @param html
     * @param text
     */
    onEditorChange({quill, html, text}) {
      this.$emit('change', html, this.index);
      this.editorContent = html;
    },

    /**
     * 图片处理
     * @param file
     * @param Editor
     * @param cursorLocation
     * @param resetUploader
     */
    handleImageAdded: function(file, Editor, cursorLocation, resetUploader) {
      var formData = new FormData();
      formData.append("image", file);
    },
    /**
     * 获取七牛TOken
     * @returns {Promise<any>}
     */
    getQiniuUploadToken () {
      return http.post('/auth/qiniu', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-csrf-token': this.getJwtToken(),
        },
      }).catch((err) => {
        console.log(err)
      })
    },
  }
}
</script>

<style lang="scss">

</style>
