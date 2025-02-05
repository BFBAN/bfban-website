<script>
import {api, http} from "@/assets/js";
import privileges from "/public/config/privilege.json";

export default {
  data() {
    return {
      show: false,
      form: {
        data: {
          type: 'user',
          value: ''
        },
        rules: {
          type: [
            {required: true, trigger: 'change'},
          ],
          'value-player': [
            {required: true, trigger: 'change'},
            {
              type: 'string',
              validator: async (rule, value, callback) => {
                try {
                  const {value} = this.form.data;
                  const resultPlayer = await http.get(api["player"], {
                    params: {
                      dbId: value,
                      personaId: value,
                    }
                  });

                  if (resultPlayer.data.data.error === 1) {
                    callback(new Error('error router'));
                    return;
                  }

                  callback();
                } catch (e) {
                  callback(new Error(e));
                }
              },
              trigger: 'blur'
            }
          ],
          'value-icon': [
            {
              required: true, type: 'string', trigger: 'change',
            },
          ],
          'value-router': [
            {required: true, trigger: 'change'},
            {type: 'string', trigger: 'blur'}
          ],
          'value-user': [
            {
              required: true,
              validator: async (rule, value, callback) => {
                try {
                  const {value} = this.form.data;

                  const result = await http.get(api["user_info"], {
                    params: {
                      id: value,
                    }
                  });

                  if (result.data.data.error === 1 && this.privileges.filter(i => {
                    return value.includes(i.value)
                  }).length <= 0) {
                    callback(new Error('error user'));
                    return;
                  }

                  callback();
                } catch (e) {
                  callback(new Error(e));
                }
              },
              trigger: 'blur'
            }
          ],
          'value-privilege': [],
        }
      },
      inputHint: {
        'value-player': 'input persona Id (EA Persona ID',
        'value-icon': 'input icon value, md-add,md-egg ...',
        'value-router': 'input router address, /,/player,/report ...',
        'value-user': 'input user Id',
        'value-privilege': 'input privilege, dev,bot,admin,super ...',
      },
      type: [
        {value: 'player', label: 'detail.appeal.info.player', values: ''},
        {value: 'icon', values: ''},
        {value: 'router', values: ''},
        {value: 'user', label: 'profile.space.form.username', values: ''},
        {
          value: 'privilege',
          label: 'profile.space.form.privileges',
          values: privileges.child.map(i => i.value),
          model(val) {
            console.log(val, val.toString())
            // this.form.data.value = val.toString();
          }
        }
      ],
    }
  },
  methods: {
    /**
     * 确认
     */
    onFinish() {
      this.$refs.inputContractedSyntaxForm.validate((valid) => {
        let value = this.form.data.value;
        if (!valid && (this.form.data.value === undefined || this.form.data.value === ''))
          return;

        if (this.selectTypeData && typeof this.selectTypeData.values == 'object')
          value = this.form.data.value.toString()

        this.$emit('finish', this.onGenerateEditorViewHtml(this.form.data.type, value));
        this.onReset();
        this.onPanelToggle();
      })
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
     * 重置表单
     */
    onReset() {
      this.form.data.type = 'user';
      this.form.data.value = ''
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
  },
  computed: {
    privileges: () => privileges.child,
    selectTypeData() {
      return this.type.findLast(i => i.value === this.form.data.type)
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
        <FormItem label="Contracted Syntax Type" prop="url">
          <Select v-model="form.data.type" size="large" translate>
            <Option v-for="(i, index) in type" :key="index" :value="i.value">
              {{ i.label ? $t(i.label) : i.value }}
            </Option>
          </Select>
        </FormItem>
        <FormItem :prop="`value-${form.data.type}`">
          <Input v-model="form.data.value"
                 v-if="selectTypeData && typeof selectTypeData.values == 'string'"
                 size="large"
                 :placeholder="inputHint[`value-${form.data.type}`]"
                 clearable></Input>
          <Select v-model="form.data.value"
                  v-if="selectTypeData && typeof selectTypeData.values == 'object'"
                  size="large"
                  multiple
                  translate>
            <Option v-for="(i, index) in selectTypeData.values" :key="index" :value="i">
              {{ i }}
            </Option>
          </Select>
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
