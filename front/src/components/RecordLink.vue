<template>
  <div>
    <Table row-key="name"
           :span-method="handleSpan"
           :show-header="false"
           :columns="detailLink.th"
           :data="getData"
           border>
    </Table>
  </div>
</template>

<script>

export default {
  props: {
    cheater: Object,
  },
  data() {
    return {
      site: {
        'Battlefield Tracker': {
          mainUrl:"https://battlefieldtracker.com",
          icon: "https://battlefieldtracker.com/public/icons/icon192.png",
          platform: {
            "origin": {
              "bf1": `/bf1/profile/origin/{name}`,
              "bfv": `/bfv/profile/origin/{name}`,
              "bf6": `/bf2042/profile/origin/{name}`
            },
            "xbox": {
              "bf1": `/bf1/profile/xbl/{name}`,
              "bfv": `/bfv/profile/xbl/{name}`,
              "bf6": `/bf2042/profile/xbl/{name}`
            },
            "ps": {
              "bf1": `/bf1/profile/psn/{name}`,
              "bfv": `/bfv/profile/psn/{name}`,
              "bf6": `/bf2042/profile/psn/{name}`
            }
          }
        },
        'Bf1 Stats': {
          "mainUrl":"http://bf1stats.com",
          "icon": "https://endof.p-stats.com/favicon.ico",
          platform: {
            "pc": {
              "bf1": `http://bf1stats.com/pc/{id}`
            },
            "xbox": {},
            "ps": {}
          }
        },
        'Gametools Network': {
          mainUrl:"https://gametools.network",
          icon: "https://gametools.network/favicon.ico",
          platform: {
            "origin": {
              "bf1": '/stats/pc/playerid/{id}?name={name}&game=bf1',
              "bfv": '/stats/pc/playerid/{id}?name={name}&game=bfv'
            },
            "xbox": {
              "bf1": '/stats/xboxone/name/{name}?game=bf1',
              "bfv": '/stats/xboxone/name/{name}?game=bfv'
            },
            "ps": {}
          }
        },
        '247 Fairplay': {
          mainUrl:"https://www.247fairplay.com",
          icon:"https://endof.p-stats.com/favicon.ico",
          platform: {
            "origin": {
              "bf1": `https://bf1stats.com/pc/{id}`
            },
            "xbox": {},
            "ps": {}
          }
        },
      },
      platform: {
        "origin": "Origin",
        "xbox": "Xbox",
        "ps": "PlayStation"
      },
      links: {
        'bf1': ['Battlefield Tracker','Bf1 Stats','Gametools Network','247 Fairplay'],
        'bfv': ['Battlefield Tracker','Gametools Network'],
        'bf6': ['Battlefield Tracker'],
        '*':[]
      },
      detailLink: {
        th: [
          {
            title: 'name',
            key: 'name',
            minWidth: 100,
            maxWidth: 300,
            tree: true,
            render: (h, params) => {
              if (params.row.platform) {
                return h('Row', {
                  props: {
                    gutter: 10,
                    type: "flex",
                    align: "middle"
                  },
                } ,[
                  h('Col', {}, [ h('Avatar', {
                    props: {
                      shape: 'square',
                      src: this.site[params.row.name].icon
                    },
                  }) ]),
                  h('Col', {
                    props: {
                      flex: 1
                    }
                  }, [ h('p', {}, `${params.row.name}`) ]),
                ]);
              }

              return h('Tag', {
                props: {
                  color: 'primary'
                }
              }, params.row.name);
            }
          },
          {
            title: 'platform',
            key: 'platform',
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
              // console.log(widgetTag)
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
  created() {
  },
  methods: {
    push (children = [], gamename) {
      const platformSelect = 'origin';
      if (!this.cheater) return ;

      // 对应游戏类型配置下平台
      this.links[gamename].forEach(platformName => {
        // 确认存在配置标签
        // 平台支持不同游戏类型
        if (this.site[platformName].platform[platformSelect] && this.site[platformName].platform[platformSelect][gamename]) {
          let url = this.site[platformName].mainUrl + this.site[platformName].platform[platformSelect][gamename];
          let gameplatform = [];

          // 处理游戏平台
          for (const gameplatformKey in this.site[platformName].platform) {
            if (this.site[platformName].platform[gameplatformKey][gamename])
              gameplatform.push({
                title: gameplatformKey,
                url: url
                    .replaceAll('{id}', this.cheater.originUserId)
                    .replaceAll('{name}', this.cheater.originName)
              })
          }

          children.push({
            name: platformName,
            platform: gameplatform
          })
        }
      })

      return children;
    },
    handleSpan ({ row, column, rowIndex, columnIndex }) {
      if (row.link == "") {
        return { colspan: 2 };
      }
    }
  },
  computed: {
    getData () {
      if (this.cheater.length <= 0) return ;
      if (!this.cheater.games) return [];

      this.cheater.games.forEach(i => {
        let children = [];

        children = this.push(children, i);
        // children = this.push(children, '*');

        // 游戏类型一行
        this.detailLink.data.push({
          name: this.$i18n.t(`basic.games.${i}`),
          link: '',
          children,
        })
      })

      return this.detailLink.data;
    }
  }
}
</script>