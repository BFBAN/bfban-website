<script>
import Application from "@/assets/js/application";
import Empty from "@/components/Empty.vue"
import {regular} from "@/assets/js";

export default new Application({
  props: {
    placeholder: "",
    isReadonly: false,
    max: {
      type: Number,
      default: 3
    },
    links: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      linkList: [],
    };
  },
  components: {Empty},
  created() {
    if (this.links && typeof this.links == 'string') {
      this.links.split(',').forEach(i => {
        this.linkList.push({value: i})
      })
    }

    if (this.links && typeof this.links == 'object') {
      this.links.forEach(i => {
        this.linkList.push({value: i})
      })
    }
  },
  methods: {
    add() {
      if (this.linkList.length >= this.max) return;
      this.linkList.push({
        value: ''
      });
    },
    del(index) {
      this.linkList.splice(index, 1);
      this.upData();
    },
    onInputChange() {
      this.upData();
    },
    upData() {
      let linkList = [];
      for (let i of this.linkList) {
        let checkLink = regular.check('link', i.value);
        if (!i.value || checkLink.code != 0) continue;
        linkList.push(i.value);
      }
      this.$emit('input', linkList.toString());
    },
    /**
     * 校验地址
     */
    checkVideoLink(rule, value, callback) {
      const errorText = this.$i18n.t('report.messages.videoBadFormat');
      const val = value;

      if (!val) {
        return callback(this.$i18n.t('report.messages.videoEmpty'));
      }

      // 正则校验
      const reg = regular.check('link', val);

      if (reg.code != 0) {
        callback(new Error(this.$i18n.t(errorText)));
        return;
      }

      callback()
    },
  }
});
</script>

<template>
  <div>
    <Form>
      <Empty :notHint="true" v-if="linkList.length <= 0"></Empty>
      <FormItem v-else
                v-for="(i, index) in linkList" :key="index"
                :prop="`linkList[${index}].value`"
                :rules="{validator (rule, value, callback) { checkVideoLink(rule, linkList[index].value,callback) }, trigger: 'change'}">
        <Row :gutter="5">
          <Col flex="1">
            <Input
                style="margin-bottom: 5px"
                type="url"
                pattern="*://.*"
                v-model="i.value"
                @on-change="onInputChange"
                :clearable="!isReadonly"
                :readonly="isReadonly"
                :placeholder="placeholder"></Input>
          </Col>
          <Col v-if="!isReadonly">
            <Button @click="del(index)" type="dashed" v-voice-button v-if="linkList.length >= 0">
              <Icon type="md-trash"/>
            </Button>
          </Col>
          <Col v-else>
            <a :href="i.value" target="_new">
              <Button>
                <Icon type="md-share"/>
              </Button>
            </a>
          </Col>
        </Row>
      </FormItem>

      <Button long @click="add" :disabled="linkList.length >= max" v-if="!isReadonly">
        <Icon type="md-add"/>
        ({{ linkList.length }}/{{ max }})
      </Button>
    </Form>
  </div>
</template>

<style scoped lang="less">

</style>
