<template>
    <div class="container">
        <div class="content">
            <Form :label-width="80" style="position: relative">
                <div
                    class="notFoundHint"
                    id="notFoundHint"
                    v-show="failedOfNotFound"
                >
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
                <!--举报作弊-->
                <Divider>{{
                    $t("report.info.reportHacker", { msg: "reportHacker" })
                }}</Divider>

                <FormItem :label="$t('report.labels.game')">
                    <span class="hint">{{
                        $t("report.info.reportNews", { msg: "reportNews" })
                    }}</span>
                    <RadioGroup v-model="formItem.gameName" type="button">
                        <Radio label="bf1"
                            ><span>{{
                                $t("report.info.bf1", { msg: "bf1" })
                            }}</span></Radio
                        >
                        <Radio label="bfv"
                            ><span>{{
                                $t("report.info.bfv", { msg: "bfv" })
                            }}</span></Radio
                        >
                        <Radio label="bf6"
                            ><span>{{
                                $t("report.info.bf6", { msg: "bf6" })
                            }}</span></Radio
                        >
                    </RadioGroup>
                </FormItem>

                <FormItem :label="$t('report.labels.hackerId')">
                    <span class="hint">{{
                        $t("report.info.idNotion1", { msg: "idNotion1" })
                    }}</span>
                    <span class="hint">{{
                        $t("report.info.idNotion2", { msg: "idNotion2" })
                    }}</span>
                    <p style="font-size: 2rem">{{ formItem.originId }}</p>
                    <Input
                        v-model="formItem.originId"
                        :placeholder="$t('report.info.onlyOneId')"
                    />
                </FormItem>

                <FormItem :label="$t('report.labels.cheatMethod')">
                    <CheckboxGroup v-model="formItem.checkbox">
                        <Checkbox
                            v-for="method in cheatMethodsGlossary"
                            :key="method.value"
                            :label="method.value"
                        >
                            {{ $t(`cheatMethods.${method.value}`) }}
                        </Checkbox>
                    </CheckboxGroup>
                </FormItem>

                <FormItem :label="$t('detail.info.videoLink')">
                    <Alert type="warning">
                        {{
                            $t("report.info.uploadManual1", {
                                msg: "uploadManual1",
                            })
                        }}
                        <a target="_blank" href="https://streamable.com/"
                            >https://streamable.com/</a
                        >，{{
                            $t("report.info.uploadManual2", {
                                msg: "uploadManual2",
                            })
                        }}
                    </Alert>
                    <span class="hint">{{
                        $t("report.info.uploadManual3", {
                            msg: "uploadManual3",
                        })
                    }}</span>
                    <Input
                        v-model="formItem.bilibiliLink"
                        :placeholder="$t('report.info.required')"
                    />
                </FormItem>

                <FormItem :label="$t('report.labels.description')">
                    <Alert type="warning">
                        {{
                            $t("report.info.uploadPic1", { msg: "uploadPic1" })
                        }}
                    </Alert>
                    <Alert type="warning">
                        {{ $t("report.info.uploadPic2", { msg: "uploadPic2" })
                        }}<a target="_blank" href="https://sm.ms"
                            >https://sm.ms</a
                        >，{{
                            $t("report.info.uploadPic3", { msg: "uploadPic3" })
                        }}
                    </Alert>
                    <span class="hint">{{
                        $t("report.info.uploadPic4", { msg: "uploadPic4" })
                    }}</span>
                    <!-- <Input v-model="formItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." /> -->
                    <!--<Misc
                        :content="$t('report.info.description')"
                        @change="handleMiscChange"
                    />-->
                </FormItem>

                <FormItem :label="$t('report.info.captcha')">
                    <Input
                        type="text"
                        v-model="formItem.captcha"
                        :placeholder="$t('report.info.captcha')"
                    />
                    <img ref="captcha" />
                    <a
                        ref="reCaptcha"
                        href="#"
                        @click.stop.prevent="refreshCaptcha"
                    >
                        {{
                            $t("report.info.getCaptcha", { msg: "getCaptcha" })
                        }}
                    </a>
                </FormItem>

                <FormItem>
                    <Button @click="doReport" type="primary">{{
                        $t("report.info.report", { msg: "report" })
                    }}</Button>
                </FormItem>

                <Spin size="large" fix v-show="spinShow"></Spin>
            </Form>
        </div>
    </div>
</template>

<script>
//import Misc from "@/components/Misc.vue";
import {
    checkIdExist,
    checkReportFormData,
    trimAllWhitespace,
    getCsrfToken,
    cheatMethodsGlossary,
    waitForAction,
} from "@/mixins/common";
import ajax, { baseURL } from "@/mixins/ajax";

export default {
    data() {
        return {
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
            spinShow: false,
            failedOfNotFound: false,
            cheatMethodsGlossary,
        };
    },
    components: {
//        Misc,
    },
    methods: {
        checkVideoAndImg() {
            if (
                trimAllWhitespace(this.formItem.bilibiliLink) ||
                /(http(s?):)([/|.|\w|\s|-])*\.(?:jpe?g|gif|png|bmp)/.test(
                    this.formItem.description
                )
            ) {
                return true;
            } else {
                this.$Message.error(this.$i18n.t("report.info.error"));
                return false;
            }
        },
        refreshCaptcha() {
            this.$refs.captcha.src = baseURL + "/captcha?r=" + Math.random();

            waitForAction.call(this.$refs.reCaptcha);
        },
        handleMiscChange: function (h) {
            this.formItem.description = h;
        },
        doReport: function (e) {
            // check form data
            if (checkReportFormData.call(this, this.formItem) === false)
                return false;
            if (this.checkVideoAndImg() === false) return false;

            this.spinShow = true;
            checkIdExist({
                id: trimAllWhitespace(this.formItem.originId),
            })
                .then(async (res) => {
                    const d = res.data;
                    const idExist = d.idExist;

                    if (idExist) {
                        this.formItem.originUserId = d.originUserId;
                        this.formItem.originPersonaId = d.originPersonaId;
                        this.formItem.avatarLink = d.avatarLink;

                        await this.handleReport();
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

                    this.formItem.captcha = "";
                    this.refreshCaptcha();
                })
                .catch((e) => {
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
        handleReport: function () {
            this.spinShow = true;

            const cheatMethods = this.formItem.checkbox.join(",");
            const {
                gameName,
                originUserId,
                originPersonaId,
                avatarLink,
                captcha,
            } = this.formItem;

            const originId = trimAllWhitespace(this.formItem.originId);
            let bilibiliLink = trimAllWhitespace(this.formItem.bilibiliLink);
            if (bilibiliLink)
                bilibiliLink = /^https?:\/\//.test(bilibiliLink)
                    ? bilibiliLink
                    : "//" + bilibiliLink;
            const description = this.formItem.description.trim();

            ajax({
                method: "post",
                url: "/cheaters/",
                headers: {
                    // 'x-csrf-token': getCsrfToken(),
                },
                data: {
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
                        params: { game: gameName, ouid: d.data.originUserId },
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

