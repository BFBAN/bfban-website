<template>
  <div>
    <Row :gutter="20" style="padding: 5px 15px">
      <Col flex="1">
        <CheckboxGroup v-model="fastReply.selected">
          <Checkbox :label="i.content" v-for="(i, index) in fastReply.content" :key="index">
            <template v-if="i.template">
              <Card dis-hover :padding="0">
                <HtmlWidget :html="i.content"></HtmlWidget>
              </Card>
            </template>
            <template v-else>
              <Card dis-hover :padding="0">
                <HtmlWidget :html="i.content"></HtmlWidget>
              </Card>
            </template>
          </Checkbox>
        </CheckboxGroup>
      </Col>

      <Col>
        <a href="javascript:void(0)" @click="fastReply.mode = true">
          <Icon type="md-settings" size="18"/>
        </a>
        <Modal v-model="fastReply.mode" :closable="false">
          <Row slot="header" :gutter="20" type="flex" align="middle">
            <Col>
              <b>Fast Reply</b>
            </Col>
            <Col flex="1">
              <Input v-model="fastReply.searchValue" icon="md-search" style="width: 100%"></Input>
            </Col>
            <Col>
              <Button type="primary" @click="onSwitchAddModal"
                      :disabled="fastReply.content.length > fastReply.countMax - 1">
                <Icon type="md-add"/>
                ({{ fastReply.countMax - fastReply.content.length }}/{{ fastReply.countMax }})
              </Button>
            </Col>
          </Row>

          <div v-for="(i, index) in fastReply.content" :key="index">
            <div v-if="i.template && hasIndexOfSearch(i)">
              <FormItem>
                <Card dis-hover :padding="0">
                  <HtmlWidget :html="i.content"></HtmlWidget>
                </Card>
              </FormItem>
            </div>

            <div v-if="!i.template && hasIndexOfSearch(i)">
              <Row>
                <Col flex="1">
                  <b>{{ i.text }}</b>

                </Col>
                <Col>
                  <template v-if="languages && languages.length > 0 && i.language">
                    {{ languages && languages.findLast(j => j.name === i.language).label || i.language }}
                    <Divider type="vertical"></Divider>
                  </template>
                  <template v-if="i.updateTime === 0">
                    <Time :time="i.creationTime"></Time>
                  </template>
                  <template v-else>
                    {{ $t('list.colums.updateTime') }}:
                    <Time :time="i.updateTime"></Time>
                  </template>
                  <Divider type="vertical"></Divider>
                  <Dropdown trigger="click">
                    <Icon type="ios-more"/>
                    <DropdownMenu slot="list" :disabled="false">
                      <DropdownItem @click.native="onSwitchTemporaryEditor();onPassTemporaryEditorData(i)">
                        Edit
                      </DropdownItem>
                      <DropdownItem @click.native="fastReplyDel(i)">Delete</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </Col>
              </Row>
              <FormItem>
                <Card dis-hover :padding="0">
                  <HtmlWidget :html="i.content"></HtmlWidget>
                </Card>
              </FormItem>
            </div>
          </div>
          <Card dis-hover v-if="fastReply.content.length <= 0">
            <Empty :not-hint="false"></Empty>
          </Card>
        </Modal>
      </Col>
    </Row>

    <!-- 添加窗口 S -->
    <Modal
        v-model="fastReply.add.show">
      <Form>
        <FormItem>
          <Input v-model="fastReply.add.text" placeholder="Template Title" maxlength="100"></Input>
        </FormItem>
        <FormItem>
          <Card dis-hover :padding="0">
            <Textarea v-model="fastReply.add.content"
                      ref="fastReplyAddTextarea"
                      :height="'250px'"
                      :maxlength="500"
                      :show-maxlength-label="true"
                      placeholder="Template Content"></Textarea>
          </Card>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button long type="primary" @click="fastReplyAdd">
          <Icon type="md-add"/>
          {{ $t('basic.button.commit') }}
          ({{ 10 - fastReply.content.length }}/10)
        </Button>
      </div>
    </Modal>
    <!-- 添加窗口 E -->

    <!-- 待编辑窗口 S -->
    <Modal closable v-model="fastReply.temporaryEditor.show">
      <Form>
        <FormItem>
          <Input v-model="fastReply.temporaryEditor.text"
                 v-if="!fastReply.temporaryEditor.template"
                 placeholder="Template Title"
                 maxlength="100"></Input>
          <Input v-model="fastReply.temporaryEditor.text"
                 v-else
                 disabled></Input>
        </FormItem>
        <FormItem>
          <Card dis-hover :padding="0">
            <Textarea v-model="fastReply.temporaryEditor.content"
                      ref="fastReplyEditTextarea"
                      :height="'250px'"
                      placeholder="Template Content"></Textarea>
          </Card>
        </FormItem>
      </Form>
      <div slot="footer">
        <Row :gutter="10">
          <Col>
            <Button @click="onSwitchTemporaryEditor">
              {{ $t('basic.button.cancel') }}
            </Button>
          </Col>
          <Col flex="1">
            <Button type="primary" :disabled="fastReply.temporaryEditor.template" @click="editTemporaryEditorData">
              {{ $t('basic.button.commit') }}
            </Button>
          </Col>
        </Row>
      </div>
    </Modal>
    <!-- 待编辑窗口 E -->
  </div>
</template>

<script>
import {storage} from "@/assets/js";

import languages from "/public/config/languages.json";

import HtmlWidget from "./HtmlWidget";
import Textarea from "@/components/textarea/index.vue";
import uuid from "uuid";
import Empty from "@/components/Empty.vue";

export default {
  name: "FastReply",
  data() {
    return {
      languages: languages.child,

      fastReply: {
        countMax: 10,
        searchValue: '',
        templateContent: [{
          text: 'stats',
          template: true,
          content: this.$i18n.t('detail.info.fastReplies.stats')
        }, {
          text: 'evidencePic',
          template: true,
          content: this.$i18n.t('detail.info.fastReplies.evidencePic')
        }, {
          text: 'evidenceVid',
          template: true,
          content: this.$i18n.t('detail.info.fastReplies.evidenceVid')
        }],
        content: [],
        add: {
          show: false,
          text: '',
          content: '',
        },
        temporaryEditor: {
          show: false,
          template: false,
          indexAt: -1,
          text: '',
          content: '',
        },
        mode: false,
        selected: [],
      },
    }
  },
  components: {Empty, HtmlWidget, Textarea},
  watch: {
    'fastReply.selected': function () {
      this.$emit("change", this.fastReply.selected.map(i => i));
    },
    '$i18n.locale': function () {
      this.fastReply.content = [{
        text: 'stats',
        template: true,
        content: this.$i18n.t('detail.info.fastReplies.stats')
      }, {
        text: 'evidencePic',
        template: true,
        content: this.$i18n.t('detail.info.fastReplies.evidencePic')
      }, {
        text: 'evidenceVid',
        template: true,
        content: this.$i18n.t('detail.info.fastReplies.evidenceVid')
      }];
      this.loadFastReplyData();
    }
  },
  created() {
    this.loadFastReplyData();
  },
  methods: {
    /**
     * 添加窗口开关
     */
    onSwitchAddModal() {
      if (this.fastReply.content.length > this.fastReply.countMax - 1) return

      this.fastReply.add.show = !this.fastReply.add.show;
    },
    /**
     * 待编辑窗口开关
     */
    onSwitchTemporaryEditor() {
      const {show} = this.fastReply.temporaryEditor;
      this.fastReply.temporaryEditor.show = !show;
    },

    /**
     * 传递待编辑模板数据
     * @param data
     */
    onPassTemporaryEditorData(data) {
      const name = data.text;
      const template = data.template;
      this.fastReply.temporaryEditor.template = template;

      if (data) {
        for (let index = 0; index < this.fastReply.content.length; index++) {
          let item = this.fastReply.content[index];

          if (item.text === name) {
            this.fastReply.temporaryEditor.indexAt = index;
            this.fastReply.temporaryEditor.text = item.text;
            this.fastReply.temporaryEditor.content = item.content;

            // TextArea非标准标签，需要主动调用内部方法更新
            if (this.$refs.fastReplyEditTextarea)
              this.$refs.fastReplyEditTextarea.updateContent(item.content);
          }
        }
      }
    },
    /**
     * 写入待编辑数据
     * @param data
     */
    editTemporaryEditorData() {
      const that = this;
      let temporaryEditorData = this.fastReply.temporaryEditor;
      const indexAt = temporaryEditorData.indexAt;

      if (indexAt <= 0) return;

      this.fastReply.content[indexAt].text = temporaryEditorData.text;
      this.fastReply.content[indexAt].content = temporaryEditorData.content;
      this.fastReply.content[indexAt].updateTime = new Date().getTime();
      this.fastReply.content[indexAt].language = this.$i18n.locale;

      this.onSwitchTemporaryEditor();
      this.updateWriteLocalFastReply();

      this.fastReply.content = [];
      setTimeout(function () {
        that.loadFastReplyData()
      }, 150)
    },
    /**
     * 还原数据
     */
    onInitialData() {
      this.fastReply.add = {show: false, text: '', content: ''};
      this.fastReply.temporaryEditor = {show: false, text: '', content: ''};

      // Edit
      if (this.$refs.fastReplyEditTextarea)
        this.$refs.fastReplyEditTextarea.updateContent('');

      // Add
      if (this.$refs.fastReplyAddTextarea)
        this.$refs.fastReplyAddTextarea.updateContent('');
    },
    /**
     * 载入管理快速回复模板数据
     */
    loadFastReplyData() {
      const replyData = storage.local.get('customReply');

      if (replyData.code == -1) return;
      this.fastReply.content = this.fastReply.templateContent.concat(replyData.data.value);
      this.fastReply.content.map(i => {
        if (!i.template && !i.id)
          i.id = uuid.v4();
      })
    },
    /**
     * 删除快速回复模板
     * @param data 唯一
     */
    fastReplyDel(data) {
      const name = data.text;

      for (let index = 0; index < this.fastReply.content.length; index++) {
        let item = this.fastReply.content[index];
        if (name === item.text) this.fastReply.content.splice(index, 1);
      }

      this.updateWriteLocalFastReply();
    },
    /**
     * 添加快速回复模板
     */
    fastReplyAdd() {
      const tmpTitle = this.fastReply.add.text;
      const tmpContent = this.fastReply.add.content;

      if (!tmpContent || !tmpTitle) {
        this.$Message.warning(this.$i18n.t('detail.messages.fillEverything'));
        return;
      }

      // 校验标题重复
      if (this.fastReply.content.filter(i => i.text === tmpTitle).length >= 1) {
        this.$Message.warning(this.$i18n.t('detail.messages.fillEverything'));
        return;
      }

      this.fastReply.content.push({
        id: uuid.v4(),
        template: false,
        creationTime: new Date().getTime(),
        updateTime: 0,
        language: this.$i18n.locale,
        text: tmpTitle,
        content: tmpContent
      });

      this.onInitialData();
      this.updateWriteLocalFastReply();
    },
    /**
     * 写入持久储存
     */
    updateWriteLocalFastReply() {
      // 仅保留用户定义数据
      storage.local.set('customReply', this.fastReply.content.filter(l => !l.template));
    },
    hasIndexOfSearch(i) {
      if (this.fastReply.searchValue.length <= 0) return true;
      return i.text.indexOf(this.fastReply.searchValue) >= 0 || i.content.indexOf(this.fastReply.searchValue) >= 0
    }
  },
}
</script>

<style lang="less" scoped>

</style>
