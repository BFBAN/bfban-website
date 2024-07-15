<!--
- 判决模板
- 储存管理员模板+判决类型+内容..
-->

<script setup>
import {storage, util} from "@/assets/js";
import uuid from "uuid";

import EmptyView from "@/components/Empty.vue"
import TimeView from "@/components/TimeView.vue"

export default {
  props: {
    containerRefs: Object,
    fromData: Object,
  },
  created() {
    this.readLocal();
  },
  data() {
    return {
      util,

      list: [],
      modal: {
        open: false,
        title: '',
        data: {},
      }
    }
  },
  components: {EmptyView, TimeView},
  methods: {
    openModal(i) {
      this.modal.data = i;
      this.modal.open = true;
    },
    /**
     * 写入持久储存
     */
    updateWriteLocalFastReply() {
      storage.local.set('user.customJudgeAction', this.list);
    },
    /**
     * 读取持久存储
     */
    readLocal() {
      let data = storage.local.get('user.customJudgeAction');
      if (data.code === 0)
        this.list = data.data.value;
    },
    /**
     * 更新外部值
     */
    onSelectTemplate(i) {
      this.fromData.status = i.status;
      this.fromData.checkbox = i.checkbox;
      this.fromData.suggestion = i.suggestion;

      if (this.containerRefs.judgementTextarea)
        this.containerRefs.judgementTextarea.updateContent(i.suggestion);
    },

    /**
     * 创建模板
     */
    createTemplate() {
      if (!this.modal.title || !this.modal.data)
        return;

      this.list.push(Object.assign(this.fromData, {
        __id: uuid.v4(),
        __title: this.modal.title,
        __creationTime: new Date(),
      }));

      this.modal.title = "";
      this.updateWriteLocalFastReply();
    },
    /**
     * 删除模板
     */
    onDeleteTemplate(id) {
      let index = this.list.findIndex((i) => i.__id !== id);
      this.modal.open = false;
      this.list.slice(index, 0, 1);
    }
  }
}
</script>

<template>
  <div>
    <ButtonGroup>
      <Poptip ref="filesPoptip" placement="bottom-start" trigger="click" width="400" :padding="0">
        <Button size="large">JudgeAction Template</Button>
        <template slot="content">
          <Row :gutter="10" style="padding: 10px">
            <Col flex="1">
              <Input v-model="modal.title" placeholder="Title"></Input>
            </Col>
            <Col>
              <Button @click="createTemplate">
                <Icon type="md-add"/>
              </Button>
            </Col>
          </Row>
          <ul class="ivu-dropdown-menu list" v-if="list.length > 0">
            <Row class="ivu-dropdown-item item" v-for="(i, index) in list" :key="index" :gutter="10">
              <Col flex="1">
                <b>{{ i.__title || 'N/A' }}</b>
                <p class="description">
                  <TimeView :time="i.__creationTime">{{ i.__creationTime }}</TimeView>
                </p>
              </Col>
              <Col>
                <Button @click="onSelectTemplate(i)">Use</Button>
              </Col>
              <Col>
                <Button @click="openModal(i)">
                  <Icon type="md-more"/>
                </Button>
              </Col>
            </Row>
          </ul>
          <EmptyView class="judgeActionTemplate-empty" align="center" :notHint="false" v-else></EmptyView>
        </template>
      </Poptip>
    </ButtonGroup>

    <!-- Modal S -->
    <Modal v-model="modal.open">
      <div slot="default" v-if="modal.data">
        <Input v-model="modal.data.__title"/>
        <p>id: {{ modal.data.__id }}</p>
      </div>

      <Row slot:footer>
        <Button @click="onDeleteTemplate(modal.data.__id)">
          <Icon type="md-view-design"/>
        </Button>
        <Button>{{ $t('basic.button.save') }}</Button>
      </Row>
    </Modal>
    <!-- Modal E -->
  </div>
</template>

<style scoped lang="less">
.judgeActionTemplateView {
  .list {
    border-top: 1px solid rgba(0, 0, 0, .03137254901960784);
    max-height: 400px;
    overflow-y: auto;
  }

  .list .description {
    opacity: .5;
    font-size: 12px;
  }
}

.judgeActionTemplate-empty {
  margin: 20px;
  text-align: center;
}
</style>
