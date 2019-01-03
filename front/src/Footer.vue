<template>
    <footer class="footer">
      <p>
        <a href="#" @click.prevent="setLang('cn')">
          <i class="icon icon-country country-cn"></i>
        </a>
        <a href="#" @click.prevent="setLang('uk')">
          <i class="icon icon-country country-uk"></i>
        </a>
      </p>
      <p>
        <router-link :to="{name: 'about'}">{{$t('header.about')}}</router-link>
        <router-link :to="{name: 'report'}">{{$t('header.report')}}</router-link>
      </p>
      <p>
        {{$t('footer.author')}}
        &copy; 2018-2019
        All Rights Reserved.
      </p>
    </footer>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    setLang(lang) {
      this.$store.dispatch('setLang', lang);
    }
  }
}
</script>


<style lang="scss">
  .footer {
    text-align: center;
    padding: 1rem;
    background-color: rgba(252, 252, 252, 0.8);

    flex-shrink: 0;

    .icon-country {
      background-size: 1.4rem;
      background-repeat: no-repeat;
      background-position: center;
      width: 1.6rem;
      height: 1.6rem;
      display: inline-block;
    }
    .country-cn {
      background-image: url('/assets/images/lang/cn.svg');
    }
    .country-uk {
      background-image: url('/assets/images/lang/uk.svg');
    }
  }
</style>

