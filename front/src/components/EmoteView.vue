<script>
import {Editor} from "@tiptap/vue-2";

import emojis from "@/../public/config/emoji.json"

export default {
  components: {},
  props: {
    editor: {
      type: Editor,
    }
  },
  data() {
    return {
      show: false,
      emoteTabValue: "",
      pos: {left: 0, top: 0}
    }
  },
  created() {
    this.emoteTabValue = this.emojis.default;
  },
  methods: {
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
    getCursorScreenCoords() {
      const cursorPosition = this.getCursorPosition();

      if (cursorPosition !== null && this.editor) {
        const domPos = this.editor.view.coordsAtPos(cursorPosition);
        // console.log(domPos)
        // const rect = domPos.node.getBoundingClientRect();
        return {
          ...domPos
          // x: rect.left,
          // y: rect.top,
        };
      }

      return null;
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

      // if (this.show === false)
      //   this.$emit('close');
    },
    /**
     * 打开面板
     */
    openPanel() {
      this.onPanelToggle();
      this.pos = this.getCursorScreenCoords();
    },
  },
  computed: {
    emojis: () => emojis,
  }
}
</script>

<template>
  <Modal v-model="show"
         class="emote" class-name="emote-window-box"
         :width="600"
         :styles="{top:pos && pos.top ? `calc(${pos.top}px + 1.1rem)` : 'calc(50%)', left: pos && pos.left ? pos.left  + 'px' : 'calc(50% - 200px)', margin: 0, padding: 0}"
         :mask="false"
         :closable="false"
         sticky
         transfer
         scrollable
         footer-hide>
    <div class="title">
      <div class="title-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <circle cx="184" cy="232" r="24"/>
          <path
              d="M256.05 384c-45.42 0-83.62-29.53-95.71-69.83a8 8 0 017.82-10.17h175.69a8 8 0 017.82 10.17c-11.99 40.3-50.2 69.83-95.62 69.83z"/>
          <circle cx="328" cy="232" r="24"/>
          <circle cx="256" cy="256" r="208" fill="none" stroke="currentColor" stroke-miterlimit="10"
                  stroke-width="32"/>
        </svg>
      </div>
    </div>
    <Card dis-hover shadow :padding="0" style="margin: 0 -16px -16px -16px">
      <Tabs v-model="emoteTabValue">
        <TabPane :label="i.name" :name="i.name" v-for="(i, index) in emojis.child" :key="index">
          <div class="emote-row-box">
            <Card :padding="0" dis-hover class="emote-item" v-for="(j, j_index) in i.child" :key="j_index">
              <img :src="j.imageUrl" @click="onFinish(i.name,j)"/>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  </Modal>
</template>

<style scoped lang="less">
.emote {
  .title {
    height: 30px;
  }
  .title-icon {
    height: 18px;
    width: 18px;
  }

  .emote-row-box {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    padding: 10px;
    margin-top: -10px;

    .emote-item,
    .emote-item img {
      width: 40px;
      height: 40px;
    }
  }
}

.emote-window-box {
  .ivu-modal {
    margin: 0 !important;
  }
}
</style>
