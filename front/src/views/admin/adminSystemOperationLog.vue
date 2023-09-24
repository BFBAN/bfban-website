<template>
  <div>
    <Row :gutter="30">
      <Col flex="1">
        <Input v-model="userIdValue"
               search
               type="text"
               enter-button
               @on-enter="getUserOperationLog"
               @on-search="getUserOperationLog"
               placeholder="input user db id"/>
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
        <Button size="small" @click="getUserOperationLog">
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
                <Tag>Log</Tag>
                <Time :time="i.createTime" type="date"></Time>:

                <BusinessCard :id="i.byUserId" :showAdminUserInfo="true">
                  <b>{{ i.username }}</b>
                </BusinessCard>

                &nbsp; action: <Tag> {{ i.action }}</Tag>&nbsp;

                <b>{{ i.toUserId }}</b>

                role: <Tag>{{ i.role }}</Tag>
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
      userIdValue: '',

      skip: 1,
      limit: 40,
      order: 'desc',
      total: 0,
    }
  },
  components: {BusinessCard},
  created() {
    this.http = http_token.call(this);
  },
  methods: {
    handlePageChange(num) {
      this.skip = num;
      this.getBlockedUserAll();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getBlockedUserAll();
    },
    /**
     * 查询用户管理员操作者日志
     */
    getUserOperationLog() {
      if (this.load && !this.userIdValue) return;
      this.load = true;

      this.http.get(api['admin_userOperationLogs'], {
        params: {
          id: this.userIdValue,
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
