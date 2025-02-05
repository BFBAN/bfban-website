<template>
  <div class="profile-body">
    <Alert show-icon type="warning" style="width: 100%">
      {{ $t('profile.media.hint1') }}
    </Alert>

    <Card :padding="0" dis-hover>
      <Row slot="title" :gutter="30">
        <Col flex="1">
          <Button @click="$refs['uploadWidget'].onPanelChange()">
            <Icon type="md-add"></Icon>
          </Button>
          <UploadWidget ref="uploadWidget"
                        :uploadWidgetTypeArray="['upload']"
                        @finish="getMediaList"></UploadWidget>
        </Col>
        <Col span="8" v-if="media.data.usedStorageQuota && media.data.totalStorageQuota">
          <Poptip placement="bottom-end" trigger="hover" width="400">
            {{ $t('profile.media.capacity') }}
            <span>
            {{ onUnitConversion(media.data.usedStorageQuota) }}/{{ onUnitConversion(media.data.totalStorageQuota) }}
            </span>
            <Progress :percent="percentValue"/>
            <div slot="content">
              <Form label-position="left" :label-width="150">
                <FormItem :label="$t('profile.media.maxFileNumber')">
                  <Input :value="media.data.maxFileNumber" size="small" readonly></Input>
                </FormItem>
                <FormItem :label="$t('profile.media.maxTrafficQuota')">
                  <Input :value="onUnitConversion(media.data.maxTrafficQuota)" size="small" readonly></Input>
                </FormItem>
                <FormItem :label="$t('profile.media.usedStorageQuota')">
                  <Row :gutter="10">
                    <Col flex="1">
                      <Input :value="onUnitConversion(media.data.usedStorageQuota)" size="small" readonly>
                      </Input>
                    </Col>
                    <Col>/</Col>
                    <Col flex="1">
                      <Input :value="onUnitConversion(media.data.totalStorageQuota)" size="small" readonly>
                      </Input>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem :label="$t('profile.media.todayFileNumber')">
                  <Input v-model="media.data.todayFileNumber" size="small" readonly></Input>
                </FormItem>
                <FormItem :label="$t('profile.media.todayTrafficQuota')">
                  <Input :value="onUnitConversion(media.data.todayTrafficQuota)" size="small" readonly>
                  </Input>
                </FormItem>
                <FormItem :label="$t('profile.media.prevResetTime')">
                  <TimeView :time="media.data.prevResetTime">
                    <Time :time="media.data.prevResetTime"></Time>
                  </TimeView>
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

      <Spin fix v-show="loadList">
        <Loading></Loading>
      </Spin>
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
import {api, http, http_token} from "@/assets/js";

import VueViewer from 'v-viewer'
import Vue from "vue";

import UploadWidget from "@/components/UploadWidget";
import TimeView from "@/components/TimeView";
import Loading from "@/components/Loading";
import HtmlLink from "@/components/HtmlLink";

import 'viewerjs/dist/viewer.css'

Vue.use(VueViewer);

export default {
  components: {Loading, TimeView, UploadWidget},
  data() {
    return {
      loadList: true,
      loadStatus: true,
      file: {name: ''},
      service_upload: api['service_upload'],
      media: {
        columns: [
          {
            title: 'Name',
            key: 'filename',
            minWidth: 200,
            maxWidth: 400,
            render: (h, params) => {
              return h(HtmlLink, {
                props: {
                  isPoptip: false,
                  text: params.row.filename,
                  href: `${http.location()}service/file?filename=${params.row.filename}`
                }
              })
            }
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
              return h(TimeView, {
                props: {
                  time: params.row.createTime
                }
              }, [
                h('Time', {
                  props: {
                    time: params.row.createTime,
                    type: "datetime"
                  }
                })
              ]);
            }
          },
          {
            key: 'btn',
            render: (h, params) => {
              const buttonType = this.getButtonType(params.row.filename);
              let buttonText = this.$i18n.t('profile.chat.look');
              let buttonAction;

              if (buttonType === 'view') {
                buttonText = this.$i18n.t('profile.chat.look');
                buttonAction = () => {
                  if (params.row.load) return;
                  this.queryMediaDetail(params.row.filename);
                };
              } else if (buttonType === 'download') {
                const newDownloadURL = `${http.location()}service/file?filename=${params.row.filename}`;
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
        limit: 10,
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
      this.loadStatus = true
      this.http.get(api["service_myStorageQuota"], {}).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.media.data = d.data;
        }
        this.loadStatus = false
      })
    },
    /**
     * 查询媒体列表
     */
    getMediaList() {
      this.loadList = true;
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
            size: this.onUnitConversion(i.size),
            children: []
          }));

          this.media.list = d.data;
        }

        this.loadList = false;
      })
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
          const requestUploadName = http.CONF['requestUploadName'],
              getUrlData = http.CONF.child[requestUploadName],
              origin = `${getUrlData.protocol || 'http'}://${getUrlData.host}${getUrlData.pathname}`;

          const newDownloadURL = `${origin}api/service/file?filename=${this.media.list[i].filename}`;
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
    /**
     * Storage unit conversion
     * @param limit
     * @returns {string}
     */
    onUnitConversion(limit) {
      let size = "";
      if (limit < 0.1 * 1024) {
        size = limit.toFixed(2) + "B"
      } else if (limit < 0.1 * 1024 * 1024) {
        size = (limit / 1024).toFixed(2) + "KB"
      } else if (limit < 0.1 * 1024 * 1024 * 1024) {
        size = (limit / (1024 * 1024)).toFixed(2) + "MB"
      } else {
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB"
      }

      var sizeStr = size + "";
      var index = sizeStr.indexOf(".");
      var dou = sizeStr.substr(index + 1, 2)
      if (dou == "00") {
        return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
      }
      return size;
    }
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
