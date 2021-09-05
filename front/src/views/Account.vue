<template>
  <div class="container">
    <br>
    <Breadcrumb>
      <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
      <BreadcrumbItem>{{ $t("account.title") }}</BreadcrumbItem>
    </Breadcrumb>
    <br>

    <Row type="flex" justify="center" align="middle">
      <Col justify="center" align="middle">
        <br>
        <Avatar shape="square" style="background-color: yellow" size="150">{{ account.username[0] || '' }}</Avatar>
        <br>

        <h1 :title="$t('account.username')">
<!--          {{ $t("account.userInfo") }}-->
          {{ account.username || 'username' }}
        </h1>

        <p>
          {{ $t("account.role") }}
          <Tag v-if="account.privilege === 'admin'" color="success">
            {{ $t("account.admin") }}
          </Tag>
          <Tag v-if="account.privilege === 'super'" color="error">
            {{ $t("account.super") }}
          </Tag>
          <Tag v-if="account.privilege === 'normal'">
            {{ $t("account.normal") }}
          </Tag>
          <Divider type="vertical"/>
          {{ $t("account.joinedAt") }}
          <Tag color="primary">
            <Time v-if="account.joinTime" :time="account.joinTime  || new Date()"/>
          </Tag>
          <Divider type="vertical"/>
          {{ $t("account.lastOnlineTime") }}
          <Tag color="primary">
            <Time v-if="account.lastOnlineTime" :time="account.lastOnlineTime  || new Date()"/>
          </Tag>
        </p>
      </Col>
    </Row>

    <Divider></Divider>

    <div class="content">
      <Row :gutter="8" type="flex">
        <Col span="7" order="2">
          <Card title="其他" icon="ios-options" :padding="0" shadow>
            <CellGroup>
              <Cell title="荣耀" label="查看在BFBAN成就" />
            </CellGroup>
          </Card>

          <br>
          <p class="hint">{{ $t("account.hint1") }}</p>
          <p class="hint">{{ $t("account.hint2") }}</p>
          <p class="hint">{{ $t("account.hint3") }}</p>
        </Col>
        <Col span="17" order="1">
          <Card dis-hover>
            <Tabs value="tag1">
              <TabPane :label="$t('account.reports')" name="tag1">
                <div v-if="account">
<!--                  <p v-if="account.reports.length <= 0" align="center">-->
<!--                    <Alert type="warning" show-icon>-->
<!--                      {{$t('account.noReports')}}-->
<!--                    </Alert>-->
<!--                  </p>-->

                  <table>
                    <tbody>
                    <tr v-for="report in account.reports" :key="report.id">
                      <td>
                      <span>
                        <Tag color="primary">
                            <Time
                              v-if="report.createDatetime"
                              :time="report.createDatetime"
                            />
                        </Tag>
                      </span>
                      </td>
                      <td>
                      <span>
                          {{ $t("account.reported") }}
                          <router-link
                            :to="{
                                  name: 'cheater',
                                  params: {
                                      ouid: `${report.originUserId}`,
                                  },
                              }">
                              <Tag>
                                  {{ report.game }}
                              </Tag>
                              {{ report.originId }}
                          </router-link>
                      </span>
                      </td>
                      <td>
                      <span>
                        {{ $t("account.status") }}
                        <Tag color="error">
                          {{$t(`basic.status[${report.status}]`) }}
                        </Tag>
                      </span>
                      </td>
                      <td>
                      <span>
                        {{ $t("account.recentlyUpdated") }}
                        <Tag color="warning">
                          <Time
                            v-if="report.updateDatetime"
                            :time="report.updateDatetime"/>
                          <span v-else>无</span>
                        </Tag>
                      </span>
                      </td>
                    </tr>
                    </tbody>
                  </table>

                  <br>

                  <Page
                    :page-size="limit"
                    show-total
                    :current="page"
                    @on-change="handlePageChange"
                    :total="total"
                    class="page"
                    size="small"
                  />
                </div>
                <div v-else>404</div>
              </TabPane>
              <br>
              <Button size="small" slot="extra">
<!--                {{account.reports.length || 0}}-->
              </Button>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
    <br>
  </div>
</template>

<script>
import {http, api, conf} from '../assets/js/index'
import ajax from "@/mixins/ajax";

export default {
  data() {
    return {
      account: {
        username: "",
        originId: "",
        privilege: "",
        createDatetime: "",
        reports: [],
      },
      limit: 10,
      page: 0,
      total: 100
    };
  },
  watch: {
    $route: "loadData",
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      const {uId} = this.$route.params;
      http.get(api["user_info"],{
        params: {
          id: uId
        }
      }).then((res) => {
        const d = res.data;
        if (d.success === 1) {

          this.account = d.data;
          // let {reports} = d.data;
          // this.account.reports = reports;

        } else {
          this.account = "";
          this.$Message.warning(d.msg);
        }
      });
    },
    handlePageChange(e) {
      console.log(e)
    }
  },
};
</script>

<style lang="scss">
</style>
