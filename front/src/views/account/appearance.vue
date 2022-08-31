<template>
  <div class="theme">
    <RadioGroup v-model="themeIndex" size="large" :button-style="'solid'">
      <Badge :text="i.version" class="theme-card" v-for="(i, index) in themes.child" :key="index" >
        <Card @click="themeIndex = index" dis-hovershow>
<!--          <img class="theme-img" :src="require('/public/theme/' + i.name + '/preview.svg')" v-if="i.type == 'local'">-->
<!--          <img class="theme-img" :src="i.img" v-else>-->
          <div>
            <span>{{ i.authorInfo.authorName }}</span>
            <Divider type="vertical"></Divider>
            <span>{{ i.authorInfo.authorUpdate }}</span>
          </div>
        </Card>
        <Row>
          <Col flex="auto">
            <Radio :label="index" align="center"><span>{{ i.name }}</span></Radio>
          </Col>
          <Col></Col>
        </Row>
      </Badge>
    </RadioGroup>
    <Divider></Divider>
    <div>
      <Row>
        <Col span="12">
          <Button @click="changeTheme">{{ $t('basic.button.save') }}</Button>
        </Col>
        <Col span="12" align="right">
          🦖
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import {storage} from '../../assets/js/index'
import themes from '/public/conf/themes.json'

export default {
  name: "appearance",
  data() {
    return {
      themes,
      themeIndex: 0,
    }
  },
  created() {
    this.getTheme();
  },
  methods: {
    async getTheme () {
      let theme = await storage.get('theme');

      if (theme.data && theme.data.value) {
        this.themes.child.forEach((i, index) => {
          if (i.name == theme.data.value.name) {
            this.themeIndex = index;
          }
        });
        await this.$store.dispatch('setTheme', theme.data.value);
        return;
      } else {
        themes.child.filter((i, index) => {
          if (i.name == themes.default) this.themeIndex = index
        });
      }

      await this.$store.dispatch('setTheme', this.$store.state.$theme);
    },
    changeTheme(val) {
      storage.set('theme', this.themes.child[this.themeIndex || 0]);

      location.reload();
    }
  }
}
</script>

<style lang="scss" scoped>
.theme {
  .ivu-radio {
    position: absolute !important;
    top: 0;
    z-index: 10;
  }

  .theme-card {
    width: 30%;
    float: left;
    display: block;
    margin-right: 20px;
    margin-bottom: 20px;
    margin-top: 20px;
  }

  .theme-img {
    width: calc(100% + 32px) !important;
    margin: -16px -16px 0px -16px;
  }
}
</style>
