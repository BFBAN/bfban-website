<template>
  <div>
    <div v-for="(i, index) in enhance" :key="index">
      <Card>
        <Row>
          <Col flex="auto">
            <h1>{{i.name}}</h1>
            <p>{{i.dis}}</p>
          </Col>
          <Col>
            <i-switch v-model="i.value" disabled></i-switch>
          </Col>
        </Row>
      </Card>
      <br>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      enhance: [
        {
          name: "底部工具栏",
          dis: "网站顶部附属的工具栏，为用户提供玩家持续关注等功能",
          value: false,
        },
        {
          name: "未处理提醒",
          dis: "为管理员提供自动刷新，关注未处理玩家做出站内提醒",
          value: false,
        },
        {
          name: "桌面通知",
          dis: "需要安装客户端，桌面级提醒通知",
          value: false,
        },
        {
          name: "多标签举报",
          dis: "允许同页面上，创建多个举报表单",
          value: true,
        },
        {
          name: "同步语言",
          dis: "个人信息的语言同步客户端",
          value: false,
        },
        {
          name: "游览标记",
          dis: "记录访问过玩家，并在列表中标记它，如果同时启动[未处理提醒]会标记自动刷新出现的新玩家",
          value: false,
        },
        {
          name: "历史",
          dis: "记录访问过玩家，在历史列表中可以再次访问",
          value: false,
        },
        {
          name: "交互声音",
          dis: "不同交互提供不同的声音",
          value: false,
        }
      ]
    }
  }
}
</script>