<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem :to="{name: 'profile', params: {pagename: 'information'}}">{{
              $t("header.profile")
            }}
          </BreadcrumbItem>
          <BreadcrumbItem>{{ $t("profile.admin.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Card dis-hover :padding="0" class="admin">
      <Row :gutter="0">
        <Col :xs="{span: 24}" :sm="{span: 6}">
          <Menu class="admin-menu"
                :mode="isMobile ? 'horizontal' : 'vertical'"
                :width="isMobile ? null : '100%'"
                :open-names="openMuen"
                :active-name="adminMenuValue" @on-select="onMenuActive">

            <MenuItem name="home">
              {{ $t('profile.admin.menu.home') }}
            </MenuItem>

            <MenuGroup :title="isMobile ? null : $t('profile.admin.menu.' + i.title)" v-for="(i, index) in adminMuen"
                       :key="index">
              <MenuItem :name="j.value" v-for="(j, j_index) in i.child" :key="j_index" v-show="j.disabled">
                <Row>
                  <Col flex="1">
                    <Icon :type="j.icon" v-if="j.icon"/>
                    {{ $t('profile.admin.menu.' + j.title) }}
                  </Col>
                  <Col v-if="!j.ignore">
                    <Poptip trigger="hover" transfer>
                      <Icon type="md-help-circle"/>
                      <PrivilegesTag :data="j.privilege" slot="content"></PrivilegesTag>
                    </Poptip>
                  </Col>
                </Row>
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Col>
        <Col :xs="{span: 24}" :sm="{span: 18}" style="padding: 20px">
          <keep-alive>
            <div v-if="adminMenuValue === 'home'">
              <Banner :height="300" class="index-banner profile-right-content ">
                <div class="admin-content">
                  <h1>{{ currentUser.userinfo.username }}</h1>
                  <p>({{ currentUser.userinfo.userId }})</p>
                  <br>
                  <p>
                    <PrivilegesTag :data="currentUser.userinfo.privilege"></PrivilegesTag>
                  </p>
                </div>
              </Banner>

              <Card dis-hover>
                <Row type="flex" justify="space-between" align="middle">
                  <Col :xs="{span: 12}" :lg="{span: 3}">
                    <h2>
                      {{ statistics.reports || 0 }}
                    </h2>
                    <span>{{ $t('sitestats.reports') }}</span>
                  </Col>
                  <Divider type="vertical" class="mobile-hide"/>
                  <Col :xs="{span: 12}" :lg="{span: 3}">
                    <h2>
                      {{ statistics.players || 0 }}
                    </h2>
                    {{ $t('sitestats.players') }}
                  </Col>
                  <Divider type="vertical" class="mobile-hide"/>
                  <Col :xs="{span: 12}" :lg="{span: 3}">
                    <h2>{{ statistics.banAppeals || 0 }}</h2>
                    {{ $t('sitestats.banAppeals') }}
                  </Col>
                  <Divider type="vertical" class="mobile-hide"/>
                  <Col :xs="{span: 12}" :lg="{span: 3}">
                    <h2>
                      {{ statistics.registers || 0 }}
                    </h2>
                    <span>{{ $t('sitestats.registers') }}</span>
                  </Col>
                  <Divider type="vertical" class="mobile-hide"/>
                  <Col :xs="{span: 12}" :lg="{span: 3}">
                    <h2>
                      {{ statistics.confirmed || 0 }}
                    </h2>
                    <span>{{ $t('sitestats.confirmed') }}</span>
                  </Col>
                  <Divider type="vertical" class="mobile-hide"/>
                  <Col :xs="{span: 12}" :lg="{span: 3}">
                    <h2>{{ statistics.admins || 0 }}</h2>
                    {{ $t('sitestats.admins') }}
                  </Col>
                </Row>
              </Card>

              <Row :gutter="10" :wrap="true">
                <Col :lg="{span: 24}">
                  <v-chart @click="(e) => onRatioClick(e, stats.userData)" class="user-chart-op hot-map"
                           :option="stats.userConfig"/>
                </Col>
                <Col :xs="{span: 24}" :lg="{span: 12}">
                  <Card dis-hover :padding="0">
                    <v-chart @click="(e) => onRatioClick(e, stats.workingRatioData)" ref="workingRatio" class="ratio"
                             :option="stats.workingRatioStats"/>

                    <Modal v-model="model.workingRatio.value" footer-hide width="600px">
                      <Row :gutter="10" type="flex" align="middle">
                        <Col flex="1">
                          <h2><b>{{ model.workingRatio.data.title || 'Detail' }}</b></h2>
                        </Col>
                        <Col span="24">
                          <Card dis-hover :padding="0">
                            <v-chart class="statistical-percentage"
                                     :option="stats.statisticalPercentageStats"/>
                          </Card>
                          <br>
                        </Col>
                        <Col span="24">
                          <Row :gutter="20" type="flex" justify="space-between" align="bottom">
                            <Col span="6">
                              <Card dis-hover :padding="4" align="center" v-if="model.workingRatio.data.max">
                                <div>
                                  <BusinessCard :id="model.workingRatio.data.max.id">
                                    <HtmlLink :text="model.workingRatio.data.max.username" :is-poptip="false"
                                              :href="`/space/${model.workingRatio.data.max.id}?username=${model.workingRatio.data.max.username}`"></HtmlLink>
                                    ·
                                    {{ model.workingRatio.data.max.total || 'N/A' }}
                                  </BusinessCard>
                                </div>
                                <b>Max</b>
                              </Card>
                            </Col>
                            <Col span="6">
                              <Card dis-hover :padding="4" align="center">
                                <p>{{
                                    statistics.admins - (model.workingRatio.data.users && model.workingRatio.data.users.length || 0)
                                  }}</p>
                                <b>Have not participated</b>
                              </Card>
                            </Col>
                            <Col span="6">
                              <Card dis-hover :padding="4" align="center">
                                <p>{{
                                    (model.workingRatio.data.users && model.workingRatio.data.users.length || 0)
                                  }}</p>
                                <b>Participate in</b>
                              </Card>
                            </Col>
                            <Col span="6">
                              <Card dis-hover :padding="4" align="center">
                                <p> {{ statistics.admins || 0 }}</p>
                                <b>All personnel</b>
                              </Card>
                            </Col>
                          </Row>
                        </Col>
                        <Col span="24">
                          <br>
                          <Input placeholder="search value" v-model="model.workingRatio.searchValue"
                                 class="ivu-mb-10">
                            <template slot="prefix">
                              <Icon type="ios-search"/>
                            </template>
                          </Input>
                        </Col>
                      </Row>
                      <br/>

                      <div class="working-ratio-ul">
                        <ul v-if="model.workingRatio.data.users && model.workingRatio.data.users.length > 0">
                          <li v-for="(i, index) in model.workingRatio.data.users" :key="index"
                              v-show="i.username.indexOf(model.workingRatio.searchValue) >= 0">
                            <Row :gutter="10" type="flex" align="middle">
                              <Col>
                                <BusinessCard :id="i.id">
                                  <HtmlLink :text="i.username" :is-poptip="false"
                                            :href="`/space/${i.id}?username=${i.username}`"></HtmlLink>
                                </BusinessCard>
                              </Col>
                              <Col flex="1">
                                <Divider dashed style="margin: 0"></Divider>
                              </Col>
                              <Col class="privilege">
                                <HtmlLink
                                    :text="i.total || 0" :is-poptip="false"
                                    :href="`/admin/judgement_log?value=${i.id}&type=userId&date=${model.workingRatio.data.date_as}`">
                                  {{ i.total || 0 }}
                                </HtmlLink>
                              </Col>
                            </Row>
                          </li>
                        </ul>
                      </div>
                    </Modal>
                  </Card>
                </Col>
                <Col :xs="{span: 24}" :lg="{span: 12}">
                  <Card dis-hover class="inactive-user">
                    <Row :gutter="10" type="flex" align="middle">
                      <Col flex="1">
                        <Row type="flex" align="middle">
                          <Col flex="1">
                            <h2>
                              <b>inactive admin</b>
                            </h2>
                          </Col>
                          <Col>
                            <span> ({{ stats.inactiveUserData.length || 0 }}/{{ statistics.admins || 0 }})</span>
                          </Col>
                        </Row>
                      </Col>
                      <Col span="24">
                        <Input placeholder="search value" v-model="stats.inactiveUserSearchValue"
                               class="ivu-mb-10">
                          <template slot="prefix">
                            <Icon type="ios-search"/>
                          </template>
                        </Input>
                      </Col>
                    </Row>
                    <br/>

                    <ul class="sitestats-ul" v-if="stats.inactiveUserData.length > 0">
                      <li v-for="(i, index) in stats.inactiveUserData" :key="index"
                          v-show="i.username.indexOf(stats.inactiveUserSearchValue) >= 0">
                        <Row :gutter="10" type="flex" align="middle">
                          <Col>
                            <BusinessCard :id="i.id">
                              <HtmlLink :text="i.username" :is-poptip="false"
                                        :href="`/space/${i.id}?username=${i.username}`"></HtmlLink>
                            </BusinessCard>
                          </Col>
                          <Col flex="1">
                            <Divider dashed style="margin: 0"></Divider>
                          </Col>
                          <Col class="privilege">
                            <PrivilegesTag :data="i.privilege"></PrivilegesTag>
                          </Col>
                        </Row>
                      </li>
                    </ul>
                  </Card>
                </Col>
              </Row>

              <Spin size="large" fix v-show="load">
                <Icon type="ios-loading" size="50" class="spin-icon-load"></Icon>
              </Spin>
            </div>
            <user v-else-if="adminMenuValue == 'user'"></user>
            <blockedUsers v-else-if="adminMenuValue == 'blockedUsers'"></blockedUsers>
            <muteUsers v-else-if="adminMenuValue == 'muteUsers'"></muteUsers>

            <verifications v-else-if="adminMenuValue == 'verifications'"></verifications>
            <comment v-else-if="adminMenuValue == 'comment'"></comment>

            <chatPush v-else-if="adminMenuValue == 'chat_push'"></chatPush>
            <chatList v-else-if="adminMenuValue == 'chat_list'"></chatList>

            <fileList v-else-if="adminMenuValue == 'file_list'"></fileList>

            <adminOperationLog v-else-if="adminMenuValue == 'admin_operation_log'"></adminOperationLog>
            <messageLog v-else-if="adminMenuValue == 'message_Log'"></messageLog>
            <adminOperation v-else-if="adminMenuValue == 'adminOperation'"></adminOperation>
            <judgementLog v-else-if="adminMenuValue == 'judgement_log'"></judgementLog>
          </keep-alive>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import Application from "@/assets/js/application";

import user from "./user"
import blockedUsers from "@/views/admin/blockedUsers";
import muteUsers from "@/views/admin/muteUsers";
import comment from "./comment"
import verifications from "@/views/admin/verifications";
import adminOperationLog from "./adminSystemOperationLog"
import judgementLog from "@/views/admin/judgementLog";
import adminOperation from "@/views/admin/adminCommentOperationLog";
import chatPush from "@/views/admin/chatPush";
import chatList from "@/views/admin/chatList";
import fileList from "@/views/admin/file.vue"
import PrivilegesTag from "@/components/PrivilegesTag";
import BusinessCard from "@/components/BusinessCard";
import HtmlLink from "@/components/HtmlLink";
import Banner from "@/components/Banner"

import {account_storage, api, http_token} from "@/assets/js";
import echarts from "echarts";

export default new Application({
  name: "profile",
  data() {
    return {
      load: false,

      privileges: [],
      openMuen: ['comment', 'comm', 'log'],
      adminMenuValue: 'home',
      adminMuen: [
        {
          title: 'management',
          child: [
            {
              title: 'user',
              value: 'user',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'blockedUsers',
              value: 'blockedUsers',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'muteUsers',
              value: 'muteUsers',
              disabled: false,
              privilege: ['admin', 'super', 'root', 'dev'],
            },
            {
              title: 'comment',
              value: 'comment',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'verifications',
              value: 'verifications',
              disabled: false,
              privilege: ['root', 'dev'],
            }
          ]
        },
        {
          title: 'fileManagement',
          child: [
            {
              title: 'files',
              value: 'file_list',
              disabled: false,
              privilege: ['root', 'dev'],
            },
          ]
        },
        {
          title: 'messageManagement',
          child: [
            {
              title: 'messagePush',
              value: 'chat_push',
              disabled: false,
              privilege: ['admin', 'super', 'root', 'dev'],
            },
            {
              title: 'messageList',
              value: 'chat_list',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            }
          ]
        },
        {
          title: 'log',
          icon: 'ios-paper',
          child: [
            {
              title: 'judgementLog',
              value: 'judgement_log',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'adminOperationLog',
              value: 'admin_operation_log',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            },
            {
              title: 'adminOperation',
              value: 'adminOperation',
              disabled: false,
              privilege: ['super', 'root', 'dev'],
            }
          ]
        }
      ],

      model: {
        workingRatio: {
          value: false,
          searchValue: "",
          data: {}
        }
      },

      statistics: {},
      stats: {
        // 日历
        userShowRawValue: 4,
        userConfig: {
          tooltip: {
            position: 'top'
          },
          visualMap: {
            min: 0,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            top: -100,
            inRange: {
              color: ['#46E761', '#3DCB55', '#34AE48', '#2B913C', '#237430', '#275423', '#15451D', '#0F3315', '#203918', '#423918', '#7F3918', '#852E14', '#88250F', '#942510', '#B9170A'],
            },
          },
          calendar: [],
          series: []
        },
        userData: {},

        // 不活跃
        inactiveUserData: [],
        inactiveUserSearchValue: "",

        // 柱
        workingRatioStats: {
          tooltip: {
            position: 'top',
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function (params) {
              return `${params[0].name}: <b>${params[0].data}</b>`;
            }
          },
          grid: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 0
          },
          yAxis: {
            type: 'value',
            show: false,
          },
          xAxis: {
            type: 'category',
            data: [],
            interval: 10
          },
          series: []
        },
        workingRatioData: [],

        // 详情-统计
        statisticalPercentageStats: {
          grid: {
            top: '20%',
          },
          series: []
        },
        statisticalPercentageData: {},
      }
    }
  },
  components: {
    BusinessCard,
    HtmlLink,
    PrivilegesTag,
    Banner,

    user,
    blockedUsers,
    muteUsers,
    verifications,
    comment,
    adminOperationLog,
    judgementLog,
    chatPush,
    chatList,
    adminOperation,
    fileList,
  },
  created() {
    const {pagename} = this.$route.params;
    this.http = http_token.call(this);

    if (pagename === undefined) {
      this.onMenuActive('space');
      return;
    }

    for (let i = 0; i < this.adminMuen.length; i++) {
      if (this.adminMuen[i].child)
        for (let j = 0; j < this.adminMuen[i].child.length; j++) {
          if (!this.adminMuen[i].ignore)
            this.adminMuen[i].child[j].disabled = account_storage.checkPrivilegeGroup(
                this.currentUser.userinfo,
                this.adminMuen[i].child[j].privilege
            )
        }
    }

    this.getUserStats();
    this.getStatisticsInfo();
    this.onMenuActive(pagename);
  },
  methods: {
    onMenuActive(name) {
      this.adminMenuValue = name;
      this.$router.push({name: 'admin', params: {pagename: name}, query: {...this.$route.query}})
    },
    /**
     * 获取统计
     */
    getStatisticsInfo() {
      this.http.get(api["statistics"], {
        params: {
          reports: true,
          players: true,
          confirmed: true,
          registers: true,
          banAppeals: true,
          admins: true,
          from: 1514764800000
        }
      }).then(res => {
        const d = res.data;
        if (d.success === 1) {
          this.statistics = d.data;
        }
      });
    },
    /**
     * 获取Admin统计
     */
    getUserStats() {
      if (!this.isAdminL2) return;

      this.load = true;

      this.http.get(api["admin_userStats"], {}).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.stats.userData = d.data.behaviorAdminDayStats;
          this.stats.inactiveUserData = d.data.inactiveAdminStats;
          this.stats.workingRatioData = d.data.behaviorAdminStats;
          this.generateYearsHeatMap();
          this.generateWorkingRatio();
          return;
        }

        this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        }));
      }).finally(() => {
        this.load = false;
      })
    },
    /**
     * 生成日历图
     */
    generateWorkingRatio() {
      this.stats.workingRatioStats.series = [];
      this.stats.workingRatioStats.xAxis.data = [];

      let y = this.stats.workingRatioData.reduce((accumulator, item) => {
        const time = item.month;
        if (!accumulator[time]) {
          accumulator[time] = [];
        }
        accumulator[time].push(item);
        return accumulator;
      }, {});

      let tEntries = Object.entries(y), data = [];
      tEntries.slice(tEntries.length - 20, tEntries.length).forEach((value, index, array) => {
        // 创建x轴
        this.stats.workingRatioStats.xAxis.data.push(value[0])
        data.push(value[1].map(j => j.total_count)[0])
      })

      this.stats.workingRatioStats.series.push({
        data: data,
        type: 'bar',
        barWidth: '95%',
        itemStyle: {
          color: 'rgb(211,201,8)',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'insideBottom',
          distance: 15,
          align: 'left',
          verticalAlign: 'middle',
          rotate: 90,
          formatter: (params) => {
            return `${params.data}`;
          },
          fontSize: 16,
          rich: {
            name: {}
          },
        },
        showBackground: true,
      })
    },
    /**
     * 生成年柱图
     */
    generateYearsHeatMap() {
      this.stats.userConfig.series = [];
      this.stats.userConfig.calendar = [];

      let y = this.stats.userData.reduce((accumulator, item) => {
        const year = item.month.split('-')[0];
        if (!accumulator[year]) {
          accumulator[year] = [];
        }
        accumulator[year].push(item);
        return accumulator;
      }, {});

      // 年分组
      let yEntries = Object.entries(y);
      yEntries.slice(yEntries.length - this.stats.userShowRawValue, yEntries.length).forEach((value, index, array) => {
        // 创建实例图
        this.stats.userConfig.calendar.push({
          top: index * 185 + 23,
          range: value[0],
          cellSize: ['auto', 15],
          itemStyle: {
            borderWidth: 0.5,
            color: "rgba(0, 0, 0, 0)",
            borderColor: 'rgba(141,141,141,0.3)'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(141,141,141,0.3)'
            }
          },
          left: 50,
          right: 0,
        })
        // 创建数据
        this.stats.userConfig.series.push({
          symbol: 'roundRect',
          universalTransition: {
            enabled: true,
            seriesKey: 'calendar',
          },
          type: 'scatter',
          coordinateSystem: 'calendar',
          calendarIndex: index,
          data: value[1].map(t => [t.month, t.total_count])
        })
      })
    },
    /**
     * 生成半圆形统计百分比
     */
    generateStatisticalPercentage(d) {
      if (!d) return;
      let data = d.users.map(i => {
            return {"value": i.total, 'name': i.username}
          }),
          today = new Date(d.month),
          startOfDay = new Date(today).setHours(0, 0, 0, 0).toString(),
          endOfDay = new Date(today).setHours(23, 59, 59, 999).toString();

      d.max = d.users.sort((a, b) => b.total - a.total)[0];
      d.title = d.month;
      d.date_as = `${startOfDay},${endOfDay}`

      this.stats.statisticalPercentageStats.series = [
        {
          type: 'pie',
          radius: ['30%', '100%'],
          center: ['50%', '100%'],
          startAngle: 180,
          endAngle: 360,
          data
        }
      ]
    },
    /**
     * 查看详情
     * @param data
     */
    onRatioClick(data, raw) {
      this.model.workingRatio.value = !this.model.workingRatio.value;
      switch (data.seriesType) {
        case "scatter":
          this.model.workingRatio.data = raw.filter(i => data.data[0] === i.month)[0]
          this.generateStatisticalPercentage(this.model.workingRatio.data)
          break;
        case "bar":
          this.model.workingRatio.data = raw.filter(i => data.name === i.month)[0]
          this.generateStatisticalPercentage(this.model.workingRatio.data)
          break;
      }
    },
  },
  computed: {}
})
</script>

<style lang="less" setup>
@import "@/assets/css/icon";

@media screen and (min-width: 980px) {
  .admin-menu,
  .admin {
    min-height: 500px;
  }

  .admin-menu {
    height: 100%;
  }
}

.index-banner {
  position: relative;
  margin: -20px -20px 20px;

  .index-banner-title {
    font-weight: bold;
  }

  .index-banner-value {
    opacity: .8;
    font-size: 18px;
  }
}

.admin-content {
  height: 100%;
  padding: 20px 0;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.sitestats-ul {
  height: 244px;
  overflow: auto;
}

.working-ratio-ul,
.inactive-user {
  ul {
    padding: 0 0 0 15px;

    .privilege {
      padding-left: 5px;
      padding-right: 5px;
      max-width: 200px;
      max-height: 30px;
      overflow-x: auto;
      white-space: nowrap;
    }

    li {
      margin-bottom: 4px;
    }
  }
}

.ratio {
  margin-top: 0px;
  width: calc(100% - 10px);
  min-height: 360px;
}

.user-chart-op {
  width: calc(100% - 25px);
  min-height: 700px;
}

.user-chart-op.hot-map {
  margin: 20px 5px 10px 5px;
}

.statistical-percentage {
  width: 600px;
  height: 200px;
}
</style>
