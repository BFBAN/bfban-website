<template>
  <div class="container">
    <div class="content">
      <a
        href="https://accounts.ea.com/connect/auth?response_type=code&client_id=ORIGIN_SPA_ID&display=originXWeb/login&locale=en_US&release_type=prod&redirect_uri=http://dev.bfban.com">login</a>
      <p class="hint">ban日报会在每天北京时间8点 (UTC时间0点) 发布，让大家可以了解每一天里 bfban.com 都发生了什么</p>
      <Divider>ban日报</Divider>
      <Collapse simple @on-change="handleChange" accordion>
        <Panel v-for="(d, i) in date">
          {{ d }}

          <div slot="content" style="position: relative;">
            <div v-if="reports.length !== 0">
              <div slot="content" style="position: relative;">
                <b>举报名单 ({{reports.length}}人)</b>
                <div style="display: flex; flex-wrap: wrap;">
                  <p v-for="report in reports" style="flex-shrink: 0; flex-basis: 50%;">
                    <router-link target="_blank" :to="{name: 'cheater', params: {game: `${report.game}`, ouid: `${report.originUserId}`}}">
                      <Tag>
                        {{ report.game }}
                      </Tag>
                      {{ report.cheaterOriginId }}
                    </router-link>
                  </p>
                </div>

              </div>
            </div>
            <div v-if="cheaters.length !== 0">
              <b>石锤名单 ({{cheaters.length}}人)</b>
              <div style="display: flex; flex-wrap: wrap;">
                <p v-for="cheater in cheaters" style="flex-shrink: 0; flex-basis: 50%;">
                  <router-link target="_blank" :to="{name: 'cheater', params: {game: `${cheater.game}`, uid: `${cheater.uId}`}}">
                    <Tag>
                      {{ cheater.game }}
                    </Tag>
                    {{ cheater.originId }}
                  </router-link>
                </p>

              </div>
            </div>

            <Spin fix v-show="spinShow"></Spin>
          </div>



        </Panel>
      </Collapse>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        date: [],
        reports: [],
        cheaters: [],

        spinShow: false,
      }
    },
    created() {
      axios({
        method: 'get',
        url: '/days',
      })
      .then((res) => {
        const d = res.data;

        if (d.error === 0) {
          _.each(d.data.days, (day) => {
            this.date.push(day.date)
          });
        }
      });
    },
    methods: {
      handleChange(name) {
        console.log(name, this.date, this.date[name[0]]);
        this.spinShow = true;

        const date = this.date[name[0]];
        axios({
          method: 'post',
          url: '/daily',
          data: {
            tz: moment.tz.guess(),
            date,
          }
        })
        .then(res => {
          this.spinShow = false;

          const d = res.data;
          if (d.error === 0) {
            const { reports, cheaters } = d.data;

            console.log(reports, cheaters);
            this.reports = reports;
            this.cheaters = cheaters;
          }
        });
      }
    }
  }
</script>
<style lang="scss">

</style>
