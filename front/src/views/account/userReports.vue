<template>
  <Tabs>
    <TabPane :label="$t('profile.reports.title')">
      <div class="profile-body">
        <Row>
          <Col :xm="{span: 24}" :lg="{span: 24}"
               style="width: 100%">
            <Card dis-hover :padding="0">
              <Reports :data="report.data"></Reports>
              <Spin size="large" fix v-show="load">
                <Loading size="50"></Loading>
              </Spin>
            </Card>

            <br/>
            <Row>
              <Col :xs="{span: 23, push: 1}" :lg="{span: 24, push: 0}">
                <Page
                    show-total
                    @on-change="getMyReports"
                    :page-size="limit"
                    :current="page"
                    :total="total"
                    class="page"
                    size="small"/>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </TabPane>
  </Tabs>
</template>

<script>
import Application from "@/assets/js/application";
import cheaterStatusView from "@/components/CheaterStatusView.vue";
import TimeView from "@/components/TimeView.vue";
import Empty from "@/components/Empty.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import Confetti from "@/components/Confetti.vue";
import Reports from "@/components/Reports.vue"
import Loading from "@/components/Loading.vue";
import {api, http, http_token} from "@/assets/js";

export default new Application({
  data() {
    return {
      load: false,
      report: {
        data: []
      },
      limit: 40,
      page: 1,
      total: 0,
    };
  },
  watch: {
    $route: "loadData",
  },
  components: {Loading, Empty, UserAvatar, cheaterStatusView, TimeView, Confetti, Reports},
  created() {
    this.http = http_token.call(this);

    this.getMyReports(null);
  },
  methods: {
    /**
     * 获取举报信息
     * @param uId
     */
    getMyReports(pageNum) {
      this.load = true;

      http.get(api["user_reports"], {
        params: {
          id: this.currentUser.userinfo.userId,
          skip: (pageNum || 1) - 1,
          limit: this.limit,
        }
      }).then(res => {
        const d = res.data;
        let reportData = [];

        if (d.success === 1) {
          d.data.forEach(i => reportData.push(i));

          this.report.data = reportData;
          this.total = d.total;
        }
      }).finally(() => {
        this.$Loading.finish();
        this.load = false;
      });
    },
  },
  computed: {
    /**
     * 是否包含用户附带的额外内容
     * 如果自我描述以及attr特定属性不显示，则关闭右侧一栏
     * @returns {boolean}
     */
    isAttachedContent() {
      return !this.account.attr.introduction && !this.account.origin;
    },
    /**
     * 是否可用聊天
     * @returns {boolean}
     */
    isChat() {
      return !this.account.attr.allowDM || this.account.id == this.currentUser.userinfo.userId
    }
  }
})
</script>

<style scoped lang="less">

</style>
