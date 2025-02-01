<script setup>
import HtmlLink from "@/components/HtmlLink.vue";
import cheaterStatusView from "@/components/CheaterStatusView.vue";
import TimeView from "@/components/TimeView.vue";
import ExposedName from "@/components/ExposedName.vue";

export default {
  props: {
    data: []
  },
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
              const that = this,
                  href = window.location.origin + that.$router.resolve({
                    name: "player",
                    params: {ouid: params.row.originPersonaId}
                  }).href;
              return h('row', {
                props: {
                  type: 'flex',
                  align: 'middle',
                },
                class: 'reports-table'
              }, [
                h('Col', [
                  h('Avatar', {
                    props: {
                      src: params.row.avatarLink
                    },
                    style: {
                      margin: '0 10px 0 0'
                    }
                  })
                ]),
                h(ExposedName, {
                  props:{
                    disabled: true
                  }
                },[
                  h(HtmlLink, {
                    props: {
                      text: params.row.originName,
                      isPoptip: false,
                      href
                    },
                    style: {
                      "overflow": "hidden",
                      "display": "inline",
                      "width": "calc(100% - 50px)",
                      "text-overflow": "ellipsis",
                      "white-space": "nowrap",
                      "word-break": 'break-all',
                    },
                    on: {
                      click: () => {
                        that.$router.push({
                          name: "player",
                          params: {ouid: params.row.originPersonaId},
                        })
                      }
                    }
                  }, params.row.originName)
                ]),
                h('div', {class: 'reports-table-mark'})
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
    };
  },
  watch: {
    $route: "loadData",
    data: "loadData",
  },
  components: {},
  methods: {
    loadData() {
      if (this.data.length > 0)
        this.report.data = this.data;
    }
  },
}
</script>

<template>
  <Table show-header
         :border="false"
         :no-data-text="$t('basic.tip.noReports')"
         :columns="report.columns"
         :data="report.data"></Table>
</template>

<style>
.reports-table {
  position: relative;
}

.reports-table-mark {
  position: absolute;
  z-index: 1;
  right: 0;
  top: 0;
  bottom: 0;
  width: 30px;
  pointer-events: none;
}
</style>
