<script>
export default {
  props: {
    isDelete: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      form: {
        load: true,
        data: {
          url: "",
          text: ""
        },
        rules: {
          text: [
            {trigger: 'change'}
          ],
          url: [
            {trigger: 'change'}
          ],
        },
      },

      inputLinkPlane: false,
    }
  },
  methods: {
    /**
     * 最后确认
     */
    onFinish() {
      const that = this;
      this.$refs.inputLinkForm.validate(async (valid) => {
        if (!valid) return;

        const url = that.form.data.url,
            text = that.form.data.text,
            type = that.type;

        that.$emit('finish', url, text, type);
        that.onPanelChange(null);
      });
    },
    /**
     * 重置表单
     */
    onReset() {
      this.form.data.url = "";
      this.form.data.text = "";
    },
    /**
     * 删除
     */
    onDelete() {
      this.$emit('delete');
      this.onReset();
    },
    /**
     * 面板改变通知
     */
    onPanelChange(url, text, type) {
      this.inputLinkPlane = !this.inputLinkPlane;
      this.form.type = type;
      this.onReset();
      if (text) {
        this.form.data.text = text || url;
      }
      if (url) {
        this.form.data.url = url;
      }
    }
  }
}
</script>

<template>
  <div>
    <Modal v-model="inputLinkPlane" :loading="form.load">
      <Form labelPosition="left" ref="inputLinkForm" v-model="form.data" :rules="form.rules">
        <div>
          <Icon type="md-link" size="18"/>
        </div>
        <div class="see-mode">
          <FormItem prop="text" label="Text" class="input">
            <Input v-model="form.data.text" size="large" placeholder="link content" clearable></Input>
          </FormItem>
          <FormItem prop="src" label="Href" class="input">
            <Input v-model="form.data.url" size="large" placeholder="http(s)://" clearable></Input>
          </FormItem>
        </div>
      </Form>
      <Row slot="footer">
        <Col>
          <Button type="error" ghost @click="onDelete" v-if="isDelete">
            <Icon type="md-trash"></Icon>
          </Button>
        </Col>
        <Col flex="1"></Col>
        <Col>
          <Button @click="onFinish">
            {{ $t(`basic.button.${form.type || 'commit' || 'insert'}`) }}
          </Button>
        </Col>
      </Row>
    </Modal>
  </div>
</template>

<style scoped lang="less">
.see-mode {
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.05);
  margin: 10px -16px -16px -16px;
  padding: 10px 20px;

  .input {
    width: 100% !important;
  }
}
</style>
