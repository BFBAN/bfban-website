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

      <Row>
        <Col span="8">
          <div>
            <h1>11</h1>
            <span>社区共计已举报</span>
          </div>
          <Row>
            <Col span="5">
              <h2>1</h2>
              举报数
            </Col>
            <Divider type="vertical"/>
            <Col span="5">
              <h2>233</h2>
              已确认作弊
            </Col>
            <Divider type="vertical"/>
            <Col span="5">
              <h2>233</h2>
              申诉数
            </Col>
          </Row>
        </Col>
        <Col span="16">
          <Card :padding="0" dis-hover>
            <v-chart class="chart" :option="option" />
          </Card>
        </Col>
      </Row>

      <br/>

      <Row>
        <Col span="8">
          <div>
            <h1>11</h1>
            <span>社区注册用户</span>
          </div>
        </Col>
        <Col span="16">
          <Card :padding="0" dis-hover>
            <v-chart class="chart" :option="option" />
          </Card>
        </Col>
      </Row>

      <br/>

      <Row>
        <Col span="8">
          <div>
            <h1>12331</h1>
            <span>社区管理已处理案件</span>
          </div>
          <Row>
            <Col>
              <h2>31</h2>
              总共管理员数
            </Col>
          </Row>
        </Col>
        <Col span="16">
          <Card :padding="0" dis-hover>
            <v-chart class="chart" :option="option" />
          </Card>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";
import "echarts";

import {http, api, conf} from '../assets/js/index'

export default new BFBAN({
  data () {
    return {
      option: {
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '30%']
        },
        visualMap: {
          type: 'piecewise',
          show: false,
          dimension: 0,
          seriesIndex: 0,
          pieces: [
            {
              gt: 1,
              lt: 3,
              color: 'rgba(180,180,180,0.07)'
            },
            {
              gt: 5,
              lt: 7,
              color: 'rgba(105,105,105,0.4)'
            }
          ]
        },
        series: [
          {
            name: 'Line 1',
            type: 'line',
            smooth: 0.6,
            symbol: 'none',
            lineStyle: {
              color: '#5470C6',
              width: 2
            },
            markLine: {
              symbol: ['none', 'none'],
              label: { show: false },
              data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }]
            },
            areaStyle: {},
            data: [
              ['2019-10-10', 200],
              ['2019-10-11', 560],
              ['2019-10-12', 750],
              ['2019-10-13', 580],
              ['2019-10-14', 250],
              ['2019-10-15', 300],
              ['2019-10-16', 450],
              ['2019-10-17', 300],
              ['2019-10-18', 100]
            ]
          },
          {
            name: 'Line 2',
            type: 'line',
            smooth: 0.6,
            symbol: 'none',
            lineStyle: {
              color: '#f2f2f2',
              width: 2
            },
            markLine: {
              symbol: ['none', 'none'],
              label: { show: false },
              data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }]
            },
            areaStyle: {},
            data: [
              ['2019-10-10', 400],
              ['2019-10-11', 560],
              ['2019-10-12', 750],
              ['2019-10-13', 580],
              ['2019-10-14', 250],
              ['2019-10-15', 300],
              ['2019-10-16', 450],
              ['2019-10-17', 300],
              ['2019-10-18', 100]
            ]
          }
        ],
        grid: {
          x: 0,
          y: -1,
          x2: 0,
          y2: 0
        },
      }
    }
  },
  methods: {
    /**
     * todo
     * api/siteStats
     */
    getSiteStats () {

    }
  }
});
</script>

<style scoped>
.chart {
  height: 200px;
}
</style>