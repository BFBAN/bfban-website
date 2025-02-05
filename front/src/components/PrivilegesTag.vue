<template>
    <span class="privilege-tagbox">
      <span v-for="(p_item, p_index) in tags" :key="p_index">
        <Tag :type="tagType" :size="size" :color="p_item.class" class="tag"
             :title="$t('basic.privilege.' + p_item.value)">
          {{ $t('basic.privilege.' + p_item.value) }}
        </Tag>
      </span>
    </span>
</template>

<script>
import privileges from "/public/config/privilege.json";

export default {
  props: {
    data: {
      type: [Array, String],
      default: () => []
    },
    size: {
      type: String,
      default: 'default'
    },
    tagType: {
      type: String,
      default: 'border'
    }
  },
  data() {
    return {
      tags: []
    }
  },
  created() {
    this.update();
  },
  watch: {
    'data': function (value, old) {
      let _v = value
      if (typeof _v == 'string')
        _v = value.split(',');
      this.update(_v);
    }
  },
  methods: {
    update(privilegeArray) {
      const that = this;
      if (!privilegeArray) return [];
      this.tags = that.privileges.filter(i => {
        return privilegeArray ? privilegeArray.includes(i.value) : that.data.includes(i.value);
      });
    }
  },
  computed: {
    privileges: () => privileges.child
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
