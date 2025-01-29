<script>
import {storage} from '../assets/js/index'
import themes from '/public/config/themes.json'

export default {
  props: {
    size: {
      type: String,
      default: '27px'
    }
  },
  data() {
    return {
      themes,
    }
  },
  methods: {
    /**
     * 改变主题
     * @param {number} index
     */
    changeTheme(index) {
      storage.local.set('theme', this.themes.child[index || 0]);

      location.reload();
    },
  }
}
</script>

<template>
  <Dropdown>
    <DropdownItem style="padding: 0;">
      <div v-for="(i, theme_index) in themes.child" :key="theme_index" class="iuv-card">
        <template v-if="$store.state.$theme.name === i.name">
          <div class="header-theme-color" :style="`background-color: ${i.themeColor};width: ${size};height: ${size};`">
            <Icon type="md-color-fill" size="18"/>
          </div>
        </template>
      </div>
    </DropdownItem>
    <DropdownMenu slot="list" class="header-theme-ul">
      <DropdownItem
          v-for="(i, theme_index) in themes.child" :key="theme_index"
          :name="i.name"
          :selected="$store.state.$theme.name === i.name"
          @click.native="changeTheme(theme_index)">
        <Row type="flex" align="middle">
          <div class="header-theme-color right-space" :style="`background-color: ${i.themeColor}`"></div>
          <p>{{ i.name }}</p>
        </Row>
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
</template>

<style scoped lang="less">
.header-theme-ul {
  min-width: 200px;
}

.header-theme-color {
  display: flex;
  justify-content: center;
  width: 27px;
  height: 27px;
  align-items: center;
  border-radius: 3px;

  .ivu-icon {
    opacity: .1;
  }
}

.header-theme-color.right-space {
  margin-right: 10px;
}
</style>
