<template>
  <div class="container">
    <Bulletin />
    <div class="content">
      <Divider>{{$t("home.activity.title")}}</Divider>

      <p v-html="$t('home.activity.description', { report: site.report, cheater: site.cheater })"></p>
      <table>
        <tbody>
          <tr v-for="activity in activities" :key="activity.id">
            <td nowrap>
              <Time v-if="activity.createDatetime" :time="activity.createDatetime"></Time>
            </td>
            <td v-if="activity.type === 'report'">
              <span>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{ activity.username }}</router-link>
                {{$t("home.activity.activities.report")}}
                <Tag>
                  {{ handleGameName(activity.game, $i18n.locale) }}
                </Tag>
                <router-link :to="{name: 'cheater', params: {game: `${activity.game}`, ouid: `${activity.originUserId}`}}">{{ activity.cheaterOriginId }}</router-link>
              </span>

            </td>

            <td v-if="activity.type === 'register'">
              <span>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{ activity.username }}</router-link>
                {{$t("home.activity.activities.join")}}
              </span>

            </td>

            <td v-if="activity.type === 'verify'">
              <span>
                <Tag color="success">{{$t("home.activity.activities.admin")}}</Tag>
                <router-link :to="{name: 'account', params: {uId: `${activity.uId}`}}">{{ activity.username }}</router-link>
                {{$t("home.activity.activities.mark")}}
                <router-link :to="{name: 'cheater', params: {ouid: `${activity.originUserId}`}}">{{ activity.cheaterOriginId }}</router-link>
                {{$t("home.activity.activities.as")}}
                <Tag color="warning">
                  {{ handleStatus(activity.status, $i18n.locale) }}
                </Tag>
              </span>

            </td>
          </tr>
        </tbody>
      </table>

    </div>
    <div class="content">
      <Divider>{{$t("home.howToUse.title")}}</Divider>
      <p v-html="$t('home.howToUse.description')"></p>

      <p>
        <!--<b>本站管理员：</b>-->
      </p>
      <p v-for="m in manager" :key="m.name">

        <a v-if="m.link" target="_blank" :href="m.link">{{ m.name }}</a>
        <span v-else>{{ m.name }}</span>
      </p>


<br>
      <h2>{{$t("home.howToUse.tools.main")}}</h2>
      <div class="tools">
        <p>
          <a target="_blank" href="https://battlefieldtracker.com/">
            battlefieldtracker.com
          </a>
          {{$t("home.howToUse.tools.description.bftracker")}}
        </p>
        <p>
          <a target="_blank" href="https://bf1.mygoare.com/">
            {{$t("home.howToUse.tools.name.report")}}
          </a>
          {{$t("home.howToUse.tools.description.report")}}
        </p>
        <p>
          <a target="_blank" href="https://www.247fairplay.com/">
            247fairplay
          </a>
          {{$t("home.howToUse.tools.description.fairplay")}}
        </p>
        <p>
          <a target="_blank" href="https://www.notion.so/1-5-f348c539fd4f41a08878f274a37c7d81">
            {{$t("home.howToUse.tools.name.tracker")}}
          </a>
          {{$t("home.howToUse.tools.description.tracker")}}
        </p>
        <p>
          <a target="_blank" href="http://bfban.ys168.com/">
            {{$t("home.howToUse.tools.name.tools")}}
          </a>
          {{$t("home.howToUse.tools.description.tools")}}
        </p>
        <p>
          <a target="_blank" href="https://app.bfban.com/public/www/">
            {{$t("home.howToUse.tools.name.bfban")}}
          </a>
          {{$t("home.howToUse.tools.description.bfban")}}
        </p>
        <p>
          <a target="_blank" href="https://api.gametools.network/docs">
            {{$t("home.howToUse.tools.name.apiGametools")}}
          </a>
          {{$t("home.howToUse.tools.description.apiGametools")}}
        </p>
        <p>
          <a target="_blank" href="https://top.gg/bot/714524944783900794">
            {{$t("home.howToUse.tools.name.botGametools")}}
          </a>
          {{$t("home.howToUse.tools.description.botGametools")}}
        </p>
      </div>

<br>
      <h2>{{$t("home.howToUse.qqGroup")}}</h2>
      <div class="tools">
        <p>
		  <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=pC07TOvE">
			BFBan QQ
		  </a><span>/</span>
          <a target="_blank" href="https://discord.gg/KCBM3GAW59">
            Community network Discord
          </a>
          {{$t("home.howToUse.bfbanQq")}}
        </p>
      </div>
    </div>
  </div>



</template>

<script>
  import Bulletin from '@/components/Bulletin.vue';
  import { getCheaterStatusLabel, getGameLabel } from '@/mixins/common';
  import ajax from '@/mixins/ajax';
  export default {
  data() {
    return {
      site: {},
      activities: [],
      manager: [
        {
          name: '',
          link: '',
          desc: '',
        }
      ]
    }
  },
  components: {
    Bulletin,
  },
  methods: {
    handleStatus: getCheaterStatusLabel,
    handleGameName: getGameLabel,
  },
  created() {
    ajax({
      method: 'get',
      url: '/activity',
    })
    .then(({data}) => {
      const d = data;
      if (d.error === 0) {
        let { registers, reports, verifies, number } = d.data;

        reports = _.each(reports, (v, k, l) => {
          v['type'] = 'report'
        });
        registers = _.each(registers, (v, k, l) => {
          v['type'] = 'register'
        });
        verifies = _.each(verifies, (v, k, l) => {
          v['type'] = 'verify'
        });

        let activities = [].concat(verifies, reports, registers);

        activities = _.sortBy(activities, (v) => {
          return (new Date(v.createDatetime)).getTime();
        }).reverse();

        this.activities = activities;

        this.site = number;
      }
    })
  }
}
</script>

