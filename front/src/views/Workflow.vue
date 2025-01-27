<script>
import WorkflowView from "@/components/workflow/index.vue";
import cheaterStatus from '/public/config/cheaterStatus.json';
import {account_storage, workflow_storage} from "@/assets/js";
import store from "@/store";

export default {
  data() {
    return {
      cheaterStatus,

      search: {
        value: ''
      },
      workflowSettingModel: false,
      setting: {
        showColumn: [],
        autoMatic: {
          data: [{
            value: [3, 4, 8],
            time: 100000,
            action: 'archiving',
          },
            {
              value: [1],
              time: 200000,
            }]
        },
        autoMaticAction: ['archiving'],
        isWindowNotify: true,
        columnWidth: 400,
      }
    }
  },
  components: {WorkflowView},
  watch: {
    'setting.isWindowNotify': {
      handler(val) {
        store.state.configuration.desktopNotification = val;
        account_storage.updateConfiguration('desktopNotification', val);
      },
    }
  },
  methods: {
    /**
     * 工作流初始事件
     */
    onReadyWorkflow(data) {
      this.setting.showColumn = data.setting.showColumn || cheaterStatus.child.map(i => i.value);
    },
    /**
     * 确认工作流设置
     */
    onSettingSave() {
      this.$refs.workflow.updateArgument({
        showColumn: this.setting.showColumn,
        columnWidth: this.setting.columnWidth
      })
      this.workflowSettingModel = false;
    },
    /**
     * 删除工作流数据
     */
    onDeleteWorkflowData() {
      workflow_storage.delete('0', workflow_storage.DATA);
      this.$refs.workflow.loadLocalData();
      this.workflowSettingModel = false;
    },
    /**
     * 删除工作流配置数据
     */
    onDeleteWorkflowConfig() {
      workflow_storage.delete('0', workflow_storage.CONFIG);
      this.workflowSettingModel = false;
    },
    /**
     * 删除工作流元数据
     */
    onDeleteWorkflowMetaData() {
      workflow_storage.delete('0', workflow_storage.CASEMETADATA);
      this.workflowSettingModel = false;
    }
  },
  computed: {
    workflowIdAdded() {
      return this.$refs.workflow && this.$refs.workflow.workflowPersonaIdAdded || [];
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
          <BreadcrumbItem>{{ $t("workflow.title") }}<Tag>Beta</Tag></BreadcrumbItem>
        </Breadcrumb>
      </Col>
    </Row>
    <br>

    <template v-if="$store.state.configuration.autoUpdatePlayerList && $store.state.configuration.footerBar">
      <Row :gutter="10">
        <Col>

        </Col>
        <Col flex="1"></Col>
        <Col>
          <Dropdown placement="bottom-end">
            <ButtonGroup>
              <Button>
                刷新
                <Icon type="ios-arrow-down"></Icon>
              </Button>

            </ButtonGroup>
            <DropdownMenu slot="list">
              <DropdownItem @click.native="$refs.workflow.onRefreshWorkflow('local')">刷新 (从本地重新读取)</DropdownItem>
              <DropdownItem @click.native="$refs.workflow.onRefreshWorkflow('network')">数据刷新 (从远程刷新)</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Col>
        <Col>
          <ButtonGroup>
            <Button>
              归档夹
            </Button>
            <Button @click="workflowSettingModel = true">
              <Icon type="md-settings"/>
              设置
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      <br>

      <Card :padding="0" dis-hover>
        <WorkflowView ref="workflow" @ready="onReadyWorkflow"/>
      </Card>

      <!-- 工作流设置 S -->
      <Modal v-model="workflowSettingModel">
        <div slot="header">
          <b>工作流设置</b>
        </div>

        <Form labelPosition="top">
          <Row>
            <Col span="24">
              <FormItem label="显示列">
                <p>控制显示对你需要的列</p>
                <Select clearable multiple v-model="setting.showColumn">
                  <Option v-for="(j, j_index) in cheaterStatus.child" :label="$t(`basic.status.${j.value}.text`)"
                          :value="j.value" :key="j_index"></Option>
                </Select>
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="是否提醒">
                <Checkbox v-model="setting.isWindowNotify">窗口通知</Checkbox>
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="列宽度">
                <InputNumber v-model="setting.columnWidth" :min="350" :max="800"></InputNumber>
              </FormItem>
            </Col>
            <Col span="24">
              <FormItem>
                <Row :gutter="10" slot="label" type="flex" align="middle">
                  <Col flex="1">
                    自动归档
                  </Col>
                  <Col>
                    <Button size="small">
                      <Icon type="md-add" @click="setting.automaticArchiving.data.push({value: [], time: 0})"></Icon>
                    </Button>
                  </Col>
                </Row>
                <Alert type="info">设置下方规则，让长期不处理案件自动归档</Alert>
                <div v-for="(i,index) in setting.autoMatic.data" :key="index">
                  <Row :gutter="10">
                    <Col span="12">
                      <FormItem label="类型">
                        <Select multiple v-model="i.value">
                          <Option v-for="(j, j_index) in cheaterStatus.child" :label="$t(`basic.status.${j.value}.text`)"
                                  :value="j.value" :key="j_index"></Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span="6">
                      <FormItem label="时间">
                        <Input v-model="i.time"></Input>
                        <p>多久无操作时间</p>
                      </FormItem>
                    </Col>
                    <Col span="6">
                      <FormItem label="处理">
                        <Select>
                          <Option v-for="(k, k_index) in setting.autoMaticAction" :label="k" :value="k"
                                  :key="k_index">
                            {{ k }}
                          </Option>
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </FormItem>
            </Col>
            <Col span="24">
              <Divider></Divider>
              <FormItem label="删除">
                <List border>
                  <ListItem>
                    <ListItemMeta title="工作流数据" description="删除工作流数据，该操作无法复原，谨慎选择删除"/>
                    <div slot="extra">
                      <Button size="small" type="error" @click="onDeleteWorkflowData">
                        确认删除
                      </Button>
                    </div>
                  </ListItem>
                  <ListItem>
                    <ListItemMeta title="配置" description="删除配置数据，该操作无法复原，谨慎选择删除"/>
                    <div slot="extra">
                      <Button size="small" type="error" @click="onDeleteWorkflowConfig">
                        确认删除
                      </Button>
                    </div>
                  </ListItem>
                  <ListItem>
                    <ListItemMeta title="单元数据"
                                  description="删除单元数据，如用户对玩家案件的备份信息、定时器，该操作无法复原，谨慎选择删除"/>
                    <div slot="extra">
                      <Button size="small" type="error" @click="onDeleteWorkflowMetaData">
                        确认删除
                      </Button>
                    </div>
                  </ListItem>
                </List>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <div slot="footer">
          <Row>
            <Col flex="1"></Col>
            <Col>
              <Button @click="onSettingSave">
                {{ $t('basic.button.submit') }}
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
      <!-- 工作流设置 E -->
    </template>
    <template v-else>
      <Card dis-hover>
        <b>未开启对应权限</b>
        <p>请在设置里打开本地增强 > '底部工具'和'未处理提醒'设置</p>
      </Card>
    </template>
  </div>
</template>

<style lang="less" scoped>
</style>
