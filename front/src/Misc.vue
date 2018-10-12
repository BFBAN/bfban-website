<template>
    <div>
        <Button @click.stop.prevent="getJwtToken">get jwt token</Button>
        <Button @click.stop.prevent="getQiniuUploadToken">get qiniu upload token</Button>

        <Upload
        class="file-uploader"

        :headers="headers"
        :data="extraData"
        action="//up-z2.qiniu.com"
        accept="image/*"
        multiple
        name="file"
        
        :with-credentials="withCredentials"
        :show-upload-list="showUploadList"

        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="handleBeforeUpload">
            <Button icon="ios-cloud-upload-outline">Upload files</Button>
        </Upload>


        <quill-editor
        ref="quillEditor"
        :options="editorOption"
        v-model="content">
        </quill-editor>
    </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'

const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["link", "image"],
    ["clean"]
];
export default {
    data: function() {
        return {
            withCredentials: false,
            showUploadList: true,
            headers: {
                'x-csrf-token': '',
            },
            extraData: {
                token: ''
            },


            content: '',
            editorOption: {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: toolbarOptions,
                        handlers: {
                            image: (value)=> {
                                if (value) {
                                    console.log(value)
                                    document.querySelector('.file-uploader input').click()
                                } else {
                                    this.quill.format("image", false)
                                }
                                
                            }
                        }
                    }
                }
            }
        }
    },
    methods: {
        handleBeforeUpload: async function(files) {
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
            // 插入图片
            quill.insertEmbed(length, "image", "http://ban.bamket.com/"+res.hash)
            // 调整光标到最后
            quill.setSelection(length + 1)

            console.log(quill.root.innerHTML)
        },
        handleError: function(err, file, fileList) {
            console.log(err)

            this.$Message.error('upload images fail...')
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


<style>
    .quill-editor,
    .content {
    background-color: white;
    }
</style>