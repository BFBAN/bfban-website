<template>
  <Card dis-hover :padding="0" class="ad-container mobile-hide"
       style="width: 100%;height: 150px">
    <Adsense
        data-ad-client="ca-pub-6625226616103631"
        data-ad-slot="7930151828"
        data-ad-format="auto"
        data-full-width-responsive="true">
    </Adsense>
  </Card>
</template>

<script setup>
export default {
  name: 'AdsGoogle',
  data() {
    return {}
  },
  created() {
  }
}
</script>

<style scoped lang="less">
.ad-container {
  margin: 15px 0;
}
</style>
