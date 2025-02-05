<template>
  <div class="container apps">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("apps.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Row>
      <Col :xs="{span: 18, push: 1, pull: 1}" :lg="{push: 0, pull: 0}">
        <h1>{{ $t("apps.title") }}</h1>
        <p>{{ $t("apps.describe") }}</p>
      </Col>
      <Col align="right" :xs="{span: 0, push: 0, pull: 0}" :lg="{span: 6,push:0, pull: 0}">
        <a href="https://kook.top/Jlo8x6" target="_blank">
          <Button>{{ $t("apps.submit_tool_app") }}</Button>
        </a>
      </Col>
    </Row>
    <Divider/>

    <Row :gutter="10">
      <Col :xs="{span: 24, push: 0, pull: 0}" :lg="{span: 18,push:0,pull:0}" class="apps-list">
        <br class="desktop-hide">
        <div v-for="item in appsConf.list" :key="item.title">
          <Card dis-hover class="apps-item" v-if="appItemIsShow(item)">
            <div slot="title">
              <Badge :text="!!item.hot ? $t('apps.buttons.hot') : ''" :offset="[-1, -20]">
                <h2 v-if="item.titleLang">
                  {{ item.titleLang[$i18n.locale] || item.title }}
                </h2>
                <h2 v-else>{{ item.title }}</h2>
              </Badge>
            </div>

            <div>
              <Tag color="primary" v-for="tagitem in item.tag || []" :key="tagitem.describe">
                {{ $t('apps.screen.' + tagitem) }}
              </Tag>
            </div>

            <p>
              <span v-if="item.describeLang">{{ item.describeLang[$i18n.locale] || item.describe }}</span>
              <span v-else>{{ item.describe }}</span>
            </p>

            <div>
              <br>
              <Button type="primary" :disabled="!item.get" v-if="item.get">
                <a :href="item.get" target="_new">{{ $t('apps.buttons.get') }}</a>
              </Button>
              <Divider type="vertical" v-if="(!item.get || item.website) && (item.get || !item.website)"/>
              <Button type="dashed" :disabled="!item.website" v-if="item.website">
                <a :href="item.website" target="_new">
                  {{ $t('apps.buttons.website') }}
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </Col>
      <Col :xs="{span: 24, push: 0, pull: 0}" :lg="{span: 6,push:0,pull:0}">
        <Tree :data="getAppsScreen" show-checkbox @on-check-change="checkAllGroupChange"></Tree>
      </Col>
    </Row>
    <br>
  </div>
</template>

<script>
import {application} from "@/assets/js";

import appsConf from "/public/config/appslist.json";

export default new application({
  name: "Apps",
  data() {
    return {
      appsConf: [],
      checkAllGroup: [],
    }
  },
  created() {
    this.appsConf = appsConf;

    this.checkAllGroupChange();
  },
  methods: {
    /**
     * 取 app tags map内置值
     * @param valueName
     * @returns {{checked: boolean, title: any, value: any}[]}
     */
    getAppsTagValue(valueName = 'value') {
      let checkAllGroup = [];
      for (let item of appsConf.tags) {
        if (item)
          checkAllGroup.push({
            title: this.$i18n.t('apps.screen.' + item[valueName]),
            value: item[valueName],
            checked: true
          });
      }
      return checkAllGroup;
    },

    /**
     * 是否可见
     * @param index this.appsConf
     * @returns {boolean}
     */
    appItemIsShow(item) {
      let _is = false;
      let list = item?.tag || [];

      for (let indexTag in list) {
        if (this.checkAllGroup.indexOf(list[indexTag]) >= 0) {
          _is = true;
        }
      }
      return _is;
    },

    /**
     * 更新筛选结果
     * @param data
     */
    checkAllGroupChange() {
      let checkAllGroup = []
      if (this.getAppsScreen)
        this.getAppsScreen[0].children.forEach(i => {
          if (i.checked)
            checkAllGroup.push(i.value)
        })
      this.checkAllGroup = checkAllGroup;
    }
  },
  computed: {
    getAppsScreen() {
      let appsScreen = [
        {
          title: this.$i18n.t('apps.screen.all'),
          expand: true,
          children: this.getAppsTagValue() || []
        }
      ];
      return appsScreen;
    }
  }
});
</script>

<style lang="less">
@media screen and (max-width: 900px) {
  .apps-list {
    columns: 1 !important;
    column-gap: 0 !important;
  }
}

.apps-list {
  display: block;
  columns: 2;
  column-gap: 10px;

  .apps-item {
    break-inside: avoid;
    overflow: hidden;
    margin-bottom: 10px;

    > div {
      display: flex;
      flex-flow: column;
      justify-content: space-between;
      height: 100%;
    }
  }
}
</style>
