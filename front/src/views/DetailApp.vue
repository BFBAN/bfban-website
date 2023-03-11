<template>
  <div class="container">
    <div class="content">
      <template>
        <br>
        <Row>
          <Col :xs="{push: 1}" :lg="{push: 0}">
            <Breadcrumb>
              <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
              <BreadcrumbItem :to="{name: 'player_list'}">{{ $t("list.title") }}</BreadcrumbItem>
              <BreadcrumbItem :to="{name: 'player'}">{{ $t("detail.info.cheatersInfo") }}</BreadcrumbItem>
              <BreadcrumbItem>{{ $t('detail.info.app_qr.title') }}</BreadcrumbItem>
            </Breadcrumb>
          </Col>
        </Row>
        <br>
      </template>

      <Card dis-hover class="detail-app">
        <div class="mobile-hide" align="center">
          <vue-qr :text="'{id: '+ $route.params.ouid + '}'" :size="250"></vue-qr>

          <div class="qrcode" ref="qrCodeUrl"></div>

          {{ $t('detail.info.app_qr.tip') }} 🦖
        </div>
        <div class="desktop-hide" align="center">
          <Button>{{ $t('detail.info.app_qr.openApp') }}</Button>
          <p>{{ $t('detail.info.app_qr.openAppDescribe') }} 🦖</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import Application from "/src/assets/js/application"
import vueQr from 'vue-qr'

export default new Application({
  name: "detailApp",
  data() {
    return {

    }
  },
  components: {vueQr},
  created() {

  },
  methods: {

  },
  computed: {

  }
})
</script>

<style lang="scss" scoped>
@media screen and (min-width: 1024px) {
  .detail-app {
    justify-content: center;
    display: flex;
    min-height: 400px;
    flex-direction: column;
  }
}
</style>
