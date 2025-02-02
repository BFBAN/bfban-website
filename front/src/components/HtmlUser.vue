<script>
import HtmlLink from "@/components/HtmlLink.vue";
import {api, http} from "@/assets/js"

export default {
  props: {
    id: {
      type: [Number, String],
      default: ""
    }
  },
  data() {
    return {
      userData: {}
    }
  },
  components: {
    HtmlLink,
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    async getUserInfo() {
      const result = await http.get(api["user_info"], {
        params: {
          id: this.id,
        }
      }).then(r => r.data);

      this.userData = result.data;
    }
  }
}
</script>

<template>
  <Tag size="medium" color="primary">
    <span class="user-select-none" contenteditable="false">@ </span>
    <HtmlLink :href="`/space/${id}`" :text="userData.username || id.toString()" target="_blank"></HtmlLink>
  </Tag>
</template>

<style scoped lang="less">

</style>
