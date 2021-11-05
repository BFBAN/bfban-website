<template>
  <div>
    <Table row-key="name" :columns="detailLink.th" :data="getData" border></Table>
  </div>
</template>

<script>

export default {
  props: {
    cheater: Object,
  },
  data() {
    return {
      links: {
        'bf1': {
          'Battlefieldv Tracker': `https://battlefieldtracker.com/bf1/profile/pc/{name}`,
          'Bf1 Stats': `http://bf1stats.com/pc/{id}`,
          'Gametools Network': 'https://gametools.network/stats/pc/playerid/{id}?name={name}&game=bf1'
        },
        'bfv': {
          'Battlefield Tracker': 'https://battlefieldtracker.com/bfv/profile/origin/{name}',
          'Gametools Network': 'https://gametools.network/stats/pc/playerid/{id}?name={name}&game=bfv'
        },
        '*': {
          '247 Fairplay': 'https://www.247fairplay.com/CheatDetector/{id}'
        }
      },
      detailLink: {
        th: [
          {
            title: 'name',
            key: 'name',
            tree: true
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
        children.push({
          name: link,
          link: this.links[name][link]
              .replaceAll('{id}', this.cheater.originUserId)
              .replaceAll('{name}', this.cheater.originName)
        })
      }

      return children;
    }
  },
  computed: {
    getData () {
      if (!this.cheater.games) return [];
      this.cheater.games.split(',').forEach(i => {
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