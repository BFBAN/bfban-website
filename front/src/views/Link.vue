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

    <Card class="content link" dis-hover>
      <div class="link-background"></div>

      <div class="business-partner-link">
        <div class="header">
          <Row>
            <Col flex="auto">
              <h2>👏🏻 <b>{{ $t("link.sponsor") }}</b></h2>
            </Col>
            <Col>
              <Row :gutter="10">
                <Col>
                  <a href="mailto:services@bfban.com?subject=Join the BFBAN Sponsor application" target="_blank">
                    <Button>{{ $t("link.join") }}</Button>
                  </a>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <div class="content">
          <Row :gutter="10" class="footer-link" type="flex" v-if="link.footerStatic">
            <Col v-for="(link, linkindex) in link.footerChild" :key="linkindex" align="center">
              <a :href="link.linkUrl" target="_blank" class="footer-link-text">
                <img :src="link.localFilePath" :alt="link.tag" :title="link.describe">
              </a>
            </Col>
          </Row>

          <Row :gutter="15" class="friend-link">
            <Col>🔗 <b>{{ $t("link.links") }}</b></Col>
            <Col>
            <span v-for="(i, linkIndex) in link.linkChild" :key="linkIndex">
              <HtmlLink :href="i.linkUrl" :text="i.title" target="_blank"></HtmlLink>,
            </span>
            </Col>
          </Row>
        </div>
      </div>

      <div class="dev-link">
        <h2><b>{{ $t("link.linkWebDeveloperChild") }}</b></h2>
        <p class="description">{{ $t("link.linkWebDeveloperDescribe") }}</p>
        <div class="content">
          <Row :gutter="20" type="flex" justify="center">
            <Col v-for="(i, index) in link.linkWebDeveloperChild"
                 :key="index">
              <Row :gutter="5" type="flex" align="middle">
                <Col>
                  <Avatar icon="ios-person" size="30"></Avatar>
                </Col>
                <Col>
                  <HtmlLink :text="i.title" :href="i.url"></HtmlLink>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      <div class="translated-link">
        <h2><b>{{ $t("link.languageMembers") }}</b></h2>
        <p class="description">{{ $t("link.languageMembersDescribe") }}</p>
        <div class="content">
          <Card :bordered="false" dis-hover :padding="0">
            <div v-for="(i, index) of language.child"
                 :key="index"
                 :href="i.url"
                 target="_parent">
              <Row :gutter="10" type="flex" align="middle">
                <Col>
                  <b>
                    <HtmlLink :text="i.label" :href="`/lang/${i.value}.json`"></HtmlLink>
                  </b>
                  ({{ i.name }})
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
                          <HtmlLink :href="members.url" :text="members.name" target="_blank"></HtmlLink>
                          ,
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import {application} from "@/assets/js";

import link from "/public/config/link.json";
import language from "/public/config/languages.json";

import HtmlLink from "@/components/HtmlLink"

export default new application({
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

.link {
  overflow: hidden;
  position: relative;
  padding-top: 200px;

  .link-background {
    opacity: .1;
    z-index: 0;
    pointer-events: none;
    position: absolute;
    display: block;
    top: -10rem;
    left: calc(50% - 15rem);
    background-position: center center;
    background-size: 30rem 30rem;
    background-repeat: no-repeat;
    background-image: linear-gradient(to top, rgba(255, 255, 255, 1) 20%, rgba(255, 255, 255, 0)), url(../assets/images/logo.png);
    width: 30rem;
    height: 30rem;
    border-radius: 50rem;
  }
}

.business-partner-link,
.friend-link,
.dev-link,
.translated-link {
  margin-bottom: 150px;

  h2 {
    font-size: 35px;
    margin-bottom: 8px;
  }

  .description {
    margin: 0 auto 30px auto;
  }

  @media only screen and (max-width: 1024px) {
    .content {
      width: 100% !important;
    }
  }
}

.business-partner-link {
  img {
    margin-right: 15px;
    margin-bottom: 20px;
    height: 40px;
  }

  .header,
  .content {
    width: 80%;
    margin: 0 auto;
  }
}

.friend-link {
  font-size: 18px;
}

.dev-link {
  h2, p {
    text-align: center;
  }

  .content {
    width: 80%;
    margin: 0 auto;
  }
}

.translated-link {
  h2, p {
    text-align: center;
  }

  .content {
    width: 80%;
    margin: 0 auto;
  }
}
</style>
