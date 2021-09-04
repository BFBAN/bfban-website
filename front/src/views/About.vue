<template>
  <div class="container">
    <Breadcrumb>
      <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
      <BreadcrumbItem>{{ $t("about.title") }}</BreadcrumbItem>
    </Breadcrumb>
    <br>
    <Card class="content" dis-hover>
      <p v-html="$t('about.description')"></p>
      <p v-html="$t('about.clanInfo', { clans: clan.length })"></p>

      <div class="clan">
        <p v-for="d in clan" :key="d.id">{{ d }}</p>
      </div>

      <br/>
      <p v-html="$t('about.website')"></p>

      <br/>
      <p v-html="$t('about.contact')"></p>
    </Card>
    <br>
  </div>
</template>

<script>
export default {
  data() {
    return {
      clan: [
        "1975",
        "CDN",
        "FATE",
        "HS",
        "SAK",
        "TNT",
        "Mua",
        "More27",
        "XJBD",
        "CNH",
        "KOI",
        "RUSH",
        "BOA",
        "pb",
        "coco",
        "WSG",
        "Lion",
        "LowB",
        "k-0n",
        "ROB",
        "HERO",
        "b1br",
        "awsl",
        "bilibili",
        "pcr",
      ],
    };
  },
};
</script>

<style lang="scss">
.logo {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 10rem;
  border-radius: 10rem;
}

.clan {
  display: flex;
  flex-wrap: wrap;

  p {
    flex-grow: 0;
    flex-basis: 20%;
    flex-shrink: 0;
  }
}
</style>
