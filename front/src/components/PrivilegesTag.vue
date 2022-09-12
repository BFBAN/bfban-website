<template>
    <div>
      <span v-for="(p_item, p_index) in tags" :key="p_index">
        <Tag :type="tagType" :color="p_item.class">
          {{ $t('basic.privilege.' + p_item.value) }}
        </Tag>
      </span>
    </div>
</template>

<script>
import privileges from "/public/conf/privilege.json";

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