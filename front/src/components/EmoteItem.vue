<script>
import emojis from "@/../public/config/emoji.json"

export default {
  props: {
    id: {
      type: [String],
      default: ''
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
        typeList.child.findLast(i => {
          if (i.name === id)
            result = i;
        })
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
  <img class="emote user-select-none" :alt="emojiItemData.name" :src="emojiItemData.imageUrl" v-if="emojiItemData"/>
</template>

<style scoped lang="less">
img.emote {
  display: inline-flex !important;
  width: 24px;
  height: 24px;
}
</style>
