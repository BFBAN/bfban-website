<template>
    <span class="privilege-tagbox">
      <span v-for="(p_item, p_index) in tags" :key="p_index">
        <Tag :type="tagType" :color="p_item.class" class="tag" :title="$t('basic.privilege.' + p_item.value)">
          {{ $t('basic.privilege.' + p_item.value) }}
        </Tag>
      </span>
    </span>
</template>

<script>
import privileges from "/public/config/privilege.json";

export default {
  props: {
    data: [],
    tagSize: {
      type: String,
      default: ''
    },
    tagType: {
      type: String,
      default: 'border'
    }
  },
  data () {
    return {
      privileges: privileges.child,
      tags: []
    }
  },
  created () {
    this.update();
  },
  watch: {
    'data': function (val, old) {
      this.update(val);
    }
  },
  methods: {
    update (privilegeArray) {
      const that = this;
      this.tags = that.privileges.filter(i => {
        return privilegeArray ? privilegeArray.includes(i.value) : that.data.includes(i.value);
      });
    }
  }
}
</script>

<style lang="less" scoped>
.privilege-tagbox {
  user-select: none;

  .tag {
    cursor: pointer;
  }
}
</style>
