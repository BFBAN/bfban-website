<template>
  <div>
    <Divider>Cheater Detail</Divider>
    <p>
      游戏ID: {{ cheater.origin_id }}

      <a target="_blank" :href="`https://battlefieldtracker.com/bf1/profile/pc/${cheater.origin_id}`">{{ cheater.origin_id }}</a>
    </p>
    <p>
    处理状态: {{ handleStatus(cheater.status) }}
    </p>

    <Divider />

    <div style="position: relative;">
      <h2>举报过程:</h2>
      <TimelineItem v-for="d in reports" :key="d.create_datetime">
        <div class="timeline-time">
          <Time :time="d.create_datetime" type="datetime"></Time>
        </div>
        <div class="timeline-content">
          <p>
            举报人 {{d.username}}
            <Tag>
              {{d.privilege}}
            </Tag>
          </p>

          <p>
            作弊方式 {{ d.cheat_methods }}
          </p>
          <p>
            b站链接
            <a :href="d.bilibili_link" target="_blank">{{ d.bilibili_link }}</a>
          </p>
          <div>
            论证
            <p v-html="d.description"></p>
          </div>
        </div>
      </TimelineItem>

      <div v-if="isVerified">
        <Divider />
        <h2>
          处理过程:
        </h2>
        <TimelineItem v-for="d in verifies" :key="d.create_datetime">
          <div class="timeline-time">
            <Time :time="d.create_datetime" type="datetime"></Time>
          </div>
          <div class="timeline-content">
            <p>
              处理人 {{d.username}}
              <Tag color="primary">
                {{d.privilege}}
              </Tag>
            </p>
            <p>
              将状态处理成 {{ handleStatus(d.status) }}
            </p>
            <div>
              处理意见
              <p v-html="d.suggestion"></p>
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
      const d = res.data;

      let reports = d.data.reports;

      reports = reports.map((v, i, arr) => {
        v.cheat_methods = this.convertCheatMethods(v.cheat_methods);

        return v;
      })

      this.cheater = d.data.cheater[0];
      this.reports = reports;
      this.verifies = d.data.verifies;

      this.spinShow = false;
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

