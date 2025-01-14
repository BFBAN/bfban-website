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
              <div class="admin-content">
                <h1>{{ currentUser.userinfo.username }}</h1>
                <p>({{ currentUser.userinfo.userId }})</p>
                <br>
                <p>
                  <PrivilegesTag :data="currentUser.userinfo.privilege"></PrivilegesTag>
                </p>
              </div>

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
                  <v-chart class="chart hot-map" :option="stats.userConfig"/>
                </Col>
                <Col :xs="{span: 24}" :lg="{span: 12}">
                  <Card dis-hover :padding="0" >
                    <v-chart @click="onRatioClick" ref="workingRatio" class="ratio" :option="stats.workingRatioStats"/>

                    <Modal v-model="model.workingRatio.value">
                      <div class="working-ratio-ul">
                        <ul v-if="model.workingRatio.data.users && model.workingRatio.data.users.length > 0">
                          <li v-for="(i, index) in model.workingRatio.data.users" :key="index">
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
                      </div>
                    </Modal>
                  </Card>
                </Col>
                <Col :xs="{span: 24}" :lg="{span: 12}">
                  <Card dis-hover class="inactive-user">
                    <Row :gutter="10" type="flex" align="middle">
                      <Col flex="1">
                        <h2><b>inactive admin</b> ({{ stats.inactiveUserData.length || 0 }}/{{
                            statistics.admins || 0
                          }})</h2>
                      </Col>
                      <Col span="6">
                        <Input placeholder="search value" v-model="stats.inactiveUserSearchValue"
                               class="ivu-mb-8"></Input>
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

import {account_storage, api, http_token} from "@/assets/js";
import echarts from "echarts";

export default new Application({
  name: "profile",
  data() {
    return {
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

      model:{
        workingRatio: {
          value: false,
          data: {}
        }
      },

      statistics: {},
      stats: {
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
              color: ['#0e4429', '#006d32', '#26a641', '#39d353'],
            },
          },
          calendar: [],
          series: []
        },
        userData: {},

        inactiveUserData: [],
        inactiveUserSearchValue: "",

        workingRatioStats: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function (params) {
              return `${params[0].name}：${params[0].data}`;
            }
          },
          grid: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 30
          },
          yAxis: {
            type: 'value',
            show: false
          },
          xAxis: {
            type: 'category',
            data: []
          },
          series: []
        },
        workingRatioData: []
      }
    }
  },
  components: {
    BusinessCard,
    HtmlLink,
    PrivilegesTag,

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
      this.$router.push({name: 'admin', params: {pagename: name}})
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

      this.http.get(api["admin_userStats"], {}).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.stats.userData = d.data.behaviorAdminStats;
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

      })
    },
    generateWorkingRatio() {
      let y = this.stats.userData.reduce((accumulator, item) => {
        const time = item.month;
        if (!accumulator[time]) {
          accumulator[time] = [];
        }
        accumulator[time].push(item);
        return accumulator;
      }, {});

      let tEntries = Object.entries(y), data = [];
      tEntries.slice(tEntries.length - 10, tEntries.length).forEach((value, index, array) => {
        // 创建x轴
        this.stats.workingRatioStats.xAxis.data.push(value[0])
        data.push(value[1].map(j => j.total_count)[0])
      })

      this.stats.workingRatioStats.series.push({
        data: data,
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      })
    },
    onRatioClick(data) {
      console.log(data)
      this.model.workingRatio.value = !this.model.workingRatio.value;
      this.model.workingRatio.data = this.stats.workingRatioData.filter(i => data.name === i.month)[0]
    },
    /**
     * 生成年热力图
     */
    generateYearsHeatMap() {
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
      yEntries.slice(yEntries.length - 3, yEntries.length).forEach((value, index, array) => {
        // 创建实例图
        this.stats.userConfig.calendar.push({
          top: index * 185 + 23,
          range: value[0],
          cellSize: ['auto', 15],
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
    }
  },
  computed: {}
})
</script>

<style lang="less">
@media screen and (min-width: 980px) {
  .admin-menu,
  .admin {
    min-height: 500px;
  }

  .admin-menu {
    height: 100%;
  }
}

.admin-content {
  height: 100%;
  padding: 20px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
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
  }
}

.ratio {
  margin-top: 10px;
  width: calc(100% - 10px);
  min-height: 350px;
}

.chart {
  width: calc(100% - 25px);
  min-height: 500px;
}

.chart.hot-map {
  margin: 20px 5px 10px 5px;
}
</style>
