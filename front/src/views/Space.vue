<template>
  <div class="container">
    <br>
    <Row>
      <Col flex="1" :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("account.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
      <Col v-if="currentUser && currentUser.userinfo">
        <Poptip trigger="hover" transfer :disabled="isChat">
          <Button @click="openMessage" :disabled="isChat">
            <Icon type="ios-chatbubbles"/>
            {{ $t("account.message.chat") }}
          </Button>
          <div slot="content">
            <Alert show-icon type="error" v-if="!account.attr.allowDM"> {{
                $t("account.message.hint.taOffChat")
              }}
            </Alert>
            <Alert show-icon type="error" v-if="account.id == currentUser.userinfo.userId">
              {{ $t("account.message.hint.selfTalk") }}
            </Alert>
            <template v-show="!isChat">{{ $t("account.message.chat") }}</template>
          </div>
        </Poptip>
      </Col>
    </Row>
    <br>

    <template v-if="account">
      <div>
        <Confetti :y="20" :emojiCount="300"
                  :switch="new Date(account.joinTime).getTime() < new Date('2020 01-01').getTime() || account.id <= 1000">
          <Row type="flex" justify="center" align="middle">
            <Col justify="center" align="middle">
              <br>
              <UserAvatar :src="account.userAvatar ? `${account.userAvatar}` : ''"></UserAvatar>

              <div class="account-username">
                <h1 :title="$t('account.username')">
                  {{ account.username || 'username' }}
                </h1>
                <template v-if="account.attr.introduction">
                  <Html :html="account.attr.introduction" class="introduction"></Html>
                </template>
              </div>

              <Row :gutter="10" type="flex" justify="center" align="middle">
                <Col>
                  <PrivilegesTag :data="account.privilege" v-if="account.privilege"></PrivilegesTag>
                  <p v-else>-</p>
                  <p class="account-info-p">{{ $t("account.role") }}</p>
                </Col>
                <Divider type="vertical"/>
                <Col>
                  <Tag type="border" size="large" color="primary" v-if="account.joinTime">
                    <TimeView :time="account.joinTime || new Date()">
                      <Time :time="account.joinTime || new Date()"/>
                    </TimeView>
                  </Tag>
                  <p v-else>-</p>
                  <p class="account-info-p">{{ $t("account.joinedAt") }}</p>
                </Col>
                <Divider type="vertical"/>
                <Col>
                  <Tag type="border" size="large" color="#df22ff" v-if="account.lastOnlineTime">
                    <TimeView :time="account.lastOnlineTime || new Date()">
                      <Time :time="account.lastOnlineTime || new Date()"/>
                    </TimeView>
                  </Tag>
                  <p v-else>-</p>
                  <p class="account-info-p">{{ $t("account.lastOnlineTime") }}</p>
                </Col>
                <template
                    v-if="account.attr && account.attr.achievements && Object.keys(account.attr.achievements).length > 0">
                  <Divider type="vertical"/>
                  <Col>
                    <AchievementsTag :showAll="true" :data="account.attr.achievements" :size="'17px'"
                                     :max-overflow="3"></AchievementsTag>
                    <p class="account-info-p">{{ $t("profile.achievement.title") }}</p>
                  </Col>
                </template>
                <Divider type="vertical"/>
                <Col>
                  <Poptip :transfer="true">
                    <h3>{{ account.reportNum || '-' }}
                      <Icon type="md-more"/>
                    </h3>
                    <Row :gutter="15" type="flex" justify="center" align="middle" slot="content"
                         v-if="account.statusNum"
                         style="text-align: center">
                      <template v-if="isLogin">
                        <Col>
                          <b>{{ account.statusNum['0'] || '-' }}</b>
                          <p class="account-info-p">{{ $t(`basic.status.0.text`) }}</p>
                        </Col>
                        <Divider type="vertical"/>
                        <Col>
                          <b>{{ account.statusNum['1'] || '-' }}</b>
                          <p class="account-info-p">{{ $t(`basic.status.1.text`) }}</p>
                        </Col>
                        <Divider type="vertical"/>
                        <Col>
                          <b>{{ account.statusNum['4'] || '-' }}</b>
                          <p class="account-info-p">{{ $t(`basic.status.4.text`) }}</p>
                        </Col>
                        <Divider type="vertical"/>
                        <Col>
                          <b>{{
                              account.reportNum - (account.statusNum['0'] + account.statusNum['1'] + account.statusNum['4'])
                            }}</b>
                          <p class="account-info-p">···</p>
                        </Col>
                        <Col>=</Col>
                        <Col>
                          <b>{{ account.reportNum || '-' }}</b>
                          <p class="account-info-p">{{ $t("account.reportNum") }}</p>
                        </Col>
                      </template>
                      <Spin size="large" v-show="!isLogin">
                        <div>
                          <Icon type="md-lock" size="30"/>
                        </div>
                        <Button :to="{name: 'signin'}">{{ $t("header.signin") }}</Button>
                      </Spin>
                    </Row>
                  </Poptip>
                  <p class="account-info-p">{{ $t("account.reportNum") }}</p>
                </Col>
                <Divider type="vertical"/>
                <Col>
                  <Poptip :boundaries-padding="30">
                    <b>
                      <Icon type="md-qr-scanner" size="19"/>
                    </b>
                    <p class="account-info-p">{{ $t('share.title') }}</p>
                    <Row style="width: 330px" :gutter="40" type="flex" justify="center" align="middle" wrap
                         slot="content">
                      <Col>
                        <vue-qr :text="'https://bfban.com/space/' + $route.params.uId" :size="120" :margin="3"
                                v-if="$route.params.uId" style="display: block"></vue-qr>
                      </Col>
                      <Col>
                        <vue-qr :logoScale=".25" :logoSrc="'https://bfban-app.cabbagelol.net/images/logo.png'"
                                :text="'https://bfban-app.cabbagelol.net/as?p=account?id=' + $route.params.uId"
                                :size="120"
                                :margin="3"
                                v-if="$route.params.uId" style="display: block"></vue-qr>
                      </Col>
                    </Row>
                  </Poptip>
                </Col>
              </Row>
            </Col>
          </Row>
        </Confetti>
      </div>

      <br/>

      <div class="content">
        <Row :gutter="isAttachedContent ? 0 : 15">
          <Col :xm="{span: 24}" :lg="{span: 24}"
               style="width: 100%">
            <Card dis-hover :padding="0">
              <Reports :data="report.data"/>
              <Spin size="large" fix v-show="load">
                <Loading size="50"></Loading>
              </Spin>
            </Card>

            <br/>
            <Row>
              <Col :xs="{span: 23, push: 1}" :lg="{span: 24, push: 0}">
                <Page
                    show-total
                    @on-change="getUserReports"
                    :page-size="limit"
                    :current="page"
                    :total="total"
                    class="page"
                    size="small"/>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      <Modal v-model="message.show" @on-ok="onPushMessage">
        <Form>
          <FormItem :label="$i18n.t('account.message.chat')">
            <Input v-model="message.content"
                   type="textarea" :autosize="{minRows: 5,maxRows: 10}"></Input>
          </FormItem>
        </Form>
      </Modal>
    </template>
    <template v-else>
      <div align="center">
        <Empty></Empty>
      </div>
    </template>
  </div>
</template>

<script>
import {api, application, http, http_token, util} from "@/assets/js"
import vueQr from "vue-qr";
import Empty from "@/components/Empty";
import UserAvatar from "@/components/UserAvatar.vue";
import TimeView from "@/components/TimeView.vue";
import Reports from "@/components/Reports.vue"
import cheaterStatusView from "@/components/CheaterStatusView.vue";
import Confetti from "@/components/Confetti.vue";
import Html from "@/components/Html.vue"
import PrivilegesTag from "@/components/PrivilegesTag";
import AchievementsTag from "/src/components/AchievementsTag.vue";
import Loading from "@/components/Loading.vue";

import games from '/public/config/gameName.json'

export default new application({
  name: 'space',
  data() {
    return {
      games: games.child,
      load: true,
      account: {
        username: "",
        originId: "",
        privilege: "",
        createDatetime: "",
        attr: {
          allowDM: false,
        }
      },
      report: {
        data: []
      },
      limit: 20,
      page: 1,
      total: 0,

      cheaterStatus: [],
      url: "",

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
  components: {
    PrivilegesTag,
    AchievementsTag,
    Empty,
    UserAvatar,
    cheaterStatusView,
    TimeView,
    Confetti,
    Reports,
    Html,
    Loading,
    vueQr
  },
  created() {
    const {username} = this.$route.query;
    this.http = http_token.call(this);
    this.account.username = username || '';

    this.loadData();
  },
  methods: {
    async loadData() {
      const {uId} = this.$route.params;

      await util.initUtil().then(res => {
        this.cheaterStatus = res.cheaterStatus;
        this.url = window.location.href;
      });

      this.getUserInfo(uId);
    },
    /**
     * 获取用户信息
     */
    getUserInfo(uId) {
      this.$Loading.start();

      this.http.get(api["user_info"], {
        params: {
          id: uId
        }
      }).then(res => {
        const d = res.data;

        if (this.$route.query.repeat) {
          this.openMessage()
        }

        if (d.success === 1) {
          this.account = d.data;
          return;
        }

        this.account = "";
        this.$Message.warning(d.code);

      }).catch(err => {
        this.$Loading.error();
      }).finally(() => {
        this.getUserReports()
      });
    },
    /**
     * 打开消息
     */
    openMessage() {
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
    /**
     * 发送消息
     */
    onPushMessage() {
      const {uId} = this.$route.params;

      if (!uId) return;

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

          return;
        }

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
      }).finally(() => {
        this.message.load = false;
        this.message.show = false;
      })
    },
    /**
     * 获取举报信息
     * @param uId
     */
    getUserReports(pageNum) {
      const {uId} = this.$route.params;

      if (!uId) return;

      this.load = true;

      http.get(api["user_reports"], {
        params: {
          id: uId,
          skip: (pageNum || 1) - 1,
          limit: this.limit,
        }
      }).then(res => {
        const d = res.data;
        let reportData = [];

        if (d.success === 1) {
          d.data.forEach(i => reportData.push(i));

          this.report.data = reportData;
          this.total = d.total;
        }
      }).finally(() => {
        this.$Loading.finish();
        this.load = false;
      });
    },
  },
  computed: {
    /**
     * 是否包含用户附带的额外内容
     * 如果自我描述以及attr特定属性不显示，则关闭右侧一栏
     * @returns {boolean}
     */
    isAttachedContent() {
      return !this.account.attr.introduction && !this.account.origin;
    },
    /**
     * 是否可用聊天
     * @returns {boolean}
     */
    isChat() {
      return !this.account.attr.allowDM || this.account.id == this.currentUser.userinfo.userId
    }
  }
})
</script>

<style lang="less">
.account-username {
  margin: 2rem 0 2rem 0;

  .introduction {
    opacity: .8;
    text-align: center;
  }
}

.account-info-p {
  margin: .2rem;
  font-size: 12px;
  opacity: .6;
}
</style>
