<template>
  <div>
    <Divider>Cheater Detail</Divider>
    <div>
      <Tag color="error">
        {{ handleStatus(cheater.status) }}
      </Tag>
      <br>
      <span style="font-size: 1.6rem;">
        {{ cheater.origin_id }}
      </span>

      <a target="_blank" :href="`https://battlefieldtracker.com/bf1/profile/pc/${cheater.origin_id}`">战绩</a>
    </div>

    <Divider />

    <div style="position: relative">
      <h2 style="margin: 1rem 0;">举报经过</h2>

      <TimelineItem v-for="d in reports" :key="d.create_datetime">
        <div class="timeline-time">
          <Time :time="d.create_datetime"></Time>
        </div>
        <div class="timeline-content">
          <p>
            被
            <b style="font-size: 1rem;">{{d.username}}</b>
            举报
          </p>

          <p>
            <Tag color="warning">
              {{ d.cheat_methods }}
            </Tag>
          </p>
          <p v-if="d.bilibili_link">
            <Tag color="primary">
              b站视频
            </Tag>
            <a :href="d.bilibili_link" target="_blank">{{ d.bilibili_link }}</a>
          </p>
          <div v-html="d.description" style="background-color: #e4f5ff6b;
    padding: 1rem;
    border-radius: .4rem;
    border: 1px solid #cccccc8c;">
          </div>
        </div>
      </TimelineItem>

      <div v-if="isVerified">
        <Divider />
        <h2 style="margin: 1rem 0;">处理经过</h2>

        <TimelineItem v-for="d in verifies" :key="d.create_datetime">
          <div class="timeline-time">
            <Time :time="d.create_datetime"></Time>
          </div>
          <div class="timeline-content">
            <p>
              被
              <b style="font-size: 1rem;">{{d.username}}</b>
              认定为
            </p>
            <p>
              <Tag color="warning">
                {{ handleStatus(d.status) }}
              </Tag>
            </p>
            <div v-html="d.suggestion" style="background-color: #e4f5ff6b;
    padding: 1rem;
    border-radius: .4rem;
    border: 1px solid #cccccc8c;">
            </div>
          </div>
        </TimelineItem>
      </div>

      <Spin size="large" fix v-if="spinShow"></Spin>
    </div>

    <div v-show="isAdmin">
      <Divider />
      <h2>处理意见：</h2>
      <Form :label-width="80" ref='verifyForm'>
          <FormItem label="Select">
            <Select v-model="verify.status">
              <!-- 0=> 未处理，1=> 石锤，2=> 嫌疑玩家再观察，3=> 没有问题不是挂，4=> 捣乱的 -->
              <Option value="0">未处理</Option>
              <Option value="1">石锤</Option>
              <Option value="2">嫌疑玩家再观察</Option>
              <Option value="3">没有问题不是挂</Option>
              <Option value="4">捣乱的</Option>

            </Select>
          </FormItem>

          <FormItem label="Text">
            <Input v-model="verify.suggestion" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." />
          </FormItem>

          <FormItem>
              <Button type="primary" @click.stop.prevent="doVerify">提交</Button>
          </FormItem>
      </Form>
    </div>

  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      cheater: {},
      reports: [],
      verifies: [],
      verify: {
        status: '0',
        suggestion: '',
      },
      spinShow: true,
    }
  },
  created() {
    axios({
      method: 'get',
      url: `/cheaters/${this.$route.params.uid}`,
    })
    .then((res) => {
      this.spinShow = false;

      const d = res.data;

      let reports = d.data.reports;

      reports = reports.map((v, i, arr) => {
        v.cheat_methods = this.convertCheatMethods(v.cheat_methods);

        return v;
      });

      this.cheater = d.data.cheater[0];
      this.reports = reports;
      this.verifies = d.data.verifies;
    });
  },
  methods: {
    handleStatus(status) {
      const statusObj = {
        0: "未处理",
        1: "石锤",
        2: "嫌疑玩家再观察",
        3: "没有问题不是挂",
        4: "捣乱的",
      }

      return statusObj[status]
    },
    convertCheatMethods(str) {

      const list = {
        wallhack: '透视',
        damageChange: '改伤',
        aimbot: '自瞄',
        oneShotKill: '秒杀',
        gadgetModify: '改装备',
        stealth: '隐身',
        shootingThroughWalls: '子弹穿墙',
      };

      // return string
      return str.split(',').map((v, i) => {
        return list[v]
      }).join(' ');
    },
    doVerify() {
      const {status, suggestion} = this.verify;
      const cheaterUId = this.$route.params.uid;

      axios({
        method: 'post',
        url: '/cheaters/verify',
        data: {
          status,
          suggestion,
          cheaterUId,
        }
      })
      .then((res) => {
        console.log(res.data.error, res.data);

        const d = res.data;
        if (res.data.error === 0) {
          // reset verifyForm
          this.verify.status = '0'
          this.verify.suggestion = '';

          const { create_datetime, status, suggestion, username, privilege } = d.data;

          this.verifies.push({
            create_datetime,
            status,
            suggestion,
            username,
            privilege,
          })

          this.$Message.success('提交成功');
        } else {
          this.$Message.error('提交失败 ' + d.msg);
        }
      })
    }
  },
  computed: {
    isVerified: function() {
      return this.verifies.length > 0
    },
    isAdmin() {
      const user = this.$store.state.user;

      const is = user ? user.userPrivilege !== 'normal' : false;
      return Boolean(is);
    },
  }
}
</script>

<style>
</style>

