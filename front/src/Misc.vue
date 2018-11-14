<template>
    <div>
      <!-- <Button @click.stop.prevent="getJwtToken">get jwt token</Button> -->
      <!-- <Button @click.stop.prevent="getQiniuUploadToken">get qiniu upload token</Button> -->

      <Modal
        v-model="modal1"
        title="上传图片，不要超过2M"
      >
        <Upload
          :headers="headers"
          :data="extraData"
          action="//up-z2.qiniu.com"
          accept="image/*"
          :format="['jpg','jpeg','png', 'gif']"
          multiple
          name="file"
          :max-size="imgMaxSize"
          type="drag"

          :with-credentials="withCredentials"
          :show-upload-list="showUploadList"

          :on-success="handleSuccess"
          :on-error="handleError"
          :on-exceeded-size="handleExceededSize"
          :before-upload="handleBeforeUpload">

          <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>Click or drag files here to upload</p>
          </div>

        </Upload>
      </Modal>


      <Modal
        v-model="modal2"
        title="上传视频，不要超过30M"
      >
        <Upload
          :headers="headers"
          :data="extraData"
          action="//up-z2.qiniu.com"
          accept="video/mp4"
          :format="['mp4']"
          multiple
          name="file"
          :max-size="vodMaxSize"
          type="drag"

          :with-credentials="withCredentials"
          :show-upload-list="showUploadList"

          :on-success="handleSuccess"
          :on-error="handleError"
          :on-exceeded-size="handleExceededSize"
          :before-upload="handleBeforeUpload">

          <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>Click or drag files here to upload</p>
          </div>

        </Upload>
      </Modal>


      <div>
          <quill-editor
          ref="quillEditor"
          :options="editorOption"

          :content="editorContent"
          @change="onEditorChange($event)"
          >
          </quill-editor>

          <Spin size="large" fix v-show="spinShow">
            <p>
              上传中...
            </p>
          </Spin>
        </div>
    </div>
</template>

<script>
// import qs from 'qs'
// https://github.com/zenoamaro/react-quill/issues/270
// https://codepen.io/emanuelbsilva/pen/Zpmmzv
// import Quill from 'quill'

var Embed = Quill.import('blots/embed');
class QuillHashtag extends Embed {
  static create(value) {
    let node = super.create(value);
    node.innerHTML = `<video controls><source src="${value}" type="video/mp4"></video>`;
    return node;
  }
}
QuillHashtag.blotName = 'mp4';
QuillHashtag.className = 'ql-mp4';
QuillHashtag.tagName = 'div';

Quill.register({
    'formats/mp4': QuillHashtag
});

const toolbarOptions = [
    ["image"],
];
export default {
    props: {
        content: {
            type: String,
            default: '',
        }
    },
    data() {
      return {
          imgMaxSize: 2014,
          vodMaxSize: 30720,

          modal1: false,
          modal2: false,

          withCredentials: false,
          showUploadList: true,
          headers: {
              'x-csrf-token': '',
          },
          extraData: {
              token: ''
          },
          uploadType: '',

          spinShow: false,

          editorContent: '',
          editorOption: {
              theme: 'snow',
              modules: {
                  toolbar: {
                      container: toolbarOptions,
                      handlers: {
                          image: (value)=> {
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
                          }
                      }
                  }
              }
          }
      }
    },
    methods: {
        onEditorChange({ quill, html, text }) {
            this.$emit('change', html);
            this.editorContent = html;
        },

        handleBeforeUpload: async function(file) {

            // axios get qiniu tooken to extraData
            let d = await this.getQiniuUploadToken();
            let token = d.data.token;

            this.extraData.token = token;
            this.extraData.key = (new Date()).getTime() + '-' + Math.round(Math.random() * 1000000) + '.' + file.name.split(".").pop()
        },
        handleSuccess: function(res, file, fileList) {
          const quill = this.$refs.quillEditor.quill;

          // editor focus
          quill.focus();

          // 获取光标所在位置
          let length = quill.getSelection().index;
          // 插入图片 或 插入视频
          if (this.uploadType === 'image') {
              quill.insertEmbed(length, 'image', "http://bfban.bamket.com/"+res.key)
            }
            if (this.uploadType === 'video') {
              quill.insertEmbed(length, 'mp4', "http://bfban.bamket.com/"+res.key)
            }
            // 调整光标到最后
            quill.setSelection(length + 1);

        },
        handleError: function(err, file, fileList) {
            this.$Message.error('upload images fail...')

        },
        handleExceededSize: function(file, fileList) {
          this.$Message.warning('超过上传最大限制，图片2M，视频30M');

        },

        getCsrfToken: function() {
            return document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },

        getJwtToken: function() {
            const csrfToken = this.getCsrfToken()

            // axios request (with credentials)
            return axios({
                method: 'post',
                url: '/auth',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformRequest: [
                    (data, headers)=> {
                        headers['x-csrf-token'] = csrfToken
                        return qs.stringify(data)
                    }
                ],
                data: {
                    username: 'user',
                    password: 'pwd'
                }
            })
            .catch((err)=> {
                console.log(err)
            })
        },
        getQiniuUploadToken: function() {
            const csrfToken = this.getCsrfToken()

            // axios request with credentials, it is async
            return axios({
                method: 'post',
                url: '/auth/qiniu',
                // qini up token stores at cookies
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-csrf-token': csrfToken,
                },
            })
            .catch((err)=> {
                console.log(err)
            })
        },

    }
}
</script>


<style lang="scss">
  .ql-editor {
    background-color: white;
  }

  .ql-container.ql-snow {
    height: 20rem;
  }
</style>
