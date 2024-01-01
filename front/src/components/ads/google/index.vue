<template>
  <Card dis-hover :padding="0" class="ad-container mobile-hide" :class="adId && ads[adId].class || []"
        v-if="adId && adsSwitch"
        :style="ads[adId].style">
    <div class="ad-off" @click="offAds">
      <Icon size="10" type="md-close"></Icon>
    </div>
    <Adsense v-if="adId"
             :data-ad-client="adClient"
             :data-ad-slot="adId"
             :data-ad-format="ads[adId].adFormat"
             :data-full-width-responsive="ads[adId].fullWidthResponsive"></Adsense>
  </Card>
</template>

<script setup>
import {account_storage} from "@/assets/js";

export default {
  name: 'AdsGoogle',
  props: {
    id: [Number, String],
    default: () => '7930151828'
  },
  watch: {
    id: {
      handler(value) {
        this.adId = value.toString();
      }
    }
  },
  data() {
    return {
      account_storage,

      adId: "",
      adClient: "ca-pub-6625226616103631",
      ads: {
        "7930151828": {
          style: "width: 100%;height: 80px;",
          class: [],
          adFormat: 'true',
          fullWidthResponsive: 'true'
        },
        "1760339032": {
          style: "width: 100%;height: 300px;margin-bottom: 10px;",
          class: [],
          adFormat: 'true',
          fullWidthResponsive: 'true'
        }
      }
    }
  },
  created() {
    this.adId = this.id.toString();
  },
  methods: {
    offAds() {
      account_storage.updateConfiguration('ads-switch', false);
      this.$router.push({
        name: this.$router.name,
        query: {
          ...this.$route.query,
          skipAds: true
        }
      })
    }
  },
  computed: {
    adsSwitch() {
      const isSkipAds = this.$route.query['skipAds'] || false;
      return isSkipAds ? false : account_storage.getConfiguration('ads-switch');
    },
  }
}
</script>

<style lang="less">
.ad-container {
  overflow: hidden;

  .ad-off {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.02);

    & * {
      opacity: .5;
    }
  }

  ins, .ins {
    position: relative;
    z-index: 5;
    min-width: 100%;
    min-height: 100%;
  }
}

.ad-container:after {
  content: "AD";
  text-align: center;
  width: 100%;
  opacity: .4;
  font-size: 1.5rem;
  position: absolute;
  z-index: 0;
  top: calc(50% - 1.5rem);
}

.ad-container:before {
  content: "Advertising content";
  text-align: center;
  width: 100%;
  opacity: .2;
  font-size: .8rem;
  position: absolute;
  z-index: 0;
  top: calc(50% + 5px);
}
</style>
