<template>
  <div>
    <Row :gutter="30">
      <Col flex="1">
        <Input v-model="userValue"
               type="text"
               search
               enter-button
               @on-enter="getAdminjudgementLog"
               @on-search="getAdminjudgementLog"
               placeholder="input user name"/>
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
        <Button size="small" @click="getAdminjudgementLog">
          <Icon type="md-refresh" :class="load ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>

    <br>

    <Card dis-hover :padding="5">
      <template v-if="operationLogs.length > 0">
        <div v-for="(i) in operationLogs" :key="i.id">
          <Row type="flex" align="middle">
            <Col flex="1">
              <div>
                <Time :time="i.createTime" type="date"></Time>
                :
                <BusinessCard :id="i.byUserId">
                  <b>{{ i.adminName }}</b>
                </BusinessCard>
                &nbsp;<Tag> {{ i.action }}</Tag>&nbsp;
                <a href="javascript:void(0)">{{ i.userName }}</a>
                &nbsp;<Tag>{{ i.role }}</Tag>&nbsp;
              </div>
            </Col>
          </Row>
        </div>
      </template>
      <template v-else>
        {{ $t('basic.tip.notContent') }}
      </template>
    </Card>
  </div>
</template>

<script>
import {api, http, http_token} from "../../assets/js";

import BusinessCard from "@/components/businessCard";

export default {
  data() {
    return {
      load: false,
      operationLogs: [],
      userValue: '',

      skip: 1,
      limit: 40,
      order: 'desc',
      total: 0,
    }
  },
  components: {BusinessCard},
  created() {
    this.http = http_token.call(this);

    this.getAdminjudgementLog();
  },
  methods: {
    getAdminjudgementLog() {
      if (this.load) return;
      this.load = true;

      this.http.get(api['admin_userOperationLogs'], {
        params: {
          name: this.userValue,
          skip: this.skip - 1,
          limit: this.limit,
          order: this.order,
        }
      }).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.operationLogs = d.data;
        }
      }).finally(() => {
        this.load = false;
      });
    }
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/css/icon.less";

</style>
