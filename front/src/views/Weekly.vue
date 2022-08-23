<template>
  <div>
    =
    <card v-for="(i, index) in weekday" :key="index">
      {{i}}
    </card>
  </div>
</template>

<script>
import {api, http, util} from '../assets/js/index'

export default {
  name: "Weekly",
  data() {
    return {
      weekday: [],
    }
  },
  created () {
    this.getWeekly();
  },
  methods: {
    getWeekly() {
      http.request("http://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history", {
        headers: {
          "Origin": "api.vc.bilibili.com"
        },
        method: http.GET,
        params: {
          "host_uid": "387820951",
          "need_top": 1,
        }
      }).then(res => {
        this.weekday = res.data.data.cards;
      });
    }
  }
}
</script>

<style scoped>

</style>