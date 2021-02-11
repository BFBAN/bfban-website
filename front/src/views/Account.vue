<template>
  <div class="container">
    <div class="content">
      <p class="hint">{{$t("account.hint1")}}</p>
      <p class="hint">{{$t("account.hint2")}}</p>
      <p class="hint">{{$t("account.hint3")}}</p>

      <div v-if="account">
        <Divider>{{$t("account.title")}}</Divider>
        <h2>{{$t("account.userInfo")}}</h2>
        <p>
          {{$t("account.username")}}
          {{account.username}}
        </p>
        <p>
          {{$t("account.role")}}
          <Tag v-if="account.privilege === 'admin'" color="success">
            {{$t("account.admin")}}
          </Tag>
          <Tag v-if="account.privilege === 'super'" color="error">
            {{$t("account.super")}}
          </Tag>
          <Tag v-if="account.privilege === 'normal'">
            {{$t("account.normal")}}
          </Tag>
        </p>
        <p>
          {{$t("account.joinedAt")}}
          <Tag color="primary">
            <Time v-if="account.createDatetime" :time="account.createDatetime" />
          </Tag>
        </p>

        <br>
        <h2>{{$t("account.reports")}}</h2>
        <p v-if="account.reports.length === 0">
          {{$t("account.noReports")}}
        </p>
        <table>
          <tbody>
          <tr v-for="report in account.reports" :key="report.id">
            <td>
            <span>
          <Tag color="primary">
            <Time v-if="report.createDatetime" :time="report.createDatetime" />
          </Tag>
        </span>
            </td>
            <td>
        <span>
          {{$t("account.reported")}}
          <router-link :to="{name: 'cheater', params: {ouid: `${report.originUserId}`}}">
            <Tag>
              {{ report.game }}
            </Tag>
            {{report.originId}}
          </router-link>
        </span>
            </td>
            <td>
        <span>
          {{$t("account.status")}}
          <Tag color="error">
            {{ handleStatus(report.status) }}
          </Tag>
        </span>
            </td>
            <td>
        <span>
          {{$t("account.recentlyUpdated")}}
          <Tag color="warning">
            <Time v-if="report.updateDatetime" :time="report.updateDatetime" />
            <span v-else>无</span>
          </Tag>
        </span>
            </td>
          </tr>
          </tbody>

        </table>
        <Page :page-size="limit" show-total :current="page" @on-change="handlePageChange" :total="total" class="page" size="small" />
      </div>
      <div v-else>404</div>
    </div>
  </div>

</template>

<script>
  import { getCheaterStatusLabel } from '@/mixins/common';
  import ajax from '@/mixins/ajax';

  export default {
    data() {
      return {
        account: {
          username: '',
          originId: '',
          privilege: '',
          createDatetime: '',

          reports: [],
        }
      }
    },
    watch: {
      '$route': 'loadData',
    },
    created() {
      this.loadData();
    },
    methods: {
      loadData() {
        const { uId } = this.$route.params;
        ajax({
          method: 'get',
          url: `/account/${uId}`,
        })
        .then((res) => {
          const d = res.data;

          if (d.error === 0) {
            this.account = d.data;
            let { reports } = d.data;
            this.account.reports = reports;
          } else {
            this.account = '';
            this.$Message.warning(d.msg);
          }
        });
      },
      handleStatus: getCheaterStatusLabel,
    }
  }
</script>

<style lang="scss">
</style>
