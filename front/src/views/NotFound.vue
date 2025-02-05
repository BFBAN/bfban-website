<template>
  <div class="container">
    <div class="content notFound" align="center">
      <div class="content-main">
        <Icon type="md-alert" size="100" />
        <h2>{{ $t("basic.tip.notFound") }}</h2>
      </div>
    </div>
  </div>
</template>

<script>
import {application} from "@/assets/js";

export default new application({
  data () {
    return {
      time: Date.now()
    }
  }
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
