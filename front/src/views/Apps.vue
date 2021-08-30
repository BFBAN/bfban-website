<template>
  <div class="container apps">
    <div>
      <Row :gutter="30">
        <Col span="12">
          <h1>{{$t("home.howToUse.tools")}}</h1>
          <p>第三方集成BFBAN数据库工具</p>
        </Col>
        <Col align="right">
          <Button>提交你的应用</Button>
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
          <Checkbox :label="item.value" v-for="(item,i) in appsConf.tags"></Checkbox><br>
        </CheckboxGroup>
      </Col>
      <Col span="20" class="apps-list">
        <block v-for="(item, i) in appsConf.list" >
          <Card class="apps-item" v-if="appItemIsShow(i)">
            <h2>{{item.title}}</h2>
            <div>
              <Tag color="primary" v-for="(tagitem, tagi) in item.tag">{{tagitem}}</Tag>
            </div>
            <p>{{item.describe}}</p>
            <div>
              <Divider />
              <Button type="primary" :disabled="!item.get">
                <a :href="item.get">获取</a>
              </Button>
              <Divider type="vertical" v-if="item.website"/>
              <Button type="text" :disabled="!item.website"><a :href="item.website">网站</a></Button>
            </div>
          </Card>
        </block>
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
    getAppsList () {
      axios({
        method: 'get',
        url: 'assets/json/appslist.json',
      })
        .then(res => {
          this.appsConf = res.data;
          this.checkAllGroup = this.getAppsTagValue();
        });
    },

    // 取apptags map内置值
    getAppsTagValue (valueName = 'value') {
      let checkAllGroup = [];
      for (let i of this.appsConf.tags) {
        checkAllGroup.push(i[valueName]);
      }

      return checkAllGroup;
    },

    // 是否可见
    appItemIsShow (index) {
      let that = this;
      let _is = false;

      for (let indexTag in this.appsConf.list[index].tag) {
        if (that.checkAllGroup.indexOf( this.appsConf.list[index].tag[indexTag] ) >= 0) {
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
