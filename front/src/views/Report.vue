<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("report.info.reportHacker", {msg: "reportHacker"}) }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <Tabs type="card"
            v-model="tabs.count"
            closable
            @on-tab-remove="doCancel">
        <TabPane v-for="(tab, index) in tabs.list.length" :key="index"
                 :label="(tabs.list[index].formItem.originId ? tabs.list[index].formItem.originId : tab.toString())">
          <Card dis-hover v-if="tabs.list[index].statusOk == 0">
            <Form :label-width="150"
                  :model="tabs.list[index].formItem" :rules="ruleValidate"
                  ref="formValidate"
                  label-position="left">
              <!-- 基础信息 S -->
              <Card dis-hover>
                <!-- 游戏类型 S -->
                <FormItem prop="gameName"
                          :label="$t('report.labels.game') + '(' + tabs.list[index].formItem.gameName + ')'">
                  <RadioGroup
                      size="large"
                      class="game-type"
                      v-model="tabs.list[index].formItem.gameName"
                      type="button">
                    <Radio :label="i.value" :disabled="i.disabled" v-for="i in games" :key="i.value"
                           :style="'background-image: url(' + require('/src/assets/' + i.bk_file + '/bf.jpg') + ')'">
                      <Tooltip :content="$t('list.filters.game.' + i.value)" placement="top-start">
                        <img height="35" :src="require('/src/assets/' + i.bk_file + '/logo.png')" v-if="i.logo_src"/>
                        <span v-else>{{ i.full_name }}</span>
                      </Tooltip>
                    </Radio>
                  </RadioGroup>
                  <span class="hint">{{ $t("report.info.reportNews", {msg: "reportNews"}) }}</span>
                </FormItem>
                <!-- 游戏类型 E -->

                <FormItem prop="originId" :label="$t('report.labels.hackerId')">
                  <Alert type="error"
                         show-icon
                         id="notFoundHint"
                         v-show="failedOfNotFound">
                    <b>{{ $t("report.info.notFoundHintTitle") }}</b>
                    <span slot="desc">
                      <p style="font-size: 14px; margin-left: 10px">
                        Q:{{ $t("report.info.notFoundHintQuestion1") }}
                      </p>
                      <p style="font-size: 12px; margin-left: 20px">
                        A:{{ $t("report.info.notFoundHintAnswer1") }}
                      </p>
                      <p style="font-size: 14px; margin-left: 10px">
                        Q:{{ $t("report.info.notFoundHintQuestion2") }}
                      </p>
                      <p style="font-size: 12px; margin-left: 20px">
                        A:{{ $t("report.info.notFoundHintAnswer2") }}
                      </p>
                    </span>
                  </Alert>
                  <Card class="hackrid" dis-hover>
                    <h1 v-if="tabs.list[index].formItem.originId">{{ tabs.list[index].formItem.originId }}</h1>
                    <span v-else>ID</span>
                    <br>
                    <p class="hint">
                      {{ $t("report.info.idNotion1", {msg: "idNotion1"}) }}
                    </p>
                    <p class="hint">
                      {{ $t("report.info.idNotion2", {msg: "idNotion2"}) }}
                    </p>
                  </Card>
                  <Row :gutter="30">
                    <Col flex="1">
                      <Input
                          v-model="tabs.list[index].formItem.originId"
                          maxlength="80"
                          show-word-limit
                          size="large"
                          :placeholder="$t('report.info.onlyOneId')"/>
                    </Col>
                    <Col>
                      {{ $t('report.info.or') }}
                    </Col>
                    <Col flex="1">
                      <Button type="dashed" long size="large" @click="tabs.players.show = true">
                        {{ $t('report.info.fromDatabaseOneId') }}
                      </Button>
                      <Modal
                          v-model="tabs.players.show"
                          @on-ok="tabs.list[index].formItem.originId = tabs.list[index].formItem.originId_l; tabs.list[index].formItem.originId_l = ''"
                          :styles="{top: '20px'}">
                        <Select
                            size="large"
                            v-model="tabs.list[index].formItem.originId_l"
                            filterable
                            :remote-method="getPlayerList"
                            :loading="tabs.players.load">
                          <Option v-for="(option, index) in tabs.players.list" :value="option.originName" :key="index">
                            <Row>
                              <Col flex="auto">
                                <Avatar :src="option.avatarLink"> </Avatar>
                                <span>&emsp; {{option.originName}}</span>
                              </Col>
                              <Col>
                                <router-link
                                    :to="{name: 'cheater', params: {ouid: `${option.originPersonaId}.${option.originUserId}.${option.id}`}}">
                                  <Icon type="md-eye" size="30" />
                                </router-link>
                              </Col>
                            </Row>
                          </Option>
                        </Select>
                      </Modal>

                    </Col>
                  </Row>
                </FormItem>

                <FormItem prop="checkbox" :label="$t('report.labels.cheatMethod')">
                  <CheckboxGroup v-model="tabs.list[index].formItem.checkbox">
                    <Checkbox
                        style="margin-bottom: 10px"
                        border
                        v-for="method in cheatMethodsGlossary"
                        :indeterminate="false"
                        :key="method.value"
                        :label="method.value">
                      <Tag color="primary">{{ $t(`cheatMethods.${method.value}.title`) }}</Tag>
                      <Divider type="vertical"/>
                      <span>{{ $t(`cheatMethods.${method.value}.describe`) }}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </FormItem>
              </Card>
              <!-- 基础信息 E -->
              <br>
              <!-- 证据 S -->
              <Card dis-hover>
                <FormItem :label="$t('detail.info.videoLink')">
                  <Row :gutter="30">
                    <Col flex="1 1 300px">
                      <Alert type="warning">
                        {{$t("report.info.uploadManual1", {msg: "uploadManual1",}) }}
                        <a target="_blank" href="https://streamable.com/">https://streamable.com/</a>，{{$t("report.info.uploadManual2", {msg: "uploadManual2",}) }}
                      </Alert>
                      <Row :gutter="0" v-for="(blink, blinkindex) in tabs.list[index].formItem.videoLink"
                           :key="blinkindex">
                        <Col flex="auto">
                          <Input
                              style="margin-bottom: 5px"
                              v-model="tabs.list[index].formItem.videoLink[blinkindex]"
                              :placeholder="$t('report.info.required')">
                          </Input>
                        </Col>
                        <Col>
                          <Divider type="vertical" v-if="tabs.list[index].formItem.videoLink.length > 0"/>
                          <Button type="dashed"
                                  @click="tabs.list[index].formItem.videoLink.splice(blinkindex, 1)"
                                  v-if="tabs.list[index].formItem.videoLink.length > 0">
                            <Icon type="md-trash"/>
                          </Button>
                        </Col>
                      </Row>
                      <Button type="dashed"
                              long
                              @click="tabs.list[index].formItem.videoLink.splice(tabs.list[index].formItem.videoLink.length + 1, 0, '')"
                              v-if="tabs.list[index].formItem.videoLink.length < 10">
                        <Icon type="md-add"/><span>&emsp; ({{ tabs.list[index].formItem.videoLink.length || 0 }} / 10)</span>
                      </Button>
                      <span class="hint">{{ $t("report.info.uploadManual3", {msg: "uploadManual3",}) }}</span>
                    </Col>
                    <Col>
                      <img src="../assets/images/videoStyle.png" width="300">
                    </Col>
                  </Row>
                </FormItem>

                <FormItem prop="description" :label="$t('report.labels.description')">
                  <Alert type="warning">
                    {{ $t("report.info.uploadPic1", {msg: "uploadPic1"}) }}
                  </Alert>
                  <Alert type="warning">
                    {{ $t("report.info.uploadPic2", {msg: "uploadPic2"}) }}
                    <a target="_blank"
                       href="https://sm.ms">https://sm.ms</a>，{{ $t("report.info.uploadPic3", {msg: "uploadPic3"}) }}
                  </Alert>
                  <span class="hint">{{ $t("report.info.uploadPic4", {msg: "uploadPic4"}) }}</span>
                  <Edit :index="index" :content="$t('report.info.description')" @change="handleMiscChange"/>
                </FormItem>
              </Card>
              <!-- 证据 E -->
              <br>
              <!-- 提交 S -->
              <Card dis-hover>
                <FormItem prop="captcha" :label="$t('report.info.captcha')">
                  <Input
                      type="text"
                      v-model="tabs.list[index].formItem.captcha"
                      :placeholder="$t('report.info.captcha')"/>
                  <div v-html="tabs.list[index].captchaUrl.content"></div>
                  <a
                      ref="reCaptcha"
                      href="#"
                      @click.stop.prevent="refreshCaptcha(index)">
                    {{
                      $t("report.info.getCaptcha", {msg: "getCaptcha"})
                    }}
                  </a>
                </FormItem>

                <FormItem>
                  <Button type="dashed" size="large" :disabled="tabs.list.length <= 1" @click="doCancel">
                    {{ $t("report.info.cancel", {msg: "cancel"}) }}
                  </Button>
                  <Divider type="vertical"/>
                  <Button @click="doReport(index)"
                          type="primary"
                          size="large">
                    {{ $t("report.info.report", {msg: "report"}) }}
                  </Button>
                </FormItem>
              </Card>
              <!-- 提交 E -->
              <br>
              <Spin size="large" fix v-show="spinShow"></Spin>
            </Form>
          </Card>
          <Card shadow v-else-if="tabs.list[index].statusOk == -1">
            <Alert type="error" show-icon>
              {{ tabs.list[index].statusMsg }}
            </Alert>
          </Card>
          <Card shadow v-else-if="tabs.list[index].statusOk == 1">
            <Alert type="success" show-icon>
              {{ tabs.list[index].statusMsg }}
            </Alert>
          </Card>
        </TabPane>
        <Button @click="handleTabsAdd" size="small" slot="extra">
          <Icon type="md-add" />
        </Button>
      </Tabs>
    </div>
    <br>
  </div>
</template>

<script>
import {api, http, http_token, util, regular} from '../assets/js/index'
import {checkReportFormData} from "@/mixins/common";

import gameName from '../assets/gameName.json'
import Edit from "@/components/Edit.vue";

export default {
  data() {
    return {
      games: [],
      tabs: {
        count: 0,
        list: [],

        players: {
          show: false,
          list: []
        }
      },
      spinShow: false,
      failedOfNotFound: false,
      cheatMethodsGlossary: [],
      ruleValidate: {
        gameName: [
          {required: true, trigger: 'blur'}
        ],
        originId: [
          {required: true, trigger: 'blur'}
        ],
        checkbox: [
          {required: true, type: 'array', min: 1, trigger: 'change'},
        ],
        description: [
          {required: true, trigger: 'change'},
        ],
        captcha: [
          {required: true, trigger: 'blur'}
        ],
      }
    };
  },
  components: { Edit },
  created() {
    this.http = http_token.call(this);

    this.handleTabsAdd();
    this.loadData();
  },
  watch: {
    '$route': 'loadData',
  },
  methods: {
    loadData() {
      util.initUtil().then((res) => {
        this.cheatMethodsGlossary = res.cheatMethodsGlossary;
        this.games = res.gameName;
      });
    },
    /**
     * 查询作弊玩家列表
     * 用于从BFBAN数据库中取现有id，填充名称
     * @param query
     */
    getPlayerList (query) {
      if (query !== '') {
        this.tabs.players.load = true;

        http.get(api["search"], {
          params: {
            param: query || '',
            scope: 'current',
          }
        }).then(res => {
          const d = res.data;

          if (d.success == 1) {
            this.tabs.players.list = d.data;
          }

          this.tabs.players.load = false;
        })
      } else {
        this.tabs.players.list = [];
      }
    },
    /**
     * 添加举报新标签
     * 举报JSON格式
     */
    handleTabsAdd() {
      let newFormData = {
        formItem: {
          gameName: gameName.child[gameName.defaultIndex].value,
          originId: "",
          videoLink: [],
          checkbox: [],
          description: this.$i18n.t("report.info.description"),
          captcha: "",
          originUserId: "",
          originPersonaId: "",
          avatarLink: "",
        },
        statusOk: 0,
        captchaUrl: {}
      };
      this.tabs.list.push(newFormData);
    },
    checkVideoAndImg(formData) {

      return true;
      // trimAllWhitespace(formData.formItem.videoLink) ||
      // if (
      //     /(http(preview.svg?):)([/|.|\w|\preview.svg|-])*\.(?:jpe?g|gif|png|bmp)/.test(formData.formItem.description)
      // ) {
      //   return true;
      // } else {
      //   this.$Message.error(this.$i18n.t("report.info.error"));
      //   return false;
      // }
    },
    /**
     * 更新或刷新验证码
     * @param index
     */
    refreshCaptcha(index) {
      http.get(api["captcha"], {
        params: {
          r: Math.random()
        }
      }).then(res => {
        if (res.data.success === 1) {
          this.tabs.list[index].captchaUrl = res.data.data;
        }
      });
    },
    /**
     * 单向绑定编辑器的值
     * @param h edit value
     * @param index tabs to index
     */
    handleMiscChange(h, index) {
      this.tabs.list[index].formItem.description = h;
    },
    /**
     * 取消当前标签的举报
     * 同删除此标签
     */
    doCancel() {
      if (this.tabs.list.length <= 1) {
        return;
      }
      this.tabs.count = 0;
      this.tabs.list.splice(this.tabs.count, 1);
    },
    /**
     * 发布当前标签的举报
     * @param index tabs index
     * @returns {Promise<boolean>}
     */
    async doReport(index) {
      // that form
      let formData = this.tabs.list[index];

      // check form data
      if (checkReportFormData.call(this, formData.formItem) === false) return false;
      // if (regular.check(regular.A, formData.formItem.description).code === -1) return false;

      formData.formItem.captcha = "";

      this.handleReport(formData, index);
      this.refreshCaptcha();
    },
    /**
     * 发布请求
     * @param formData
     * @param index
     */
    handleReport(formData, index) {
      const cheatMethods = formData.formItem.checkbox.join(",");
      const {gameName, captcha, originId} = formData.formItem;
      const description = formData.formItem.description.trim();
      const videoLink = formData.formItem.videoLink.toString();

      this.spinShow = true;
      this.http.post(api["player_report"], {
        data: {
          data: {
            game: gameName,
            originName: originId,
            cheatMethods,	// see {{valid_cheatMethod}}
            videoLink,
            description
          },
          encryptCaptcha: this.tabs.list[index].captchaUrl.hash,
          captcha
        },
      }).then((res) => {
        const d = res.data;

        if (d.success == 1) {
          this.tabs.list[index].statusOk = 1;

          // this.$router.push({
          //   name: "cheater",
          //   params: {game: gameName, ouid: d.data.originUserId},
          // });

          this.$Message.success(this.$i18n.t("report.info.success"));
        } else {
          this.tabs.list[index].statusOk = -1;

          switch (d.code) {
            case 'originId':
              this.$Message.error(
                  this.$i18n.t("report.info.originId")
              );
              break;
              default:
                this.$Message.error("failed " + d.message);
          }
        }

        this.tabs.list[index].statusMsg = d.message;
      }).finally(() => {
        this.tabs.list[index].statusOk = -1;

        this.spinShow = false;
        this.failedOfNotFound = false;
      });
    },
  },
};
</script>

<style lang="scss">
.hackrid {
  text-align: center;
  padding: 2rem 0;
  margin-bottom: 20px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  h1,span {
    font-size: 2rem;
    letter-spacing: .5rem;
  }

  span {
    color: rgba(0, 0, 0, 0.43);
  }
}

.notFoundHint {
  background: #cc0000;
  color: white;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  padding: 10px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
  "Microsoft YaHei", "\5FAE\8F6F\96C5\9ED1", Arial, sans-serif;
}

.ivu-tabs-bar {
  position: relative;
  z-index: 1;
  margin-bottom: -1px !important;
}
</style>