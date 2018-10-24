<template>
    <div>
        <!-- <Button @click.stop.prevent="getJwtToken">get jwt token</Button> -->
        <!-- <Button @click.stop.prevent="getQiniuUploadToken">get qiniu upload token</Button> -->

        <Upload
          class="file-uploader-image"

          :headers="headers"
          :data="extraData"
          action="//up-z2.qiniu.com"
          accept="image/*"
          :format="['jpg','jpeg','png', 'gif']"
          multiple
          name="file"
          max-size="2014"

          :with-credentials="withCredentials"
          :show-upload-list="showUploadList"

          :on-success="handleSuccess"
          :on-error="handleError"
          :on-exceeded-size="handleExceededSize"
          :before-upload="handleBeforeUpload">
              <Button icon="ios-cloud-upload-outline">Upload files</Button>
        </Upload>

        <Upload
          class="file-uploader-video"

          :headers="headers"
          :data="extraData"
          action="//up-z2.qiniu.com"
          accept="video/mp4"
          :format="['mp4']"
          multiple
          name="file"
          max-size="30720"

          :with-credentials="withCredentials"
          :show-upload-list="showUploadList"

          :on-success="handleSuccess"
          :on-error="handleError"
          :on-exceeded-size="handleExceededSize"
          :before-upload="handleBeforeUpload">
              <Button icon="ios-cloud-upload-outline">Upload files</Button>
        </Upload>

        <div>
          <quill-editor
          ref="quillEditor"
          :options="editorOption"

          :content="content"
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
import axios from 'axios'
import qs from 'qs'

// https://github.com/zenoamaro/react-quill/issues/270
// https://codepen.io/emanuelbsilva/pen/Zpmmzv
import Quill from 'quill'
var Embed = Quill.import('blots/embed');
class QuillHashtag extends Embed {
  static create(value) {
    let node = super.create(value);
    node.innerHTML = `<video width="400" controls><source src="${value}" type="video/mp4"></video>`;
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
    ["bold", "italic", "underline", "strike"],
    ["link", "image", "video"],
    ["clean"]
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

            content: '',
            editorOption: {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: toolbarOptions,
                        handlers: {
                            image: (value)=> {
                                if (value) {
                                    this.uploadType = 'image';
                                    document.querySelector('.file-uploader-image input').click()
                                } else {
                                    this.quill.format("image", false)
                                }

                            },

                            video: (value) => {
                                if (value) {
                                    this.uploadType = 'video';
                                    document.querySelector('.file-uploader-video input').click()
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
            this.$emit('change', html)
            this.content = html
        },

        handleBeforeUpload: async function(files) {
          this.spinShow = true;

            // axios get qiniu tooken to extraData
            let d = await this.getQiniuUploadToken()
            let token = d.data.token

            this.extraData.token = token
        },
        handleSuccess: function(res, file) {
            console.log(res)

            const quill = this.$refs.quillEditor.quill
            // 获取光标所在位置
            let length = quill.getSelection().index
            // 插入图片 或 插入视频
            if (this.uploadType === 'image') {
              quill.insertEmbed(length, 'image', "http://ban.bamket.com/"+res.hash)
            }
            if (this.uploadType === 'video') {
              quill.insertEmbed(length, 'mp4', "http://ban.bamket.com/"+res.hash)
            }
            // 调整光标到最后
            quill.setSelection(length + 1)

            console.log(quill.root.innerHTML)

            this.spinShow = false
        },
        handleError: function(err, file, fileList) {
            console.log(err)

            this.$Message.error('upload images fail...')

            this.spinShow = false
        },
        handleExceededSize: function(file, fileList) {
          this.$Message.warning('超过上传最大限制，图片2M，视频30M');

            this.spinShow = false
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

  .file-uploader-image, .file-uploader-video {
    display: none;
  }

</style>
