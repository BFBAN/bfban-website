<template>
  <div class="container">
    <br>
    <Row>
      <Col flex="auto" :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("account.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
      <Col align="right" v-if="currentUser">
        <Alert show-icon type="error" v-if="!account.attr.allowDM"> {{ $t("account.message.hint.taOffChat") }} </Alert>
        <Alert show-icon type="error" v-if="account.id == currentUser.userinfo.userId"> {{ $t("account.message.hint.selfTalk") }} </Alert>
        <Button @click="openMessage" :disabled="!account.attr.allowDM || account.id == currentUser.userinfo.userId">
          <Icon type="ios-chatbubbles" />
          {{ $t("account.message.chat") }}
        </Button>
      </Col>
    </Row>
    <br>

    <div dis-hover	bordered>
      <Row type="flex" justify="center" align="middle">
        <Col justify="center" align="middle">
          <br>
          <Avatar shape="square" style="background-color: yellow" size="150">{{ account.username[0] || '' }}</Avatar>

          <h1 :title="$t('account.username')" class="account-username">
            {{ account.username || 'username' }}
          </h1>

          <Row :gutter="20" type="flex" justify="center" align="middle">
            <Col>
              <span v-for="(i,index) in privileges" :key="index">
                <span v-for="(p, pi) in account.privilege" :key="pi">
                  <Tag type="border" size="large" :color="i.class" v-if="p == i.value">
                    {{ $t("basic.privilege." + i.value) }}
                  </Tag>
                </span>
              </span>
              <p class="account-info-p">{{ $t("account.role") }}</p>
            </Col>
            <Divider type="vertical"/>
            <Col>
              <Tag type="border" size="large" color="primary">
                <Time v-if="account.joinTime" :time="account.joinTime  || new Date()"/>
              </Tag>
              <p class="account-info-p">{{ $t("account.joinedAt") }}</p>
            </Col>
            <Divider type="vertical"/>
            <Col>
              <Tag type="border" size="large" color="success">
                <Time v-if="account.lastOnlineTime" :time="account.lastOnlineTime  || new Date()"/>
              </Tag>
              <p class="account-info-p">{{ $t("account.lastOnlineTime") }}</p>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>

    <br/>

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
          <br>
          <p class="hint">{{ $t("account.hint2") }}</p>
          <p class="hint">{{ $t("account.hint3") }}</p>
        </Col>
        <Col span="17" order="1">
          <Card dis-hover :padding="0">
            <p v-if="report.data.length <= 0" align="center">
              <Alert type="warning" show-icon>
                {{ $t('basic.tip.noReports') }}
              </Alert>
            </p>

            <Table show-header
                   :border="false"
                   :no-data-text="$t('basic.tip.notcontent')"
                   :columns="report.columns"
                   :data="report.data"></Table>
          </Card>

          <br/>
          <Page
              :page-size="limit"
              show-total
              :current="page"
              @on-change="getReports"
              :total="total"
              class="page"
              size="small"/>
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
import BFBAN from "../assets/js/bfban";
import {api, http, http_token} from '../assets/js/index'

import games from '/public/conf/gameName.json'

export default new BFBAN({
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
      report: {
        columns: [
          {
            title: " ",
            key: 'createTime',
            sortable: true,
            fixed: "left",
            render: (h, params) => {
              return h('Tag', {
                props: {
                  color: 'primary'
                }
              }, [
                h('Time', {
                  props: {
                    time: params.row.createTime
                  }
                })
              ]);
            }
          },
          {
            title: this.$i18n.t("account.reported"),
            key: 'originName',
            ellipsis: true,
            tooltip: true,
            render: (h, params) => {
              return h('div', [
                h('a', {
                  href: '/player/' + params.row.originPersonaId
                }, params.row.originName)
              ]);
            }
          },
          {
            title: "ID",
            key: 'originPersonaId',
            ellipsis: true,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('p', params.row.originPersonaId)
              ]);
            }
          },
          {
            title: this.$i18n.t("account.status"),
            key: 'status',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Tag', {
                  props: {
                    color: 'error'
                  }
                }, `${this.$i18n.t(`basic.status[${params.row.status}]`)}`)
              ]);
            }
          },
          {
            title: this.$i18n.t("account.recentlyUpdated"),
            key: 'updateTime',
            align: 'center',
            sortable: true,
            render: (h, params) => {
              return h('div', [
                h('Tag', {
                  props: {
                    color: 'warning'
                  }
                }, `${params.row.updateTime}`)
              ]);
            }
          }
        ],
        data: []
      },
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

      const privileges = await import('/public/conf/privilege.json');
      this.privileges = this.privileges.concat(privileges.child)

      this.getUserInfo(uId);
    },
    /**
     * 获取用户信息
     */
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

        this.getReports()
      });
    },
    /**
     * 打开消息
     */
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
    /**
     * 发送消息
     */
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
    /**
     * 获取举报信息
     * @param uId
     */
    getReports(pageNum) {
      const {uId} = this.$route.params;

      http.get(api["user_reports"], {
        params: {
          id: uId,
          skip: (pageNum || 1) - 1,
          limit: this.limit,
        }
      }).then((res) => {
        const d = res.data;
        let reportData = [];
        if (d.success === 1) {
          d.data.forEach(i => {
            reportData.push({
              createTime: i.createTime,
              originName: i.originName,
              originPersonaId: i.originPersonaId,
              status: i.status,
              updateTime: i.updateTime
            });
          });

          this.report.data = reportData;
          this.total = Number(this.account.reportnum);
        }
      });
    },
  },
  computed:{
    currentUser() {
      return this.$store.state.user && {token: '', userinfo: {userId: ''}};
    }
  }
});
</script>

<style lang="scss">
 .account-username {
   margin: 2rem 0 2rem 0;
 }

 .account-info-p {
   margin: .2rem;
   font-size: 12px;
   opacity: .6;
 }
</style>