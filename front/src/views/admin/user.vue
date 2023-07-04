<template>
  <div>
    <Row :gutter="10" type="flex" align="middle">
      <Col>
        <Button
            @click="addUserModel = true"
            :disabled="isAddUserExecutable">
          <Icon type="md-add"/>
        </Button>
      </Col>
      <Col flex="1">
      </Col>
      <Col>
        <Select v-model="userOrder.value" @on-change="getUserList">
          <Option :value="i.value" v-for="(i,index) in userOrder.list" :key="index">
            {{ i.title }}
          </Option>
        </Select>
      </Col>
      <Col>
        <Select v-model="userType.value" @on-change="getUserList">
          <Option :value="i.value" v-for="(i,index) in userType.list" :key="index">
            {{ i.title }}
          </Option>
        </Select>
      </Col>  
      <template v-if="userType.value == 'all'">
        <Col>
          <Select v-model="userparameter.value" @on-change="getUserList">
            <Option :value="i.value" v-for="(i,index) in userparameter.list" :key="index">
              {{ i.title }}
            </Option>
          </Select>
        </Col>
        <Col>
          <div v-show="load">
            <Icon type="ios-loading"></Icon>
          </div>
        </Col>
        <Col>
          <Input v-model="userValue"
                 type="text"
                 search
                 enter-button
                 @on-enter="onSearchUser"
                 @on-search="onSearchUser"
                 style="width: 280px">
          </Input>
        </Col>
      </template>
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
        <Button size="small" @click="getUserList">
          <Icon type="md-refresh" :class="load ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>
    <br>

    <Card dis-hover v-for="(i, index) in userListData" :key="index" class="admin-user">
      <Row :gutter="10" type="flex" justify="center" align="middle">
        <Col flex="1">
          <BusinessCard :id="i.id">
            <b>{{ i.username }}</b>
          </BusinessCard>
          <div>
            Id:{{ i.id }}
            <divider type="vertical"></divider>
            Valid:{{ i.valid }}
          </div>
        </Col>
        <Col>
          <PrivilegesTag :ref="`tag_${i.id}_privilegesTag`" :data="i.privilege" v-if="i.privilege"></PrivilegesTag>
        </Col>
        <Col>
          <Divider type="vertical"></Divider>
          <Button @click="onEditUser(index)" type="dashed" size="small" :disabled="!isAdmin">
            <Icon type="ios-create"/>
          </Button>

          <Divider type="vertical"></Divider>
          <Button @click="openDelUserModel(index)" type="error" size="small" :disabled="isDeleteExecutable">
            <Icon type="md-trash"/>
          </Button>
        </Col>
      </Row>
    </Card>
    <Card dis-hover align="center" v-if="userListData.length <= 0">
      {{ $t('basic.tip.notContent') }}
    </Card>

    <!-- 编辑用户 S -->
    <Modal v-model="userEditModel"
           width="980"
           @on-ok="onEditUserSubmit"
           :title="editUserData.username">
      <Form :model="editUserData"
            ref="formValidate"
            label-position="top">

        <Row :gutter="20">
          <Col span="12">
            <Row :gutter="10">
              <Col span="24">
                <Row :gutter="10">
                  <Col span="6">
                    <FormItem prop="id">
                      <Input v-model="editUserData.id" readonly/>
                    </FormItem>
                  </Col>
                  <Col span="18">
                    <FormItem prop="username">
                      <Input v-model="editUserData.username" maxlength="40"/>
                    </FormItem>
                  </Col>
                </Row>
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
                <FormItem label="originEmail">
                  <Input v-model="editUserData.originEmail" readonly></Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem label="originName">
                  <Input v-model="editUserData.originName" readonly></Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem label="originPersonaId">
                  <Input v-model="editUserData.originPersonaId" readonly></Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem label="originUserId">
                  <Input v-model="editUserData.originUserId" readonly></Input>
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span="12">
            <Row :gutter="10">
              <Col span="12">
                <FormItem label="change Name Left">
                  <InputNumber :max="5" :min="0" v-model="editUserData.attr.changeNameLeft"></InputNumber>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem :label="$t('profile.account.form.language')">
                  <Select v-model="editUserData.attr.language" class="switch-language" prefix="md-globe"
                          placement="top-end">
                    <Option v-for="item in languages" :value="item.name" :disabled="item.ignoreSave" :key="item.name">
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
                      <Select v-model="editPrivilegesForm.activeName" style="width: 160px">
                        <Option v-for="(i, index) in editPrivilegesForm.action" :value="i" :key="index">
                          {{ i }}
                        </Option>
                      </Select>
                    </Col>
                    <Col flex="1">
                      <Select v-model="editPrivilegesForm.roleName">
                        <Option v-for="(i, index) in editPrivilegesForm.role" :value="i" :key="index">
                          {{ $t('basic.privilege.' + i) }}
                        </Option>
                      </Select>
                    </Col>
                    <Col>
                      <Button @click="onEditPrivileges">{{ $t('basic.button.commit') }}</Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </FormItem>

            <FormItem label="introduction" prop="introduction">
              <Card dis-hover :padding="0">
                <Textarea ref="userIntroductionTextarea" :content="editUserData.attr.introduction"></Textarea>
              </Card>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
    <!-- 编辑用户 E -->

    <!-- 新增用户 S -->
    <Modal v-model="addUserModel"
           :loading="addUserLoad">
      <Form :model="addUserData"
            :rules="addUserRuleValidate"
            ref="addUserFormValidate"
            label-position="top">

        <Alert type="info" icon="info">
          添加未绑定用户
          <template slot="desc">
            在当前添加的用户，无法操作任何评论、判决、回复等操作，因为他未通过origin的邮箱绑定，需要用户登录账户完成最后平台绑定。
          </template>
        </Alert>

        <Row :gutter="10">
          <Col span="24">
            <FormItem :label="$t('signup.form.username')" prop="username">
              <Input v-model="addUserData.username"
                     maxlength="40"
                     :placeholder="$t('signup.placeholder.username')"/>
            </FormItem>
          </Col>
          <Col span="24">
            <FormItem :label="$t('signup.form.password')" prop="password">
              <Input v-model="addUserData.password"
                     password
                     minlength="6"
                     :placeholder="$t('signup.placeholder.password')"/>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button @click="onAddUserSubmit" :loading="addUserLoad">{{ $t('basic.button.submit') }}</Button>
      </div>
    </Modal>
    <!-- 新增用户 E -->

    <!-- 删除用户 S -->
    <Modal v-model="delUserModel"
           :loading="delUserLoad"
           width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>Delete User Account</span>
      </p>
      <Card dis-hover align="center">
        <BusinessCard :id="editUserData.id">
          <h2><a href="javascript:void(0)"><b>{{ editUserData.username }}</b></a></h2>
        </BusinessCard>
        <p>{{ editUserData.id }}</p>
      </Card>
      <div slot="footer">
        <Row type="flex" align="middle">
          <Col>
            <Select v-model="delTypeValue" style="width: 150px">
              <Option v-for="(i, index) in delTypes" :key="index" :value="i"> {{ i }}</Option>
            </Select>
          </Col>
          <Divider type="vertical"></Divider>
          <Col flex="2">
            <Button @click="onDeleteUser" type="error" long :loading="delUserLoad">
              {{ $t('basic.button.submit') }}
            </Button>
          </Col>
        </Row>
      </div>
    </Modal>
    <!-- 删除用户 E -->
  </div>
</template>

<script>
import {account_storage, api, http, http_token, mail} from "../../assets/js";

import languages from "/public/config/languages.json";

import BusinessCard from "@/components/businessCard";
import PrivilegesTag from "/src/components/PrivilegesTag";
import _ from "lodash";
import Textarea from "@/components/Textarea";
import Application from "@/assets/js/application";

export default new Application({
  data() {
    return {
      delUserModel: false,
      delUserLoad: false,
      delTypes: ['logic', 'real', 'restore'],
      delTypeValue: 'logic',

      userType: {
        value: 'all',
        list: [{title: 'All', value: 'all'}, {title: 'Admin`s', value: 'admin'}]
      },
      userOrder: {
        value: 'asc',
        list: [{title: 'Asc', value: 'asc'}, {title: 'Desc', value: 'desc'}]
      },
      userparameter: {
        value: 'username',
        list: [{title: 'BFBAN ID', value: 'id'}, {title: 'BFBAN Username', value: 'username'}, {title: 'originName', value: 'originName'}, {title: 'originPersonaId', value: 'originPersonaId'}, {title: 'Email', value: 'originEmail'}]
      },

      addUserLoad: false,
      load: false,

      userValue: '',
      userListData: [],
      editUserData: {
        attr: {
          language: '',
          introduction: ''
        },
        temporaryPrivilege: {},
        privilege: []
      },
      editPrivilegesForm: {
        id: '',
        roleName: '',
        role: ['normal', 'admin', 'bot', 'super', 'dev', 'blacklisted', 'freezed'],
        activeName: 'grant',
        action: ['grant', 'revoke'],
      },
      addUserData: {
        username: '',
        password: ''
      },
      addUserRuleValidate: {
        username: [
          {required: true, min: 4, max: 40, trigger: 'blur'}
        ],
        password: [
          {required: true, min: 6, max: 40, trigger: 'blur'}
        ],
      },
      userEditModel: false,
      addUserModel: false,
      languages: languages.child,

      skip: 1,
      limit: 40,
      order: 'desc',
      total: 0,
    }
  },
  components: {Textarea, PrivilegesTag, BusinessCard},
  created() {
    this.http = http_token.call(this);

    this.getUserList();
  },
  methods: {
    /**
     * 提交修改表单
     */
    async onEditUserSubmit() {
      this.load = true;

      // 处理用户属性
      await this.setUserAttr();

      // 处理用户身份权限
      for (const key in this.editUserData.temporaryPrivilege) {
        if (this.editUserData.id) {
          await this.setUser(
              this.editUserData.id,
              this.editUserData.temporaryPrivilege[key],
              key
          );
        }
      }

      await this.onSearchUser();
      this.load = false;
    },
    /**
     * 管理员增加用户
     */
    onAddUserSubmit() {
      const {username, password} = this.addUserData;

      if (
          !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ['super', 'root', 'dev'])
      ) {
        this.$Message.error(this.$i18n.t('basic.tip.noAccess'))
        return;
      }

      this.$refs.addUserFormValidate.validate((valid) => {
        // 检查表单
        if (!valid) {
          this.$Message.error('Fail!');
          return;
        }

        this.addUserLoad = true;

        this.http.post(api["admin_addUser"], {
          data: {
            data: {
              username,
              password,
              language: this.$i18n.locale
            }
          }
        }).then(res => {
          const d = res.data;

          if (d.success == 1) {
            this.$Message.success(d.code);
            return
          }

          this.$Message.error(d.message || d.code);
        }).finally(() => {
          this.addUserLoad = false;
          this.addUserModel = false;
        });
      })
    },
    /**
     * 管理员删除用户
     */
    onDeleteUser() {
      const {id} = this.editUserData;

      this.delUserLoad = true;
      this.http.post(api["admin_delUser"], {
        data: {
          data: {
            type: this.delTypeValue,
            id,
          }
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.$Message.success(d.code);
          return
        }

        this.$Message.error(d.message || d.code);
      }).finally(() => {
        this.getUserList();

        this.delUserLoad = false;
        this.delUserModel = false;
      });
    },
    /**
     * 打开删除面板Mode
     */
    openDelUserModel(index) {
      this.editUserData = this.userListData[index];
      this.delUserModel = true;
    },
    /**
     * 处理表单内用户权限增加与删除
     */
    onEditPrivileges() {
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
          if (roleName >= 0) {
            this.editUserData.privilege.splice(roleName, 1);
            this.editUserData.temporaryPrivilege[this.editPrivilegesForm.roleName] = "revoke";
          } else
            this.$Message.error('not role');
          break;
      }

      if (this.$refs.privilegesTag)
        this.$refs.privilegesTag.update();
    },
    /**
     * 精准名称搜索
     */
    onSearchUser() {
      this.getUserList().finally(() => {
        this.onReset()
      });
    },
    /**
     * 站内用户搜索
     */
    async getUserList() {
      const that = this;
      let params = {name: '', skip: this.skip - 1, limit: this.limit, parameter: ''};

      if (this.load) return;

      return new Promise((resolve, reject) => {
        that.load = true;

        if (this.userValue)
          params.name = this.userValue;
        if (this.userType.value)
          params.type = this.userType.value;
        if (this.userOrder.value)
          params.order = this.userOrder.value
        if (this.userparameter.value)
          params.parameter = this.userparameter.value

        that.http.get(api["admin_searchUser"], {
          params,
        }).then(res => {
          const d = res.data;

          if (d.success == 1) {
            that.userListData = d.data;
            that.total = d.total;
            return;
          }

          that.$Message.error(d.message || d.code);
        }).finally(() => {
          that.load = false;

          resolve();
        });
      })
    },
    /**
     * 编辑用户
     * @param index
     */
    onEditUser(index) {
      this.userEditModel = true;
      this.editUserData = Object.assign(this.editUserData, this.userListData[index]);

      if (this.$refs.privilegesTag)
        this.$refs.privilegesTag.update(this.editUserData.privilege);
      if (this.$refs.userIntroductionTextarea)
        this.$refs.userIntroductionTextarea.updateContent(this.editUserData.attr.introduction);
    },
    /**
     * 修改用户身份
     */
    async setUser(id, action, role) {
      await this.http.post("admin/setUser", {
        data: {
          data: {id, action, role},
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          // TODO
          return;
        }

        this.$Message.error(d.message || d.code);
      })
    },
    /**
     * 修改用户属性
     */
    async setUserAttr() {
      return new Promise((resolve, reject) => {
        let attr = this.editUserData.attr;

        delete attr.valid;
        delete attr.language;
        delete attr.registerIP;
        delete attr.lastSigninIP;
        delete attr.freezeOfNoBinding;

        this.http.post("admin/setUserAttr", {
          data: {
            data: {
              id: this.editUserData.id,
              username: this.editUserData.username,
              attr,
            }
          }
        }).then(res => {
          const d = res.data;

          if (d.success == 1) {
            resolve()
            return;
          }

          this.$Message.error(d.message || d.code);
          reject();
        })
      })
    },
    handlePageChange(num) {
      this.skip = num;
      this.getUserList();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getUserList();
    },
    onReset() {
      this.skip = 1;
      this.limit = 20;
      this.order = 'desc';
      this.total = 0;
    }
  },
  computed: {
    isDeleteExecutable() {
      return !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ['root', 'dev']);
    },
    isAddUserExecutable() {
      return !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ["super", "root", "dev"]);
    }
  }
})
</script>

<style lang="less" scoped>
.admin-user {
  margin-bottom: 10px;
}
</style>