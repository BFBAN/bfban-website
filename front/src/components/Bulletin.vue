<template>
  <div class="content">
      <Divider>{{$t("home.bulletin.title")}}</Divider>
      <!-- <div class="md" v-html="data"></div> -->
      <div>
          <b>{{$t("home.bulletin.webDev")}}:</b> <a href="https://mygoare.com" target="_blank">mygoare</a><br>
		  
<!-- <b>{{$t("home.bulletin.bfbanAppD")}}:</b> <a href="https://app.bfban.com/public/www/">cabbagelol</a><br>
<b>{{$t("home.bulletin.japCon")}}:</b> <a href="https://www.youtube.com/channel/UCptnZeaSNaurVVy9UMWzI6w">RiseJack</a><br>
<b>{{$t("home.bulletin.engCon")}}:</b> <a href="https://live.bilibili.com/591314">___4Tr1</a><br> -->

          <b>{{$t("home.bulletin.lanCon")}}:</b> <a href="https://live.bilibili.com/591314" target="_blank">SoraKasvgano</a> <a href="https://www.youtube.com/channel/UCptnZeaSNaurVVy9UMWzI6w" target="_blank">RiseJack</a> <a href="https://top.gg/user/498163591216758815" target="_blank">Duck</a> <a href="https://top.gg/user/140391046822494208" target="_blank">Arcur</a> <a href="https://space.bilibili.com/44569813/" target="_blank">Sgt-Scar</a> <a href="https://www.youtube.com/channel/UCNj8A90Uo0jM8YZsXkLWO1w" target="_blank">KiyakAbi</a><br>
          <b>{{$t("home.bulletin.domCost")}}:</b> <a href="https://space.bilibili.com/24946604" target="_blank">RBQ</a><br>
		      <b>{{$t("home.bulletin.localManager")}}:</b> <a href="https://manager.gametools.network" target="_blank">Web Panel</a> <span>/</span> <a href="https://docs.qq.com/doc/DZFVocWxyTE5tR1lT" target="_blank">Windows Program(zh-cn)</a> <span>/</span> <a href="https://suzubucket.cc/bot-python/" target="_blank">QQ Bot(zh-cn)</a><br>
          <b v-if="this.$t('home.special.universityBFStats')!=''">{{ $t('home.special.universityBFStats') }} <a target="_blank" href="https://status.k-0n.org/">University Leader Board</a> </b>
      </div>
  </div>
</template>

// <script>
//   export default {
//     data() {
//       return {
//         data: marked(`
// **网站开发**: [mygoare](https://mygoare.com)
// **BFBAN APP下载**: [cabbagelol](https://app.bfban.com/public/www/)
// **JapaneseContributor**: [RiseJack](https://www.youtube.com/channel/UCptnZeaSNaurVVy9UMWzI6w)
// **EnglishContributor**: [___4Tr1](https://live.bilibili.com/591314)
// **DomainCost**: [【NFZ】BoomNextDoor](https://space.bilibili.com/131470523)
//         `, {breaks: true, gfm: true, smartLists: true})
//       }
//     }
//   }
// </script>

// <style lang="scss">
//   .md {
//     ul {
//       margin-left: 1rem;
//     }
//     p {
//       margin: .4rem 0;
//     }
//   }
// </style>
