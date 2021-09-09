<template>
  <div class="theme">
    <p>
      选择单个主题，或与系统同步，并自动在白天和夜间主题之间切换.
    </p>
    <br>
    <RadioGroup v-model="themeIndex" size="large">
      <Radio :label="index" v-for="(i, index) in themes.child" :key="index" align="center">
        <Card>
          <img class="theme_img" :src="i.img">
          <p>{{ i.name }}</p>
        </Card>
      </Radio>
    </RadioGroup>
    <Divider></Divider>
    <div>
      <Row>
        <Col span="12">
          <Button @click="changeTheme" >确认</Button>
        </Col>
        <Col span="12" align="right">
          需要重载页面生效
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import {storage} from '../../assets/js/index'
import themes from '../../assets/themes.json'

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
  .theme_img {
    margin: -16px -16px 0px -16px;
    border-bottom: 1px solid #f2f2f2;
  }
}
</style>
