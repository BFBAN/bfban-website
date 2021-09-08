<template>
  <div class="container apps">
    <br>
    <Breadcrumb>
      <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
      <BreadcrumbItem>{{$t("home.howToUse.tools.main")}}</BreadcrumbItem>
    </Breadcrumb>
    <br>

    <div>
      <Row :gutter="30">
        <Col span="20">
          <h1>{{$t("home.howToUse.tools.main")}}</h1>
          <p>{{$t("home.howToUse.tools.describe")}}</p>
        </Col>
        <Col span="1" type="flex" align="right">
          <Button>{{$t("home.howToUse.tools.submit_tool_app")}}</Button>
        </Col>
      </Row>
      <Divider />
    </div>

    <Row :gutter="30">
      <Col span="4">
        <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
          <Checkbox
            :indeterminate="indeterminate"
            :value="checkAll"
            @click.prevent.native="handleCheckAll">全选</Checkbox>
        </div>
        <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
          <Checkbox :label="item.value" v-for="item in appsConf.tags" :key="item.value"></Checkbox><br>
        </CheckboxGroup>
      </Col>
      <Col span="20" class="apps-list">
        <div v-for="item in appsConf.list" :key="item.title">
          <Card class="apps-item" v-if="appItemIsShow(item)">
            <Badge :text="!!item.hot ? 'hot' : ''" :offset="[15, 20]">
              <h2>{{item.title}}</h2>
            </Badge>
            <div>
              <Tag color="primary" v-for="tagitem in item.tag || []" :key="tagitem.describe">{{tagitem}}</Tag>
            </div>
            <p style="overflow: hidden">{{item.describe}}</p>
            <div>
              <Divider />
              <Button type="primary" :disabled="!item.get">
                <a :href="item.get">获取</a>
              </Button>
              <Divider type="vertical"/>
              <Button type="dashed" :disabled="!item.website"><a :href="item.website">网站</a></Button>
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
  .apps {
    margin-top: 50px;
  }

  .apps-list {
    display: block;

    .apps-item {
      float: left;
      width: calc(50% - 20px);
      height: 200px;
      overflow: hidden;
      margin: 0 10px 20px 10px;

      > div {
        display: flex;
        flex-flow: column;
        justify-content: space-between;
        height: 100%;
      }
    }
  }
</style>
