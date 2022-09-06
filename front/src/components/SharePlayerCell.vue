<template>
  <div>
    <Card id="getSharePicture" class="share" dis-hover>
      <div slot="title">
        <img class="share-logo" src="../assets/images/logo.png">
        <br>
        <div v-show="cheater.avatarLink" align="center">
          <!-- Origin头像 -->
          <Avatar :src="cheater.avatarLink" size="80"
                  :title="$t('detail.info.originAvatar', { msg: 'originAvatar' })">
          </Avatar>
        </div>
        <br>
        <div style="text-align: center;">
          <h1>
            {{ cheater.originName }}
          </h1>
          <h5>{{ cheater.originUserId }}</h5>
        </div>
        <br>
        <Row :gutter="20" type="flex" justify="center" align="middle">
          <Col>
            <Tag color="error">
              {{ $t(`basic.status.${cheater.status}`) }}
            </Tag>
          </Col>
          <Divider type="vertical"/>
          <Col>
            <!-- 被举报的游戏 S -->
            <router-link :to="{name: 'cheater', params: { game: cheater.game }}" v-if="cheater.games">
              <Tag color="gold" :alt="$t('detail.info.reportedGames')"
                   v-for="(game,gameindex) in cheater.games" :key="gameindex">
                {{ $t(`basic.games.${game}`, {game: game}) }}
              </Tag>
            </router-link>
          </Col>
          <Divider type="vertical"/>
          <Col>
            <!-- 被举报的类型 E -->
            <template v-if="cheater.cheatMethods && cheater.cheatMethods.length > 0" >
              <Tag color="warning" v-for="(method_item, method_index) in cheater.cheatMethods" :key="method_index">
                {{ $t("cheatMethods." + method_item + ".title") }}
              </Tag>
            </template>
          </Col>
        </Row>

      </div>
      <div>
        <Row>
          <Col flex="1"> {{ href }} </Col>
          <Col>
            <vue-qr :text="href" :size="60" :margin="5"></vue-qr>
          </Col>
        </Row>
      </div>
    </Card>
  </div>
</template>

<script>
import {api, http, storage} from '../assets/js/index'
import theme from "/public/conf/themes.json";
import languages from "/public/conf/languages.json";

import vueQr from 'vue-qr'

export default {
  data() {
    return {
      isFull: true,
      href: window.location.origin,
      cheater: {},
    }
  },
  created() {
    this.getCheatersInfo();
    this.onLoadTheme();
    this.onLoadLang();
  },
  components: {vueQr},
  methods: {
     SetCwinHeight() {
      var cwin = document.getElementById("cwin");
      if (document.getElementById)
      {
        if (cwin && !window.opera)
        {
          if (cwin.contentDocument && cwin.contentDocument.body.offsetHeight)
            cwin.height = cwin.contentDocument.body.offsetHeight;
          else if(cwin.Document && cwin.Document.body.scrollHeight)
            cwin.height = cwin.Document.body.scrollHeight;
        }
      }
    },
    /**
     * 加载主题
     * @returns {Promise<void>}
     */
    async onLoadTheme () {
      await this.$store.dispatch('setTheme', theme.child.filter(
          i => i.name == this.$route.query.theme)[0] || theme.child[0]
      );
    },
    /**
     * 加载语言
     */
    async onLoadLang () {
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

      http.get(api["cheaters"], {
        params: Object.assign({
          history: true
        }, {
          personaId: this.$route.params.ouid
        })
      }).then((res) => {
        this.spinShow = false;
        const d = res.data;

        if (d.success === 1) {
          this.cheater = d.data;
          // this.cheater.games.forEach(i => {
          //   this.games.push({game: i});
          // })
        }
      });
    },
  }
}
</script>

<style>
.share-logo {
  width: 300px;
  height: 300px;
  position: fixed;
  opacity: .05;
  left: -50px;
  top: -110px;
  border-radius: 50%;
}
</style>