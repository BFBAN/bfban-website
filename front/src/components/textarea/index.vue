<script>
import TextareaV1 from "@/components/textarea/v1"
import TextareaV2 from "@/components/textarea/v2"

export default {
  props: {
    version: {
      type: String,
      default: 'v2'
    },
    index: null,
    showMaxlengthLabel: {
      type: Boolean,
      default: false,
    },
    maxlength: {
      type: Number,
      default: 500
    },
    height: {
      type: String,
      default: '200px'
    },
    placeholder: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      default: "",
    },
    toolbar: {
      type: Array,
      default: () => ['ordered', 'bullet', 'bold', 'italic', 'underline', 'hr', 'link', 'image']
    }
  },
  data (){
    return {
      context: ''
    }
  },
  components: {TextareaV1, TextareaV2},
  methods: {
    /**
     * ->
     * 更新富文本
     * @param val
     */
    updateContent(val) {
      switch (this.version) {
        case "v1":
          this.$refs.v1.updateContent(val)
          break;
        case "v2":
          this.$refs.v2.updateContent(val)
          break;
      }
    },

    /**
     * <-
     */
    onChangeContent (val) {
      switch (this.version) {
        case "v1":
          this.$emit("input", val);
          break;
        case "v2":
          this.$emit("input", val);
          break;
      }
    }
  },
  computed: {
    editType () {
      return this.$route.query.editType || this.version;
    }
  }
}
</script>

<template>
  <div>
    <TextareaV2 ref="v2"
                :content="content"
                :disabled="disabled"
                :placeholder="placeholder"
                :height="height"
                :maxlength="maxlength"
                :showMaxlengthLabel="showMaxlengthLabel"
                :toolbar="toolbar"
                @input="onChangeContent"
                v-if="editType === 'v2'"></TextareaV2>
    <TextareaV1 ref="v1"
                :content="content"
                :disabled="disabled"
                :placeholder="placeholder"
                :height="height"
                :maxlength="maxlength"
                :showMaxlengthLabel="showMaxlengthLabel"
                :toolbar="toolbar"
                @input="onChangeContent"
                v-else-if="editType === 'v1'"></TextareaV1>
  </div>
</template>

<style scoped lang="less">

</style>
