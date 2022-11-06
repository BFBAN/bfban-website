<template>
  <div>
    <Row type="flex" align="middle">
      <Col flex="auto" :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 24, push: 0, pull: 0}">
        <RadioGroup
            class="game-type"
            v-model="gameName"
            @on-change="handleChanges"
            type="button">
          <Radio label="all" value="all">
            {{ $t('basic.games.all') }}
          </Radio>
          <Radio :label="i.value" :disabled="i.disabled" v-for="i in games" :key="i.value" aria-radio
                 :style="'background-image: url(' + require('/src/assets/' + i.bk_file + '/bf.jpg') + ');'"
                 :class="gameName == i.value ? 'gametype-select' : ''">
            <Tooltip :content="$t('basic.games.' + i.value)" placement="top-start">
              <img height="35" :src="require('/src/assets/' + i.bk_file + '/logo.png')" v-if="i.logo_src"/>
              <span v-else>{{ i.full_name }}</span>
            </Tooltip>
          </Radio>
        </RadioGroup>
      </Col>
      <Col>
        <Select v-model="typeValue">
          <Option v-for="(i, index) in typeArray" :key="index" :value="i">{{ i }}</Option>
        </Select>
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
        <Button size="small" @click="getCommentList">
          <Icon type="md-refresh" :class="load ? 'spin-icon-load' : ''"/>
        </Button>
      </Col>
    </Row>

    <br>

    <div v-if="commentList.length > 0">
      <div v-for="(i,index) in commentList" :key="index">
        <Card :padding="0" dis-hover>
          <div slot="title">
            <Tag>COMMENT</Tag>
            <Time :time="i.createTime" type="date"></Time>
            :
            <BusinessCard :id="i.byUserId">
              <a href="javascript:void(0)"><b>{{ i.username }}</b></a>
            </BusinessCard>
            {{ $t(`basic.button.reply`) }}
            <router-link :to="{name: 'player', params: {ouid: i.toOriginPersonaId}}">
              <span>{{ i.toOriginName }}</span>
            </router-link>
            ({{ i.cheatGame }})
          </div>
          <div slot="extra">
            <a href="javascript:void(0)">
              <Tooltip content="Edit Comment">
                <Button size="small" type="primary" @click="openCommentMode(index)">
                  <Icon type="md-create"/>
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
import BFBAN from "@/assets/js/bfban";
import HtmlWidget from "@/components/HtmlWidget";

export default new BFBAN({
  data() {
    return {
      commentEditModel: false,
      commentEditLoad: false,
      editCommentFrom: {
        id: 0,
        content: '',
        videoLink: ''
      },
      commentRuleValidate: {
        content: [
          {required: true, trigger: 'blur'}
        ],
        videoLink: [
          {required: true, trigger: 'blur'}
        ],
      },

      load: false,
      gameName: 'all',
      games: [],
      commentList: [],
      typeValue: 'report',
      typeArray: ['report', 'reply', 'judgement', 'banAppeal'],
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
     * @returns {Promise<void>}
     */
    async loadData() {
      await util.initUtil().then(res => {
        this.games = res.gameName;
      });

      this.getCommentList();
    },
    openCommentMode(index) {
      if (
          !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ['super', 'root', 'dev'])
      ) {
        this.$Message.error(this.$i18n.t('basic.tip.noAccess'))
        return;
      }

      this.editCommentFrom = this.commentList[index];

      if (this.$refs.commentTextarea)
        this.$refs.commentTextarea.updateContent(this.editCommentFrom.content);

      this.commentEditModel = true;
    },
    handlePageChange(val) {
      this.skip = val;
      this.getCommentList();
    },
    handlePageSizeChange(val) {
      this.limit = val;
      this.getCommentList();
    },
    handleChanges() {
      this.getCommentList()
    },
    /**
     * 编辑评论、回复、判决
     */
    commentSubmit() {
      if (!this.editCommentFrom.id || !this.editCommentFrom.content || !this.editCommentFrom.videoLink) return;

      if (
          !account_storage.checkPrivilegeGroup(this.currentUser.userinfo, ['super', 'root', 'dev'])
      ) {
        this.$Message.error(this.$i18n.t('basic.tip.noAccess'))
        return;
      }

      this.http.post(api['admin_setComment'], {
        data: {
          data: {
            id: this.editCommentFrom.id,
            content: this.editCommentFrom.content,
            videoLink: this.editCommentFrom.videoLink
          },
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.$Message.success(d.code);
          return;
        }

        this.$Message.error(d.code);
      }).finally(() => {
        this.commentEditModel = false;
        this.load = false;

        this.getCommentList();
      })
    },
    /**
     * 取得评论列表
     */
    getCommentList() {
      this.load = true;

      this.http.get(api['admin_commentAll'], {
        params: {
          type: this.typeValue,
          game: this.gameName,
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

        this.$Message.error(d.code);
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