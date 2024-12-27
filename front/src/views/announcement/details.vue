<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem :to="{name: 'announcement'}">{{ $t("home.bulletin.title") }}</BreadcrumbItem>
          <BreadcrumbItem>{{$route.query.date}}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Card dis-hover class="announcement">
<!--      <div class="title">{{config.name}}</div>-->

<!--      <div class="user">-->
<!--        <div class="name">{{config.author.name}}</div>-->
<!--        <div class="date">{{config.date}}</div>-->
<!--      </div>-->
<!--      <div class="content">-->
<!--        <item :data="config.content.nodes" />-->
<!--      </div>-->

      <div v-html="htmlContent"></div>

    </Card>
  </div>

</template>

<script>
// import item from './components/item.vue'
// import config from './config'
export default {
  data() {
    return {
      htmlContent: ''
    }
  },
  mounted() {
    const { route, date } = this.$route.query
    fetch(`/data/${this.$i18n.locale === "zh-CN" ? "CN" : "US"}/${route}/${date}.html`)
        .then((response) => {
          if (!response.ok) throw new Error("加载 HTML 文件失败！");
          return response.text();
        })
        .then((html) => {
          this.htmlContent = html;
        })
        .catch((error) => {
          console.error("HTML 加载错误:", error);
        });
  },
}
</script>

<style lang="less" scoped>
.announcement {
  .title {
    min-height: 42px;
    font-size: 34px;
    font-weight: 600;
    line-height: 48px;
    // text-align: center;
    padding: 30px 10px 10px;
  }
  .user {
    margin: 14px 10px 24px;
    .name {
      color: rgb(44, 44, 47);
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      text-overflow: ellipsis;
      word-break: break-all;
    }
    .date {
      color: rgb(146, 146, 156);
      font-size: 12px;
      font-weight: normal;
      line-height: 1.45;
    }
  }
}
</style>
