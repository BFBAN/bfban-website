<script>
import SharePlayerCell from "@/components/SharePlayerCell.vue";
import {player_storage, workflow_storage} from "@/assets/js";

export default {
  data() {
    return {
      load: false,
      status: 0
    }
  },
  components: {SharePlayerCell},
  methods: {
    /**
     * 确认
     * 将批量或单个案件添加到工作流中
     */
    async onAddDataWorkflow() {
      try {
        this.load = true;
        let workflowData = workflow_storage.getConfiguration('0', workflow_storage.DATA),
            promises = this.getPlayers.map(async personaId => {
              if (this.$route.query.type === 'persona' && this.getPlayers.indexOf(personaId) >= 0) {
                return {
                  data: await player_storage.getPlayerInfo({personaId}, true)
                };
              }
              return {
                error: true,
                data: {
                  originPersonaId: personaId
                },
              }
            }),
            playersData = await Promise.all(promises).then(res => res.find(i => i.error !== true)),
            selectStatusIndex = workflowData.children.findIndex(i => i.name.value === 0);

        workflowData.children[selectStatusIndex].children = workflowData.children[selectStatusIndex].children.concat(playersData)

        workflow_storage.updateConfiguration('0', workflowData, workflow_storage.DATA);
        await this.$router.push({name: "workflow"})
      } finally {
        this.load = false;
      }
    }
  },
  computed: {
    /**
     * 添加玩家ids
     * @returns {(string|(string | null)[])[]|string[]|*[]}
     */
    getPlayers() {
      const {ids, id} = this.$route.query;
      if (ids)
        return this.$route.query.ids.split(',');
      if (id)
        return [id];
      return []
    }
  }
}
</script>

<template>
  <div class="container">
    <br>
    <Row>
      <Col flex="1" :xs="{push: 1}" :lg="{push: 0}">
        <Breadcrumb>
          <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
          <BreadcrumbItem :to="{name: 'workflow'}">{{ $t("workflow.title") }}</BreadcrumbItem>
          <BreadcrumbItem>{{ $t("workflow.add.title") }}</BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <Card dis-hover>
      <template v-if="$route.name === 'workflow_item_add'">
        <h1>添加</h1>
        <p>将以下玩家添加到你的工作流中</p>
        <br>
      </template>

      <template v-if="$route.query.type === 'persona' && $route.name === 'workflow_adds'">
        <h1>批量添加</h1>
        <p>将以下玩家添加到你的工作流中</p>
        <br>
      </template>

      <Row :gutter="10">
        <Col>
          <template v-if="$route.name === 'workflow_item_add'">
            <SharePlayerCell type="card" :persona-id="$route.query.id"></SharePlayerCell>
          </template>
          <template v-if="$route.query.type === 'persona' && $route.name === 'workflow_adds'">
            <Row :gutter="10">
              <Col v-for="(i, index) in getPlayers" :key="index">
                <SharePlayerCell type="card" :persona-id="i"></SharePlayerCell>
              </Col>
            </Row>
          </template>
        </Col>
      </Row>

      <Divider dashed></Divider>
      <Row :gutter="10" type="flex" justify="center">
        <Col>
          <Select v-model="status" size="large" :disabled="true">
            <Option :value="0">待处理</Option>
          </Select>
        </Col>
        <Col>
          <Button type="primary" size="large" long :loading="load" @click="onAddDataWorkflow">确认</Button>
        </Col>
      </Row>

    </Card>
  </div>
</template>

<style lang="less" scoped>
</style>
