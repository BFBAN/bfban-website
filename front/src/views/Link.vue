<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("link.title") }} 🦖</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>

    <br>

    <Card class="content" dis-hover>
      <div>
        <Row>
          <Col flex="auto">
            <h1><b>{{ $t("link.sponsor") }}</b></h1>
          </Col>
          <Col>
            <router-link :to="{name: 'about'}">
              {{ $t("link.join") }}
            </router-link>
          </Col>
        </Row>
        <Row :gutter="5" class="footer-link" type="flex">
          <Col v-for="(link, linkindex) in link.footerChild" :key="linkindex" align="center">
            <a :href="link.linkUrl" target="_blank" class="footer-link-text">
              <img :src="link.linkImageUrl" width="100" height="35" :alt="link.tag" :title="link.describe">
            </a>
          </Col>
        </Row>
      </div>

      <Divider dashed />

      <h1><b>{{ $t("link.links") }}</b></h1>
      <a v-for="(i, index) in link.linkChild"
           :key="index"
           :href="i.linkUrl"
            target="_parent">
          {{i.title}}
      </a>

      <Divider dashed />

      <h1><b>{{ $t("link.linkWebDeveloperChild") }}</b></h1>
      <a v-for="(i, index) in link.linkWebDeveloperChild"
         :key="index"
         :href="i.url"
         target="_parent">
        {{i.title}}
      </a>
    </Card>

    <br/>
  </div>
</template>

<script>
import link from "../../public/conf/link.json";

export default {
  data() {
    return {
      link: link
    };
  },
};
</script>

<style lang="scss">
</style>