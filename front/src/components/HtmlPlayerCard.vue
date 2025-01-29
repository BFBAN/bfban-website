<template>
  <div>
    <keep-alive>
      <SharePlayerCell class="player-card" :id="id" type="card"></SharePlayerCell>
    </keep-alive>
  </div>
</template>

<script>
import SharePlayerCell from "@/components/SharePlayerCell";

export default {
  name: "HtmlPlayerCard",
  props: {
    id: {
      type: Number,
      default: 0
    }
  },
  components: {SharePlayerCell},
}
</script>

<style lang="less" scoped>
.player-card {
  overflow: hidden;
  position: relative;
  user-select: none;
  margin: 10px 0;
}
</style>
