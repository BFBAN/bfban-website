<template>
  <Card dis-hover :padding="0" class="ad-container" :class="adId && ads[adId].class || []"
        v-if="adId && adsSwitch"
        :style="ads[adId].style">
    <button type="button" class="ad-off" aria-label="Close ads" @click="offAds">
      <Icon size="10" type="md-close"></Icon>
    </button>
    <component
        :is="ads[adId].component"
        :key="adId"
        v-if="adVisible"
        is-new-ads-code="yes"
        :ins-style="ads[adId].insStyle"
        :data-ad-client="adClient.toString()"
        :data-ad-slot="adId.toString()"
        :data-ad-format="ads[adId].adFormat"
        :data-full-width-responsive="ads[adId].fullWidthResponsive">
    </component>
    <slot></slot>
  </Card>
</template>

<script>
import {account_storage} from "@/assets/js";

export default {
  name: 'AdsGoogle',
  props: {
    id: {
      type: [Number, String],
      default: () => '3340268100',
    },
  },
  watch: {
    adsSwitch() {
      this.$nextTick(this.observeAd);
    },
    id: {
      handler(value) {
        this.adId = value;
      }
    },
  },
  data() {
    return {
      account_storage,

      adId: "",
      adVisible: false,
      adClient: "ca-pub-1202177945078410",
      ads: {
        3340268100: {
          component: 'Adsense',
          style: "width: 100%;min-height: 80px;",
          class: [],
          adFormat: 'auto',
          fullWidthResponsive: 'yes'
        },
        8672485837: {
          component: 'Adsense',
          name: 'right',
          style: "width: 100%;min-height: 300px;margin-bottom: 10px;",
          class: [],
          adFormat: 'auto',
          fullWidthResponsive: 'yes'
        },
        6397676285: {
          component: 'InArticleAdsense',
          name: 'bfban-x',
          style: "width: 100%;min-height: 200px;",
          class: [],
          insStyle: 'display:block; text-align:center;',
          adFormat: 'fluid',
          fullWidthResponsive: 'no'
        },
      }
    }
  },
  created() {
    this.adId = this.id;
  },
  mounted() {
    this.observeAd();
  },
  beforeDestroy() {
    if (this.adObserver) this.adObserver.disconnect();
  },
  methods: {
    observeAd() {
      if (this.adObserver) this.adObserver.disconnect();
      this.adVisible = false;
      if (!this.adsSwitch) return;
      this.adObserver = new ResizeObserver(entries => {
        if (entries[0].contentRect.width > 0) {
          this.adVisible = true;
          this.adObserver.disconnect();
        }
      });
      this.adObserver.observe(this.$el);
    },
    offAds() {
      account_storage.updateConfiguration('ads.google.switch', false);
      this.$router.push({
        name: this.$route.name,
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
      const adsSwitchValue = this.$store.state.configuration['ads.google.switch'];
      return isSkipAds ? false : adsSwitchValue;
    },
  }
}
</script>

<style lang="less">
.ad-container {
  .ad-off {
    display: flex;
    margin-left: auto;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border: 0;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.02);

    & * {
      opacity: .5;
    }
  }

  ins {
    position: relative;
    z-index: 5;
    height: 100%;
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
