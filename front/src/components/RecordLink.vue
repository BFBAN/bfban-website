<template>
  <div>
    <Table row-key="name" :span-method="handleSpan" :show-header="false" :columns="detailLink.th" :data="getData" border>
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
          "mainUrl":"https://tracker.gg",
          "icon": "https://tracker.gg/public/icons/icon192.png"
        },
        'Bf1 Stats': {
          "mainUrl":"http://bf1stats.com",
          "icon": "https://endof.p-stats.com/favicon.ico"
        },
        'Gametools Network': {
          "mainUrl":"https://gametools.network",
          "icon": "https://gametools.network/favicon.ico"
        },
        '247 Fairplay': {
          "mainUrl":"https://www.247fairplay.com",
          "icon":""
        },
      },
      links: {
        'bf1': {
          'Battlefield Tracker': `https://battlefieldtracker.com/bf1/profile/pc/{name}`,
          'Bf1 Stats': `http://bf1stats.com/pc/{id}`,
          'Gametools Network': 'https://gametools.network/stats/pc/playerid/{id}?name={name}&game=bf1',
          '247 Fairplay': 'https://www.247fairplay.com/CheatDetector/{id}'
        },
        'bfv': {
          'Battlefield Tracker': 'https://battlefieldtracker.com/bfv/profile/origin/{name}',
          'Gametools Network': 'https://gametools.network/stats/pc/playerid/{id}?name={name}&game=bfv',
          '247 Fairplay': 'https://www.247fairplay.com/CheatDetector/{id}'
        },
        'bf6': {
        },
        '*': {
        }
      },
      detailLink: {
        th: [
          {
            title: 'name',
            key: 'name',
            tree: true,
            render: (h, params) => {
              if (params.row.link) {
                return h('Row', {
                  props: {
                    gutter: 10,
                    type:"flex" ,
                    align:"middle",
                  }
                },  [
                  h('Avatar', {
                    props: {
                      shape: 'square',
                      src: this.site[params.row.name].icon
                    },
                    style: {

                    }
                  }),
                  h('p', {}, `${params.row.name}`),
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
            title: 'link',
            key: 'link'
          },
          {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    display: params.row.link ? 'block' : 'none'
                  },
                  on: {
                    click: () => {
                      window.open(params.row.link)
                    }
                  }
                }, 'link'),
              ]);
            }
          }
        ],
        data: []
      },
    }
  },
  created() {
  },
  methods: {
    push (children = [], name) {
      for (let link in this.links[name]) {
        if (!this.cheater) return ;

        children.push({
          name: link,
          link: this.links[name][link]
              .replaceAll('{id}', this.cheater.originUserId)
              .replaceAll('{name}', this.cheater.originName)
        })
      }

      return children;
    },
    handleSpan ({ row, column, rowIndex, columnIndex }) {
      if (row.link == "") {
        return { colspan: 3 };
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
        children = this.push(children, '*');

        this.detailLink.data.push({
          name: this.$i18n.t(`list.filters.game.${i}`),
          link: '',
          children,
        })
      })

      return this.detailLink.data;
    }
  }
}
</script>