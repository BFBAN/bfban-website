<template>
  <div class="container">
    <br>
    <div class="content">
      <Row :gutter="0">
        <Col span="11" class="mobile-hide carousel">
          <Carousel :autoplay-speed="5000" :dots="'none'">
            <!--            <CarouselItem v-for="i in banner" :key="i" width="440" height="548">-->
            <!--              <img :src="i">-->
            <!--            </CarouselItem>-->
            <CarouselItem class="carousel-item">
              <img src="https://i.loli.net/2018/11/03/5bdd8e977b10d.png">
              <h2>{{ $t("home.cover.h1") }}</h2>
              <span>{{ $t("home.cover.h3") }}</span>
            </CarouselItem>
          </Carousel>
        </Col>
        <Col span="13">
          <Card v-if="currentUser.token == ''" shadow>
            <p slot="title">{{ $t("signin.title") }}</p>
            <Form>
              <FormItem :label="$t('signin.form.username')">
                <Input prefix="ios-contact" type="text" v-model="signin.username" size="large"
                       :placeholder="$t('signin.form.username')">
                </Input>
              </FormItem>

              <FormItem :label="$t('signin.form.password')">
                <Input type="password" password v-model="signin.password" size="large"
                       :placeholder="$t('signin.form.password')"/>
              </FormItem>

              <FormItem :label="$t('signup.form.captcha')">
                <Input type="text" v-model="signin.captcha" size="large" maxlength="4"
                       :placeholder="$t('signup.form.captcha')">
                </Input>
                <div ref="captcha" :alt="$t('signup.form.getCaptcha')" @click="refreshCaptcha">
                  <div v-html="captchaUrl.content"></div>
                </div>
              </FormItem>

              <FormItem>
                <Button @click.prevent.stop="handleSignin" long :loading="spinShow" size="large" type="primary"
                        :disabled="!signin.captcha || !signin.password || !signin.username">
                  {{ $t('signin.form.submit') }}
                </Button>

                <Divider>
                  <router-link :to="{name: 'signup'}">{{ $t('signin.form.submitHint') }}</router-link>
                  <Divider type="vertical"/>
                  <router-link :to="{name: 'forgetPassword'}">{{ $t('signin.form.forgetPasswordHint') }}</router-link>
                </Divider>
              </FormItem>
            </Form>
          </Card>
          <Card v-if="currentUser.token != ''" shadow align="center">
            <br>
            <Avatar size="100">{{currentUser.userinfo.username[0]}}</Avatar>
            <h1>
              {{currentUser.userinfo.username}}
            </h1>
            <p>哎列？请先登出 (✿◡‿◡)</p>
            <br>
          </Card>
        </Col>
      </Row>
    </div>
    <br>
  </div>
</template>

<script>
import {api, http} from '../assets/js/index'
import Vuex from "vuex";
import _ from "lodash";

const {mapActions, mapMutations} = Vuex;

export default {
  data() {
    return {
      banner: [
        'https://hbimg.huabanimg.com/f4c3995155eb9200a231827a91aec230d31c272842a18-gKy65m_fw658/format/webp'
      ],
      signin: {
        username: '',
        password: '',
        captcha: '',
      },
      captchaUrl: {},
      spinShow: false,
    }
  },
  created() {
    this.refreshCaptcha();
  },
  beforeMount() {
    if (this.$route.query.rurl) {
      this.$Message.info(this.$t('signin.loginFirst'));
    }
  },
  methods: {
    ...mapActions({
      'signinUser': 'signin'
    }),
    ...mapMutations([
      'SIGNIN'
    ]),
    refreshCaptcha: function () {
      http.get(api["captcha"], {
        params: {
          r: Math.random()
        }
      }).then(res => {
        if (res.data.success === 1) {
          this.captchaUrl = res.data.data;
        }
      });

      // waitForAction.call(this.$refs.reCaptcha);
    },
    handleSignin() {
      const that = this;
      const {username, password, captcha} = _.each(this.signin, (v, k, o) => {
        o[k] = v.trim();
      });

      if (username && password && captcha.length === 4) {
        this.spinShow = true;

        http.post(api["account_signin"], {
          headers: {
            'content-type': 'application/json'
          },
          data: {
            data: {
              username,
              password,
            },
            encryptCaptcha: this.captchaUrl.hash,
            captcha,
          },
        }).then((res) => {
          const d = res.data;

          if (d.error === 1) {
            that.$Message.error(this.$t('signin.failed') + ': ' + d.message);
            that.signin.password = '';
            that.signin.captcha = '';
            that.refreshCaptcha();
          } else {
            that.signinUser(d.data).then(() => {
              const rurl = this.$route.query.rurl;

              // redirect rurl or home
              if (rurl) {
                this.$router.push(rurl);
              } else {
                this.$router.go('-1');
              }

              this.$Message.success(this.$t('signin.success'));
            })
          }
        }).finally((res) => {
          that.spinShow = false;
        })
      } else {
        this.$Message.error(this.$t('signin.fillEverything'));
      }
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.user || {token: ''};
    }
  }
}
</script>

<style lang="scss" scoped>
  .carousel {
    border-bottom: 2px solid #f2f2f2;
    width: 440px;
    height: 550px;
    overflow: hidden;
    //background: #fff;
    background: #401487;

    > * {
      background-image: url("https://app.bfban.com/public/svg/bk1.svg");
      background-repeat: repeat;
    }

    .carousel-item {
      display: flex;
      flex-flow: column;
      justify-content: center;
      align-items: center;
      align-content: center;
      height: 100%;
      color: #fff;

      img {
        width: 150px;
        height: 150px;
        margin-top: 150px;
        margin-bottom: 20px;
      }
    }
  }
</style>