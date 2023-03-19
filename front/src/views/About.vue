<template>
  <div class="container">
    <br>
    <Row>
      <Col :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("about.title") }} 🦖</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>
    <Card class="content" dis-hover>
      <p v-html="$t('about.description')"></p>

      <br/>
      <p v-html="$t('about.website')"></p>

      <br/>
      <p v-html="$t('about.privacy')"></p>
    </Card>
    <br>
  </div>
</template>

<script>
import Application from "../assets/js/application";

export default new Application({
  data() {
    return {
    };
  },
});
</script>

<style lang="less">
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
