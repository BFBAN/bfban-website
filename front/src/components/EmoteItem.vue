<script>
import emojis from "@/../public/config/emoji.json"

export default {
  props: {
    id: {
      type: [String],
      default: ''
    },
    size: {
      type: [String, Number],
      default: '24'
    },
    isSpan: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      emojiItemData: null
    }
  },
  created() {
    this.getQuterEmojiItem(this.id);
  },
  watch: {
    id: {
      handler: val => {
        this.getQuterEmojiItem(val)
      }
    }
  },
  methods: {
    /**
     * 查询对应表情id
     * {type}|{id}
     * @param idRaw
     * @returns {{}}
     */
    getQuterEmojiItem(idRaw) {
      let type = idRaw.split('|')[0],
          id = idRaw.split('|')[1],
          result = {};

      const typeList = this.emojis.child.findLast(i => i.name === type);
      if (typeList && typeList.child)
        for (let index = 0; index <= typeList.child.length; index++) {
          let i = typeList.child[index];
          if (i.name === id) {
            result = {
              imageUrl: typeList.imageUrl,
              ...i,
            };
            break;
          }
        }
      this.emojiItemData = result;
      return result;
    }
  },
  computed: {
    emojis: () => emojis
  }
}
</script>

<template>
  <span v-if="emojiItemData">
    <template v-if="emojiItemData.config.type == 'gif'">
        <img class="emote" :alt="emojiItemData.name"
             :src="emojiItemData.imageUrl"
             :class="[
                 isSpan ? 'emote-none-padding': ''
              ]"
             :style="`width: ${size}px;height: ${size}px`"
             v-if="emojiItemData"/>
    </template>
    <template v-if="emojiItemData.config.type == 'spriteDiagram'">
        <span class="emote"
              :class="[
                 isSpan ? 'emote-none-padding': ''
              ]"
              :style="`width: ${size}px;height: ${size}px;background-image: url(${emojiItemData.imageUrl});background-size: ${emojiItemData.config.size};background-position: ${emojiItemData.config.position}`"
              v-if="emojiItemData"/>
    </template>
  </span>
</template>

<style scoped lang="less">
span.emote-none-padding,
img.emote-none-padding{
  margin: -6px 1px;
}

span.emote,
img.emote {
  display: inline-flex !important;
}
</style>
