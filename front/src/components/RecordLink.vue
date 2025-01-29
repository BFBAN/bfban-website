<template>
  <Table row-key="name"
         class="record-link-box"
         :span-method="handleSpan"
         :show-header="false"
         :columns="detailLink.th"
         :data="detailLink.data"
         border>
  </Table>
</template>

<style>
.record-link-box td[rowspan="1"] .ivu-table-cell .ivu-table-cell-tree-level,
.record-link-box td[rowspan="1"] .ivu-table-cell .ivu-table-cell-tree.ivu-table-cell-tree-empty {
  display: none;
}
</style>

<script>
import {util} from "@/assets/js";

import recordLinks from '../../public/config/recordLink.json'

export default {
  data() {
    return {
      detailLink: {
        th: [
          {
            minWidth: 100,
            maxWidth: 300,
            tree: true,
            render: (h, params) => {
              // 分支
              if (params.row.platform) {
                // params.column.tree = true;
                return h('Row', {
                  props: {
                    gutter: 10,
                    type: "flex",
                    align: "middle"
                  },
                }, [
                  h('Col', {}, [
                    h('Avatar', {
                      style: {
                        margin: '0 10px 0 0'
                      },
                      props: {
                        shape: 'square',
                        src: require(`/src/assets/images/recordPlatforms/${params.row.key}.png`)
                      },
                    }),
                  ]),
                  h('Col', {
                    props: {
                      flex: 1
                    }
                  }, [h('p', {}, `${params.row.key}`)]),
                ]);
              }

              // 主类型
              // params.column.tree = false;
              return h('Tag', {
                props: {
                  color: 'primary'
                }
              }, params.row.name);
            }
          },
          {
            flex: 1,
            render: (h, params) => {
              let widgetTag = [];

              // hr，不显示platform
              if (!params.row.platform) return;

              if (params.row.platform) {
                params.row.platform.forEach(p => {
                  widgetTag.push(
                      h('Col', {}, [h('Button', {
                        props: {
                          type: ['origin'].includes(p.title) ? 'primary' : null,
                          size: 'small'
                        },
                        on: {
                          click: () => {
                            window.open(p.url)
                          }
                        }
                      }, p.title)])
                  )
                });
              }
              return h('Row', {
                props: {
                  gutter: 10,
                }
              }, widgetTag);
            }
          },
        ],
        data: []
      },
    }
  },
  watch: {
    "$route": 'generateTable'
  },
  methods: {
    /**
     * 生成表单
     */
    generateTable(cheater) {
      if (!cheater) return;
      this.cheater = cheater;

      this.detailLink.data = [];
      this.generateColumn();
    },
    /**
     * generate table td
     * @param children
     * @param gameName
     * @returns {*[]}
     */
    generateLine(children = [], gameName) {
      const platformSelect = 'origin';
      if (!this.cheater) return;

      // 对应游戏类型配置下平台
      recordLinks.links[gameName].forEach(platformName => {
        // 确认存在配置标签
        // 平台支持不同游戏类型
        if (
            recordLinks.site[platformName].platform &&
            recordLinks.site[platformName].platform[platformSelect] &&
            recordLinks.site[platformName].platform[platformSelect][gameName]
        ) {
          let url = recordLinks.site[platformName]['webSite'] + recordLinks.site[platformName].platform[platformSelect][gameName];
          let gamePlatform = [];

          // 处理游戏平台
          // Processing game platform
          for (const gamePlatformKey in recordLinks.site[platformName].platform) {
            if (recordLinks.site[platformName].platform[gamePlatformKey][gameName])
              gamePlatform.push({
                title: this.$i18n.t('basic.gamePlatforms.' + gamePlatformKey),
                url: util.onReplacementStringVariable(url, {
                  id: this.cheater.originUserId,
                  personaId: this.cheater.originPersonaId,
                  name: this.cheater.originName
                })
              })
          }

          children.push({
            key: platformName,
            platform: gamePlatform,
            children: []
          })
        }
      })
      return children;
    },
    /**
     * generate table td
     */
    generateColumn() {
      if (this.cheater.length <= 0 || !this.cheater.games) return;
      let array = [];

      this.cheater.games.forEach(i => {
        // 游戏类型一行
        // children {function} generateLine(children, i) 中的children字段，在一级时，应当是一个新数组
        // link在一级时为空
        array.push({
          name: this.$i18n.t(`basic.games.${i}`),
          link: '',
          children: this.generateLine([], i),
        })
      });

      this.detailLink.data = array;
    },
    /**
     * Merge form cells
     * @param row
     * @param column
     * @param rowIndex
     * @param columnIndex
     * @returns {{colspan: number}}
     */
    handleSpan({row, column, rowIndex, columnIndex}) {
      if (row.link === "") {
        return {colspan: 2};
      }
    },
  },
  computed: {}
}
</script>
