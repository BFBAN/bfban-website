<template>
  <div>
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
              :total="total" />
      </Col>
      <Col>
        <Button size="small" @click="getAdminMessageLog" :loading="load">
          <Icon type="md-refresh" />
        </Button>
      </Col>
    </Row>
    <br>

    <Card dis-hover :padding="5">
      <template v-if="messageLog.length > 0" >
        <div v-for="(i, index) in messageLog" :key="index">
          <Row type="flex">
            <Col>
              <Tag>Msg</Tag>
              <Tag>{{i.type}}</Tag>
            </Col>
            <Col flex="1">
              <div>
                <Time :time="i.createTime" type="date"></Time>:
                <BusinessCard :id="i.byUserId">
                  <b>{{i.byUserId || 'N/A'}}</b>
                </BusinessCard>
                ->
                <BusinessCard :id="i.byUserId">
                  <b>{{i.toUserId || 'N/A'}}</b>
                </BusinessCard>
                <span> haveRead:{{i.haveRead}} </span>
              </div>
            </Col>
            <Col>
              <div>{{i.content}}</div>
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
          :total="total" />
  </div>
</template>

<script>
import BusinessCard from "@/components/businessCard";
import {api, http_token} from "@/assets/js";

export default {
  name: "messageLog",
  data () {
    return {
      load: false,
      messageLog: [],
      limit: 20,
      skip: 1,
      total: 0,
    }
  },
  components: {BusinessCard},
  created() {
    this.http = http_token.call(this);

    this.getAdminMessageLog();
  },
  methods: {
    getAdminMessageLog () {
      if (this.load) return;
      this.load = true;

      this.http.get(api['admin_messageLog'], {
        params: {
          limit: this.limit,
          skip: this.skip,
          total: this.total,
        }
      }).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.messageLog = d.data;
          this.total = d.total;
        }
      }).finally(() => {
        this.load = false;
      });
    },
    handlePageSizeChange (val) {
      this.limit = val;
      this.getAdminMessageLog();
    },
    handlePageChange (val) {
      this.skip = val;
      this.getAdminMessageLog();
    }
  }
}
</script>

<style lang="less" scoped>

</style>