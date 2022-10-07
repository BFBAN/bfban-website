<template>
  <Tooltip :content="href" max-width="300">
    <Icon type="md-link" />
    <u><a :href="href" target="_blank">{{ text }}</a></u>
  </Tooltip>
</template>

<script>
export default {
  name: "HtmlLink",
  props: {
    href: {
      type:String,
      default: ""
    },
    text: {
      type:String,
      default: ""
    }
  }
}
</script>

<style scoped>
</style>