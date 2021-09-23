<template>
  <div class="container">
    <br>
    <Row>
      <Col flex="auto">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("account.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
      <Col align="right">
        <Alert show-icon type="error" v-if="!account.attr.allowDM"> {{ $t("account.message.hint.taOffChat") }} </Alert>
        <Alert show-icon type="error" v-if="account.id == currentUser.userinfo.userId"> {{ $t("account.message.hint.selfTalk") }} </Alert>
        <Button @click="openMessage" :disabled="!account.attr.allowDM || account.id == currentUser.userinfo.userId">
          <Icon type="ios-chatbubbles" />
          {{ $t("account.message.chat") }}
        </Button>
      </Col>
    </Row>
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
          <span v-for="(i,index) in privileges" :key="index">
            <Tag type="dot" v-if="account.privilege == i.value"
                 color="success">
              {{ $t("account." + i.value) }}
            </Tag>
          </span>
          <Divider type="vertical"/>
          {{ $t("account.joinedAt") }}
          <Tag type="dot" color="primary">
            <Time v-if="account.joinTime" :time="account.joinTime  || new Date()"/>
          </Tag>
          <Divider type="vertical"/>
          {{ $t("account.lastOnlineTime") }}
          <Tag type="dot" color="success">
            <Time v-if="account.lastOnlineTime" :time="account.lastOnlineTime  || new Date()"/>
          </Tag>
        </p>
      </Col>
    </Row>

    <Divider></Divider>

    <div class="content">
      <Row :gutter="8" type="flex">
        <Col span="7" order="2">
          <Card v-if="account.introduction" dis-shadow>
            <div v-html="account.introduction"></div>
          </Card>
          <br v-if="account.introduction">

          <Card v-if="account.origin && account.origin.originName" dis-shadow>
            <b>origin id:</b>
            <p>{{account.origin.originName}}</p>
          </Card>
          <br v-if="account.origin && account.origin.originName">

          <Card title="其他" icon="ios-options" :padding="0" shadow>
            <CellGroup>
              <Cell title="荣耀" label="查看在BFBAN成就"/>
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

                <div v-if="reports">
                  <p v-if="reports.length <= 0" align="center">
                    <Alert type="warning" show-icon>
                      {{$t('account.noReports')}}
                    </Alert>
                  </p>

                  <table>
                    <tbody>
                    <tr v-for="report in reports" :key="report.id">
                      <td>
                      <span>
                        <Tag color="primary">
                            <Time v-if="report.createTime"
                                :time="report.createTime"/>
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
                                      ouid: `${report.originPersonaId}`,
                                  },
                              }">
                              <Tag>{{ report.game }}</Tag>
                              {{ report.originName }}
                          </router-link>
                      </span>
                      </td>
                      <td>
                      <span>
                        {{ $t("account.status") }}
                        <Tag color="error">
                          {{ $t(`basic.status[${report.status}]`) }}
                        </Tag>
                      </span>
                      </td>
                      <td>
                      <span>
                        {{ $t("account.recentlyUpdated") }}
                        <Tag color="warning">
                          <Time v-if="report.updateTime"
                              :time="report.updateTime"/>
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
                      @on-change="getReports"
                      :total="total"
                      class="page"
                      size="small"/>
                </div>
                <div v-else>404</div>
              </TabPane>
              <br>
              <Button size="small" slot="extra">{{reports.length || 0}}</Button>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>

    <Modal v-model="message.show"
        @on-ok="setMessage">
      <Form>
        <FormItem label="聊天">
          <Input v-model="message.content"
                 type="textarea" :autosize="{minRows: 5,maxRows: 10}"></Input>
        </FormItem>
      </Form>
    </Modal>
    <br>
  </div>
</template>

<script>
import {http, api, http_token, util} from '../assets/js/index'

import games from '../assets/gameName.json'

export default {
  data() {
    return {
      games: games.child,
      privileges: [],
      account: {
        username: "",
        originId: "",
        privilege: "",
        createDatetime: "",
        attr: {
          allowDM: false,

        }
      },
      reports: [],
      limit: 20,
      page: 1,
      total: 100,

      message: {
        id: '',
        show: false,
        load: false,
        content: '',
      }
    };
  },
  watch: {
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);

    this.loadData();
  },
  methods: {
    async loadData() {
      const {uId} = this.$route.params;

      this.getReports(uId);

      const privileges = await import('/src/assets/privilege.json');
      this.privileges = this.privileges.concat(privileges.child)

      this.getUserInfo(uId);
    },
    getUserInfo (uId) {
      http.get(api["user_info"], {
        params: {
          id: uId
        }
      }).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.account = d.data;
        } else {
          this.account = "";
          this.$Message.warning(d.msg);
        }

        if ( this.$route.query.repeat) {
          this.openMessage()
        }

        this.getReports(uId)
      });
    },
    openMessage () {
      if (!this.account.attr.allowDM) {
        this.$Message.error(this.$i18n.t("account.message.hint.taOffChat"))
        return
      }
      if (this.account.id == this.currentUser.userinfo.userId) {
        this.$Message.error(this.$i18n.t("account.message.hint.selfTalk"))
        return
      }

      this.message.show = true;
    },
    setMessage () {
      const {uId} = this.$route.params;

      this.http.post(api["user_message"], {
        data: {
          data: {
            toUserId: this.message.id || uId,
            type: 'direct',
            content: this.message.content,
          }
        }
      }).then(res => {
        if (res.data.success == 1) {
          this.$Message.success(res.data.message);
        } else {
          switch (res.data.error) {
            case 'message.denied':
              this.$Message.error(this.$i18n.t("account.message.hint.denied"));
              break;
            case 'message.blocked':
              this.$Message.error(this.$i18n.t("account.message.hint.taOffChat"));
              break;
            default:
              this.$Message.error(res.data.message);
          }
        }
      }).finally(() => {
        this.message.load = false;
        this.message.show = false;
      })
    },
    getReports(uId) {
      http.get(api["user_reports"], {
        params: {
          id: uId,
          skip: this.page,
          limit: this.limit,
        }
      }).then((res) => {
        const d = res.data;
        if (d.success == 1) {
          this.reports = d.data;
          this.total = Number(d.total);
        }
      });
    },
  },
  computed:{
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
};
</script>

<style lang="scss">
</style>