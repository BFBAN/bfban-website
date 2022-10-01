<template>
  <div>
    <div><DatePicker type="datetimerange" v-model="date" format="yyyy-MM-dd" placeholder="Select date and time" style="width: 300px" @on-ok="change" /></div>
    <br />
    <Row type="flex" align="middle">
      <Col flex="auto" :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
        <RadioGroup
            class="game-type"
            v-model="adminId"
            type="button">
          <Radio v-for="i in admin" :key="i.byUserId" :label="i.byUserId">
            {{ i.username }}({{i.times}})
          </Radio>
        </RadioGroup>
      </Col>
    </Row>
    <br />
    <Card dis-hover :padding="5">
      <template v-if="adminLogs.length > 0" >
        <div v-for="(i, index) in adminLogs" :key="index">
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
        {{ $t('basic.tip.notcontent') }}
      </template>
    </Card>
  </div>
</template>

<script>
import {api, http_token, util } from "../../assets/js";

import BusinessCard from "@/components/businessCard";
import BFBAN from "@/assets/js/bfban";

export default new BFBAN({
  data () {
    return {
      log: [],
      admin: [],
      adminId: '',
      date: [],
      util
    }
  },
  components: {BusinessCard},
  created() {
    this.http = http_token.call(this);
  },
  computed: {
    adminLogs() {
      console.log(this.log.filter(item => item.byUserId == this.adminId))
      return this.log.filter(item => item.byUserId == this.adminId)
    }
  },
  methods: {
    loadData({ createTimeto, createTimeFrom }) {
      this.http.get(api['adminLog'], {
        params: {
          createTimeFrom, createTimeto
        }
      }).then(res => {
        const admin = []
        const log = res.data.data.filter(item => !item.privilege.includes('super'))
        log.forEach(item => {
          const index = admin.findIndex(i => i.byUserId == item.byUserId)
          if(index == -1) {
            admin.push({ ...item, username: item.username, byUserId: item.byUserId, times: 1})
          }else {
            admin[index].times++
          }
        })
        this.admin = admin.filter(item => item.times > 5)
        this.log = res.data.data
        this.adminId = this.admin[0] ? this.admin[0].byUserId : 0
      })
    },
    change(e) {
      console.log(e)
      const [start, end] = this.date
      const startTime = new Date(start)
      const endTime = new Date(end)
      
      const createTimeFrom = `${startTime.getFullYear()}-${startTime.getMonth() + 1}-${startTime.getDate()}`
      const createTimeto = `${endTime.getFullYear()}-${endTime.getMonth() + 1}-${endTime.getDate()}`
      this.loadData({ createTimeFrom, createTimeto })
    }
  }
})
</script>