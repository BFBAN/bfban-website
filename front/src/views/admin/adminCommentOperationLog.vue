<template>
  <div>
    <Form>
      <FormItem>
        <Row :gutter="10">
          <Col>
            <DatePicker type="datetimerange"
                        :options="timeOptions"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        v-model="date"
                        @on-ok="dateChange"/>
          </Col>
          <Col flex="1" align="right">
            <RadioGroup
                class="game-type"
                v-model="gameName"
                type="button">
              <Radio label="all" value="all" disabled>
                {{ $t('basic.games.all') }}
              </Radio>
              <Radio :label="i.value" :disabled="i.disabled" v-for="i in games" :key="i.value" aria-radio
                     :style="'background-image: url(' + require('/src/assets/' + i.bk_file + '/bf.jpg') + ');'"
                     :class="gameName === i.value ? 'game-type-select' : ''">
                <Tooltip :content="$t('basic.games.' + i.value)" placement="top-start">
                  <img height="35" :src="require('/src/assets/' + i.bk_file + '/logo.png')" v-if="i.logo_src"/>
                  <span v-else>{{ i.full_name }}</span>
                </Tooltip>
              </Radio>
            </RadioGroup>
          </Col>
        </Row>
      </FormItem>

      <FormItem v-if="adminTab.length > 0">
        <RadioGroup
            class="game-type"
            v-model="adminId"
            type="button">
          <Radio v-for="i in adminTab" :key="i.byUserId" :label="i.byUserId">
            {{ i.username }} - [{{ i.count }}] - ({{ i.scale }}%)
          </Radio>
        </RadioGroup>
      </FormItem>
    </Form>

    <Card dis-hover :padding="5">
      <template v-if="adminLogs.length > 0">
        <div v-for="(i, index) in adminLogs" :key="index">
          <Row type="flex" align="middle"
               @click.native="$router.push({name: 'player', params: {ouid: i.toOriginPersonaId}, query: {byPath: $route.name}})">
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

                {{ $t('detail.info.judge') }}

                <ExposedName>
                  <a href="javascript:void(0)">{{ i.originName }} ({{ i.toOriginPersonaId }})</a>
                </ExposedName>

                {{ i.cheatMethods.toString() }} {{$t(`basic.action.${util.queryAction(i.judgeAction)}.text`) }}
              </div>
            </Col>
            <Col>
              <router-link :to="{name: 'player', params: {ouid: i.toOriginPersonaId}, query: {byPath: $route.name}}" target="_blank">
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
  </div>
</template>

<script>
import {api, application, http_token, util} from "@/assets/js";

import BusinessCard from "@/components/BusinessCard";

export default new application({
  data() {
    return {
      load: false,
      log: [],
      admin: [],
      adminId: '',
      date: [],
      total: '',
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
      gameName: 'bf1',
      games: [],
    }
  },
  components: {BusinessCard},
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);

    this.loadData();
  },
  methods: {
    async loadData() {
      await util.initUtil().then(res => {
        this.games = res.gameName;
      });

      // this.getAdminLog()
    },
    getAdminLog({createTimeto, createTimeFrom} = {}) {
      let _params = {};

      // if (!this.load) return;
      this.load = true;

      if (createTimeto) _params['createTimeto'] = createTimeto;
      if (createTimeFrom) _params['createTimeFrom'] = createTimeFrom;
      _params['limit'] = 20
      _params['game'] = this.gameName
      this.http.get(api['admin_adminLog'], {
        params: _params
      }).then(res => {
        const {data} = res.data

        this.admin = data.stats
        this.log = data.details
        this.total = data.total
        this.adminId = this.admin[0] ? this.admin[0].byUserId : 0
      }).finally(() => {
        this.load = false;
      })
    },
    dateChange(e) {
      const start = this.date[0]
      const end = this.date[1]
      this.getAdminLog({createTimeFrom: start, createTimeto: end})
    },
  },
  computed: {
    util: () => util,
    adminLogs() {
      return this.currentlog.filter(item => item.byUserId == this.adminId)
    },
    currentlog() {
      return this.log.filter(item => item.games[0] == this.gameName)
    },
    adminTab() {
      let {admin, currentlog, gameName, total} = this
      const length = total
      return admin
          .sort((a, b) => b.count - a.count)
          .map(item => ({
            ...item,
            scale: Math.floor(item.count * 100 / length)
          }))
          .filter(item => item.scale > 1);
    }
  },
})
</script>
