<template>

    <Form :label-width="80" style="position: relative;">
      <Divider>举报作弊</Divider>

      <FormItem label="游戏ID">
        <Input v-model="formItem.originId" placeholder="" />
        <span>
          <a target="_blank" :href="'https://battlefieldtracker.com/bf1/profile/pc/' + formItem.originId">{{ formItem.originId ? 'https://battlefieldtracker.com/bf1/profile/pc/' + formItem.originId : ''}}</a>
        </span>
      </FormItem>

      <FormItem label="作弊方式">
        <CheckboxGroup v-model="formItem.checkbox">
          <Checkbox label="wallhack">
            <span>透视</span>
          </Checkbox>
          <Checkbox label="damageChange">
            <span>改伤</span>
          </Checkbox>
          <Checkbox label="aimbot">
            <span>自瞄</span>
          </Checkbox>
          <Checkbox label="oneShotKill">
            <span>秒杀</span>
          </Checkbox>
          <Checkbox label="gadgetModify">
            <span>改装备</span>
          </Checkbox>
          <Checkbox label="stealth">
            <span>隐身</span>
          </Checkbox>
          <Checkbox label="shootingThroughWalls">
            <span>子弹穿墙</span>
          </Checkbox>
        </CheckboxGroup>
      </FormItem>

      <FormItem label="B站链接">
        <Input v-model="formItem.bilibiliLink" placeholder="选填" />
        <span>
          <a target="_blank" :href="formItem.bilibiliLink">{{formItem.bilibiliLink}}</a>
        </span>
      </FormItem>

      <FormItem label="论述">
          <p>请论述为什么你觉得他作弊...</p>
          <!-- <Input v-model="formItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." /> -->
          <Misc :content="formItem.description" @change="handleMiscChange" />
      </FormItem>

      <FormItem label="验证码">
        <Input type="text" v-model="formItem.captcha" placeholder="验证码" />
        <img ref="captcha">
        <a href="#" @click.stop.prevent="refreshCaptcha">
          获得验证码
        </a>
      </FormItem>

      <FormItem>
          <Button @click.prevent.stop="handleReport" type="primary">提交</Button>
      </FormItem>

      <Spin size="large" fix v-show="spinShow"></Spin>
    </Form>
</template>

<script>
import Misc from './Misc.vue';
import axios from 'axios';
import _ from 'underscore';

export default {
  data() {
     return {
        formItem: {
          originId: '',
          bilibiliLink: '',
          checkbox: ['aimbot'],
          description: '',
          captcha: '',
        },
        spinShow: false,
     }
  },
  components: {
    Misc
  },
  methods: {
    waitForCaptcha(e) {
      e.target.style = "display: none;";
      let span = document.createElement('span');
      e.target.parentNode.insertBefore(span, e.target.nextSibling);

      let n = 2;
      span.innerText = `${n} 秒后重新获取`;
      let si = setInterval(function() {
        if (n > 1) {

          n -= 1;
          span.innerText = `${n} 秒后重新获取`;
        } else {
          e.target.style = "";
          span.innerText = '';
          clearInterval(si);
        }
      }, 1000);
    },
    refreshCaptcha(e) {
      this.$refs.captcha.src = '/captcha?r=' + Math.random();

      this.waitForCaptcha(e);
    },
    handleMiscChange: function(h) {
      this.formItem.description = h
    },
    handleReport: function() {
      this.spinShow = true;

      const cheatMethods = this.formItem.checkbox.join(',');

      const {
        originId,
        bilibiliLink,
        description,
        captcha,
      } = _.each(this.formItem, (v, k, o) => {
        if (k = 'checkbox') return;
        o[k] = v.trim();
      });

      axios({
        method: 'post',
        url: '/cheaters/',
        data: {
          originId,
          cheatMethods,
          bilibiliLink,
          description,
          captcha,
        }
      }).then((res) => {
        this.spinShow = false;

        const d = res.data;
        if (d.error === 0) {
          this.$router.push({name: 'cheater', params: {uid: d.data.cheaterUId}});

          this.$Message.success('提交成功');
        } else {
          this.$Message.error('提交失败 ' + d.msg);
        }

        this.formItem.captcha = '';
      });
    }
  }
}
</script>

<style>
</style>

