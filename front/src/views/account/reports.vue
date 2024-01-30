<template>
  <Tabs>
    <TabPane :label="$t('profile.reports.title')">
      <div class="profile-body">

        <Row>
          <Col :xm="{span: 24}" :lg="{span: 24}"
               style="width: 100%">
            <Card dis-hover :padding="0">
              <Table show-header
                     :border="false"
                     :no-data-text="$t('basic.tip.noReports')"
                     :columns="report.columns"
                     :data="report.data"></Table>
            </Card>

            <br/>
            <Row>
              <Col :xs="{span: 23, push: 1}" :lg="{span: 24, push: 0}">
                <Page
                    show-total
                    @on-change="getReports"
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
    </TabPane>
  </Tabs>
</template>

<script>
import Application from "@/assets/js/application";
import cheaterStatusView from "@/components/CheaterStatusView.vue";
import TimeView from "@/components/TimeView.vue";
import Empty from "@/components/Empty.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import Confetti from "@/components/Confetti.vue";
import vueQr from "vue-qr";
import {api, http, http_token, util} from "@/assets/js";

export default new Application({
  data() {
    return {
      load: false,
      report: {
        columns: [
          {
            title: this.$i18n.t("account.reported"),
            key: 'originName',
            fixed: "left",
            minWidth: 200,
            maxWidth: 300,
            ellipsis: true,
            tooltip: true,
            render: (h, params) => {
              const that = this;
              return h('row', {
                props: {
                  type: 'flex',
                  align: 'middle',
                }
              }, [
                h('col', [
                  h('Avatar', {
                    props: {
                      src: params.row.avatarLink
                    },
                    style: {
                      margin: '0 10px 0 0'
                    }
                  })
                ]),
                h('col', [
                  h('a', {
                    attr: {
                      title: params.row.originName
                    },
                    style: {
                      "overflow": "hidden",
                      "display": "block",
                      "width": "100px",
                      "text-overflow": "ellipsis",
                      "white-space": "nowrap"
                    },
                    on: {
                      click() {
                        that.$router.push({
                          name: 'player',
                          params: {
                            ouid: params.row.originPersonaId
                          }
                        })
                      }
                    }
                  }, params.row.originName)
                ])
              ]);
            }
          },
          {
            title: this.$i18n.t('signup.form.originId'),
            key: 'originPersonaId',
            ellipsis: true,
            width: 200,
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
            width: 200,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h(cheaterStatusView, {
                  props: {
                    status: params.row.status
                  }
                }, params.row.status)
              ]);
            }
          },
          {
            title: this.$i18n.t("list.colums.reportTime"),
            key: 'createTime',
            sortable: true,
            minWidth: 150,
            render: (h, params) => {
              return h('Tag', {
                props: {
                  color: 'primary'
                }
              }, [
                h(TimeView, {
                  props: {
                    time: params.row.createTime
                  }
                }, [
                  h('Time', {
                    props: {
                      time: params.row.createTime,
                      type: 'datetime'
                    }
                  })
                ])
              ]);
            }
          },
          {
            title: this.$i18n.t("list.colums.updateTime"),
            key: 'updateTime',
            align: 'center',
            width: 200,
            sortable: true,
            render: (h, params) => {
              return h('tag', {
                props: {
                  color: "primary"
                }
              }, [
                h(TimeView, {
                  props: {
                    time: params.row.createTime
                  }
                }, [
                  h('Time', {
                    props: {
                      time: params.row.updateTime
                    }
                  })
                ])
              ]);
            }
          }
        ],
        data: []
      },
      limit: 40,
      page: 1,
      total: 0,
    };
  },
  watch: {
    $route: "loadData",
  },
  components: { Empty, UserAvatar, cheaterStatusView, TimeView, Confetti, vueQr},
  created() {
    this.http = http_token.call(this);

    this.getMyReports();
  },
  methods: {
    /**
     * 获取举报信息
     * @param uId
     */
    getMyReports() {
      this.load = true;

      http.get(api["user_reports"], {
        params: {
          id: this.currentUser.userinfo.userId,
          skip: (this.page || 1) - 1,
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
    isChat () {
      return !this.account.attr.allowDM || this.account.id == this.currentUser.userinfo.userId
    }
  }
})
</script>

<style scoped lang="less">

</style>
