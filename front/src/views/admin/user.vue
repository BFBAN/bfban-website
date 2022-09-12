<template>
  <div>
    <Row :gutter="10">
      <Col flex="1">
        <Input v-model="userValue" placeholder="Enter ..." />
      </Col>
      <Col>
        <Button @click="onSearchUser">搜索</Button>
      </Col>
    </Row>
    <br>

    <Card dis-hover v-for="(i, index) in userListData" :key="index">
      <Row :gutter="10">
        <Col flex="1">
          <h1>{{i.username}}</h1>
          <span>{{i.id}}</span>
        </Col>
        <Col>
          <PrivilegesTag :data="i.privilege"></PrivilegesTag>
        </Col>
        <Col>
          <Button @click="onEditUser(index)" type="dashed">SET</Button>
        </Col>
      </Row>
    </Card>
    <div v-if="userListData.length <= 0">:(</div>

    <Modal v-model="userModel"
           @on-ok="onSubmit"
           :title="editUserData.username">
      <Form :model="editUserData"
            ref="formValidate"
            label-position="top">

        <Row :gutter="10">
          <Col span="24">
            <FormItem prop="username">
              <Input v-model="editUserData.username" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem prop="username" label="password">
              <Input v-model="editUserData.password" readonly disabled />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem prop="username" label="avatar">
              <Input v-model="editUserData.avatar" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="lastSigninIP" prop="username">
              <Input v-model="editUserData.attr.lastSigninIP" readonly disabled/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="registerIP" prop="">
              <Input v-model="editUserData.attr.registerIP" readonly disabled/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="createTime" prop="">
              <Input v-model="editUserData.createTime" readonly disabled/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="signoutTime" prop="">
              <Input v-model="editUserData.signoutTime" readonly disabled/>
            </FormItem>
          </Col>

          <Col span="12">
            <FormItem label="change Name Left">
              <InputNumber :max="5" :min="0" v-model="editUserData.attr.changeNameLeft"></InputNumber>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem :label="$t('profile.account.form.language')">
              <Select v-model="editUserData.attr.language" class="switch-language" prefix="md-globe" placement="top-end">
                <Option v-for="item in languages" :value="item.name" :key="item.name">
                  {{ item.label }}
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem :label="$t('profile.account.form.showOrigin')">
              <i-switch v-model="editUserData.attr.showOrigin"/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem :label="$t('profile.account.form.allowDM')">
              <i-switch v-model="editUserData.attr.allowDM"/>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="privileges" prop="privileges">
          <Row :gutter="10">
            <Col span="24">
              <PrivilegesTag ref="privilegesTag" :data="editUserData.privilege"></PrivilegesTag>
            </Col>
            <Col span="24">
                <Row :gutter="10">
                  <Col>
                    <Select v-model="editPrivilegesForm.activeName" style="width: 120px">
                      <Option v-for="(i, index) in editPrivilegesForm.action" :value="i" :key="index">
                        {{ i }}
                      </Option>
                    </Select>
                  </Col>
                  <Col>
                    <Select v-model="editPrivilegesForm.roleName" style="width: 120px">
                      <Option v-for="(i, index) in editPrivilegesForm.role" :value="i" :key="index">
                        {{ i }}
                      </Option>
                    </Select>
                  </Col>
                  <Col>
                    <Button @click="onEditPrivileges">ok</Button>
                  </Col>
                </Row>
            </Col>
          </Row>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {api, http, http_token} from "../../assets/js";

import languages from "/public/conf/languages.json";

import PrivilegesTag from "/src/components/PrivilegesTag";

export default {
  data() {
    return {
      userValue: '',
      userListData: [],
      editUserData: {
        attr: {
          language: ''
        },
        temporaryPrivilege: {},
        privilege: []
      },
      editPrivilegesForm: {
        id: '',
        roleName: '',
        role: ['normal','admin','bot','super','dev','blacklisted','freezed'],
        activeName: 'grant',
        action: ['grant', 'revoke'],
      },
      userModel: false,
      languages: languages.child,
      // privileges: privilege.child
    }
  },
  components: {PrivilegesTag},
  created() {
    this.http = http_token.call(this);
  },
  methods: {
    /**
     * 提交修改表单
     */
    async onSubmit () {
      this.load = true;

      // 处理用户属性
      await this.setUserAttr();

      // 处理用户身份权限
      for (const key in this.editPrivilegesForm) {
        if (this.editUserData.id && key && this.editPrivilegesForm[key])
          await this.setUser(this.editUserData.id, key, this.editPrivilegesForm[key]);
      }

      this.load = false;
    },
    /**
     * 处理表单内用户权限增加与删除
     */
    onEditPrivileges () {
      if (!this.editPrivilegesForm.roleName || !this.editUserData.privilege) return;

      const roleName = this.editUserData.privilege.indexOf(this.editPrivilegesForm.roleName);

      switch (this.editPrivilegesForm.activeName) {
        case "grant":
          // 授予
          if (roleName >= 0)
            this.$Message.error('already exist');
          else {
            this.editUserData.privilege.push(this.editPrivilegesForm.roleName);
            this.editUserData.temporaryPrivilege[this.editPrivilegesForm.roleName] = "grant";
          }
          break;
        case "revoke":
          // 剥夺
          if (roleName) {
            this.editUserData.privilege.splice(roleName,1);
            this.editUserData.temporaryPrivilege[this.editPrivilegesForm.roleName] = "revoke";
          }
          else
            this.$Message.error('not role');
          break;
      }

      if(this.$refs.privilegesTag)
        this.$refs.privilegesTag.update();
    },
    /**
     * 站内用户搜索
     */
    onSearchUser () {
      this.http.get("admin/searchUser", {
        params: {
          name: this.userValue
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.userListData = d.data;
        }
      })
    },
    onEditUser (index) {
      this.userModel = true;
      this.editUserData = Object.assign(this.editUserData, this.userListData[index]);

      if(this.$refs.privilegesTag)
        this.$refs.privilegesTag.update(this.editUserData.privilege);
    },
    /**
     * 修改用户身份
     */
    async setUser (id, action, role) {
      return await this.http.post("admin/setUser", {
        data: {
          data: { id, action, role }
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          // TODO
        }
      })
    },
    /**
     * 修改用户属性
     */
    async setUserAttr () {
      return await this.http.post("admin/setUser", {
        data: {
          data: {
            id: this.editPrivilegesForm.id,
            attr: this.editUserData.attr,
            username: this.editUserData.username,
          }
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          // TODO
        }
      })
    }
  },
  computed: {

  }
}
</script>

<style scoped>

</style>