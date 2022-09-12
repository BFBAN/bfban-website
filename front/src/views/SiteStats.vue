<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("sitestats.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Col>
        <Card :padding="0" dis-hover>
          <Button @click="loadData" class="sitestats-loading">
            <Icon type="ios-loading" />
          </Button>
          <v-chart class="chart" :option="chart.stats" />

        </Card>

        <Spin size="large" fix v-if="load"></Spin>
      </Col>
      <br>

      <Card dis-hover>
        <Row type="flex" justify="space-between" align="middle">
          <Col span="3">
            <h2>
              {{ statistics.reports || 0 }}
            </h2>
            <span>{{ $t('sitestats.reports') }}</span>
          </Col>
          <Divider type="vertical" />
          <Col span="3">
            <h2><Badge :color="chart.stats.color[0]" />{{ statistics.players || 0 }}</h2>
            {{ $t('sitestats.players') }}
          </Col>
          <Divider type="vertical" />
          <Col span="3">
            <h2>{{ statistics.banAppeals || 0 }}</h2>
            {{ $t('sitestats.banAppeals') }}
          </Col>
          <Divider type="vertical" />
          <Col span="3">
            <h2><Badge :color="chart.stats.color[2]" />{{ statistics.registers || 0 }}</h2>
            <span>{{ $t('sitestats.registers') }}</span>
          </Col>
          <Divider type="vertical" />
          <Col span="3">
            <h2><Badge :color="chart.stats.color[1]" />{{ statistics.confirmed || 0 }}</h2>
            <span>{{ $t('sitestats.confirmed') }}</span>
          </Col>
          <Divider type="vertical" />
          <Col span="3" v-if="admins">
            <h2>{{ admins || 0 }}</h2>
            {{ $t('sitestats.admins') }}
          </Col>
        </Row>
      </Card>
    </div>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";
import * as echarts from  "echarts";

import {http, api, conf} from '../assets/js/index'

export default new BFBAN({
  data () {
    return {
      load: true,
      statistics: { },
      admins: 0,
      chart: {
        'stats': {
          color: ['#fff13c', '#401486', '#ed4014'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#f2f2f2',
                color: '#535353'
              }
            }
          },
          xAxis: {
            type: 'time',
            boundaryGap: true,
            splitLine: {
              show: false,
            }
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '30%'],
            splitLine: {
              show: false,
            }
          },
          series: [],
          grid: { x: -1, y: -1, x2: 0, y2: 30 },
        },
      },
      chartConf: {
        array: [{
          name: "players",
          valName: 'playerStats',
          lineColor: '#fff13c'
        }, {
          name: "confirmed",
          valName: 'confirmStats',
          lineColor: '#401486'
        }, {
          name: "registers",
          valName: 'userStats',
          lineColor: '#ed4014'
        }],
      }
    }
  },
  created () {
    this.loadData();
  },
  methods: {
    async loadData () {
      this.init();

      this.load = true;

      await this.getSiteStats();
      await this.getStatisticsInfo();

      setTimeout(() => {
        this.load = false;
      }, 1000);
    },
    init () {
      this.chart['stats'].series = [];

      this.chartConf.array.map(i=>{
        this.chart['stats'].series.push({
          name: this.$i18n.t(`sitestats.${i.name}`),
          valName: i.valName,
          type: 'line',
          smooth: true,
          symbol: 'none',
          stack: 'Total',
          showSymbol: true,
          lineStyle: {
            color: i.lineColor,
            width: 2
          },
          markLine: {
            symbol: ['none', 'none'],
            label: { show: false },
            data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }]
          },
          areaStyle: {
            opacity: 1,
            color: i.lineColor
          },
          data: []
        });
      })
    },
    /**
     * 统计信息
     * api/siteStats
     */
    async getSiteStats () {
      http.get(api['siteStats'], {}).then(res => {
        const d = res.data;

        if (d.success == 1) {
          for (const dKey in d.data) {
            this.chart['stats'].series.filter(i => {
              if (i.valName == dKey) {
                d.data[dKey].forEach(t => {
                  i.data.push([t.time, t.num]);
                })
              }
            })
          }
        }
      }).catch((res) => {
        this.$Message.error(res.message);
      });

      return;
    },
    /**
     * 获取统计
     */
    getStatisticsInfo() {
      http.get(api["statistics"], {
        params: {
          reports: true,
          players: true,
          confirmed: true,
          registers: true,
          banAppeals: true,
          admins: true,
          from: new Date('2018-01-01').getTime()
        }
      }).then((res) => {
        const d = res.data;
        if (d.success == 1) {
          this.statistics = d.data;
        }
      }).finally(() => {
        this.getAdmins();
      });

      return;
    },
    /**
     * 管理
     */
    getAdmins() {
      http.get(api["admins"], {}).then((res) => {
        const d = res.data;

        if (d.success == 1) {
          this.admins = d.data.length;
        }
      })
    }
  }
});
</script>

<style scoped>
.chart {
  height: 300px;
}

.sitestats-loading {
  position: absolute;
  z-index: 10;
  top: 10px;
  left: 10px;
}

.sitestats-avatar {
  position: relative;
  padding-top: 30px;
  padding-left: 40px;
}

.sitestats-avatar span {
  margin-left: -15px;
  margin-bottom: 10px;
  box-shadow: 0 0 10px #00000017;
}
</style>