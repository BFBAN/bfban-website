<template>
  <div>
    <p class="hint">Blacklist users cannot log in to the website</p>
    <br>

    <Row :gutter="10">
      <Col flex="1">
        <Select
            v-model="searchName"
            filterable
            :remote-method="getSearchUser"
            :loading="searchLoading">
          <Option v-for="(i, index) in searchBlockedUserList" :value="i.id" :key="index" :disabled="true">
            <Row :gutter="10">
              <Col flex="1">
                {{ i.username }} ({{ i.id }})
              </Col>
              <Col>
                <PrivilegesTag :data="i.privilege"></PrivilegesTag>
              </Col>
              <Col>

              </Col>
            </Row>
          </Option>
        </Select>
      </Col>
    </Row>
    <br>
  </div>
</template>

<script>
import {api, http_token, mail} from "@/assets/js";

export default {
  name: "blockedUsers",
  data () {
    return {
      searchName: "",
      searchLoading: false,
      searchBlockedUserList: [],
      skip: 1,
      limit: 20,
      total: 0,
      order: null
    }
  },
  created() {
    this.http = http_token.call(this);
  },
  methods: {
    /**
     * 条件查询站内用户
     */
    getSearchUser(queryUserName) {
      if (!queryUserName) return

      this.searchLoading = true;
      this.http.get(api["admin_searchUser"], {
        params: {
          name: queryUserName,
          skip: this.skip - 1,
          limit: this.limit,
          order: this.order
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.searchBlockedUserList = d.data;
          return;
        }

        this.$Message.error({content: d.message || d.code, duration: 3});
      }).catch(err => {
        this.$Message.error(err.code);
      }).finally(() => {
        this.searchLoading = false
      })
    },
  }
}
</script>

<style scoped>

</style>
