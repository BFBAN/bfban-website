<template>
  <div class="container">
    <div class="content">
      <br>
      <Breadcrumb>
        <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
        <BreadcrumbItem>{{ $t("report.info.reportHacker", {msg: "reportHacker"}) }}</BreadcrumbItem>
      </Breadcrumb>
      <br>

      <Tabs type="card" v-model="tabs.count">
        <TabPane v-for="(tab, index) in tabs.list.length" :key="tab"
                 :label="tabs.list[index].formItem.originId ? tabs.list[index].formItem.originId : '举报标签' + tab">
          <Card shadow style="margin-top: -16px">
            <Form :label-width="80" label-position="left">
              <!--举报作弊-->
              <div
                class="notFoundHint"
                id="notFoundHint"
                v-show="failedOfNotFound">
                <p style="font-size: 14px; font-weight: bold">
                  {{ $t("report.info.notFoundHintTitle") }}
                </p>
                <p style="font-size: 14px; margin-left: 10px">
                  {{ $t("report.info.notFoundHintQuestion1") }}
                </p>
                <p style="font-size: 12px; margin-left: 20px">
                  {{ $t("report.info.notFoundHintAnswer1") }}
                </p>
                <p style="font-size: 14px; margin-left: 10px">
                  {{ $t("report.info.notFoundHintQuestion2") }}
                </p>
                <p style="font-size: 12px; margin-left: 20px">
                  {{ $t("report.info.notFoundHintAnswer2") }}
                </p>
              </div>

              <Timeline>
                <TimelineItem>
                  <Card dis-hover>
                    <FormItem :label="$t('report.labels.game')">
                      <RadioGroup v-model="tabs.list[index].formItem.gameName" type="button">
                        <Radio label="bf1">
                          <span>{{ $t("report.info.bf1", {msg: "bf1"}) }}</span>
                        </Radio>
                        <Radio label="bfv">
                          <span>{{ $t("report.info.bfv", {msg: "bfv"}) }}</span>
                        </Radio>
                        <Radio label="bf6">
                          <span>{{ $t("report.info.bf6", {msg: "bf6"}) }}</span>
                        </Radio>
                      </RadioGroup>
                      <span class="hint">{{ $t("report.info.reportNews", {msg: "reportNews"}) }}</span>
                    </FormItem>

                    <FormItem :label="$t('report.labels.hackerId')">
                      <p style="font-size: 2rem">{{ tabs.list[index].formItem.originId }}</p>
                      <Input
                        v-model="tabs.list[index].formItem.originId"
                        :placeholder="$t('report.info.onlyOneId')"/>
                      <span class="hint">
                      {{ $t("report.info.idNotion1", {msg: "idNotion1"}) }}
                    </span>
                      <span class="hint">
                      {{ $t("report.info.idNotion2", {msg: "idNotion2"}) }}
                    </span>
                    </FormItem>

                    <FormItem :label="$t('report.labels.cheatMethod')">
                      <CheckboxGroup v-model="tabs.list[index].formItem.checkbox">
                        <Checkbox
                          v-for="method in cheatMethodsGlossary"
                          :key="method.value"
                          :label="method.value">
                          {{ $t(`cheatMethods.${method.value}`) }}
                        </Checkbox>
                      </CheckboxGroup>
                    </FormItem>
                  </Card>
                </TimelineItem>
                <TimelineItem>
                  <Card dis-hover>
                    <FormItem :label="$t('detail.info.videoLink')">
                      <Alert type="warning">
                        {{
                          $t("report.info.uploadManual1", {
                            msg: "uploadManual1",
                          })
                        }}
                        <a target="_blank" href="https://streamable.com/">https://streamable.com/</a>，{{
                          $t("report.info.uploadManual2", {
                            msg: "uploadManual2",
                          })
                        }}
                      </Alert>
                      <span class="hint">
                      {{
                          $t("report.info.uploadManual3", {
                            msg: "uploadManual3",
                          })
                        }}
                    </span>
                      <Input
                        v-model="tabs.list[index].formItem.bilibiliLink"
                        :placeholder="$t('report.info.required')"/>
                    </FormItem>

                    <FormItem :label="$t('report.labels.description')">
                      <Alert type="warning">
                        {{ $t("report.info.uploadPic1", {msg: "uploadPic1"}) }}
                      </Alert>
                      <Alert type="warning">
                        {{ $t("report.info.uploadPic2", {msg: "uploadPic2"}) }}
                        <a target="_blank"
                           href="https://sm.ms">https://sm.ms</a>，{{
                          $t("report.info.uploadPic3", {msg: "uploadPic3"})
                        }}
                      </Alert>
                      <span class="hint">
                        {{ $t("report.info.uploadPic4", {msg: "uploadPic4"}) }}
                      </span>
                      <Edit :index="index" :content="$t('report.info.description')" @change="handleMiscChange"/>
                    </FormItem>
                  </Card>
                </TimelineItem>
                <TimelineItem>
                  <Card dis-hover>
                    <FormItem :label="$t('report.info.captcha')">
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
                      <Button @click="doReport(index)" type="primary" size="large">
                        {{ $t("report.info.reportOne", {msg: "report"}) }}
                      </Button>
                    </FormItem>
                  </Card>
                </TimelineItem>
              </Timeline>

              <Button @click="doReport" type="primary" size="large">
                {{ $t("report.info.reportAll", {msg: "report"}) }}
              </Button>

              <Spin size="large" fix v-show="spinShow"></Spin>
            </Form>
          </Card>
        </TabPane>
        <Button @click="handleTabsAdd" size="small" slot="extra">+</Button>
      </Tabs>
    </div>
    <br>
  </div>
</template>

<script>
import {http, api, conf, http_token} from '../assets/js/index'
import Edit from "@/components/Edit.vue";
import {
  checkReportFormData,
  trimAllWhitespace,
  cheatMethodsGlossary,
} from "@/mixins/common";

export default {
  data() {
    return {
      tabs: {
        count: 0,
        list: []
      },
      spinShow: false,
      failedOfNotFound: false,
      cheatMethodsGlossary,
    };
  },
  components: {
    Edit,
  },
  created() {
    this.http = http_token.call(this);
    this.handleTabsAdd();
  },
  methods: {
    handleTabsAdd() {
      let newFormData = {
        formItem: {
          gameName: "",
          originId: "",
          bilibiliLink: "",
          checkbox: ["aimbot"],
          description: this.$i18n.t("report.info.description"),
          captcha: "",

          originUserId: "",
          originPersonaId: "",
          avatarLink: "",
        },
        captchaUrl: {}
      };
      this.tabs.list.push(newFormData);
    },
    checkVideoAndImg(formData) {
      if (
        trimAllWhitespace(formData.formItem.bilibiliLink) ||
        /(http(s?):)([/|.|\w|\s|-])*\.(?:jpe?g|gif|png|bmp)/.test(
          formData.formItem.description
        )
      ) {
        return true;
      } else {
        this.$Message.error(this.$i18n.t("report.info.error"));
        return false;
      }
    },
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
      // waitForAction.call(this.$refs.reCaptcha);
    },
    handleMiscChange(h, index) {
      this.tabs.list[index].formItem.description = h;
    },
    doCancel() {
      if (this.tabs.list.length <= 1) {
        return;
      }
      this.tabs.count = 0;
      this.tabs.list = this.tabs.list.splice(this.tabs.count, 1);
    },
    doReport(index) {
      // that form
      let formData = this.tabs.list[index];

      // check form data
      if (checkReportFormData.call(this, formData.formItem) === false)
        return false;
      if (this.checkVideoAndImg(formData) === false) return false;

      this.spinShow = true;

      this.post('checkGameIdExist', {
        data: {
          id: trimAllWhitespace(formData.formItem.originId),
        },
      }).then(async (res) => {
        const d = res.data;
        const idExist = d.idExist;

        if (idExist) {
          formData.formItem.originUserId = d.originUserId;
          formData.formItem.originPersonaId = d.originPersonaId;
          formData.formItem.avatarLink = d.avatarLink;

          await this.handleReport(formData);
        } else {
          this.spinShow = false;
          this.failedOfNotFound = true;

          setImmediate(() => {
            document
              .getElementById("notFoundHint")
              .scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest",
              });
          });

          this.$Message.error(
            this.$i18n.t("report.info.originId")
          );
        }

        formData.formItem.captcha = "";
        this.refreshCaptcha();
      }).catch((e) => {
        if (e.response && e.response.status == 401)
          this.$Message.error(
            this.$t("report.info.loginExpired")
          );
        else if (e.response && e.response.status == 500)
          this.$Message.error(
            "An error occured in server, please try again later."
          );
        else this.$Message.error("Failed: Unknown error.");
        this.spinShow = false;
      });
    },
    handleReport(formData) {
      this.spinShow = true;
      const cheatMethods = formData.formItem.checkbox.join(",");
      const {
        gameName,
        originUserId,
        originPersonaId,
        avatarLink,
        captcha,
      } = formData.formItem;
      const originId = trimAllWhitespace(formData.formItem.originId);
      let bilibiliLink = trimAllWhitespace(formData.formItem.bilibiliLink);
      if (bilibiliLink)
        bilibiliLink = /^https?:\/\//.test(bilibiliLink)
          ? bilibiliLink
          : "//" + bilibiliLink;
      const description = formData.formItem.description.trim();

      this.http.post(api["cheaters"], {
        data: {
          // data: {
          //   game: 'bf1' | 'bfv',
          //   originName: 'string',
          //   cheatMethods: 'string',	// see {{valid_cheatMethod}}
          //   videoLink: '',
          //   description: 'string'
          // },
          gameName,
          originId,
          cheatMethods,
          bilibiliLink,
          description,
          captcha,
          originUserId,
          originPersonaId,
          avatarLink,
        },
      }).then((res) => {
        this.spinShow = false;
        this.failedOfNotFound = false;
        const d = res.data;
        if (d.error === 0) {
          this.$router.push({
            name: "cheater",
            params: {game: gameName, ouid: d.data.originUserId},
          });

          this.$Message.success(this.$i18n.t("report.info.success"));
        } else {
          this.$Message.error("failed " + d.msg);
        }
      });
    },
  },
};
</script>

<style lang="scss">
.notFoundHint {
  background: #cc0000;
  color: white;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  padding: 10px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
  "Microsoft YaHei", "\5FAE\8F6F\96C5\9ED1", Arial, sans-serif;
}
</style>
