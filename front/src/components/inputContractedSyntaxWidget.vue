<script>
export default {
  data() {
    return {
      show: false,
      form: {
        data: {
          type: 'user',
          value: ''
        }
      },
      type: [{
        value: 'player',
      },
        {
          value: 'icon'
        },
        {
          value: 'router'
        }, {
          value: 'user'
        }, {
          value: 'privilege'
        }],
    }
  },
  methods: {
    onFinish() {
      this.$emit('finish', this.onGenerateEditorViewHtml(this.form.data.type, this.form.data.value));
      this.onPanelToggle();
    },
    /**
     * 生成缩语对应编辑器标签
     * @param target
     */
    onGenerateEditorViewHtml(type, value) {
      return {
        type,
        value,
        html: `<span data-type="contracted-syntax" data-cs-type="${type}" data-cs-value="${value}">{${type}:${value}</span>`
      }
    },
    /**
     * 面板开关
     */
    onPanelToggle() {
      this.show = !this.show;
    },
    /**
     * 打开面板
     */
    openPanel() {
      this.onPanelToggle();
    }
  }
}
</script>

<template>
  <Modal v-model="show">
    <Form labelPosition="left" ref="inputContractedSyntaxForm" :model="form.data" :rules="form.rules">
      <div>
        <Icon type="md-code" size="18"/>
      </div>
      <div class="see-mode">
        <FormItem prop="url">
          <Select v-model="form.data.type" size="large" translate>
            <Option v-for="(i, index) in type" :key="index" :value="i.value">
              {{ i.value }}
            </Option>
          </Select>
        </FormItem>
        <FormItem prop="text">
          <Input v-model="form.data.value" size="large" clearable></Input>
        </FormItem>
      </div>
    </Form>
    <Row slot="footer">
      <Col flex="1"></Col>
      <Col>
        <Button type="primary" @click="onFinish">
          {{ $t(`basic.button.${form.type || 'commit' || 'insert'}`) }}
        </Button>
      </Col>
    </Row>
  </Modal>
</template>

<style scoped lang="less">
.see-mode {
  background-color: rgba(0, 0, 0, 0.05);
  margin: 10px -16px -16px -16px;
  padding: 10px 20px;

  .input {
    width: 100% !important;
  }
}
</style>
