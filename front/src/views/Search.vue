<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("search.title") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <div :class="`search-content ${cheaters.length > 0 ? 'search-content-mini' : ''}`">
        <Row :gutter="50" style="width: 100%;">
          <Col>
            <RadioGroup v-model="searchScopeValue" type="button" size="large" class="search-input-show">
              <Radio :label="i" border v-for="i in searchScope" :key="i">{{ $t('search.scope.' + i) }}</Radio>
            </RadioGroup>
          </Col>
          <Col flex="1">
            <Dropdown style="width: 100%">
              <Input enter-button
                     search
                     size="large"
                     class="search-input search-input-show"
                     :placeholder="$t('search.placeholder')"
                     v-model="searchVal"
                     @on-clear="searchVal = '';cheaters = []"
                     @on-click="handleSearch"
                     @on-search="handleSearch">
              </Input>
              <div transfer slot="list">
                <Row :gutter="5" v-if="searchHistory.list.length > 0" style="padding: 10px">
                  <Col v-for="(i, index) in searchHistory.list"
                       :key="index">
                    <Tag stype="border"
                         type="dot"
                         checkable
                         closable
                         @on-change="handleSearchHistoryClickTag(index)"
                         @on-close="handleSearchHistoryClose(index)">{{ i || '' }}
                    </Tag>
                  </Col>
                </Row>
                <div v-else align="center">
                  🦖
                </div>
              </div>
            </Dropdown>
          </Col>
        </Row>
        <div class="checkboxGroup">
          <Icon type="md-alert" /> {{ $t("search.describe") }}
          <Divider type="vertical"/>
          <a href="javascript:void(0)">{{ $t("search.collectionHint") }}</a>
        </div>
      </div>

      <Alert type="warning" show-icon v-if="cheaters.length > 60">
        庞大的数量
        <template slot="desc">
          啊呀！一共{{ cheaters.length }}条,看起来与你搜索的关键词区配出大量数据，请尝试继续补充{{ searchVal }}后续字符，如:
          <a :href="'?s=' + searchVal + '2021'">{{ searchVal }}2021</a>、<a :href="'?s=' + searchVal + '_love'">{{ searchVal }}2021</a> 让搜索更精准
        </template>
      </Alert>


      <div v-if="cheaters.length !== 0">
        <List border class="content">
          <ListItem v-for="(cheater, index) in cheaters" :key="index">
            <ListItemMeta
                :avatar="cheater.avatarLink"
                :title="cheater.currentName || cheater.originName"
                :description="`${cheater.originUserId ? 'uid:' + cheater.originPersonaId : ''} ${cheater.historyName ? '过去id:' + cheater.historyName: ''}`"/>
            <template slot="action">
              <li @click="searchModal = false">
                <router-link
                    :to="{name: 'player', params: {ouid: `${cheater.originPersonaId}`}}">
                  <Icon type="ios-eye" size="20"/>
                  查看
                </router-link>
              </li>
            </template>
          </ListItem>


          <Spin size="large" fix v-show="modalSpinShow"></Spin>
        </List>
      </div>
    </div>
    <br>
  </div>
</template>

<script>
import BFBAN from "../assets/js/bfban";

import {api, http, storage, time} from "../assets/js";

export default new BFBAN({
  name: "search",
  data() {
    return {
      searchVal: '',
      searchHistory: {
        list: []
      },
      modalSpinShow: false,
      searchScope: ['current', 'history'],
      searchScopeValue: 'current',
      cheaters: []
    }
  },
  created() {
    const {s, type} = this.$route.query;
    this.searchScopeValue = type || this.searchScope[0];
    this.searchVal = s || '';

    this.handleSearch();
    this.getSearchHistory();
  },
  methods: {
    getSearchHistory() {
      let history = storage.get('search.history');

      if (history.code == -1) {
        this.setSearchHistoryValue([]);
      }

      this.searchHistory.list = history.data.value || [];
    },
    async setSearchHistoryValue(val) {
      await storage.set('search.history', val);
    },
    handleSearchHistoryClose(index) {
      this.searchHistory.list.splice(index, 1);

      this.setSearchHistoryValue(this.searchHistory.list);
    },
    handleSearchHistoryClickTag(index) {
      this.searchVal = this.searchHistory.list[index];

      this.handleSearch();
    },
    handleSearch() {
      const that = this;
      const val = this.searchVal.trim();

      if (val === '' && val.length <= 3) return false;

      this.searchModal = true;
      this.modalSpinShow = true;

      http.get(api["search"], {
        params: {
          param: val,
          scope: this.searchScopeValue,
        }
      }).then((res) => {
        that.modalSpinShow = false;

        let hisArr = Array.from(new Set(that.searchHistory.list.concat([val])))
            that.setSearchHistoryValue(hisArr);
            that.searchHistory.list = hisArr;

        const d = res.data;
        if (d.success === 1) {
          const {cheaters} = d.data;
          this.cheaters = d.data;

          if (d.data.length <= 0) {
            this.$Message.error('not data')
          }
        } else {
          this.$Message.error(d.message)
        }
      })
    },
  }
});
</script>

<style scoped lang="less">
.search-background {
  position: fixed;
  background-size: cover;
  background-image: url(https://media.contentapi.ea.com/content/dam/bf/images/2018/08/bf-hero-medium-keyart-games-7x2-xl1.jpg.adapt.crop5x2.1455w.jpg);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: .15;
}

.search-content {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  transition: all .25s;
  min-height: 600px;
  height: 100%;
  padding: 0 30px;

  &.search-content-mini {
    min-height: 150px !important;
  }

  .checkboxGroup {
    margin-top: 50px;
    font-size: 1rem;
    color: #a8a8a8;
  }

  .search-input-show {
    box-shadow: 0 10px 50px #0000002b;
  }

  .search-input {
    width: 100% !important;
    border-radius: 10px;
  }
}
</style>