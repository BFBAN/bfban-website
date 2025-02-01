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
          src: '',
        },
        rules: {
          src: [
            {required: true, trigger: 'change'},
            {
              validator: (rule, value, callback) => {
                try {
                  let checkLinkHref = regular.check('link', value);
                  if (checkLinkHref.code === -1) {
                    callback(new Error('error image href'));
                    return;
                  }

                  callback();
                } catch (e) {
                  callback(new Error(e));
                }
              },
              trigger: 'blur'
            },
          ],
        },
      },

      inputImagePlane: false,
    }
  },
  methods: {
    /**
     * 最后确认
     */
    onFinish() {
      const that = this;
      this.$refs.inputImageForm.validate((valid) => {
        if (!valid) return;

        const url = that.form.data.src;

        that.$emit('finish', url);
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
    },
    /**
     * 面板改变通知
     */
    onPanelToggle() {
      this.inputImagePlane = !this.inputImagePlane;
    },
    /**
     * 打开面板
     * @param src
     */
    openPanel(src) {
      this.onPanelToggle();
      this.onReset();

      if (src) {
        this.form.data.src = src;
      }
    }
  }
}
</script>

<template>
  <div>
    <Modal v-model="inputImagePlane" :loading="form.load">
      <Form labelPosition="left" ref="inputImageForm" :model="form.data" :rules="form.rules">
        <div>
          <Icon type="md-images" size="18"/>
        </div>
        <div class="see-mode">
          <FormItem label="Src" prop="src">
            <Input :value="form.data.src"
                   size="large"
                   readonly
                   placeholder="http(s)://"></Input>
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
