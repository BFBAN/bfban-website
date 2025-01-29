<script>
import cheaterStatus from '/public/config/cheaterStatus.json';

import {Container, Draggable} from 'vue-smooth-dnd';
import {api, http_token, workflow_storage} from "@/assets/js";

import Empty from "@/components/Empty.vue";

import lodash from "lodash";
import CheaterStatusView from "@/components/CheaterStatusView.vue";
import TimeView from "@/components/TimeView.vue";
import JudgementActionView from "@/components/judgementActionView.vue";
import TimelineView from "@/components/timeline/index.vue";
import SharePlayerCell from "@/components/SharePlayerCell.vue";
import HtmlLink from "@/components/HtmlLink.vue";

export default {
  data() {
    const columnNames = cheaterStatus.child.map(i => ({
      value: i.value,
      label: this.$i18n.t(`basic.status.${i.value}.text`)
    }));
    const workflow = {
      type: 'container',
      props: {
        orientation: 'horizontal',
        className: 'workflow-col',
      },
      children: this.generateItems(columnNames.length, i => ({
        id: `column${i}`,
        type: 'container',
        name: columnNames[i],
        props: {
          orientation: 'vertical',
          className: 'workflow-col'
        },
        children: [],
      }))
    }

    return {
      workflowLoading: true,

      // 工作流数据
      workflow,
      // 案件元
      workflowMeta: {
        value: {
          timer: 7,
          action: 'archive',
        },
        takes: {
          timer: [7, 30],
          action: ['archive', 'desktop-notification']
        },
        data: {}
      },
      // 设置面板
      setting: {
        showColumn: [],
        columnWidth: 350,
        isWindowNotify: true,
      },
      // 添加
      addPlayerModal: {
        show: false,
        searchValue: '',
        select: []
      },
      // 编辑
      editPlayerModal: {
        show: false,
        data: {},
      },
      // 归档
      archivedModal: {
        show: false,
        data: {},
      },
    }
  },
  components: {
    HtmlLink,
    SharePlayerCell,
    JudgementActionView, TimelineView, TimeView, CheaterStatusView, Empty, Container, Draggable
  },
  created() {
    this.http = http_token.call(this);
    this.setting.showColumn = cheaterStatus.child.map(i => i.value);
    this.loadLocalData();

    // 外部事件通知
    this.$emit('ready', {
      setting: this.setting,
      scene: this.workflow,
    });
  },
  methods: {
    /**
     * 载入本地数据
     */
    async loadLocalData() {
      // 本地初始队列
      if (!workflow_storage.getConfiguration('0', workflow_storage.DATA))
        this.onSaveWorkflowData();
      else
        this.workflow = lodash.mergeWith(this.workflow, workflow_storage.getConfiguration('0', workflow_storage.DATA))

      // 本地初始配置
      if (!workflow_storage.getConfiguration('0', workflow_storage.CONFIG))
        this.onSaveWorkflowConfig();
      else
        this.setting = workflow_storage.getConfiguration('0', workflow_storage.CONFIG);

      // 本地初始元
      if (!workflow_storage.getConfiguration('0', workflow_storage.CASEMETADATA))
        this.onSaveWorkflowMetaData();
      else
        this.workflowMeta.data = workflow_storage.getConfiguration('0', workflow_storage.CASEMETADATA);

      // 本地初始归档
      if (!workflow_storage.getConfiguration('0', workflow_storage.ARCHIVEDDATA))
        this.onSaveWorkflowArchivedData();
      else
        this.archivedModal.data = workflow_storage.getConfiguration('0', workflow_storage.ARCHIVEDDATA);
      this.workflowLoading = false;
    },
    /**
     * 查看玩家详情
     * @param i
     */
    openDetail(i, column, type) {
      this.isFooterFull = false;
      this.$emit('close');

      switch (type) {
        case 1:
          this.$router.push({name: 'player', params: {ouid: i.originPersonaId}, query: {byPath: this.$route.name}});
          break;
        case 2:
          this.editPlayerModal.show = true;
          this.editPlayerModal.column = column;
          this.editPlayerModal.data = i;
          if (this.$refs.timeline_workflow)
            this.$refs.timeline_workflow.getTimeline();
          break;
      }
    },

    /**
     * 刷新
     * @param type
     */
    async onRefreshWorkflow(type) {
      try {
        this.workflowLoading = true;

        switch (type) {
          case 'local':
            await this.loadLocalData();
            break;
          default:
          case 'network':
            for (const i of this.workflow.children) {
              const userIds = i.children.map(i => i.data.originUserId);
              if (userIds.length < 0) return; // 空队列不请求
              const res = await this.http.get(api["player_batchs"], {
                params: {userIds}
              });

              const d = res.data;

              if (d.success === 1) {
                const mergePlayerData = lodash.map(i.children, (child) => {
                  const found = lodash.find(d.data, {id: child.id});
                  return {...child, ...found};
                });
                i.children = mergePlayerData;
              }
            }
            break;
        }

      } finally {
        this.workflowLoading = false;
      }
    },

    /**
     * 打开添加玩家Model
     * @param column
     */
    openAddPlayerModel(column) {
      this.addPlayerModal.show = true;
      this.addPlayerModal.data = column;
      this.onSaveWorkflowData();
    },

    /**
     * 更新工作流配置
     * @param data
     */
    updateArgument(data) {
      this.setting.showColumn = data.showColumn;
      this.setting.columnWidth = data.columnWidth;
      this.onSaveWorkflowConfig();
    },

    /**
     * 改变列表名称
     */
    onChangeColumnName(e, value, col) {
      col.name.label = value;
      this.onSaveWorkflowData();
    },

    /**
     * 最小过滤队列数据
     */
    onMinimumFiltrationData(scene) {
      return {
        children: scene.children.map(i => ({
          name: i.name,
          children: i.children.map(j => ({
            data: j.data
          }))
        }))
      };
    },

    /**
     * 添加玩家卡片
     */
    onAddPlayer() {
      let column = this.addPlayerModal.data,
          selectPlayer = this.$store.state.$desktop.workflow.autoUpdatePlayerList.result.filter(i => {
            return i.select && this.workflowPersonaIdAdded.indexOf(i.originPersonaId) < 0;
          });

      selectPlayer.forEach(i => {
        column.children.push({
          type: 'draggable',
          data: i
        })
        // id player case id
        const now = new Date().getTime();
        this.workflowMeta.data[i.id] = Object.assign(this.workflowMeta.data[i.id] || {}, {
          take: [],
          remark: '',
          creationTime: now,
          updateTime: now,
        });
      })
      this.addPlayerModal.show = false;

      this.onSaveWorkflowData();
      this.onSaveWorkflowMetaData();
    },

    /**
     * 删除玩家卡片
     */
    onDeletePlayer(column, id, type) {
      let index = lodash.findIndex(column.children, i => i.data.originPersonaId === id)
      delete column.children.splice(index, 1);
      this.editPlayerModal.show = false;

      // 添加归档数据
      if (type === 2)
        this.onSaveWorkflowArchivedData()

      this.onSaveWorkflowData();
    },

    /**
     * 编辑玩家卡片
     */
    onEditPlayer() {
      let data = this.editPlayerModal.data;
      this.workflowMeta.data[data.id] = Object.assign({}, this.workflowMeta.data[data.id]);
      this.editPlayerModal.show = false;
      this.onSaveWorkflowMetaData();
    },

    /**
     * 创建元take任务
     */
    onCreateMetaTake() {
      // if (!this.editPlayerModal.data.id) return;
      this.workflowMeta.data[this.editPlayerModal.data.id].take.push({
        timer: this.workflowMeta.value.timer,
        action: this.workflowMeta.value.action
      });
    },

    /**
     * 删除take任务
     */
    onDeleteMetaTake(index) {
      if (this.workflowMeta.data[this.editPlayerModal.data.id] &&
          this.workflowMeta.data[this.editPlayerModal.data.id].take.length >= 0)
        this.workflowMeta.data[this.editPlayerModal.data.id].take.splice(index, 1);
    },

    // =====

    /**
     * 列拖拽
     * @param dropResult
     */
    onColumnDrop(dropResult) {
      const scene = Object.assign({}, this.workflow);
      scene.children = this.applyDrag(scene.children, dropResult);
      this.workflow = scene;
      this.onSaveWorkflowData();
    },

    /**
     * 列-卡片拖拽
     * @param columnId
     * @param dropResult
     */
    onCardDrop(columnId, dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const scene = Object.assign({}, this.workflow)
        const column = scene.children.filter(p => p.id === columnId)[0]
        const columnIndex = scene.children.indexOf(column)

        const newColumn = Object.assign({}, column)
        newColumn.children = this.applyDrag(newColumn.children, dropResult)
        scene.children.splice(columnIndex, 1, newColumn)

        this.workflow = scene;
        this.onSaveWorkflowData();
      }
    },

    /**
     * 保存工作流数据
     */
    onSaveWorkflowData() {
      workflow_storage.updateConfiguration('0', this.onMinimumFiltrationData(this.workflow), workflow_storage.DATA);
    },

    /**
     * 保存工作流配置数据
     */
    onSaveWorkflowConfig() {
      workflow_storage.updateConfiguration('0', this.setting, workflow_storage.CONFIG)
    },

    /**
     * 保存工作流元数据
     */
    onSaveWorkflowMetaData() {
      let meta = workflow_storage.getConfiguration('0', workflow_storage.CASEMETADATA);
      const workflowPlayerCaseIdAdded = new Set(this.workflowPlayerCaseIdAdded);
      if (!meta) meta = {};
      workflow_storage.updateConfiguration(
          '0',
          lodash.mergeWith(meta, this.workflowMeta.data),
          workflow_storage.CASEMETADATA
      );
    },

    /**
     * 保存工作流归档数据
     */
    onSaveWorkflowArchivedData() {
      workflow_storage.updateConfiguration(
          '0',
          this.archivedModal.data,
          workflow_storage.ARCHIVEDDATA
      )
    },

    /**
     * 获取卡片
     * @param columnId
     * @returns {function(*): *}
     */
    getCardPayload(columnId) {
      return index => {
        return this.workflow.children.filter(p => p.id === columnId)[0].children[index]
      }
    },

    /**
     * 拖拽结束
     * @param arr
     * @param dragResult
     * @returns {*|*[]}
     */
    applyDrag(arr, dragResult) {
      const {removedIndex, addedIndex, payload} = dragResult
      if (removedIndex === null && addedIndex === null) return arr

      const result = [...arr]
      let itemToAdd = payload

      if (removedIndex !== null) {
        itemToAdd = result.splice(removedIndex, 1)[0]
      }

      if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd)
      }

      return result
    },

    /**
     * 生成列-卡片
     * @param count
     * @param creator
     * @returns {*[]}
     */
    generateItems(count, creator) {
      const result = []
      for (let i = 0; i < count; i++) {
        result.push(creator(i))
      }
      return result
    },
  },
  computed: {
    /**
     * 已添加persona id
     * 玩家id
     */
    workflowPersonaIdAdded() {
      try {
        let personaIds = [];
        this.workflow.children.forEach(i => {
          if (i.children)
            i.children.forEach(j => {
              personaIds.push(j.data.originPersonaId)
            })
        })
        return personaIds;
      } catch (e) {
        return [];
      }
    },
    /**
     * 已添加player db id
     * 案件id
     */
    workflowPlayerCaseIdAdded() {
      try {
        let ids = [];
        this.workflow.children.forEach(i => {
          if (i.children)
            i.children.forEach(j => {
              ids.push(j.data.id)
            })
        })
        return ids;
      } catch (e) {
        return [];
      }
    }
  }
}
</script>

<template>
  <div>
    <div class="workflow-box">
      <Container
          :drop-placeholder="{
            className: 'cards-drop-preview',
            animationDuration: '150',
            showOnTop: true
          }"
          drag-handle-selector=".column-drag-handle"
          orientation="horizontal"
          @drop="onColumnDrop($event)">
        <Draggable v-for="(column, column_index) in workflow.children" :key="column_index">
          <div v-if="setting.showColumn.indexOf(column.name.value) >= 0"
               :class="column.props.className"
               :style="`width: ${setting.columnWidth}px`">
            <Row :gutter="10" align="middle" class="card-column-header" type="flex">
              <Col class="column-drag-handle handle">&#x2630;</Col>
              <Col flex="1">
                <Input v-model="column.name.label" :border="false" size='small'
                       @on-change="(e) => onChangeColumnName(e, column.name.label,column)"></Input>
                <p>{{ $t(`basic.status.${column.name.value}.text`) }} · {{ column.name.value }}</p>
              </Col>
              <Col>
                {{ column.children.length || 0 }}
              </Col>
              <Col>
                <Button @click="openAddPlayerModel(column)">
                  <Icon type="md-add"></Icon>
                </Button>
              </Col>
            </Row>
            <Container
                :drop-placeholder="{
                  animationDuration: '150',
                  showOnTop: false
                }"
                :get-child-payload="getCardPayload(column.id)"
                drag-class="card-ghost"
                drag-handle-selector=".card-drag-handle"
                drop-class="card-ghost-drop"
                group-name="col"
                @drop="(e) => onCardDrop(column.id, e)">
              <Draggable v-for="(card,card_index) in column.children" :key="card_index">
                <keep-alive>
                  <Row :gutter="4" align="middle" type="flex">
                    <Col flex="1">
                      <Card :padding="10" class="card card-drag-handle" dis-hover>
                        <Row :gutter="4" align="middle" type="flex">
                          <Col>
                            <Avatar :src="card.data.avatarLink" size="30"
                                    v-if="card.data && card.data.avatarLink"></Avatar>
                          </Col>
                          <Col flex="1">
                            <a herf="javascript:void(0)" @click="openDetail(card.data, column, 2)"
                               v-if="card.data && card.data.originName">
                              <b class="text-distinguishing-letter"><code>{{ card.data.originName || 'N/A' }}</code></b>
                            </a>
                          </Col>
                          <Col>
                            <cheater-status-view :status="editPlayerModal.data.status"
                                                 v-if="editPlayerModal.data && editPlayerModal.data.status"/>
                            <template v-if="card.data && card.data.games">
                              <Poptip v-for="(game,game_index) in card.data.games"
                                      :key="game_index"
                                      transfer trigger="hover">
                                <Tag :alt="$t('detail.info.reportedGames')" type="border">
                                  <img :src="require('/src/assets/images/games/' + game + '/logo.png')" height="12"/>
                                </Tag>
                                <div slot="content">{{ $t(`basic.games.${game}`) }}</div>
                              </Poptip>
                            </template>

                          </Col>
                          <Col>
                            <Button @click="openDetail(card.data, column, 1)">
                              <Icon type="md-open"></Icon>
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </keep-alive>
              </Draggable>
            </Container>
          </div>
        </Draggable>
      </Container>
    </div>

    <Spin v-show="workflowLoading" fix size="large">
      <Icon class="spin-icon-load" size="50" type="ios-loading"></Icon>
    </Spin>

    <!-- 添加 S -->
    <Modal v-model="addPlayerModal.show">
      <Row slot="header">
        <b>导入</b>
        <template v-if="$store.state.$desktop.workflow.autoUpdatePlayerList">
          ({{ $store.state.$desktop.workflow.autoUpdatePlayerList.total || 0 }})
        </template>
        <Icon v-if="$store.state.$desktop.workflow.autoUpdatePlayerLoading" class="spin-icon-load"
              type="ios-loading"></Icon>
      </Row>
      <Input v-model="addPlayerModal.searchValue" clearable maxlength="20" placeholder="搜索玩家"></Input>
      <List border style="overflow: auto; max-height: 400px; margin-top: 10px"
            v-if="$store.state.$desktop.workflow.autoUpdatePlayerList">
        <ListItem v-for="(i, index) in $store.state.$desktop.workflow.autoUpdatePlayerList.result"
                  v-show="i.originName.indexOf(addPlayerModal.searchValue) >= 0 && workflowPersonaIdAdded.indexOf(i.originPersonaId) < 0"
                  :key="index">
          <Row :gutter="10" type="flex" align="middle" style="width: 100%">
            <Col>
              <Checkbox size="large" v-model="i.select"></Checkbox>
            </Col>
            <Col flex="1">
              <div class="ivu-list-item-meta">
                <div class="ivu-list-item-meta-avatar">
                  <Avatar :src="i.avatarLink" size="50"></Avatar>
                </div>
                <div class="ivu-list-item-meta-content">
                  <div class="ivu-list-item-meta-title">
                    <Row :gutter="5">
                      <Col flex="1">
                        <b class="text-distinguishing-letter"><code>{{ i.originName }}</code></b>
                      </Col>
                      <Col>
                        <Tag type="border">{{ $t('basic.games.' + i.games) }}</Tag>
                      </Col>
                    </Row>
                  </div>
                  <div class="ivu-list-item-meta-description">
                    <Row :gutter="5" type="flex" align="middle">
                      <Col>
                        <TimeView :time="i.updateTime">
                          {{ i.updateTime }}
                        </TimeView>
                      </Col>
                      <!--                    <Divider type="vertical"></Divider>-->
                      <Col>
                        <!--                      <TimeView :time="i.createTime">-->
                        <!--                        {{ i.createTime }}-->
                        <!--                      </TimeView>-->
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </ListItem>
      </List>
      <div slot="footer">
        <Row :gutter="30" align="middle" type="flex">
          <Col flex="1">
            <Alert show-icon type="warning">
              当前一共
              <template v-if="$store.state.$desktop.workflow.autoUpdatePlayerList">
                {{ $store.state.$desktop.workflow.autoUpdatePlayerList.total || 0 }}
              </template>
              待处理数据，已添加
              <template v-if="workflowPersonaIdAdded">
                {{ workflowPersonaIdAdded.length }}
              </template>
              条到工作流中
            </Alert>
          </Col>
          <Col>
            <Button @click="onAddPlayer">
              {{ $t('basic.button.submit') }}
            </Button>
          </Col>
        </Row>
      </div>
    </Modal>
    <!-- 添加 E -->

    <!-- 编辑 S -->
    <Modal v-model="editPlayerModal.show" class-name="2" transfer width="90%">
      <Row slot="header" :gutter="10" type="flex" align="middle">
        <Col>
          <b>详情</b>
        </Col>
        <Divider type="vertical"></Divider>
        <Col>
          <Row :gutter="5" type="flex" align="middle">
            <Col>
              <Avatar :src="editPlayerModal.data.avatarLink" size="22"></Avatar>
            </Col>
            <Col>
              <HtmlLink :href="`/player/${editPlayerModal.data.originPersonaId}`"
                        :text="editPlayerModal.data.originName"></HtmlLink>
            </Col>
          </Row>
        </Col>
      </Row>

      <div slot="default">
        <Row :gutter="20">
          <Col span="16">
            <JudgementActionView :cheater="editPlayerModal.data"></JudgementActionView>

            <template v-if="$route.name === 'workflow'">
              <br>
              <TimelineView :id="editPlayerModal.data.originPersonaId"
                            :isDisabledUpdateName="true"
                            :isDisabledReply="true"
                            ref="timeline_workflow"/>
            </template>
          </Col>

          <Col span="8">
            <SharePlayerCell type="card" :personaId="editPlayerModal.data.originPersonaId"></SharePlayerCell>
            <br>

            <Form labelPosition="top">
              <Row>
                <Col span="12">
                  <FormItem label="卡片创建时间">
                    <TimeView :time="editPlayerModal.data.createTime">
                      {{ editPlayerModal.data.createTime || '' }}
                    </TimeView>
                  </FormItem>
                </Col>
                <Col span="12">
                  <FormItem label="卡片更新时间">
                    <TimeView :time="editPlayerModal.data.updateTime">
                      {{ editPlayerModal.data.updateTime || '' }}
                    </TimeView>
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <div
                v-if="workflowMeta.data && workflowMeta.data[editPlayerModal.data.id] && workflowMeta.data[editPlayerModal.data.id]">
              <Form labelPosition="top">
                <Row :gutter="30">
                  <Col span="24">
                    <FormItem label="定时任务">
                      <template
                          v-if="workflowMeta.data[editPlayerModal.data.id].take && workflowMeta.data[editPlayerModal.data.id].take.length > 0">
                        <Row v-for="(take, take_index) in workflowMeta.data[editPlayerModal.data.id].take"
                             :key="take_index"
                             :gutter="10">
                          <Col flex="1">
                            <Select v-model="take.timer" :disabled="true">
                              <Option v-for="(timer_value, timer_value_index) in workflowMeta.takes.timer"
                                      :key="timer_value_index"
                                      :value="timer_value">
                                {{ timer_value }}天
                              </Option>
                            </Select>
                          </Col>
                          <Col flex="1">
                            <Select v-if="take.action" v-model="take.action" :disabled="true">
                              <Option v-for="(action_value, action_value_index) in workflowMeta.takes.action"
                                      :key="action_value_index"
                                      :value="action_value">
                                {{ action_value }}
                              </Option>
                            </Select>
                          </Col>
                          <Col>
                            <Button @click="onDeleteMetaTake(take_index)">
                              <Icon type="md-trash"/>
                            </Button>
                          </Col>
                        </Row>
                      </template>
                      <template v-else>
                        <Card dis-hover :padding="5">
                          <Empty :not-hint="false"></Empty>
                        </Card>
                      </template>
                      <br>
                      <Row :gutter="30">
                        <Col flex="1">
                          <Select v-model="workflowMeta.value.timer">
                            <Option v-for="(timer, timer_index) in workflowMeta.takes.timer"
                                    :key="timer_index"
                                    :value="timer">
                              {{ timer }}天
                            </Option>
                          </Select>
                        </Col>
                        <Col flex="1">
                          <Select v-model="workflowMeta.value.action">
                            <Option v-for="(action, action_index) in workflowMeta.takes.action"
                                    :key="action_index"
                                    :value="action">
                              {{ action }}
                            </Option>
                          </Select>
                        </Col>
                        <Col>
                          <Button @click="onCreateMetaTake">创建任务</Button>
                        </Col>
                      </Row>
                    </FormItem>
                  </Col>
                  <Col span="24">
                    <FormItem label="备注">
                      <Input v-model="workflowMeta.data[editPlayerModal.data.id].remark"
                             :rows="5" placeholder="案件备注，仅自己可见"
                             type="textarea"/>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>
      </div>

      <div slot="footer">
        <Row :gutter="10">
          <Col>
            <ButtonGroup>
              <Button @click="onDeletePlayer(editPlayerModal.column,editPlayerModal.data.originPersonaId, 2)">
                <Icon type="md-cube"/>
                归档
              </Button>
              <Button type="error" ghost
                      @click="onDeletePlayer(editPlayerModal.column,editPlayerModal.data.originPersonaId, 1)">
                <Icon type="md-trash"/>
                删除
              </Button>
            </ButtonGroup>
          </Col>
          <Col>
            <router-link v-if="editPlayerModal.data.originPersonaId"
                         :to="{name: 'cheater_share', params: {ouid: editPlayerModal.data.originPersonaId}}"
                         target="_blank">
              <Button>
                <Icon type="md-open"></Icon>
                {{ $t('share.title') }}
              </Button>
            </router-link>
          </Col>
          <Col flex="1">
            <Button type="primary" @click="onEditPlayer">
              {{ $t('basic.button.save') }}
            </Button>
          </Col>
        </Row>
      </div>
    </Modal>
    <!-- 编辑 E -->

    <!-- 归档数据 S -->
    <Modal v-model="archivedModal.show">

    </Modal>
  </div>
</template>

<style lang="less">
@import "@/assets/css/icon";

.workflow-box {
  position: relative;
  overflow: auto;
  flex: 1;
  min-width: 0;
  min-height: 40vh;

  .workflow-col {
    margin: 10px 10px;
    min-width: 350px;

    .ivu-input-small {
      padding: 0 !important;
    }

    .card-column-header {
      height: 60px;
      margin-bottom: 5px;

      p {
        font-size: 12px;
        opacity: .4;
      }
    }

    .handle {
      font-size: 20px;
    }

    .card {
      transition: all .25s;
      margin: 0 0 3px 0 !important;
    }
  }
}
</style>
