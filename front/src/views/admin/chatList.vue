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
              :total="total"/>
      </Col>
      <Col>
        <Button size="small" @click="getChatLog">
          <Icon type="md-refresh" :class="load ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>
    <br>

    <div>
      <template v-if="chatList.length > 0">
        <div v-for="(i, index) in chatList" :key="index">
          <div class="ivu-card ivu-card-bordered ivu-card-dis-hover">
            <div class="ivu-card-head">
              <Tag>Log</Tag>
              <Tag>{{ i.type }}</Tag>
              <Time :time="i.createTime" type="date"></Time>
              :
              <BusinessCard :id="i.byUserId" :showAdminUserInfo="true">
                <b>{{ i.byUserId || 'N/A' }}</b>
              </BusinessCard>
              ->
              <BusinessCard :id="i.byUserId" :showAdminUserInfo="true">
                <b>{{ i.toUserId || 'N/A' }}</b>
              </BusinessCard>
              <div class="ivu-card-extra">
                {{ $t(`profile.chat.tabsList.form.${i.haveRead == 1 ? 'read' : 'unread'}`) }}
              </div>
            </div>
            <Html :html="i.content"></Html>
          </div>
          <br>
        </div>
      </template>
      <template v-else>
        {{ $t('basic.tip.notContent') }}
      </template>
    </div>

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
import BusinessCard from "@/components/businessCard";
import Html from "@/components/Html"
import {api, http_token} from "@/assets/js";

export default {
  name: "chat",
  data() {
    return {
      load: false,
      chatList: [],
      limit: 20,
      skip: 1,
      total: 0,
    }
  },
  components: {BusinessCard, Html},
  created() {
    this.http = http_token.call(this);

    this.getChatLog();
  },
  methods: {
    // 获取全站聊天
    getChatLog() {
      if (this.load) return;
      this.load = true;

      this.http.get(api['admin_chatLog'], {
        params: {
          limit: this.limit,
          skip: this.skip,
          total: this.total,
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          d.data.forEach(i => i.content = `<p>${i.content }</p>`)

          this.chatList = d.data;
          this.total = d.total;
          return;
        }

        this.$Message.error(d);
      }).finally(() => {
        this.load = false;
      });
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getChatLog();
    },
    handlePageChange(num) {
      this.skip = num;
      this.getChatLog();
    }
  }
}
</script>
