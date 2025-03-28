<template>
  <div>
    <p class="hint">
      此处名单将禁用账户，用户无法继续登陆账户；如果仍然需要保留账户，并且依旧能赋予黑名单限制，可以在账户身份中添加'黑名单'身份来限制用户网站使用范围</p>
    <p class="hint">Use with caution, and your actions will be recorded</p>
    <br>

    <Row :gutter="10" type="flex" justify="center" align="middle">
      <Col flex="1">
        <Select
            v-model="searchName"
            filterable
            :remote-method="getSearchUser"
            :loading="searchLoading">
          <Option v-for="(i, index) in searchBlockedUserList" :value="i.username" :key="index" :disabled="true">
            <Row :gutter="10" type="flex" justify="center" align="middle">
              <Col flex="1">
                {{ i.username }} ({{ i.id }})
              </Col>
              <Col>
                <PrivilegesTag :data="i.privilege"></PrivilegesTag>
              </Col>
              <Col>
                <Button @click="onAddUserBlocked(searchBlockedUserList[index])" size="small"
                        :disabled="isDeleteExecutable">
                  <Icon type="md-add"/>
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
        <Button size="small" @click="getBlockedUserAll">
          <Icon type="md-refresh" :class="blockedLoading ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>
    <br>

    <template v-if="blockedUserList.length > 0">
      <Card dis-hover v-for="(i, index) in blockedUserList" :key="index" class="interval-card">
        <Row :gutter="10" type="flex" justify="center" align="middle">
          <Col flex="1">
            <BusinessCard :id="i.id" :showAdminUserInfo="true">
              <b>{{ i.username }}</b> ({{ i.id }})
            </BusinessCard>
          </Col>
          <Col>
            <PrivilegesTag :ref="`tag_${i.id}_privilegesTag`" :data="i.privilege" v-if="i.privilege"></PrivilegesTag>
          </Col>
          <Col>
            <Button @click="onRemoveUserBlocked(blockedUserList[index])" :disabled="isDeleteExecutable">
              <Icon type="md-trash"/>
              Removal Blocked
            </Button>
          </Col>
        </Row>
      </Card>
    </template>
    <Card dis-hover v-else>
      <Empty></Empty>
    </Card>

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
    <br>
  </div>
</template>

<script>
import {account_storage, api, application, http_token} from "@/assets/js";

import PrivilegesTag from "@/components/PrivilegesTag";
import BusinessCard from "@/components/BusinessCard";
import Empty from "@/components/Empty";

export default new application({
  name: "blockedUsers",
  data() {
    return {
      searchName: "",
      searchLoading: false,
      searchBlockedUserList: [],
      blockedLoading: false,
      blockedModel: false,
      blockedUserList: [],
      editUserData: {
        attr: {
          language: '',
          introduction: ''
        },
        temporaryPrivilege: {},
        privilege: []
      },
      skip: 1,
      limit: 20,
      total: 0,
      order: null
    }
  },
  components: {PrivilegesTag, BusinessCard, Empty},
  created() {
    this.http = http_token.call(this);

    this.getBlockedUserAll()
  },
  methods: {
    handlePageChange(num) {
      this.skip = num;
      this.getBlockedUserAll();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getBlockedUserAll();
    },
    /**
     * 条件查询站内用户
     */
    getSearchUser(queryUserName) {
      if (!queryUserName) return

      this.searchLoading = true;
      this.http.get(api["admin_searchUser"], {
        params: {
          name: queryUserName,
          skip: (this.skip - 1) * this.limit,
          limit: this.limit,
          type: 'all',
          order: this.order,
          parameter: 'username',
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
    /**
     * 查询所有黑名单(封禁)用户
     */
    getBlockedUserAll() {
      this.blockedLoading = true;
      this.http.get(api["admin_blockedUserAll"], {
        params: {
          skip: this.skip - 1,
          limit: this.limit
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.blockedUserList = d.data;
          this.total = d.total;
          return;
        }

        this.$Message.error({content: d.message || d.code, duration: 3});
      }).catch(err => {
        this.$Message.error(err.code);
      }).finally(() => {
        this.blockedLoading = false
      })
    },
    /**
     * 管理员操作账户状态，逻辑关闭与恢复
     * @param id dbId
     * @param type Operating type ['logic', 'restore']
     */
    onOperatingAccountStatus(id, type) {
      if (!id || !type && !['logic', 'restore'].includes(type)) {
        this.$Message.error(this.$i18n.t('signup.fillIn'));
        return
      }

      this.delUserLoad = true;
      this.http.post(api["admin_delUser"], {
        data: {
          data: {type, id}
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.$Message.success(d.code);
          this.searchBlockedUserList = []
          return
        }

        this.$Message.error(d.message || d.code);
      }).finally(() => {
        this.getBlockedUserAll();

        this.delUserLoad = false;
        this.delUserModel = false;
      });
    },
    /**
     * 禁用账户
     */
    onAddUserBlocked(data) {
      const {id} = data;
      this.onOperatingAccountStatus(id, 'logic')
    },
    /**
     * 解除账户禁用
     */
    onRemoveUserBlocked(data) {
      const {id} = data;
      this.onOperatingAccountStatus(id, 'restore')
    }
  },
  computed: {
    isDeleteExecutable() {
      return !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ['root', 'dev']);
    },
  }
})
</script>

<style ref="less" scoped>
.interval-card {
  margin-bottom: 10px;
}
</style>
