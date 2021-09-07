<template>
  <div class="theme">
    <p>
      选择单个主题，或与系统同步，并自动在白天和夜间主题之间切换.
    </p>
    <br>
    <RadioGroup v-model="theme" size="large">
      <Radio :label="i.value" v-for="i in themes" :key="i.value" align="center">
        <Card>
          <img class="theme_img" :src="i.img">
          <p>{{ i.title }}</p>
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

export default {
  name: "appearance",
  data() {
    return {
      themes: [{
        img: 'https://github.githubassets.com/images/modules/settings/color_modes/light_preview.svg',
        title: '默认', value: 'dis'
      },
      {
        img: 'https://github.githubassets.com/images/modules/settings/color_modes/dark_dimmed_preview.svg',
        title: '深色', value: 'deep'
      }],
      theme: '',
    }
  },
  created() {
    this.getTheme();
  },
  methods: {
    getTheme () {
      this.theme = storage.get('theme').data.value;
    },
    changeTheme(val) {
      storage.set('theme', this.theme);

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
