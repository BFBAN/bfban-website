<template>
  <div>
    <Row :gutter="20">
      <Col flex="1"></Col>
      <Col>
        <Poptip ref="filesPoptip" placement="bottom-end" trigger="click" width="400" popper-class="files-poptip"
                :padding="'20px 30px'">
          <Button>
            <Icon type="md-funnel" size="15"/>
          </Button>
          <Form ref="filesFunnel" label-position="top" slot="content">
            <FormItem label="User dbId">
              <Input type="text" v-model="userId" placeholder="input user dbId"></Input>
            </FormItem>
            <FormItem label="Create Time Radiu">
              <DatePicker type="daterange"
                          split-panels
                          @on-change="handleCDatepicker"
                          :placeholder="'createTime'"></DatePicker>
            </FormItem>
            <Row :gutter="10">
              <Col>
                <Button @click="resetFormData">{{ $t('basic.button.reset') }}</Button>
              </Col>
              <Col>
                <Button @click="subimtFormData" type="primary" :disabled="deleteFileLoading">
                  {{ $t('basic.button.commit') }}
                </Button>
              </Col>
            </Row>
          </Form>
        </Poptip>
      </Col>
    </Row>
    <br>

    <Row :gutter="20">
      <Col flex="1">
        <Page class="page"
              size="small"
              show-sizer
              show-total
              show-elevator
              @on-change="handlePageChange"
              @on-page-size-change="handlePageSizeChange"
              :page-size="limit"
              :current="skip"
              :total="total"/>
      </Col>
      <Col>
        <Button size="small" @click="getFiles">
          <Icon type="md-refresh" :class="filesLoading ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>
    <br>

    <Card dis-hover>
      <div v-if="files.length > 0">
        <div v-for="(i, index) in files" :key="index">
          <Row>
            <Col>
              <Tag>file</Tag>
            </Col>
            <Col flex="1">
              <p><b>{{ i.filename }}</b></p>
              <div>
                <Time :time="i.createTime" :type="'datetime'"></Time>
                <Divider type="vertical"/>
                <BusinessCard :id="i.byUserId">
                  <router-link :to="{name:'space', params: { uId: i.byUserId }}">{{ i.byUserId }}</router-link>
                </BusinessCard>
              </div>
            </Col>
            <Col>
              <Button @click="deleteFileItem(i.filename)">
                <Icon type="md-trash"/>
              </Button>
            </Col>
          </Row>
        </div>
      </div>
      <Empty v-else></Empty>
    </Card>

    <br>
    <Page class="page"
          size="small"
          show-sizer
          show-total
          show-elevator
          @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange"
          :page-size="limit"
          :current="skip"
          :total="total"/>
  </div>
</template>

<script>
import {api, util, http_token} from "../../assets/js";
import Empty from "@/components/Empty.vue";
import BusinessCard from "@/components/BusinessCard.vue";

export default {
  data() {
    return {
      util,

      deleteFileLoading: false,
      filesLoading: false,
      files: [],
      userId: "",
      createTimeFrom: 0,
      createTimeTo: 0,
      timeOptions: {
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        },
        shortcuts: [
          {
            text: this.$i18n.t('sitestats.timeRange.daily'),
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              return [start, end];
            }
          },
          {
            text: this.$i18n.t('sitestats.timeRange.weekly'),
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          },
          {
            text: this.$i18n.t('sitestats.timeRange.monthly'),
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          },
          {
            text: this.$i18n.t('sitestats.timeRange.yearly'),
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30 * 12);
              return [start, end];
            }
          }
        ]
      },

      limit: 40,
      skip: 1,
      total: 0,
    }
  },
  components: {BusinessCard, Empty},
  created() {
    this.http = http_token.call(this);

    this.getFiles();
  },
  methods: {
    /**
     * 获取文件列表
     */
    getFiles() {
      let fromData = {
        limit: this.limit,
        skip: (this.skip - 1) * this.limit,
        data: {}
      };

      if (this.filesLoading) return;
      if (this.userId) fromData.data.userId = this.userId;
      if (this.createTimeFrom) fromData.data.createTimeFrom = this.createTimeFrom;
      if (this.createTimeTo) fromData.data.createTimeTo = this.createTimeTo;

      this.filesLoading = true;
      this.http.post(api['service_files'], {data: fromData}).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.files = d.data;
          this.total = d.total;
        }
      }).finally(() => {
        this.filesLoading = false;
      });
    },
    /**
     * 删除文件
     */
    deleteFileItem(filename) {
      if (this.deleteFileLoading) return;

      this.deleteFileLoading = true;

      this.http.delete(api['service_file'], {data: {filename: filename}}).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.$Message.success("error");
          return;
        }

        this.$Message.error(d.message || d.code);
      }).finally(() => {
        this.deleteFileLoading = false;
      });
    },
    resetFormData() {
      this.userId = "";
      this.createTimeFrom = 0;
      this.createTimeTo = 0;

      this.$refs["filesPoptip"].handleClose();
      this.$refs["filesFunnel"].resetFields();
    },
    subimtFormData() {
      this.getFiles();
      this.resetFormData();
    },
    handleCDatepicker(date) {
      this.createTimeFrom = new Date(date[0]).getTime();
      this.createTimeTo = new Date(date[1]).getTime();

      this.skip = 1;
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getFiles();
    },
    handlePageChange(num) {
      this.skip = num;
      this.getFiles();
    }
  }
}
</script>

<style lang="less">
.files-poptip .ivu-poptip-body-content {
  overflow: inherit !important;
}
</style>
