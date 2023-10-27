<template>
  <div class="tells" v-if="tellStatic && tellShow">
    <row :gutter="30">
      <Col flex="auto">
        <div v-for="(i, index) in tells" :key="index">
          <Card class="tell-item" v-if="i.showLang.filter(e => $i18n.locale == e).length > 0" :bordered="false" dis-hover>
            <div align="center">
              <Avatar :src="i.avatar" size="100"/>
              <h2>{{ i.name }}</h2>
            </div>
            <div>
              <Icon type="ios-quote" size="20"/>
              <span v-html="i.content"></span>
            </div>
            <Divider></Divider>
            <div v-for="(id, idindex) in i.identity" :key="idindex">
              <Tag>{{id}}</Tag>
            </div>
          </Card>
        </div>
      </Col>
    </row>
  </div>
</template>

<script>
import tell from '/public/config/tells.json'

export default {
  data() {
    return {
      tells: tell.child,
      tellStatic: tell.static
    }
  },
  computed: {
    tellShow () {
      return this.tells.filter(i => this.$i18n.locale == i.showLang).length > 0 ? true : false;
    }
  }
}

</script>

<style lang="less">
.tells {
  padding: 60px 0;
  margin: 30px 0;

  columns: 3;
  column-gap: 30px;

  .tell-item {
    break-inside: avoid;

    h2 {
      margin: 10px 0;
    }
  }
}
</style>
