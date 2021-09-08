<template>
  <div class="content">
      <Divider>{{$t("home.bulletin.title")}}</Divider>

      <div class="md" v-html="data"></div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        data: `⛑`
      }
    }
  }
</script>

<style lang="scss">
  .md {
    ul {
      margin-left: 1rem;
    }
    p {
      margin: .4rem 0;
    }
  }
</style>
