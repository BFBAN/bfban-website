<script setup>
import {api} from "@/assets/js";

export default {
  methods:{
    /**
     * 获取举报玩家 时间轴
     */
    async getTimeline() {
      this.timelineListPreparedness = [];
      this.timelineList = [];

      return new Promise(resolve => {
        this.spinShow = true;

        this.http.get(api["player_timeline"], {
          params: Object.assign({
            skip: (this.timeline.skip - 1) * this.timeline.limit,
            limit: this.timeline.limit,
            order: this.timeline.order,
          }, {personaId: this.getParamsIds('personaId'), random: +(new Date())})
        }).then(res => {
          let d = res.data;

          if (d.success === 1) {
            d.data.result.forEach((i, index) => {
              if (i.videoLink) {
                let videoLink = i.videoLink.split(',');
                if (videoLink instanceof Array)
                  for (let j = 0; j < videoLink.length; j++)
                    if (videoLink[j].indexOf('http') >= 0) videoLink[j] = new URL(videoLink[j]);
                i.videoLink = videoLink;
              }

              i.index = index;
              i.show = false;
            });

            this.timelineListPreparedness = d.data.result;
            this.timeline.total = d.data.total;

            // 排序
            this.onMergeHistoryName();

            this.$forceUpdate();
          }
        }).finally(() => {
          this.onRollingFloor();

          this.spinShow = false;

          resolve();
        })
      })
    },
  }
}
</script>

<template>

</template>

<style scoped lang="less">

</style>
