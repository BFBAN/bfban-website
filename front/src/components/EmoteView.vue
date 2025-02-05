<script>
import {Editor} from "@tiptap/vue-2";

import emojis from "@/../public/config/emoji.json"
import EmoteItem from "@/components/EmoteItem.vue";
import {application} from "@/assets/js";

export default new application({
  components: {EmoteItem},
  props: {
    editor: {
      type: Editor,
    }
  },
  data() {
    return {
      show: false,
      emoteTabValue: "",
      isInsertPreview: false,
      insertPreview: "",
      pos: {left: 0, top: 0}
    }
  },
  created() {
    this.emoteTabValue = this.emojis.default;
  },
  methods: {
    /**
     * 获取当前光标位于编辑器位置
     * @returns {*|null}
     */
    getCursorPosition() {
      if (this.editor) {
        const {from, to} = this.editor.state.selection;
        if (from === to) {
          return from;
        } else {
          return null;
        }
      }

      return null;
    },
    /**
     * 获取当前光标屏幕的位置
     */
    getCursorScreenCoords() {
      const cursorPosition = this.getCursorPosition();

      if (cursorPosition !== null && this.editor) {
        const domPos = this.editor.view.coordsAtPos(cursorPosition);
        this.pos = domPos;
        return;
      }

      this.pos = null
    },

    /**
     * 完成
     * @param val
     */
    onFinish(type, val) {
      this.onPanelToggle();
      this.$emit('finish', type, val)
    },

    /**
     * 面板开关
     */
    onPanelToggle() {
      this.show = !this.show;

      if (this.show === false)
        this.$emit('close');
    },
    /**
     * 打开面板
     */
    openPanel() {
      this.onPanelToggle();
      this.getCursorScreenCoords();
    },
    /**
     * 表情标题
     * @param h
     * @param i
     * @returns {*}
     */
    emoTeTabTitle(h, i) {
      return h(EmoteItem, {
        props: {
          isSpan: false,
          size: 23,
          id: i.titleEmoteName,
          isDisabledTooltip: true
        }
      });
    },

    handleMouseEnter(i, j) {
      this.isInsertPreview = true;
      this.insertPreview = `${i.name}|${j.name}`
    },
    handleMouseLeave(i, j) {
      this.isInsertPreview = false;
    }
  },
  computed: {
    emojis: () => emojis,
  }
})
</script>

<template>
  <Modal v-model="show"
         class="emote"
         class-name="emote-window-box"
         :transitionNames="['fade']"
         :width="isMobile ? '100%' : 600"
         :styles="{
           top: pos && pos.top ? `calc(${pos.top}px + 1.5rem)` : 'calc(20%)',
           left: isMobile ? 0 : pos && pos.left ? pos.left  + 'px' : 'calc(50% - 300px)',
           bottom: isMobile ? 0 : null,
           margin: 0,
           padding: 0
         }"
         :mask="true"
         :closable="true"
         @on-visible-change="(status) => !status ? $emit('close') : null"
         sticky
         transfer
         footer-hide>
    <div class="insert-preview" v-show="isInsertPreview">
      <EmoteItem :isSpan="false"
                 :size="24"
                 :id="`${insertPreview}`"
                 v-if="insertPreview && pos"></EmoteItem>
    </div>
    <div class="emote-tab">
      <Tabs v-model="emoteTabValue" size="small">
        <TabPane :label="(h) => emoTeTabTitle(h, i)" :name="i.name" v-for="(i, index) in emojis.child" :key="index">
          <div class="emote-row-box">
            <Card :padding="3" dis-hover class="emote-item"
                  @mouseenter.native="handleMouseEnter(i,j)"
                  @mouseleave.native="handleMouseLeave(i,j)"
                  v-for="(j, j_index) in i.child" :key="j_index">
              <EmoteItem :isSpan="false" :size="30" :id="`${i.name}|${j.name}`"
                         @click.native="onFinish(i.name,j)"></EmoteItem>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </div>
  </Modal>
</template>

<style scoped lang="less">
@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.emote {
  .insert-preview {
    position: absolute;
    top: -30px;
    left: 1px;
  }

  .emote-tab {
    margin: -10px -16px -16px -16px;

    .ivu-tabs-bar {
      margin-bottom: 0;
    }
  }

  .emote-row-box {
    background-color: rgba(0, 0, 0, 0.01);
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(6, 1fr);
    grid-row-gap: 10px;
    grid-column-gap: 10px;
    padding: 10px;
    margin-top: -17px;
    height: calc(100% + 17px);
    max-height: 200px;
    overflow-y: auto;

    .emote-item {
      width: 38px;
      height: 38px;
    }
  }
}

.emote-window-box {
  .ivu-modal {
    margin: 0 !important;
  }
}
</style>
