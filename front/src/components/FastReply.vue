<template>
  <div>
    <Row :gutter="20" style="padding: 5px 15px">
      <Col flex="1">
        <CheckboxGroup v-model="fastReply.selected">
          <Checkbox :label="i.content" v-for="(i, index) in fastReply.content" :key="index">
            <template v-if="i.template">
              <Card dis-hover :padding="0"><HtmlWidget :html="i.content"></HtmlWidget></Card>
            </template>
            <template v-else>
              <Card dis-hover :padding="0"><HtmlWidget :html="i.content"></HtmlWidget></Card>
            </template>
          </Checkbox>
        </CheckboxGroup>
      </Col>
      <Col>
        <a href="javascript:void(0)" @click="fastReply.mode = true">
          <Icon type="md-settings" size="18"/>
        </a>
        <Drawer :closable="fastReply.mode" v-model="fastReply.mode" width="40%">
          <Row slot="header" :gutter="20" type="flex" justify="center">
            <Col flex="1">
              Fast Reply
            </Col>
            <Col>
              <Button type="primary" @click="onSwitchAddModal" :disabled="fastReply.content.length > fastReply.countMax - 1">
                <Icon type="md-add"/>
                ({{ fastReply.countMax - fastReply.content.length }}/{{ fastReply.countMax }})
              </Button>
            </Col>
          </Row>

          <div v-for="(i, index) in fastReply.content" :key="index">
            <div v-if="i.template">
              <Row>
                <Col flex="1"></Col>
                <Col>
                  <Dropdown trigger="click">
                    <Icon type="ios-more"/>
                    <DropdownMenu slot="list">
                      <DropdownItem @click.native="onSwitchTemporaryEditor();onPassTemporaryEditorData(i)">Edit</DropdownItem>
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

            <div v-if="!i.template">
              <Row>
                <Col flex="1">
                  <b>{{ i.text }}</b>
                  <template v-if="i.language">
                    [{{ i.language }}]
                  </template>
                </Col>
                <Col>
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
                    <DropdownMenu slot="list">
                      <DropdownItem @click.native="onSwitchTemporaryEditor();onPassTemporaryEditorData(i)">Edit</DropdownItem>
                      <DropdownItem @click.native="fastReplyDel(i)">Dele</DropdownItem>
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

        </Drawer>
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
            <Button type="primary" @click="editTemporaryEditorData">
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

import HtmlWidget from "./HtmlWidget";
import Textarea from "@/components/Textarea";

export default {
  name: "FastReply",
  created() {
    this.loadFastReplyData();
  },
  data() {
    return {
      fastReply: {
        countMax: 10,
        content: [{
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
        add: {
          show: false,
          text: '',
          content: '',
        },
        temporaryEditor: {
          show: false,
          template: false,
          text: '',
          content: '',
        },
        mode: false,
        selected: [],
      },
    }
  },
  components: {HtmlWidget, Textarea},
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
      this.fastReply.temporaryEditor.show = !this.fastReply.temporaryEditor.show;
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
            this.fastReply.temporaryEditor.text = item.text;
            this.fastReply.temporaryEditor.content = item.content;

            // TextArea非标准标签，需要主动调用内部方法更新
            this.$refs.fastReplyEditTextarea.updateContent(this.fastReply.temporaryEditor.content);
          }
        }
      }
    },
    /**
     * 写入待编辑数据
     * @param data
     */
    editTemporaryEditorData() {
      let temporaryEditorData = this.fastReply.temporaryEditor;

      for (let index = 0; index < this.fastReply.content.length; index++) {
        var item = this.fastReply.content[index];
        if (item.text === temporaryEditorData.text) {
          this.fastReply.content[index].text = temporaryEditorData.text;
          this.fastReply.content[index].content = temporaryEditorData.content;
          this.fastReply.content[index].updateTime = new Date().getTime();
          this.fastReply.content[index].language = this.$i18n.locale;
        }
      }

      this.onSwitchTemporaryEditor();
      this.updataFastReply();
    },
    /**
     * 还原数据
     */
    onInitialData() {
      this.fastReply.add = {show: false, text: '', content: ''};
      this.fastReply.temporaryEditor = {show: false, text: '', content: ''};
    },
    /**
     * 载入管理快速回复模板数据
     */
    loadFastReplyData() {
      const replyData = storage.get('customReply');

      if (replyData.code == -1) return;

      this.fastReply.content = this.fastReply.content.concat(replyData.data.value);
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

      this.updataFastReply();
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
      if (
          this.fastReply.content.filter(i => i.text === tmpTitle).length >= 1
      ) {
        this.$Message.warning(this.$i18n.t('detail.messages.fillEverything'));
        return;
      }

      this.fastReply.content.push({
        template: false,
        creationTime: new Date().getTime(),
        updateTime: 0,
        language: this.$i18n.locale,
        text: tmpTitle,
        content: tmpContent
      });

      this.onInitialData();
      this.updataFastReply();
    },
    /**
     * 写入持久储存
     */
    updataFastReply() {
      // 仅保留用户定义数据
      storage.set('customReply', this.fastReply.content.filter(l => !l.template));
    }
  }
}
</script>

<style lang="less" scoped>

</style>
