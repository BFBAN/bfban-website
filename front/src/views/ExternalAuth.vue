<script setup>
import Application from "../assets/js/application";

import {api, http, http_token} from "@/assets/js";

export default new Application({
  data() {
    return {
      authLoading: false,
      authStatus: -1
    }
  },
  created() {
    this.http = http_token.call(this);

    this.onUserAuth()
  },
  methods: {
    async onUserAuth() {
      try {
        const {code} = this.$route.query

        if (!code) return;
        this.authLoading = true;

        const result = await http.post(api["service_confirmAuth"], {data: {code}}),
            d = result.data;

        if (d.error === 1) throw d.message

        this.authStatus = 1
        this.$Message.success({
          content: this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }),
          duration: 10
        });
      } catch (err) {
        this.authStatus = 2
        this.$Message.error({content: err, duration: 10});
      } finally {
        this.authLoading = false
      }
    }
  }
})
</script>

<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("externalAuth.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Card bordered align="center">
        <template v-if="authLoading && authStatus == -1">
          <Icon type="md-refresh spin-icon-load" size="180"/>
          <p> {{ $t("externalAuth.validation") }}</p>
        </template>
        <template v-else-if="authStatus == 1">
          <Icon type="md-checkmark-circle-outline" size="180" color="#42b983"/>
          <p><b>{{ $t("externalAuth.successful") }}</b></p>
        </template>
        <template v-else-if="authStatus == 2">
          <Icon type="md-alert" size="180" color="red"/>
          <p><b>{{ $t("externalAuth.error") }}</b></p>
          <p>{{ $t("externalAuth.failure") }}</p>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
