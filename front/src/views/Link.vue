<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("link.title") }} 🦖🦈🐧</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>

    <br>

    <Card class="content" dis-hover>
      <div>
        <Row>
          <Col flex="auto">
            <h2>👏🏻 <b>{{ $t("link.sponsor") }}</b></h2>
          </Col>
          <Col>
            <Row :gutter="10">
              <Col>
                <a href="https://github.com/BFBAN/exterior-design" target="_blank">
                  <Button>Exterior design</Button>
                </a>
              </Col>
              <Col>
                <a href="mailto:services@bfban.com?subject=Join the BFBAN Sponsor application" target="_blank">
                  <Button>{{ $t("link.join") }}</Button>
                </a>
              </Col>
            </Row>
          </Col>
        </Row>
        <br/>
        <Card dis-hover>
          <Row :gutter="10" class="footer-link" type="flex" v-if="link.footerStatic">
            <Col v-for="(link, linkindex) in link.footerChild" :key="linkindex" align="center">
              <a :href="link.linkUrl" target="_blank" class="footer-link-text">
                <img :src="link.localFilePath" height="35" :alt="link.tag" :title="link.describe">
              </a>
            </Col>
          </Row>
        </Card>
      </div>

      <br/>

      <h2>🔗 <b>{{ $t("link.links") }}</b></h2>
      <br/>
      <Card dis-hover>
        <span v-for="(i, linkIndex) in link.linkChild" :key="linkIndex">
          <HtmlLink :href="i.linkUrl" :text="i.title" target="_blank"></HtmlLink>,
        </span>
      </Card>

      <br/>

      <h2>🏆 <b>{{ $t("link.linkWebDeveloperChild") }}</b></h2>
      <p>{{ $t("link.linkWebDeveloperDescribe") }}</p>
      <br>
      <Row :gutter="10">
        <Col v-for="(i, index) in link.linkWebDeveloperChild"
             :key="index">
          <a :href="i.url"
             target="_parent">
            <Card dis-hover :padding="4">
              <Avatar icon="ios-person" size="20"></Avatar>
              {{ i.title }}
            </Card>
          </a>
        </Col>
      </Row>

      <br/>

      <h2>🏆 <b>{{ $t("link.languageMembers") }}</b></h2>
      <p>{{ $t("link.languageMembersDescribe") }}</p>
      <br>
      <Card dis-hover>
        <div v-for="(i, index) of language.child"
             :key="index"
             :href="i.url"
             target="_parent">

          <Row :gutter="10" type="flex" align="middle">
            <Col>
              <b>{{ i.label }} ({{ i.name }})</b>
            </Col>
            <Col flex="1">
              <Divider dashed></Divider>
            </Col>
            <Col>
              <Row :gutter="10">
                <Col v-for="(members, membersindex) of i.members" :key="membersindex">
                  <Row :gutter="5">
                    <Col>
                      <Avatar icon="ios-person" size="20"></Avatar>
                    </Col>
                    <Col>
                      <HtmlLink :href="members.url" :text="members.name" target="_blank"></HtmlLink>,
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
          <br>
        </div>
      </Card>
    </Card>
  </div>
</template>

<script>
import Application from "../assets/js/application";
import link from "../../public/config/link.json";
import language from "../../public/config/languages.json";

import HtmlLink from "@/components/HtmlLink.vue"

export default new Application({
  data() {
    return {
      link,
      language,
    };
  },
  components: {HtmlLink}
});
</script>

<style lang="less" scoped>
@import "@/assets/css/footer";
</style>
