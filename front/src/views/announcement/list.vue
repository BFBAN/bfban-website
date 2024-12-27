<template>
  <div class="container announcementView">
    <br />
    <Row>
      <Col :xs="{ push: 1 }" :lg="{ push: 0 }">
        <Breadcrumb>
          <BreadcrumbItem :to="{ name: 'home' }">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem :to="{ name: 'announcement' }">{{ $t("home.bulletin.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br />

    <div class="list">
      <Card class="item" v-for="item in list" :key="item.route">
        <template #title><span class="ruleName">{{ item.name }}</span></template>
        <p class="ruleDesc">{{ item.desc }}</p>
        <Divider orientation="left" size="small" class="divider">{{ $t("announcement.version") }}</Divider>
        <div class="version">
          <div v-for="(i, index) in item.versions" :key="i" @click="jump(item.route, i)">
            <span>
              {{ i }}
              <span v-if="index === 0">({{ $t("announcement.latest") }})</span>
            </span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [] // 用于存储加载的配置数据
    };
  },
  async created() {
    // 动态加载配置文件
    const locale = this.$i18n.locale === "zh-CN" ? "CN" : "US";
    try {
      const response = await fetch(`/data/config.json`);
      const config = await response.json();
      const categories = Object.keys(config[locale]);

      // 动态生成 list
      this.list = categories.map((key) => ({
        name: this.$i18n.t(`announcement.${key}.name`),
        desc: this.$i18n.t(`announcement.${key}.intro`),
        route: config[locale][key].route,
        versions: config[locale][key].versions.reverse()
      }));
    } catch (error) {
      console.error("加载配置文件失败:", error);
    }
  },
  methods: {
    jump(route, date) {
      this.$router.push({
        name: "announcementDetails",
        query: {
          route,
          date
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.announcementView {
  .list {
    .item {
      margin-bottom: 30px;

      .ruleName {
        font-size: 18px;
      }

      .ruleDesc {
        opacity: 0.7;
      }

      .divider {
        color: #333;
      }

      .version {
        font-size: 13px;
        color: #aaa;

        > div {
          display: flex;
          justify-content: space-between;
          padding: 0 16px;
          margin-block: 5px;

          span:first-child {
            text-decoration: underline;
            cursor: pointer;
            text-underline-offset: 3px;
          }
        }
      }
    }
  }
}
</style>
