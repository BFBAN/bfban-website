<template>
  <div>
    媒体库
    <Button disabled>上传</Button>
    <!-- MIN FILE <2MB OR MAX FILE >2MB -->
    <Upload
        multiple
        type="drag"
        @on-success="getMediaList"
        :before-upload="handleUpload"
        :format="['jpg','png']"
        :max-size="2000"
        :action="service_upload">
      <div style="padding: 20px 0">
        <Icon type="ios-cloud-upload" size="52" ></Icon>
        <p>Click or drag files here to upload</p>
      </div>
    </Upload>

    <div v-if="file !== null">
      Upload file: {{ file.name }} {{file.type}}
      <Button type="text" @click="onMediaUpdata" :loading="loadingStatus">{{ loadingStatus ? 'Uploading' : 'Click to upload' }}</Button>
    </div>

    <Card :padding="10">
      <Row>
        <Col flex="1">
          {{ media.data.todayFileNumber || 0 }}份文件
        </Col>
        <Col span="8">
          容量
          <Progress :percent="media.data.usedStorageQuota || 0" :max="media.data.totalStorageQuota || 0" />
        </Col>
      </Row>
    </Card>

    <div>
      <Card v-for="(i, index) in media.list" :key="index">

      </Card>
    </div>
  </div>
</template>

<script>
import {api, http, http_token} from "../../assets/js";

export default {
  data() {
    return {
      file: { name: '' },
      loadingStatus: false,
      service_upload: api['service_upload'],
      media: {
        data: {},
        list: [],
      }
    }
  },
  created() {
    this.http = http_token.call(this);
    this.getMedia();
    this.getMediaList();
  },
  methods: {
    /**
     * 查询媒体信息
     */
    getMedia() {
      this.http.get(api["service_myStorageQuota"], {}).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.media.data = d;
        }
      }).finally(() => {
      });
    },
    /**
     * 查询媒体列表
     */
    getMediaList() {
      this.http.get(api["service_myFiles"], {
        par: {
          limit: 0,
          skip: 0,
        }
      }).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.media.list = d.data;
        }
      }).finally(() => {
      });
    },
    /**
     * 查询文件详情
     */
    queryMediaDetail () {
      this.http.get(api["service_file"], {}).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.media.list = d;
        }
      }).finally(() => {
      });
    },
    /**
     * 上传
     */
    onMediaUpdata () {
      if (!this.file) return;

      this.loadingStatus = true;

      this.http.put(api["service_upload"], {
        body: this.file,
        headers: {
          'Content-Type': this.file.size,
        }
      }).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.file = null;
          this.loadingStatus = false;
          this.$Message.success('Success')
        }
      }).finally(() => {
      });
    },
    handleUpload (file) {
      this.file = file;
      console.log(file)
      return false;
    }
  }
}
</script>