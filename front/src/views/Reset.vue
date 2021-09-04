<template>
  <div class="container">
    <div class="content">
      <br>
      <Breadcrumb>
        <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
        <BreadcrumbItem>{{ $t("reset.title") }}</BreadcrumbItem>
      </Breadcrumb>
      <br>

      <Card dis-hover>
        <Form :label-width="80">
          <FormItem :label="$t('reset.form.qq')">
            <Input type="text" v-model="reset.qq" :placeholder="$t('reset.form.qq')"/>
          </FormItem>

          <FormItem :label="$t('reset.form.password')">
            <Input type="password" v-model="reset.password" :placeholder="$t('reset.form.password')"/>
          </FormItem>

          <FormItem :label="$t('reset.form.passwordRepeat')">
            <Input type="password" v-model="reset.passwordRepeat" :placeholder="$t('reset.form.passwordRepeat')"/>
          </FormItem>

          <FormItem>
            <Button @click.prevent.stop="handleReset" type="primary">{{ $t('reset.form.submit') }}</Button>
          </FormItem>

          <Spin size="large" fix v-show="spinShow"></Spin>
        </Form>
      </Card>
    </div>
  </div>

</template>

<script>
import {http, api} from '../assets/js/index'
import {getCsrfToken, waitForAction} from '@/mixins/common';

const {mapActions, mapMutations} = Vuex;

export default {
  data() {
    return {
      reset: {
        qq: '',
        password: '',
        passwordRepeat: '',
      },
      spinShow: false,
    }
  },
  beforeMount() {
  },
  methods: {
    handleReset() {
      const {qq, password, passwordRepeat} = _.each(this.reset, (v, k, o) => {
        o[k] = v.trim();
      });

      const {token} = this.$route.query

      if (qq && password && passwordRepeat && password === passwordRepeat) {
        this.spinShow = true;

        http.post(api["account_reset"], {
          data: {qq, token, password, passwordRepeat,},
        }).then((res) => {
          this.spinShow = false;

          const d = res.data;

          this.$Message.success(d.msg);
          if (d.error === 1) {
            this.reset.password = '';
            this.reset.passwordRepeat = '';
          } else {
            this.$router.push('/signin')
          }
        })
      } else {
        this.$Message.error('请规范填写');
      }
    }
  }
}
</script>

<style>
</style>
