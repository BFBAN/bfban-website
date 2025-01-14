<template>
  <div>
    <Row :gutter="10" type="flex" align="middle">
      <Col>
        <Select v-model="typeValue" :disabled="!!searchCommentValue" @on-change="getCommentAllList()">
          <Option v-for="(i, index) in typeArray" :key="index" :value="i">{{ i }}</Option>
        </Select>
      </Col>
      <template v-if="typeValue === 'judgement'">
        <Col>
          <Select v-model="judgementType.value" :disabled="!!searchCommentValue" @on-change="getCommentTypeList">
            <Option :value="i.value" v-for="(i,index) in judgementType.list" :key="index">
              {{ i.title }}
            </Option>
          </Select>
        </Col>
      </template>
      <template v-if="typeValue === 'banAppeal'">
        <Col>
          <Select v-model="banAppealStats.value" :disabled="!!searchCommentValue" @on-change="getCommentTypeList">
            <Option :value="i.value" v-for="(i,index) in banAppealStats.list" :key="index">
              {{ i.title }}
            </Option>
          </Select>
        </Col>
      </template>
      <Col flex="1"></Col>
      <Col>
        <Row :gutter="10">
          <Col>
            <Select v-model="filter.queryModeValue" :disabled="typeValue !== 'all'">
              <Option :value="i.value" v-for="(i, index) in filter.queryModes" :key="index">{{i.label}}</Option>
            </Select>
          </Col>
          <Col>
            <Input v-model="searchCommentValue"
                   :disabled="typeValue !== 'all'"
                   type="text"
                   search
                   enter-button
                   @on-enter="getSearchComment"
                   @on-search="getSearchComment"
                   style="width: 280px">
            </Input>
          </Col>
        </Row>
      </Col>
    </Row>

    <br>

    <Row>
      <Col flex="1">
        <Page class="page"
              size="small"
              show-sizer
              show-total
              show-elevator
              @on-change="handlePageChange"
              @on-page-size-change="handlePageSizeChange"
              :page-size="limit"
              :current="skip"
              :total="total"/>
      </Col>
      <Col>
        <Button size="small" @click="getCommentAllList()">
          <Icon type="md-refresh" :class="load ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>

    <br>

    <div v-if="commentList.length > 0">
      <div v-for="(i,index) in commentList" :key="index">
        <Card :padding="0" dis-hover>
          <div slot="title">
            <div v-if="i.type === 'banAppeal'">
              <Tag>COMMENT</Tag>
              <Tag>{{ i.type }}</Tag>
              <Tag>{{ i.appealStatus }}</Tag>
            </div>
            <div v-if="i.type === 'judgement'">
              <Tag>COMMENT</Tag>
              <Tag>{{ i.type }}</Tag>
              <Tag>{{ i.judgeAction }}</Tag>
            </div>
            <div v-if="i.type === 'reply'">
              <Tag>COMMENT</Tag>
              <Tag>{{ i.type }}</Tag>
              <Tag>{{ i.id }}</Tag>
            </div>
            <div v-if="i.type === 'all'">
              <Tag>COMMENT</Tag>
              <Tag>{{ i.id }}</Tag>
              <Tag>{{ i.type }}</Tag>
            </div>
            <div v-if="i.type === 'report'">
              <Tag>REPORT</Tag>
              <Tag>{{ i.toOriginName }}</Tag>
              <Tag>{{ i.toOriginPersonaId }}</Tag>
            </div>
            <TimeView :time="i.createTime">
              <Time :time="i.createTime" type="date"></Time>
            </TimeView>
            :
            <BusinessCard :id="i.byUserId" :showAdminUserInfo="true">
              <a href="javascript:void(0)"><b>{{ i.username }}</b></a>
            </BusinessCard>
            {{ $t(`basic.button.reply`) }}
            <router-link :to="{name: 'player', params: {ouid: i.toOriginPersonaId}, query: {byPath: $route.name}}">
              <span>{{ i.toOriginName }}</span>
            </router-link>
            ({{ i.id }})
          </div>
          <div slot="extra">
            <a href="javascript:void(0)">
              <Tooltip content="Edit Comment">
                <Button size="small" type="primary" @click="openCommentModeAsIndex(index)">
                  <Icon type="md-create"/>
                  id: {{ i.id }}
                </Button>
              </Tooltip>
            </a>
            <Divider type="vertical"></Divider>
            <a href="javascript:void(0)">
              <Tooltip content="Open Player Page">
                <Button size="small" :to="{name: 'player', params: {ouid: i.toOriginPersonaId}, query: {byPath: $route.name}}">
                  <Icon type="ios-eye"/>
                </Button>
              </Tooltip>
            </a>
          </div>
          <div class="comment-links" v-if="i.videoLink">
            <EditLinks :links="i.videoLink" :isReadonly="true" placeholder="http(s)://"></EditLinks>
          </div>
          <HtmlWidget class="comment-html" :html="i.content"></HtmlWidget>
        </Card>
        <br>
      </div>
    </div>
    <Card dis-hover v-else>
      {{ $t('basic.tip.notContent') }}
    </Card>

    <br>

    <Page class="page"
          size="small"
          show-sizer
          show-total
          show-elevator
          @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange"
          :page-size="limit"
          :current="skip"
          :total="total"/>

    <!-- 编辑评论 S -->
    <Modal v-model="commentEditModel" footer-hide>
      <Form :model="editCommentFrom"
            :rules="commentRuleValidate"
            ref="commentFormValidate"
            label-position="top">
        <Row :gutter="10">
          <Col span="24">
            <FormItem prop="videoLink" label="videoLink">
              <EditLinks v-model="editCommentFrom.videoLink" :links="editCommentFrom.videoLink" :max="10"
                         placeholder="http(s)://"></EditLinks>
            </FormItem>
          </Col>
          <Col span="24">
            <FormItem prop="content">
              <Card dis-hover :padding="0">
                <template v-if="editCommentFrom.content.text">
                  <Textarea ref="commentTextarea" :maxlength="65535" v-model="editCommentFrom.content.text"></Textarea>
                </template>
                <template v-else>
                  <Textarea ref="commentTextarea" :maxlength="65535" v-model="editCommentFrom.content"></Textarea>
                </template>
              </Card>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div solt="footer">
        <Row>
          <Col flex="1"></Col>
          <Col>
            <Button type="primary" :loading="commentEditLoad" @click="onCommentSubmit">
              {{ $t('basic.button.submit') }}
            </Button>
          </Col>
        </Row>
      </div>
    </Modal>
    <!-- 编辑评论 E -->
  </div>
</template>

<script>
import {account_storage, api, http, http_token, util} from "../../assets/js";

import Application from "@/assets/js/application";
import TimeView from "@/components/TimeView.vue";
import BusinessCard from "@/components/BusinessCard.vue";
import Textarea from "@/components/Textarea";
import EditLinks from "@/components/EditLinks.vue";
import HtmlWidget from "@/components/HtmlWidget";
import {kill} from "process";

export default new Application({
  data() {
    return {
      commentEditModel: false,
      commentEditLoad: false,
      editCommentFrom: {
        id: 0,
        content: '',
        videoLink: '',
      },
      commentRuleValidate: {
        content: [
          {required: true, trigger: 'blur'}
        ],
        videoLink: [
          {required: false, trigger: 'blur'}
        ],
      },
      filter: {
        queryModeValue: 'userId',
        queryModes: [{
          value: 'commentId',
          label: 'Comment ID'
        }, {
          value: 'userId',
          label: 'User ID'
        }]
      },
      judgementType: {
        value: 'kill',
        list: [{title: 'Comfirmd', value: 'kill'}, {title: 'Farm Weapon', value: 'farm'}, {
          title: 'Suspicious',
          value: 'suspect'
        }, {title: 'MOSS Proof', value: 'innocent'}, {title: 'Under discussion', value: 'discuss'}, {
          title: 'Voted',
          value: 'guilt'
        }, {title: 'Invalid report', value: 'invalid'}]
      },
      banAppealStats: {
        value: 'open',
        list: [{title: 'Open', value: 'open'}, {title: 'Lock', value: 'lock'}, {title: 'Close', value: 'close'}]
      },
      searchCommentValue: '',
      load: false,
      commentList: [],
      typeValue: 'all',
      typeArray: ['all', 'report', 'reply', 'judgement', 'banAppeal'],
      skip: 1,
      limit: 20,
      order: 'desc',
      total: 0,
    }
  },
  components: {BusinessCard, TimeView, HtmlWidget, EditLinks, Textarea},
  created() {
    this.http = http_token.call(this);

    this.loadData();
  },
  watch: {
    $route: "loadData",
  },
  methods: {
    /**
     * 加载数据
     */
    async loadData() {
      await util.initUtil().then(res => {
        this.games = res.gameName;
      });

      this.getCommentAllList();
    },
    /**
     * 打开面板，展示可编辑(预备)表单
     * @param index {numer}
     */
    openCommentModeAsIndex(index) {
      if (
          !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ['super', 'root', 'dev'])
      ) {
        this.$Message.error(this.$i18n.t('basic.tip.noAccess'))
        return;
      }

      this.openCommentModeAsData(this.commentList[index]);
      this.openCommentModeBase();
    },
    /**
     * 编辑评论弹窗数据载入
     * @param data
     */
    openCommentModeAsData(data) {
      this.editCommentFrom = data;

      if (this.$refs.commentTextarea)
        this.$refs.commentTextarea.updateContent(this.editCommentFrom.content || this.editCommentFrom.content.text);

      this.openCommentModeBase();
    },
    /**
     * 展开编辑评论弹窗
     */
    openCommentModeBase() {
      this.commentEditModel = true;
    },
    /**
     * 提交编辑评论、回复、判决
     */
    onCommentSubmit() {
      if (!this.editCommentFrom.id || !this.editCommentFrom.content) return;

      if (
          !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ['super', 'root', 'dev'])
      ) {
        this.$Message.error(this.$i18n.t('basic.tip.noAccess'))
        return;
      }

      let data = {
        id: this.editCommentFrom.id,
        content: this.editCommentFrom.content.text || this.editCommentFrom.content,
      };

      if (this.editCommentFrom.videoLink) data.videoLink = this.editCommentFrom.videoLink;
      if (this.editCommentFrom.isSpam) data.isSpam = this.editCommentFrom.isSpam;
      if (this.editCommentFrom.valid) data.valid = this.editCommentFrom.valid;

      this.http.post(api['admin_setComment'], {
        data: {data}
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.$Message.success(d.code);
          return;
        }

        this.$Message.error(d.message || d.code);
      }).finally(() => {
        this.commentEditModel = false;
        this.load = false;

        this.getCommentAllList();
      })
    },
    /**
     * 查询单条评论
     */
    getSearchComment() {
      const inputValue = this.searchCommentValue;

      if (!inputValue) return;

      switch (this.filter.queryModeValue) {
        case "userId":
          this.getCommentAllList({userId: inputValue})
          break;
        case "commentId":
          this.getCommentAllList({id: inputValue})
          break;
      }
    },
    /**
     * 查询所有评论
     */
    getCommentAllList(params = {}) {
      this.load = true;

      this.http.get(api['admin_commentAll'], {
        params: {
          type: this.typeValue,
          skip: (this.skip - 1) * this.limit,
          limit: this.limit,
          order: this.order,
          ...params
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.commentList = d.data;
          this.total = d.total;
          return;
        }

        this.$Message.error(d.message || d.code);
      }).finally(() => {
        this.load = false;
      })
    },
    /**
     * 查询指定Type评论
     */
    getCommentTypeList() {
      this.load = true;
      let params = {}; // 定义 params 变量
      if (this.typeValue === 'banAppeal')
        params.appealStatus = this.banAppealStats.value;
      if (this.typeValue === 'judgement')
        params.judgeAction = this.judgementType.value;
      this.http.get(api['admin_commentTypeList'], {
        params: {
          type: this.typeValue,
          judgeAction: params.judgeAction,
          banAppealStats: params.appealStatus,
          skip: this.skip - 1,
          limit: this.limit,
          order: this.order
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.commentList = d.data;
          this.total = d.total;
          return;
        }

        this.$Message.error(d.message || d.code);
      }).finally(() => {
        this.load = false;
      })
    },
    handlePageChange(num) {
      this.skip = num;
      this.getCommentAllList();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getCommentAllList();
    },
  }
})
</script>

<style lang="less" scoped>
.comment-links {
  padding: 10px 15px;
}

.comment-html {
  overflow: hidden;
}
</style>
