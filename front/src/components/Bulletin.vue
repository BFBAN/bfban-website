<template>
  <div class="content">
      <Divider>{{$t("home.bulletin.title")}}</Divider>
      <!-- <div class="md" v-html="data"></div> -->
      <div><b>{{$t("home.bulletin.webDev")}}:</b> <a href="https://mygoare.com">mygoare</a><br>
          <b>{{$t("home.bulletin.bfbanAppD")}}:</b> <a href="https://app.bfban.com/public/www/">cabbagelol</a><br>
          <b>{{$t("home.bulletin.japCon")}}:</b> <a href="https://www.youtube.com/channel/UCptnZeaSNaurVVy9UMWzI6w">RiseJack</a><br>
          <b>{{$t("home.bulletin.engCon")}}:</b> <a href="https://live.bilibili.com/591314">___4Tr1</a><br>
          <b>{{$t("home.bulletin.domCost")}}:</b> <a href="https://space.bilibili.com/131470523">【NFZ】BoomNextDoor</a></div>

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
