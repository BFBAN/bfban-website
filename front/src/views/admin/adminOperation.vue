<template>
  <div>
    <div><DatePicker type="datetimerange" v-model="date" format="yyyy-MM-dd" placeholder="Select date and time" style="width: 300px" @on-ok="change" /></div>
    <br />
    <Row type="flex" align="middle">
      <Col flex="auto" :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
        <RadioGroup
            class="game-type"
            v-model="gameName"
            type="button">
          <Radio label="bf1">
            bf1
          </Radio>
          <Radio label="bfv">
            bfv
          </Radio>
          <Radio label="bf6">
            bf2042
          </Radio>
        </RadioGroup>
      </Col>
    </Row>
    <br />
    <Row type="flex" align="middle">
      <Col flex="auto" :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
        <RadioGroup
            class="game-type"
            v-model="adminId"
            type="button">
          <Radio v-for="i in adminTab" :key="i.byUserId" :label="i.byUserId">
            {{ i.username }} - [{{i[gameName]}}] - ({{i.scale}}%) 
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
                <a href="javascript:void(0)">{{i.originName}} ({{i.toOriginPersonaId}})</a>
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
      util,
      gameName: 'bf1'
    }
  },
  components: {BusinessCard},
  created() {
    this.http = http_token.call(this);
  },
  computed: {
    adminLogs() {
      return this.currentlog.filter(item => item.byUserId == this.adminId)
    },
    currentlog() {
      return this.log.filter(item => item.games[0] == this.gameName)
    },
    adminTab() {
      let { admin, currentlog, gameName } = this
      const length = currentlog.length
      return admin.sort((a, b) => b[gameName] - a[gameName]).map(item => {
        return { ...item, scale: parseInt(item[gameName] * 100 / length) }
      }).filter(item => item.scale > 5)
    }
  },
  methods: {
    loadData({ createTimeto, createTimeFrom }) {
      this.http.get(api['adminLog'], {
        params: {
          createTimeFrom, createTimeto
        }
      }).then(res => {
        const { data } = res.data
        const admin = []
        const log = data.filter(item => !item.privilege.includes('super'))
        log.forEach(item => {
          const index = admin.findIndex(i => i.byUserId == item.byUserId)
          const game = item.games[0]
          if(index == -1) {
            admin.push({ ...item, username: item.username, byUserId: item.byUserId, [game]: 1})
          } else if(!admin[index][game]) {
            admin[index][game] = 1
          } else {
            admin[index][game]++
          }
        })
        this.admin = admin
        this.log = log
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