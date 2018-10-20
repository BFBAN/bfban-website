<template>

    <Form :label-width="80">
      <h2>举报作弊</h2>

      <FormItem label="游戏ID">
        <Input v-model="formItem.originId" placeholder="" />
        <span>
          <a :href="'https://battlefieldtracker.com/bf1/profile/pc/' + formItem.originId">{{formItem.originId}}</a>
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
        <Input v-model="formItem.bilibiliLink" placeholder="" />
        <span>
          <a :href="formItem.bilibiliLink">{{formItem.bilibiliLink}}</a>
        </span>
      </FormItem>

      <FormItem label="论述">
          <!-- <Input v-model="formItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." /> -->
          <Misc :content="formItem.description" @change="handleMiscChange" />
      </FormItem>

      <FormItem>
          <Button @click.prevent.stop="handleReport" type="primary">提交</Button>
      </FormItem>
      <T name="Hello T" />
    </Form>
</template>

<script>
import T from './T.vue'
import Misc from './Misc.vue'

export default {
  data() {
     return {
              formItem: {
                  originId: '',
                  bilibiliLink: '',
                  checkbox: ['aimbot'],
                  description: '请论述为什么你觉得他作弊...'
              }
            }
  },
  components: {
    T, Misc
  },
  methods: {
    handleMiscChange: function(h) {
      this.formItem.description = h
    },
    handleReport: function() {
      const cheatMethods = this.formItem.checkbox.join(',');

      const {
        originId,
        bilibiliLink,
        description
      } = this.formItem;
      console.log(originId,
        bilibiliLink,
        cheatMethods,
        description)
    }
  }
}
</script>

<style>
</style>

