<template>
  <Card id="getSharePicture" dis-hover :padding="0">
    <div class="share">
      <div class="share-info-context">
        <img class="share-logo user-select-none" src="@/assets/images/logo.png">
        <br class="user-select-none">
        <div style="text-align: center;">
          <ExposedName>
            <h1>{{ cheater.originName || 'N/A' }}</h1>
          </ExposedName>

          <h5 class="user-select-none">{{ cheater.originUserId || 'N/A' }}</h5>
        </div>
        <br class="user-select-none">
        <Row :gutter="20" type="flex" justify="center" align="middle" class="share-info">
          <Col>
            <cheater-status-view :status="cheater.status"/>
            <span class="share-info-p user-select-none">{{ $t("account.status") }}</span>
          </Col>
          <Divider type="vertical"/>
          <Col>
            <router-link :to="{name: 'player', params: {ouid: cheater.originPersonaId}, query: { game: cheater.game }}">
              <template v-if="cheater.games && cheater.games.length >= 0">
                <Tag color="gold" :alt="$t('detail.info.reportedGames')"
                     v-for="(game,game_index) in cheater.games" :key="game_index">
                  {{ $t(`basic.games.${game}`) }}
                </Tag>
              </template>
              <template v-else>
                <Tag fade>N/A</Tag>
              </template>
            </router-link>
            <span class="share-info-p user-select-none">{{ $t("report.labels.game") }}</span>
          </Col>
          <Divider type="vertical"/>
          <Col>
            <template v-if="cheater.cheatMethods && cheater.cheatMethods.length > 0">
              <Tag color="warning" v-for="(method_item, method_index) in cheater.cheatMethods" :key="method_index">
                {{ $t("cheatMethods." + method_item + ".title") }}
              </Tag>
            </template>
            <template v-else>
              <Tag fade>N/A</Tag>
            </template>
            <span class="share-info-p user-select-none">{{ $t("detail.info.cheatMethod") }}</span>
          </Col>
        </Row>
      </div>
      <div v-if="type === 'none'">
        <br>
        <Row :gutter="15">
          <Col flex="1" style="word-break: break-word;">
            <p>{{ href }} </p>
            <p class="share-description user-select-none">@{{ $t('name') }} 2018-{{ new Date().getFullYear() }}</p>
          </Col>
          <Col>
            <vue-qr :text="href" :size="70" :margin="3"></vue-qr>
          </Col>
        </Row>
      </div>
    </div>
    <Spin fix v-show="load">
      <div class="spin-icon-load">🦈</div>
    </Spin>
  </Card>
</template>

<script>
import {http_token, player_storage} from '../assets/js/index'
import theme from "/public/config/themes.json";

import vueQr from 'vue-qr'
import CheaterStatusView from "@/components/CheaterStatusView.vue";
import ExposedName from "@/components/ExposedName.vue";

if (window.callPhantom)
  window.callPhantom('takeShot');

export default {
  props: {
    personaId: {
      type: [String, Number],
      default: ""
    },
    type: {
      type: String,
      default: 'none'
    }
  },
  data() {
    return {
      load: true,
      isFull: true,
      href: window.location.href.replaceAll('/share', ''),
      cheater: {},
    }
  },
  created() {
    window.widgetReady = false;
    this.http = http_token.call(this);

    this.getCheatersInfo();
    // this.onLoadTheme();
    this.onLoadLang();
  },
  components: {ExposedName, CheaterStatusView, vueQr},
  watch: {
    '$route': 'getCheatersInfo',
    'personaId': 'getCheatersInfo'
  },
  methods: {
    /**
     * 加载主题
     * @returns {Promise<void>}
     */
    async onLoadTheme() {
      if (this.$route.query.theme)
        await this.$store.dispatch('setTheme', theme.child.filter(
            i => i.name === this.$route.query.theme)[0] || theme.child[0]
        );
    },
    /**
     * 加载语言
     */
    async onLoadLang(lang) {
      if (lang) {
        await this.$store.dispatch('setLang', lang)
        return;
      }

      // load lang
      if (this.$route.query.lang) {
        this.$store.dispatch('setLang', this.$route.query.lang);
      }
    },
    /**
     * 获取作弊者档案
     */
    async getCheatersInfo() {
      try {
        if (!this.$route.params.ouid && !this.personaId) return;

        this.load = true;
        this.cheater = await player_storage.getPlayerInfo({
          personaId: this.$route.params.ouid || this.personaId || null
        }, false);

      } finally {
        this.load = false;
        window.widgetReady = true;
      }
    },
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/css/icon";

.share {
  overflow: hidden;
  display: flex;
  position: relative;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  align-content: space-between;
  padding: 10px;

  .share-info-context {

    .share-description {
      opacity: .8;
    }

    .share-logo {
      pointer-events: none;
      width: 300px;
      height: 300px;
      position: absolute;
      opacity: .05;
      left: -50px;
      top: -110px;
      border-radius: 50%;
    }

    .share-info {
      text-align: center;
    }

    .share-info-p {
      display: block;
      margin: .5rem;
      font-size: 12px;
      opacity: .6;
    }
  }
}
</style>
