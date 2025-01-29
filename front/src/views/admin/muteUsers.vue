<template>
  <div>
    <p class="hint">Here you can search for users on the site and add a gag, which prevents users from Posting anything
      on the site</p>
    <p class="hint">Unable to add an administrator user</p>
    <p class="hint">Use with caution, and your actions will be recorded</p>
    <br>

    <Row :gutter="10" type="flex" justify="center" align="middle">
      <Col flex="1">
        <Select
            v-model="muteSearchName"
            filterable
            :remote-method="getSearchMuteUser"
            :loading="searchLoading">
          <Option v-for="(i, index) in searchMuteUserList" :value="i.username" :key="index" :disabled="true">
            <Row :gutter="10" type="flex" justify="center" align="middle">
              <Col flex="1">
                <b>{{ i.username }}</b> ({{ i.id }})
              </Col>
              <Col>
                <PrivilegesTag :data="i.privilege"></PrivilegesTag>
              </Col>
              <Col>
                <!-- 禁言 -->
                <Button @click.native="showMuteAlert(i.id)" type="dashed" size="small" :disabled="!isAdmin">
                  <Icon type="md-add"></Icon>
                  <Icon type="md-mic" title="mute user"/>
                </Button>
              </Col>
            </Row>
          </Option>
        </Select>
      </Col>
      <Col>
        <router-link :to="{name: 'admin', params: {pagename: 'admin_operation_log'}}" target="_blank">
          {{ $t('profile.admin.menu.adminOperationLog') }}
        </router-link>
      </Col>
    </Row>
    <br>

    <Row :gutter="20">
      <Col flex="1">
        <Page class="page"
              size="small"
              show-sizer
              show-total
              show-elevator
              @on-change="handlePageChange"
              @on-page-size-change="handlePageSizeChange"
              :page-size="limit"
              :current="skip"
              :total="total"/>
      </Col>
      <Col>
        <Button size="small" @click="getMuteUsers">
          <Icon type="md-refresh" :class="queryMuteUsersLoading ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>
    <br>

    <template v-if="muteUserList.length > 0">
      <Card dis-hover v-for="(i, index) in muteUserList" :key="index" class="interval-card">
        <Row :gutter="10" type="flex" justify="center" align="middle">
          <Col flex="1">
            <b>{{ i.username }}</b> ({{ i.id }})
            <p class="description">
              Gag time:
              <Time :time="i.attr.mute"></Time>
            </p>
          </Col>
          <Col>
            <PrivilegesTag :data="i.privilege"></PrivilegesTag>
          </Col>
          <Col>
            <Button @click="muteUser('remove', i.id)" :disabled="!isAdmin">
              <Icon type="md-mic-off" title="remove mute"/>
              Removal Mute
            </Button>
          </Col>
        </Row>
      </Card>
    </template>
    <Card dis-hover v-else>
      <Empty></Empty>
    </Card>

    <br>
    <Row :gutter="20">
      <Col flex="1">
        <Page class="page"
              size="small"
              show-sizer
              show-total
              show-elevator
              @on-change="handlePageChange"
              @on-page-size-change="handlePageSizeChange"
              :page-size="limit"
              :current="skip"
              :total="total"/>
      </Col>
    </Row>

    <!-- 禁言 -->
    <Modal
        v-model="mute.show"
        @on-ok="modalOk"
        @on-cancel="mute.show = false">
      <p slot="header" style="color:#333; text-align:center">
        <span>Select the time duration for mute</span>
      </p>

      <Form>
        <FormItem>
          <Select v-model="mute.value">
            <Option v-for="item in [
              {value: 0, text: '10 mins'},
              {value: 1, text: '1 hr'},
              {value: 2, text: '12 hrs'},
              {value: 3, text: '1 day'},
              {value: 4, text: '1 week'},
              {value: 5, text: '1 month'}]"
                    :value="item.value"
                    :key="item.value">
              {{ item.text }}
            </Option>
          </Select>
        </FormItem>

        <FormItem>
          <Checkbox v-model="mute.isNoticeIntraStationUser">是否将此禁令通知玩家？</Checkbox>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {api, http_token, mail} from "@/assets/js";
import PrivilegesTag from "@/components/PrivilegesTag";
import Application from "@/assets/js/application";
import Empty from "@/components/Empty";

export default new Application({
  name: "muteUsers",
  data() {
    return {
      mute: {
        value: '0',
        id: '',
        show: false,
        isNoticeIntraStationUser: false
      },
      muteSearchName: "",
      muteUserList: [],
      queryMuteUsersLoading: false,
      searchMuteUserList: [],
      searchLoading: false,
      skip: 1,
      limit: 20,
      total: 0,
      order: null
    }
  },
  components: {PrivilegesTag, Empty},
  created() {
    this.http = http_token.call(this);

    this.getMuteUsers()
  },
  methods: {
    showMuteAlert(id) {
      this.mute.id = id
      this.mute.show = true
    },
    modalOk() {
      this.muteUser('add', this.mute.id, this.mute.value)
    },
    muteUser(type, id, muteTime = 0) {
      const {isNoticeIntraStationUser} = this.mute;

      if (!muteTime && !id && !type) return false;

      this.http.post(api["admin_muteUser"], {
        data: {
          data: {type, id, value: muteTime},
          isNotice: isNoticeIntraStationUser,
          language: mail.exchangeLangField(this.$root.$i18n.locale)
        },
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.getMuteUsers();
          this.$Message.success({content: d.message || d.code, duration: 3});
          return;
        }

        this.$Message.error({content: d.message || d.code, duration: 3});
      }).catch(err => {
        this.$Message.error(err.code);
      })
    },
    handlePageChange(num) {
      this.skip = num;
      this.getMuteUsers();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getMuteUsers();
    },
    /**
     * 条件查询站内用户
     */
    getSearchMuteUser(queryUserName) {
      if (!queryUserName) return

      this.searchLoading = true;
      this.http.get(api["admin_searchUser"], {
        params: {
          name: queryUserName,
          skip: (this.skip - 1) * this.limit,
          limit: this.limit,
          order: this.order,
          parameter: 'username',
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.searchMuteUserList = d.data;
          return;
        }

        this.$Message.error({content: d.message || d.code, duration: 3});
      }).catch(err => {
        this.$Message.error(err.code);
      }).finally(() => {
        this.searchLoading = false
      })
    },
    /**
     * 查询所有禁言站内用户
     */
    getMuteUsers() {
      this.queryMuteUsersLoading = true;

      this.http.get(api["admin_muteUserAll"], {
        params: {
          skip: this.skip - 1,
          limit: this.limit,
          order: this.order
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.muteUserList = d.data;
          this.total = d.total;
          this.searchMuteUserList = []
          return;
        }

        this.$Message.error({content: d.message || d.code, duration: 3});
      }).catch(err => {
        this.$Message.error(err.code);
      }).finally(() => {
        this.queryMuteUsersLoading = false;
      })
    },
  }
})
</script>

<style ref="less" scoped>
.interval-card {
  margin-bottom: 10px;
}
</style>
