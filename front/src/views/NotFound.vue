<template>
  <div class="container">
    <div class="content notFound" align="center">
      <div class="content-main">
        <h1>404</h1>
        <h4>{{ $t("basic.tip.notFound") }}</h4>
        <br>
        <Row type="flex" justify="center" align="middle">
          <Col>
            <a href="http://kook.top/wHwxhw">{{ $t('signin.form.Feedback') }}</a>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>

<script>
import Application from "../assets/js/application";

export default new Application({
  data() {
    return {}
  },
  methods: {}
});
</script>

<style lang="less" scoped>
.notFound {
  min-height: 500px;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  align-content: center;

  .content-main {
    margin: 20px 0 100px 0;

    h1 {
      font-size: 15rem;
      color: #8f8f8f;
    }
  }

}
</style>
