<template>
  <div>
    under construction
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
    /**
     * 修改评论
     */
    setComment () {
      this.http.post("admin/setComment", {
        data: {
          data: {
            id: '',
            content: 'content',
            videoLink: ''
          }
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          // TODO
        }
      })
    }
  }
}
</script>