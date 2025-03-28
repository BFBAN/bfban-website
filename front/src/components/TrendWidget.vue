<script>
import {api, application, http} from '@/assets/js'

import Empty from "@/components/Empty.vue"
import HtmlLink from "@/components/HtmlLink.vue"
import Loading from "@/components/Loading.vue";
import ExposedName from "@/components/ExposedName.vue";

export default new application({
  props: {
    timeRange: {
      type: String,
      default: 'weekly'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  components: {Loading, Empty, HtmlLink, ExposedName},
  data() {
    return {
      trend: {
        load: false,
        list: Array.from({length: 10}, (_, index) => {
          return {'hot': 0, 'commentsNum': 0, 'viewNum': 0, 'originName': `🦖 ${index + 1}`, 'originPersonaId': -1}
        }) || []
      },
    }
  },
  created() {
    this.getTrend();
  },
  watch: {
    '$route': 'getTrend',
    'disabled': 'getTrend',
  },
  methods: {
    /**
     * 获取话题排行
     */
    getTrend() {
      if (this.disabled) return;
      this.trend.load = true;

      http.get(api['trend'], {
        params: {
          limit: 10,
          time: this.timeRange
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.trend.list = d.data;
        }
      }).catch(res => {
        this.$Message.error(res.message);
      }).finally(() => {
        this.trend.load = false;
      });
    },
  }
})
</script>

<template>
  <div class="trend">
    <ol class="sitestats-ul" v-if="trend.list.length > 0">
      <li v-for="(i, index) in trend.list" :key="index">
        <Row :gutter="10" type="flex" align="middle">
          <Col>
            <ExposedName>
              <HtmlLink :text="i.originName" :is-poptip="false" :href="`/player/${i.originPersonaId}`"></HtmlLink>
            </ExposedName>
          </Col>
          <Col flex="1">
            <Divider dashed style="margin: 0"></Divider>
          </Col>
          <Col>
            <Icon type="md-chatbubbles"/>
            {{ i.commentsNum.toFixed(0) || 0 }}
            <Divider type="vertical"></Divider>
            <Icon type="md-eye"/>
            {{ i.viewNum.toFixed(0) || 0 }}
          </Col>
          <Col>
            <Tag color="error">
              <Icon type="ios-flame"/>
              {{ i.hot.toFixed(0) || 0 }}
            </Tag>
          </Col>
        </Row>
      </li>
    </ol>
    <Empty :notHint="false" v-else></Empty>
    <Spin size="large" fix v-show="trend.load">
      <Loading :size="50"></Loading>
    </Spin>
  </div>
</template>

<style scoped lang="less">
.trend {
  position: relative;
}

.sitestats-ul {
  padding-left: 25px;

  li {
    padding-left: 5px;
    line-height: 2.1rem;
  }

  li:nth-child(1)::marker,
  li:nth-child(2)::marker,
  li:nth-child(3)::marker {
    font-size: 20px;
  }

  li:nth-child(3) {
    margin-bottom: 5px;
  }

  li::marker {
    font-size: 16px;
    display: block;
    padding-left: 20px;
  }
}
</style>
