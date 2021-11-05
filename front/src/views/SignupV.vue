<template>
  <div class="container">
    <div class="content">
      <p>{{ this.$t(vstatus) }}</p>
    </div>
  </div>
</template>
<script>
import ajax, { baseURL } from "@/mixins/ajax";
export default {

  data() {
    return {
      vstatus: 'signup.processing'
    }
  },
  mounted() {
    let code = this.$route.query.code;
    console.log(code);
    ajax({
      method: 'GET',
      url: '/account/signupV?code='+encodeURIComponent(code),
    }).then(res=>{
      if(res.data.error)
        this.vstatus = 'signup.badcode';
      else {
        this.$Message.success(this.$t('signup.success'));
        this.$store.dispatch('signin', res.data.data)
        .then(() => {
          // redirect
          this.$router.push('/')
        });
      }
    });
  }
}
</script>
