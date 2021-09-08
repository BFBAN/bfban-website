<template>
  <div class="container">
    <div class="content">
      <br>
      <Breadcrumb>
        <BreadcrumbItem to="/">{{ $t("header.index") }}</BreadcrumbItem>
        <BreadcrumbItem>{{ $t("search.title") }}</BreadcrumbItem>
      </Breadcrumb>
      <br>

      <div class="search-content">
        <Row :gutter="30">
          <Col>
            <RadioGroup v-model="searchScopeValue" type="button" size="large" class="search-input-show">
              <Radio :label="i" border v-for="i in searchScope" :key="i">{{$t('search.scope.' + i)}}</Radio>
            </RadioGroup>
          </Col>
          <Col>
            <Input clearable
                   search
                   enter-button
                   size="large"
                   class="search-input search-input-show"
                   :placeholder="$t('header.searchBar')"
                   v-model="searchVal"
                   @on-click="handleSearch"
                   @on-search="handleSearch"/>
          </Col>
        </Row>
        <div class="checkboxGroup">
          <Icon type="md-alert" /> 从BFBAN数据库检索ID
          <Divider type="vertical"/>
          <a href="javascript:void(0)">收藏此页面 (Ctrl+D or Command+D)</a>
        </div>
      </div>

      <Alert type="warning" show-icon v-if="cheaters.length > 60">
        庞大的数量
        <template slot="desc">
          啊呀！一共{{ cheaters.length }}条,看起来与你搜索的关键词区配出大量数据，请尝试继续补充{{ searchVal }}后续字符，如:
          {{ searchVal }}2021、{{ searchVal }}_love 让搜索更精准
        </template>
      </Alert>

      <div v-if="cheaters.length !== 0">
        <List border>
          <ListItem v-for="(cheater, index) in cheaters" :key="index">
            <ListItemMeta
                :avatar="cheater.avatarLink"
                :title="cheater.currentName || cheater.originName"
                :description="`${cheater.originUserId ? 'uid:' + cheater.originUserId : ''} ${cheater.historyName ? '过去id:' + cheater.historyName: ''}`"/>
            <template slot="action">
              <li @click="searchModal = false">
                <router-link
                    :to="{name: 'cheater', params: {ouid: `${cheater.originPersonaId}.${cheater.originUserId}.${cheater.id}`}}">
                  <Icon type="ios-eye" size="20"/>
                  查看
                </router-link>
              </li>
            </template>
          </ListItem>
        </List>
      </div>
      <div v-else>无</div>

      <Spin size="large" fix v-show="modalSpinShow"></Spin>
    </div>
    <br>
  </div>
</template>

<script>
import {api, http} from "../assets/js";

export default {
  name: "search",
  data() {
    return {
      searchVal: '',
      modalSpinShow: false,
      searchScope: ['current', 'history'],
      searchScopeValue: 'current',
      cheaters: []
    }
  },
  methods: {
    handleSearch() {
      const val = this.searchVal.trim();

      if (val === '') return false;

      this.searchModal = true;
      this.modalSpinShow = true;

      http.get(api["search"], {
        params: {
          param: val,
          scope: this.searchScopeValue,
        }
      }).then((res) => {
        this.modalSpinShow = false;

        const d = res.data;
        if (d.success === 1) {

          const {cheaters} = d.data;
          this.cheaters = d.data;
        }
      })
    },
  }
}
</script>

<style scoped lang="less">
.search-content {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  min-height: 400px;
  height: 100%;
  padding: 0 30px;

  .checkboxGroup {
    margin-top: 50px;
    font-size: 1rem;
    color: #a8a8a8;
  }

  .search-input-show {
    box-shadow: 0 10px 50px #0000002b;
  }

  .search-input {
    width: 40%;
    min-width: 400px;
    border-radius: 10px;
  }
}
</style>