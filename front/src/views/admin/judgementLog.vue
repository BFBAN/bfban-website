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
            <Row :gutter="10">
              <Col flex="1">
                <FormItem label="Search Type">
                  <Select v-model="searchTypeValue">
                    <Option v-for="(i, index) in searchType" :key="index" :value="i">{{ i }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col flex="1">
                <FormItem label="Search">
                  <Input type="text" v-model="searchValue" :placeholder="`input ${searchType.toString()}`"></Input>
                </FormItem>
              </Col>
            </Row>
            <FormItem label="Create Time Radiu">
              <DatePicker type="daterange"
                          split-panels
                          @on-change="handleCDatepicker"
                          :placeholder="'createTime'"
                          format="yyyy-MM-dd"
                          value-format="yyyy-MM-dd"
              ></DatePicker>
            </FormItem>
            <Row :gutter="10">
              <Col>
                <Button @click="resetFormData">{{ $t('basic.button.reset') }}</Button>
              </Col>
              <Col>
                <Button @click="subimtFormData" type="primary" :disabled="judgementLog.load">
                  {{ $t('basic.button.commit') }}
                </Button>
              </Col>
            </Row>
          </Form>
        </Poptip>
      </Col>
    </Row>
    <br>
    <Row>
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
        <Button size="small" @click="getAdminJudgementLog">
          <Icon type="md-refresh" :class="load ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>
    <br>

    <Card dis-hover :padding="5">
      <template v-if="judgementLog.length > 0">
        <div v-for="(i, index) in judgementLog" :key="index">
          <Row type="flex" align="middle"
               @click.native="$router.push({name: 'player', params: {ouid: i.toOriginPersonaId}, query: {byPath: $route.name}, hash: '#floor-' + i.id})">
            <Col>
              <Tag>Log</Tag>
            </Col>
            <Col flex="1">
              <div>
                <Time :time="i.createTime" type="date"></Time>
                :
                <BusinessCard :id="i.byUserId" :showAdminUserInfo="true">
                  <b>{{ i.username }}</b>
                </BusinessCard>
                <span> {{ $t('detail.info.judge') }} </span>
                <a href="javascript:void(0)" target="_blank">{{ i.toOriginPersonaId }}</a>
                <span> {{ i.cheatMethods.toString() }} {{
                    $t(`basic.action.${util.queryAction(i.judgeAction)}.text`)
                  }}</span>
              </div>
            </Col>
            <Col>
              <router-link :to="{name: 'player', params: {ouid: i.toOriginPersonaId}, query: {byPath: $route.name}}" target="_blank" @click.native.stop="$router.resolve({name: 'player', params: {ouid: i.toOriginPersonaId}, query: {byPath: $route.name}}).href && window.open($router.resolve({name: 'player', params: {ouid: i.toOriginPersonaId}, query: {byPath: $route.name}}).href, '_blank')">
                <Icon type="ios-eye" size="25"/>
              </router-link>
            </Col>
          </Row>
        </div>
      </template>
      <template v-else>
        {{ $t('basic.tip.notContent') }}
      </template>
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
import {api, http_token, util} from "../../assets/js";

import BusinessCard from "@/components/BusinessCard.vue";

export default {
  data() {
    return {
      load: false,
      judgementLog: [],
      searchTypeValue: "userId",
      searchType: ['userId', 'userName', 'dbId'],
      searchValue: "",
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
      currentFilters: {
        searchTypeValue: null,
        searchValue: null,
        createTimeFrom: null,
        createTimeTo: null
      },

      limit: 40,
      skip: 1,
      total: 0,
    }
  },
  created() {
    this.http = http_token.call(this);

    this.getAdminJudgementLog();
  },
  watch: {
    $route: "getAdminJudgementLog"
  },
  components: {BusinessCard},
  methods: {
    /**
     * 获取判决日志
     */
    getAdminJudgementLog() {
      let {value, type, date} = this.$route.query;
      if (value) this.searchValue = value.toString();
      if (type) this.currentFilters.searchTypeValue = type;
      if (date) {
        this.currentFilters.createTimeFrom = new Date(date.split(',')[0]).getTime();
        this.currentFilters.createTimeTo = new Date(date.split(',')[1]).getTime();
      }

      if (!value || !type || !date)
        this.setFilters();  // 使用当前的筛选条件

      let fromData = {
        limit: this.limit,
        skip: (this.skip - 1) * this.limit,
      };

      this.load = true;

      if (this.currentFilters.searchTypeValue === 'userId' && this.currentFilters.searchValue) fromData.userId = this.currentFilters.searchValue;
      if (this.currentFilters.searchTypeValue === 'userName' && this.currentFilters.searchValue) fromData.userName = this.currentFilters.searchValue;
      if (this.currentFilters.searchTypeValue === 'dbId' && this.currentFilters.searchValue) fromData.dbId = this.currentFilters.searchValue;
      if (this.currentFilters.createTimeFrom) fromData.createTimeFrom = this.currentFilters.createTimeFrom;
      if (this.currentFilters.createTimeTo) fromData.createTimeTo = this.currentFilters.createTimeTo;

      this.http.post(api['admin_judgementLog'], {data: fromData}).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.judgementLog = d.data;
          this.total = d.total; // 确保每次请求后都更新total值
        }
      }).finally(() => {
        this.load = false;
      });
    },
    resetFormData() {
      this.searchValue = "";
      this.createTimeFrom = 0;
      this.createTimeTo = 0;

      this.$refs["filesPoptip"].handleClose();
      this.$refs["filesFunnel"].resetFields();
    },
    subimtFormData() {
      this.skip = 1;  // 重置页码
      this.getAdminJudgementLog();
    },
    handleCDatepicker(date) {
      this.createTimeFrom = new Date(date[0]).toISOString();
      this.createTimeTo   = new Date(date[1]).toISOString();
      this.skip = 1;
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getAdminjudgementLog();
    },
    handlePageChange(num) {
      this.skip = num;
      this.getAdminjudgementLog();
    },
    setFilters() {
      this.currentFilters = {
        searchTypeValue: this.searchTypeValue,
        searchValue: this.searchValue,
        createTimeFrom: this.createTimeFrom,
        createTimeTo: this.createTimeTo
      };
    },

  },
  computed: {
    util: () => util,
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/css/icon.less";

</style>
