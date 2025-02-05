<template>
  <div>
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
        <Button size="small" @click="getVerifications">
          <Icon type="md-refresh" :class="load ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>
    <br>

    <template v-if="verificationList.length > 0">
      <Card dis-hover v-for="(i, index) in verificationList" :key="index" class="interval-card">
        <Form>
          <Row :gutter="10">
            <Col :lg="{span: 5}">
              <template v-if="i.type == 'reset'">
                <BusinessCard :id="i.userId">
                  <b>{{ i.userId }}</b>
                </BusinessCard>
              </template>
              <template v-else-if="i.type == 'register'">
                <b v-if="i.username">{{ i.username }}</b>
                <template v-if="i.userId">({{ i.userId }})</template>
              </template>
              <p>
                <Tag type="border">{{ i.type }}</Tag>
              </p>
            </Col>
            <Col :lg="{span:9}">
              <Input v-model="i.uniqCode" show-word-limit readonly type="textarea" :autosize="{min: 1, max: 4}"/>

              <HtmlLink :href="handlerLink(i.type,i.uniqCode)" :text="`✋🏻Activate ${i.type} code`"
                        :isPoptip="false"></HtmlLink>
            </Col>
            <Col :lg="{span: 4}">
              <FormItem label="expires Time">
                <TimeView :time="i.expiresTime">
                  <Time :time="i.expiresTime"></Time>
                </TimeView>
              </FormItem>
            </Col>
            <Col :lg="{span: 6}">
              <FormItem label="create Time">
                <TimeView :time="i.createTime">
                  <Time :time="i.createTime" type="datetime"></Time>
                </TimeView>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
    </template>
    <Card dis-hover v-else>
      <Empty></Empty>
    </Card>

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
    </Row>
    <br>
  </div>
</template>

<script>
import {api, http_token} from "@/assets/js";

import Empty from "@/components/Empty";
import BusinessCard from "@/components/BusinessCard";
import TimeView from "@/components/TimeView";
import HtmlLink from "@/components/HtmlLink";

export default {
  name: "verifications",
  components: {HtmlLink, TimeView, BusinessCard, Empty},
  data() {
    return {
      verificationList: [],
      load: false,

      limit: 40,
      skip: 1,
      total: 0
    }
  },
  created() {
    this.http = http_token.call(this);

    this.getVerifications()
  },
  methods: {
    /**
     * 获取验证码
     */
    getVerifications() {
      this.load = true;
      this.http.get(api['admin_verifications'], {
        params: {
          limit: this.limit,
          skip: (this.skip - 1) * this.limit,
          total: this.total,
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.verificationList = d.data;
          this.total = d.total;
        }
      }).finally(() => {
        this.load = false;
      });
    },
    /**
     * 处理链接地址
     * @param type
     * @param code
     * @returns {string}
     */
    handlerLink(type, code) {
      switch (type) {
        case 'register':
          return window.location.origin + this.$router.resolve({
            name: 'registerVerification', query: {
              code,
              lang: 'en'
            }
          }).href
        case 'reset':
          return window.location.origin + this.$router.resolve({
            name: 'forgetPasswordVerify', query: {
              code,
              lang: 'en'
            }
          }).href
        case 'binding':
          return window.location.origin + this.$router.resolve({
            name: 'bindOrigin', query: {
              code,
            }
          }).href
      }
    },
    handlePageChange(num) {
      this.skip = num;
      this.getVerifications();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getVerifications();
    },
  }
}
</script>

<style ref="less" scoped>
.interval-card {
  margin-bottom: 10px;
}
</style>
