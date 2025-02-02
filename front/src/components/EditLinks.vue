<template>
  <div>
    <Form>
      <Empty :notHint="false" v-if="linkList.length <= 0"></Empty>
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

<script>
import {application, regular} from "@/assets/js";

import Empty from "@/components/Empty.vue"

export default new application({
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
  watch: {},
  components: {Empty},
  created() {
    this.init();
  },
  methods: {
    /**
     * 初始链接列表
     */
    init() {
      this.linkList = [];

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
    /**
     * 增加
     */
    add() {
      if (this.linkList.length >= this.max) return;
      this.linkList.push({
        value: ''
      });
    },
    /**
     * 删除
     * @param index
     */
    del(index) {
      this.linkList.splice(index, 1);
      this.upData();
    },
    /**
     * 变动更新
     */
    onInputChange() {
      this.upData();
    },
    /**
     * 更新数据
     */
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

<style scoped lang="less">

</style>
