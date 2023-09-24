<template>
  <div>
    <Row type="flex" align="middle">
      <Col>
        <Select v-model="typeValue" @on-change="getCommentAllList">
          <Option v-for="(i, index) in typeArray" :key="index" :value="i">{{ i }}</Option>
        </Select>
      </Col>
      <template v-if="typeValue == 'judgement'">
        <Col>
          <Select v-model="judgementType.value" @on-change="getCommentTypeList">
            <Option :value="i.value" v-for="(i,index) in judgementType.list" :key="index">
              {{ i.title }}
            </Option>
          </Select>
        </Col>
      </template>
      <template v-if="typeValue == 'banAppeal'">
        <Col>
          <Select v-model="banAppealStats.value" @on-change="getCommentTypeList">
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
            <Select value="id">
              <Option value="id">id</Option>
            </Select>
          </Col>
          <Col>
            <Input v-model="searchCommentValue"
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
        <Button size="small" @click="getCommentAllList">
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
            <Time :time="i.createTime" type="date"></Time>
            :
            <BusinessCard :id="i.byUserId" :showAdminUserInfo="true">
              <a href="javascript:void(0)"><b>{{ i.username }}</b></a>
            </BusinessCard>
            {{ $t(`basic.button.reply`) }}
            <router-link :to="{name: 'player', params: {ouid: i.toOriginPersonaId}}">
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
                <Button size="small" :to="{name: 'player', params: {ouid: i.toOriginPersonaId}}">
                  <Icon type="ios-eye"/>
                </Button>
              </Tooltip>
            </a>
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
            <FormItem prop="content">
              <Card dis-hover :padding="0">
                <Textarea ref="commentTextarea" :maxlength="65535" v-model="editCommentFrom.content"></Textarea>
              </Card>
            </FormItem>
          </Col>
          <Col span="24">
            <FormItem prop="videoLink" label="videoLink">
              <Input v-model="editCommentFrom.videoLink" :maxlength="255"/>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div solt="footer">
        <Row>
          <Col flex="1"></Col>
          <Col>
            <Button type="primary" :loading="commentEditLoad" @click="commentSubmit">
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

import BusinessCard from "@/components/businessCard";
import Textarea from "@/components/Textarea";
import Application from "@/assets/js/application";
import HtmlWidget from "@/components/HtmlWidget";
import { kill } from "process";

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
          {trigger: 'blur'}
        ],
      },
      judgementType: {
        value: 'kill',
        list: [{title: 'Comfirmd', value: 'kill'}, {title: 'Farm Weapon', value: 'farm'}, {title: 'Suspicious', value: 'suspect'}, {title: 'MOSS Proof', value: 'innocent'}, {title: 'Under discussion', value: 'discuss'}, {title: 'Voted', value: 'guilt'}, {title: 'Invalid report', value: 'invalid'}]
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
  components: {BusinessCard, HtmlWidget, Textarea},
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

      this.editCommentFrom = this.commentList[index];

      this.openCommentModeBase();
    },
    openCommentModeAsData(data) {
      this.editCommentFrom = data;

      this.openCommentModeBase();
    },
    openCommentModeBase () {
      if (this.$refs.commentTextarea)
        this.$refs.commentTextarea.updateContent(this.editCommentFrom.content);

      this.commentEditModel = true;
    },
    handlePageChange(num) {
      this.skip = num;
      this.getCommentAllList();
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getCommentAllList();
    },
    /**
     * 提交编辑评论、回复、判决
     */
    commentSubmit() {
      if (!this.editCommentFrom.id || !this.editCommentFrom.content) return;

      if (
          !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ['super', 'root', 'dev'])
      ) {
        this.$Message.error(this.$i18n.t('basic.tip.noAccess'))
        return;
      }

      let data = {
        id: this.editCommentFrom.id,
        content: this.editCommentFrom.content,
      };

      if (this.editCommentFrom.videoLink) data.videoLink = this.editCommentFrom.videoLink;
      if (this.editCommentFrom.isSpam) data.isSpam = this.editCommentFrom.isSpam;
      if (this.editCommentFrom.valid) data.valid = this.editCommentFrom.valid;

      this.http.post(api['admin_setComment'], {
        data: {data}
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
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
      const id = this.searchCommentValue;

      if (!id) return;

      this.http.get(api['admin_commentItem'], {
        params: {
          id: this.searchCommentValue
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.openCommentModeAsData(d.data);
          return;
        }

        this.$Message.error(d.message || d.code);
      }).finally(() => {
        this.load = false;
      })
    },
    /**
     * 查询所有评论
     */
    getCommentAllList() {
      this.load = true;

      this.http.get(api['admin_commentAll'], {
        params: {
          type: this.typeValue,
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
      this.http.get(api['admin_CommentTypeList'], {
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
  }
})
</script>

<style lang="less" scoped>
.comment-html {
  overflow: hidden;
}
</style>
