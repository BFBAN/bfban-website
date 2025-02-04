<script>
import HtmlLink from "@/components/HtmlLink.vue";
import {api, http} from "@/assets/js"
import UserAvatar from "@/components/UserAvatar.vue";

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
    UserAvatar,
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
  <Tag :checked="false" size="medium">
    <Row :gutter="3" type="flex" align="middle">
      <Col contenteditable="false" class="user-select-none">
        <UserAvatar :size="15" :src="userData.avatar"></UserAvatar>
      </Col>
      <Col>
        <HtmlLink :href="`/space/${id}`" :text="userData.username || id.toString()" target="_blank"></HtmlLink>
      </Col>
    </Row>
  </Tag>
</template>

<style scoped lang="less">

</style>
