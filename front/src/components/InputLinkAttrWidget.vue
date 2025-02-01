<script>
import {regular} from "@/assets/js";

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
          url: '',
          text: ''
        },
        rules: {
          url: [
            {required: true, trigger: 'change'},
            {
              validator: (rule, value, callback) => {
                try {
                  let checkLinkHref = regular.check('link', value);
                  if (checkLinkHref.code === -1) {
                    callback(new Error('error link href'));
                    return;
                  }

                  callback();
                } catch (e) {
                  callback(new Error(e));
                }
              },
              trigger: 'blur'
            },
            {type: 'string', min: 1, trigger: 'blur'}
          ],
          text: [
            {required: false, max: 1000, trigger: 'change'}
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
      this.$refs.inputLinkForm.validate((valid) => {
        if (!valid) return;

        const url = that.form.data.url,
            text = that.form.data.text,
            type = that.type;

        that.$emit('finish', url, text, type);
        that.onPanelToggle();
      });
    },
    /**
     * 重置表单
     */
    onReset() {
      this.form.data.text = '';
      this.form.data.url = '';
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
    onPanelToggle() {
      this.inputLinkPlane = !this.inputLinkPlane;
    },
    /**
     * 打开面板
     * @param url
     * @param text
     * @param type
     */
    openPanel (url, text, type) {
      this.onPanelToggle();
      this.form.type = type;
      this.onReset();

      this.form.data.text = text || url;
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
      <Form labelPosition="left" ref="inputLinkForm" :model="form.data" :rules="form.rules">
        <div>
          <Icon type="md-link" size="18"/>
        </div>
        <div class="see-mode">
          <FormItem label="Text" prop="text">
            <Input v-model="form.data.text" size="large" :placeholder="form.data.url || 'link content'" clearable></Input>
          </FormItem>
          <FormItem label="Href" prop="url">
            <Input v-model="form.data.url"
                   size="large"
                   type="url"
                   pattern="*://.*"
                   placeholder="http(s)://" clearable></Input>
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

          <Button @click="onReset">
            {{ $t(`basic.button.reset`) }}
          </Button>
          <Button type="primary" @click="onFinish">
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
