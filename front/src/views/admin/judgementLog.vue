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
        <Button size="small" @click="getAdminjudgementLog" :loading="load">{{ $t('basic.button.submit') }}</Button>
      </Col>
    </Row>
    <br>

    <Card dis-hover :padding="5">
      <template v-if="judgementLog.length > 0" >
        <div v-for="(i, index) in judgementLog" :key="index">
          <Row type="flex" align="middle" @click.native="$router.push({name: 'player', params: {ouid: i.toOriginPersonaId}})">
            <Col>
              <Tag>Log</Tag>
            </Col>
            <Col flex="1">
              <div>
                <Time :time="i.createTime" type="date"></Time>:
                <BusinessCard :id="i.byUserId">
                  <b>{{i.username}}</b>
                </BusinessCard>
                <span> {{ $t('detail.info.judge') }} </span>
                <a href="javascript:void(0)">{{i.toOriginPersonaId}}</a>
                <span> {{i.cheatMethods.toString()}} {{ $t(`basic.action.${util.queryAction(i.judgeAction)}.text`) }}</span>
              </div>
            </Col>
            <Col>
              <router-link :to="{name: 'player', params: {ouid: i.toOriginPersonaId}}">
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
          :total="total" />
  </div>
</template>

<script>
import {api, util, http, http_token} from "../../assets/js";

import BusinessCard from "@/components/businessCard";

export default {
  data () {
    return {
      util,

      load: false,
      judgementLog: [],
      limit: 100,
      skip: 1,
      total: 0,
    }
  },
  components: {BusinessCard},
  created() {
    this.http = http_token.call(this);

    this.getAdminjudgementLog();
  },
  methods: {
    getAdminjudgementLog () {
      if (this.load) return;
      this.load = true;

      this.http.get(api['admin_judgementLog'], {
        params: {
          limit: this.limit,
          skip: this.skip,
          total: this.total,
        }
      }).then(res => {
        const d = res.data;
        if (d.success == 1) {
          this.judgementLog = d.data;
          this.total = d.total;
        }
      }).finally(() => {
        this.load = false;
      });
    },
    handlePageSizeChange (val) {
      this.limit = val;
      this.getAdminjudgementLog();
    },
    handlePageChange (val) {
      this.skip = val;
      this.getAdminjudgementLog();
    }
  }
}
</script>