<template>
  <div>
  </div>
</template>

<script>
import {api, http, http_token} from "../../assets/js";

export default {
  data () {
    return {}
  },
  created() {
    this.http = http_token.call(this);
  },
  methods: {

  }
}
</script>