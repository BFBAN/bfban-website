<template>
  <div>
    <Card :padding="0" dis-hover>
      <Row slot="title">
        <Col flex="1">
          Media
        </Col>
        <Col span="8" v-if="media.data.usedStorageQuota && media.data.totalStorageQuota">
          <Poptip placement="bottom-end" trigger="hover" width="400">
            {{
              $t('profile.media.capacity')
            }}<span>{{ media.data.usedStorageQuota }}/{{ media.data.totalStorageQuota }}</span>
            <Progress :percent="percentValue"/>
            <div slot="content">
              <Form label-position="left" :label-width="150">
                <FormItem label="最大容纳文件数量">
                  <Input v-model="media.data.maxFileNumber" size="small" readonly></Input>
                </FormItem>
                <FormItem label="文件最高大小">
                  <Input v-model="media.data.maxTrafficQuota" size="small" readonly></Input>
                </FormItem>
                <FormItem label="总储存配额">
                  <Row :gutter="10">
                    <Col flex="1">
                      <Input v-model="media.data.usedStorageQuota" size="small" readonly>
                        <span slot="append">kb</span>
                      </Input>
                    </Col>
                    <Col>/</Col>
                    <Col flex="1">
                      <Input v-model="media.data.totalStorageQuota" size="small" readonly>
                        <span slot="append">kb</span>
                      </Input>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem label="今日已上传文件">
                  <Input v-model="media.data.todayFileNumber" size="small" readonly></Input>
                </FormItem>
                <FormItem label="今日流量额度">
                  <Input v-model="media.data.todayTrafficQuota" size="small" readonly>
                    <span slot="append">kb</span>
                  </Input>
                </FormItem>
                <FormItem label="每日重置限定重置时间">
                  <Time :time="media.data.prevResetTime"></Time>
                </FormItem>
              </Form>
            </div>
          </Poptip>
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
          :current="media.skip"/>
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
      file: {name: ''},
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
              const buttonType = this.getButtonType(params.row.filename);
              let buttonText = this.$i18n.t('profile.chat.look');  // 默认文本
              let buttonAction;

              if (buttonType === 'view') {
                buttonText = this.$i18n.t('profile.chat.look');
                buttonAction = () => {
                  if (params.row.load) return;
                  this.queryMediaDetail(params.row.filename);
                };
              } else if (buttonType === 'download') {
                const newDownloadURL = `https://bfban.gametools.network/api/service/file?filename=${params.row.filename}`;
                buttonText = this.$i18n.t('profile.chat.download');
                buttonAction = () => {
                  window.location.href = newDownloadURL;
                };
              }

              return h('Button', {
                props: {
                  loading: params.row.load
                },
                on: {
                  click: buttonAction
                }
              }, buttonText);
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
    handleLoadData(item, callback) {
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
    handlePageChange(num) {
      this.media.skip = num;
      this.getMedia();
    },
    handlePageSizeChange(num) {
      this.media.limit = num;
      this.getMedia();
    },
    /**
     * 全屏查看图片
     * @param image
     */
    openViewImage(name, url) {
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
    queryMediaDetail(name) {
      this.media.selectFileId = name;

      for (let i = 0; i < this.media.list.length; i++) {
        if (this.media.list[i].filename == name)
          this.media.list[i].load = true
      }
      for (let i = 0; i < this.media.list.length; i++) {
        if (this.media.list[i].filename == name) {
          // 修改 downloadURL
          const newDownloadURL = `https://bfban.gametools.network/api/service/file?filename=${this.media.list[i].filename}`;
          this.openViewImage(this.media.list[i].filename, newDownloadURL);
        }
      }
      for (let i = 0; i < this.media.list.length; i++) {
        if (this.media.list[i].filename == name)
          this.media.list[i].load = false
      }
    },
    getButtonType(filename) {
      const extension = filename.split('.').pop().toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
        return 'view';
      } else if (extension === 'zip') {
        return 'download';
      }
      return 'default';
    },
  },
  computed: {
    percentValue() {
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
