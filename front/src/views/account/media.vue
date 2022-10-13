<template>
  <div>
    <Card :padding="0" dis-hover>
      <Row slot="title">
        <Col flex="1">
          {{ $t('profile.media.fileNum', {num: media.data.todayFileNumber || 0}) }}
        </Col>
        <Col span="8" v-if="media.data.usedStorageQuota && media.data.totalStorageQuota">
          {{ $t('profile.media.capacity') }}<span>{{media.data.usedStorageQuota}}/{{media.data.totalStorageQuota}}</span>
          <Progress :percent="percentValue" />
        </Col>
      </Row>

      <Table :border="false"
             :load-data="handleLoadData"
             :columns="media.columns"
             :data="media.list"
             class="media-content"></Table>
    </Card>

    <br>
    <Page class="page"
          show-sizer
          show-total
          show-elevator
          @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange"
          :page-size="media.limit"
          :current="media.skip" />
  </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'

import {api, http, http_token, upload} from "../../assets/js";

import VueViewer from 'v-viewer'
import Vue from "vue";

Vue.use(VueViewer);

export default {
  data() {
    return {
      file: { name: '' },
      loadingStatus: false,
      service_upload: api['service_upload'],
      media: {
        columns: [
          {
            title: 'Name',
            key: 'filename',
            minWidth: 200,
            maxWidth: 400,
          },
          {
            title: 'size',
            key: 'size',
            sortable: true
          },
          {
            title: 'createTime',
            key: 'createTime',
            render: (h, params) => {
              return h('Time', {
                props: {
                  time: params.row.createTime,
                  type: "datetime"
                }
              });
            }
          },
          {
            key: 'btn',
            render: (h, params) => {
              return h('Button', {
                props: {
                  loading: params.row.load
                },
                on: {
                  click: () => {
                    if (params.row.load) return;

                    this.queryMediaDetail(params.row.filename);
                  }
                }
              }, this.$i18n.t('profile.message.look'));
            }
          }
        ],
        images: {},
        selectFileId: '',
        data: {},
        list: [],
        limit: 40,
        skip: 1
      }
    }
  },
  created() {
    this.http = http_token.call(this);
    this.getMedia();
    this.getMediaList();
  },
  methods: {
    handleLoadData (item, callback) {
      setTimeout(() => {
        const data = [
          {
            id: '10100',
            name: 'John Brown',
            age: 18,
            address: 'New York No. 1 Lake Park'
          },
          {
            id: '10101',
            name: 'Joe Blackn',
            age: 30,
            address: 'Sydney No. 1 Lake Park'
          }
        ];
        callback(data);
      }, 2000);
    },
    handlePageChange (val) {
      this.media.skip = val;
      this.getMedia();
    },
    handlePageSizeChange (val) {
      this.media.limit = val;
      this.getMedia();
    },
    /**
     * 全屏查看图片
     * @param image
     */
    openViewImage (name, url) {
      let img_array = [];
      this.media.images[name] = url;
      for (const imagesKey in this.media.images) {
        img_array.push(this.media.images[imagesKey])
      }
      this.$viewerApi({
        options: {
          keyboard: false,
          fullscreen: true
        },
        images: img_array,
      })
    },
    /**
     * 查询媒体信息
     */
    getMedia() {
      this.http.get(api["service_myStorageQuota"], {}).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.media.data = d.data;
        }
      }).finally(() => {
      });
    },
    /**
     * 查询媒体列表
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
          d.data.map(i => i = Object.assign(i, {
            _loading: false,
            load: false,
            children: []
          }));

          this.media.list = d.data;
        }
      }).finally(() => {
      });
    },
    /**
     * 查询文件详情
     */
    queryMediaDetail (name) {
      this.media.selectFileId = name;

      for (let i = 0; i < this.media.list.length; i++) {
        if (this.media.list[i].filename == name)
          this.media.list[i].load = true
      }

      http.get(api["service_file"], {
        params: {
          filename: name,
          explain: true
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          for (let i = 0; i < this.media.list.length; i++) {
            if (this.media.list[i].filename == name) {
              this.media.list[i].detail = d.data;
              this.openViewImage(this.media.list[i].filename, d.data.downloadURL);
            }
          }

        }
      }).finally(() => {
        for (let i = 0; i < this.media.list.length; i++) {
          if (this.media.list[i].filename == name)
            this.media.list[i].load = false
        }
      });
    },
  },
  computed: {
    percentValue () {
      return Number(((this.media.data.usedStorageQuota / this.media.data.totalStorageQuota) * 100).toFixed(2));
    }
  }
}
</script>

<style lang="less">
.media-content {
  background-color: rgb(0 0 0 / 2%);
}

.media-file-detila {
  height: 200px;
  width: 100%;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>