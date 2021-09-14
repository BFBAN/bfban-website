<template>
  <div class="container apps">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{$t("home.howToUse.tools.main")}}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Row :gutter="30">
      <Col flex="auto" :xs="{span: 24, push: 1, pull: 1}">
        <h1>{{$t("home.howToUse.tools.main")}}</h1>
        <p>{{$t("home.howToUse.tools.describe")}}</p>
      </Col>
      <Col type="flex" align="right" class="mobile-hide">
        <a href="https://github.com/BFBAN/bfban.github.io/issues">
          <Button>{{$t("home.howToUse.tools.submit_tool_app")}}</Button>
        </a>
      </Col>
    </Row>
    <Divider />

    <Row :gutter="30">
      <Col :xs="{span: 24, push: 1, pull: 1}" :lg="{span: 6,push:0,pull:0}">
        <Card>
          <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
            <Checkbox
                :indeterminate="indeterminate"
                :value="checkAll"
                @click.prevent.native="handleCheckAll">{{ $t('apps.screen.all') }}</Checkbox>
          </div>
          <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
            <Checkbox :label="$t('apps.screen.' + item.value)"
                      v-for="item in appsConf.tags"
                      :key="item.value" border style="margin-bottom: 10px"></Checkbox><br>
          </CheckboxGroup>
        </Card>
      </Col>
      <Col :xs="{span: 24, push: 1, pull: 0}" :lg="{span: 18,push:0,pull:0}" class="apps-list">
        <br class="desktop-hide">
        <div v-for="item in appsConf.list" :key="item.title">
          <Card class="apps-item" v-if="appItemIsShow(item)">
            <Badge :text="!!item.hot ? $t('apps.buttons.hot') : ''" :offset="[15, 20]">
              <h2 v-if="item.titleLang">
                {{item.titleLang[$i18n.locale] || item.title}}
              </h2>
              <h2 v-else>{{item.title}}</h2>
            </Badge>
            <div>
              <Tag color="primary" v-for="tagitem in item.tag || []" :key="tagitem.describe">
                {{ $t('apps.screen.' + tagitem) }}
              </Tag>
            </div>
            <p style="overflow: hidden">
              <span v-if="item.describeLang">{{ item.describeLang[$i18n.locale] || item.describe}}</span>
              <span v-else>{{item.describe}}</span>
            </p>
            <div>
              <Divider />
              <Button type="primary" :disabled="!item.get">
                <a :href="item.get">{{ $t('apps.buttons.get') }}</a>
              </Button>
              <Divider type="vertical"/>
              <Button type="dashed" :disabled="!item.website">
                <a :href="item.website">
                  {{ $t('apps.buttons.website') }}
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
  export default {
    name: "Apps",
    data () {
      return {
        appsConf: {},
        indeterminate: true,
        checkAll: false,
        checkAllGroup: []
      }
    },
    created () {
      this.getAppsList();
    },
    methods: {
      // 获取apps列表
      async getAppsList () {
        this.appsConf = await import('/src/assets/appslist.json');
        this.checkAllGroup = this.getAppsTagValue();
      },

      // 取apptags map内置值
      getAppsTagValue (valueName = 'value') {
        let checkAllGroup = [];
        for (let item of this.appsConf.tags) {
          if (item)
            checkAllGroup.push(item[valueName]);
        }

        return checkAllGroup;
      },

      /**
       * 是否可见
       * @param index this.appsConf
       * @returns {boolean}
       */
      appItemIsShow (index) {
        let that = this;
        let _is = false;
        let list = index?.tag || [];

        for (let indexTag in list) {
          if (that.checkAllGroup.indexOf( list[indexTag] ) >= 0) {
            _is = true;
          }
        }
        return _is;
      },

      // 全选
      handleCheckAll () {
        if (this.indeterminate) {
          this.checkAll = false;
        } else {
          this.checkAll = !this.checkAll;
        }
        this.indeterminate = false;

        if (this.checkAll) {
          this.checkAllGroup = this.getAppsTagValue();
        } else {
          this.checkAllGroup = [];
        }
      },

      // 筛选
      checkAllGroupChange (data) {
        if (data.length === 3) {
          this.indeterminate = false;
          this.checkAll = true;
        } else if (data.length > 0) {
          this.indeterminate = true;
          this.checkAll = false;
        } else {
          this.indeterminate = false;
          this.checkAll = false;
        }
      }
    }
  }
</script>

<style lang="scss">
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
