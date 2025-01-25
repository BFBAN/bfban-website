<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("about.title") }} 🦖🦈🐧</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Card class="content about" :padding="80" dis-hover>
      <div class="about-logo-background"></div>

      <h1 class="about-title">
        <img class="about-logo shake active_infinite" src="@/assets/images/logo.png" alt="logo"/>
        {{ title }}
      </h1>
      <h3 class="about-minor" v-html="$t('about.minor')"></h3>
      <p class="about-description" v-html="$t('about.description')"></p>

      <Row class="about-footer-btn" :gutter="15" type="flex" justify="center" align="middle">
        <Col>
          <a href="https://short.bfban.com/privacy-policy" target="_blank">
            <Button>
              Privacy Policy
            </Button>
          </a>
        </Col>
        <Col>
          <a href="https://github.com/BFBAN/bfban-website/edit/master/CODE_OF_CONDUCT.md" target="_blank">
            <Button>
              CODE of Conduct
            </Button>
          </a>
        </Col>
        <Col>
          <Col>
            <a href="https://short.bfban.com/exterior-design" target="_blank">
              <Button>
                Exterior design
              </Button>
            </a>
          </Col>
        </Col>
        <Col>
          <Button :to="{path:'/link'}">
            {{ $t('link.title') }}
          </Button>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import Application from "../assets/js/application";

export default new Application({
  data() {
    return {};
  },
  computed: {
    title() {
      const name = this.$t("name")
      return `${name.charAt(0).toUpperCase()}${name.slice(1).toLocaleLowerCase()}`;
    }
  },
});
</script>

<style lang="less">
.about {
  overflow: hidden;
  text-align: center;
  white-space: pre-wrap;
  padding-bottom: 10px;

  .about-logo-background {
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

  .about-title {
    padding-top: 50px;
    position: relative;
    z-index: 2;
    margin-bottom: 60px;
    font-size: 58px;
    font-family: "Playwrite_IN", monospace, 'Noto Sans TC', sans-serif, "Microsoft YaHei", "微软雅黑", "Arial", sans-serif;

    .about-logo {
      user-select: none;
      display: inline-flex;
      width: 80px;
      height: 80px;
      border-radius: 10rem;
      margin: -10px 10px -10px 0;
    }
  }

  .about-minor {
    font-size: 20px;
    padding-top: 10px;
    padding-bottom: 20px;
  }

  .about-description,
  .about-minor {
    position: relative;
    z-index: 2;
    line-height: 2;
    margin: 20px 25%;
  }

  @media only screen and (max-width: 1024px) {
    .about-description,
    .about-minor {
      margin: 20px 0;
    }
  }

  .about-footer-btn {
    margin-top: 4rem;
  }
}
</style>
