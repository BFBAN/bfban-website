<template>
  <div>
    <keep-alive>
      <SharePlayerCell class="player-card" :id="id"></SharePlayerCell>
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

<style scoped>
.player-card {
  user-select: none;
  margin: 10px 0;
}
</style>