<script>
export default {
  props: {
    time: [String, Number, Date],
    trigger: {
      type: String,
      default: 'click'
    }
  },
  data() {
    return {
      timeMap: null,
      primitiveValue: 'primitive',
      options: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    }
  },
  watch: {
    'time': function () {
      this.loadData()
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      if (this.time)
        this.timeMap = {
          primitive: this.onTime(this.time),
          primitiveDateString: this.toDateString(this.onTime(this.time)),
          conversionDate: new Date(this.onTime(this.time)).toLocaleDateString(),
          conversionLocalDate: this.toLocaleString(new Date(this.onTime(this.time)).getTime()),
          timeFormatName: this.getTimeFormatName(),
          localeDateString: this.toLocaleDateString(this.onTime(this.time))
        };
    },
    toLocaleString(unixTimestamp) {
      const date = new Date(unixTimestamp);
      return date.toLocaleString();
    },
    onTime(time) {
      return time.toString()
          .replaceAll('\n', ' ')
          .replaceAll('&nbsp;', ' ');
    },
    /**
     * 获取时区名称
     * @returns {string|string|*}
     */
    getTimeFormatName() {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    },
    /**
     * 获取时区当地对应时间格式
     * @param time
     * @returns {string}
     */
    toLocaleDateString(time) {
      const date = new Date(time);
      return date.toLocaleDateString(undefined, this.options);
    },
    /**
     * 获取时间格式
     * @param time
     * @returns {string}
     */
    toDateString(time) {
      const date = new Date(time);
      return date.toDateString(undefined, this.options);
    }
  }
}
</script>

<template>
  <Poptip transfer :trigger="trigger" class="time-view">
    <u class="spelling time-view time-view-slot">
      <slot></slot>
    </u>
    <Form labelPosition="top" width="100" slot="content" v-if="time" class="time-view-form">
      <FormItem :label="$t('detail.dateView.primitive')">
        <Alert show-icon type="info">{{ $t('detail.dateView.primitiveDescription') }}</Alert>
        <Select v-model="primitiveValue">
          <Option value="primitive" :label="timeMap.primitive.toString()">
            <p>primitive value</p>
            <Input :value="timeMap.primitive.toString()" readonly></Input>
          </Option>
          <Option value="primitiveDateString" :label="timeMap.primitiveDateString.toString()">
            <p>primitive date string value</p>
            <Input :value="timeMap.primitiveDateString.toString()" readonly></Input>
          </Option>
        </Select>
      </FormItem>
      <FormItem :label="$t('detail.dateView.localTimeZoneName')">
        <Tag type="border">{{ timeMap.timeFormatName }}</Tag>
      </FormItem>
      <FormItem :label="$t('detail.dateView.localeTime')">
        <Alert show-icon type="info">{{ $t('detail.dateView.localeTimeDescription') }}</Alert>
        <Input :value="timeMap.localeDateString.toString()" readonly></Input>
      </FormItem>
    </Form>
  </Poptip>
</template>

<style scoped lang="less">
.time-view-slot:hover {
  padding: 1px 6px !important;
  margin: -1px -6px;
  border-radius: 5px;
  background: #0000000a;
}

u.spelling {
  text-decoration: dashed underline;
  cursor: pointer;
}

.time-view-form {
  padding-top: 10px;
}
</style>
