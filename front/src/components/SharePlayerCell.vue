<template>
  <Card id="getSharePicture" class="share" dis-hover>
    <div slot="title">
      <img class="share-logo" src="../assets/images/logo.png">
      <br>
      <div style="text-align: center;">
        <h1 class="text-distinguishing-letter">
          <code>{{ cheater.originName }}</code>
        </h1>
        <h5>{{ cheater.originUserId }}</h5>
      </div>
      <br>
      <Row :gutter="20" type="flex" justify="center" align="middle" class="share-info">
        <Col>
          <Tag color="error">{{ $t(`basic.status.${cheater.status}.text`) }}</Tag>
          <span class="share-info-p">{{ $t("account.status") }}</span>
        </Col>
        <Divider type="vertical"/>
        <Col>
          <router-link :to="{name: 'cheater', params: { game: cheater.game }}" v-if="cheater.games">
            <template v-if="cheater.games.length > 0">
              <Tag color="gold" :alt="$t('detail.info.reportedGames')"
                   v-for="(game,gameindex) in cheater.games" :key="gameindex">
                {{ $t(`basic.games.${game}`, {game: game}) }}
              </Tag>
            </template>
            <template v-else>
              <Tag color="warning">N/A</Tag>
            </template>
          </router-link>
          <span class="share-info-p">{{ $t("report.labels.game") }}</span>
        </Col>
        <Divider type="vertical"/>
        <Col>
          <template v-if="cheater.cheatMethods && cheater.cheatMethods.length > 0">
            <Tag color="warning" v-for="(method_item, method_index) in cheater.cheatMethods" :key="method_index">
              {{ $t("cheatMethods." + method_item + ".title") }}
            </Tag>
          </template>
          <template v-else>
            <Tag color="warning">N/A</Tag>
          </template>
          <span class="share-info-p">{{ $t("detail.info.cheatMethod") }}</span>
        </Col>
      </Row>
    </div>
    <div v-if="type == 'none'">
      <Row :gutter="5">
        <Col :ms="{span: 18}" :xs="{span: 18}" :lg="{span: 20}" style="word-break: break-word;">
          <p>{{ href }} </p>
          <p>@BFBAN 2018-{{ new Date().getFullYear() }}</p>
        </Col>
        <Col :ms="{span: 6}" :xs="{span: 6}" :lg="{span:4}">
          <vue-qr :text="href" :size="70" :margin="3"></vue-qr>
        </Col>
      </Row>
    </div>
  </Card>
</template>

<script>
import {api, http, http_token, storage} from '../assets/js/index'
import theme from "/public/config/themes.json";
import languages from "/public/config/languages.json";

import vueQr from 'vue-qr'

if (window.callPhantom)
  window.callPhantom('takeShot');

export default {
  props: {
    personaId: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: 'none'
    }
  },
  data() {
    return {
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
  components: {vueQr},
  methods: {
    /**
     * 加载主题
     * @returns {Promise<void>}
     */
    async onLoadTheme() {
      await this.$store.dispatch('setTheme', theme.child.filter(
          i => i.name == this.$route.query.theme)[0] || theme.child[0]
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
    getCheatersInfo() {
      this.cheater = {};
      this.http.get(api["cheaters"], {
        params: Object.assign({
          history: true,
          personaId: this.$route.params.ouid || this.personaId || null
        })
      }).then(res => {
        this.spinShow = false;
        const d = res.data;

        if (d.success === 1) {
          this.cheater = d.data;
        }
      }).finally(() => {
        window.widgetReady = true;
      });
    },
  }
}
</script>

<style lang="less" scoped>
#getSharePicture {
  position: relative;
  overflow: hidden;
  height: 100vh;
}

.share-logo {
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
</style>
