<template>
    <footer class="footer">
      <p>
        <router-link :to="{name: 'about'}">关于</router-link>
      </p>
      <p>
        Written by mygoare
        &copy; 2018
        All Rights Reserved.
      </p>
    </footer>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>


<style>
  .footer {
    text-align: center;
    padding: 1rem;
    background-color: rgba(252, 252, 252, 0.8);

    flex-shrink: 0;
  }
</style>

