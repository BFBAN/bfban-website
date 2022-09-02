<template>
  <div>
    <Card :padding="0" dis-hover>
      <Row slot="title">
        <Col flex="1">
          {{ $t('profile.media.fileNum', {num: media.data.todayFileNumber || 0}) }}
        </Col>
        <Col span="8">
          {{ $t('profile.media.capacity') }}
          <Progress :percent="media.data.usedStorageQuota || 0" :max="media.data.totalStorageQuota || 0" />
        </Col>
      </Row>

      <Table :border="false"
             :load-data="handleLoadData"
             :columns="media.columns"
             :data="media.list"
             class="media-content"></Table>
    </Card>

    <br>
<!--    <Page :total="100" />-->
  </div>
</template>

<script>
import {api, http, http_token, upload} from "../../assets/js";

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
            minWidth: 260
          },
          {
            title: 'size',
            key: 'size',
            sortable: true
          },
          {
            title: 'createTime',
            key: 'createTime',
            fixed: 'right',
            render: (h, params) => {
              console.log(params.row.createTime)
              return h('Time', {
                props: {
                  time: params.row.createTime
                }
              });
            }
          }
        ],
        selectFileId: '',
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
          d.data.map(i => i = Object.assign(i, {
            _loading: false,
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

      this.media.detail[name].load = true;

      http.get(api["service_file"], {
        params: {
          filename: name
        }
      }).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.media.detail[this.media.selectFileId] = d;
        } else {
          this.media.detail[this.media.selectFileId] = {
            type: 'error'
          };
        }
      }).finally(() => {
        this.media.detail[name].load = false;
      });
    },
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