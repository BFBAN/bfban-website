<template>
  <Card id="timeline" style="overflow: hidden" dis-hover :padding="isMobile ? 15 : 20">
    <Row :gutter="20" slot="title" type="flex" justify="center" align="middle">
      <Col :xs="{span: 23, push: 1}" :lg="appeal.disable ? {span: 7, push: 0} : {span: 1, push: 0}"
           class="mobile-hide">
        <template v-if="appeal.disable">
          <Button @click="onLeftAppealPlan" size="small">
            <Icon type="md-contract"/>
          </Button>
          {{ $t('detail.info.assistPppeal') }}
        </template>
        <template v-else>
          <Button @click="onLeftAppealPlan" size="small">
            <Icon type="md-expand"/>
          </Button>
        </template>
      </Col>
      <Col flex="auto" class="mobile-hide">
        {{ $t('detail.info.timeLine') }}
        <Tag v-if="timeline.total">{{ timeline.total || 0 }}</Tag>
      </Col>
      <Col>
        <Row>
          <Col>
            <!-- 时间轴筛选 S -->
            <ButtonGroup type="button">
              <Select v-model="timeline.seeType" size="small" @on-change="onUpdataSeeType">
                <Option v-for="(item, index) in timeline.seeTypeList"
                        :value="item.value"
                        :key="index">
                  {{ $t('detail.timeline.' + item.label) }}
                </Option>
              </Select>
            </ButtonGroup>
            <Divider type="vertical"/>
            <RadioGroup v-model="timeline.sort" @on-change="onTimeLineSort" type="button" size="small">
              <Radio label="1">
                <Icon type="ios-funnel"/>
              </Radio>
              <Radio label="2">
                <Icon type="ios-funnel-outline"/>
              </Radio>
            </RadioGroup>
            <Divider type="vertical"/>
            <!-- 时间轴筛选 E -->
          </Col>
          <Col>
            <Page :page-size="timeline.limit"
                  :current="timeline.page"
                  :total="timeline.total"
                  @on-change="handlePageChange"
                  simple
                  class="page"
                  size="small"/>
          </Col>
          <Col>
            <Divider type="vertical"/>
            <Button size="small" type="dashed" @click="getTimeline">
              <Icon type="md-refresh"/>
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
    <Row :gutter="20" type="flex">
      <Col :xs="{span: 24, push: 0, pull: 0}" :lg="appeal.disable ? {span: 17, push: 1} : {span: 24, push: 0} "
           order="2" class="tabs-style">
        <div class="content">
          <!-- 时间线 -->
          <TimelineItem
              pending
              class="timeline-time-line"
              v-show="filtrateTimelineItem(index)"
              v-for="(l, index) in timelineList"
              :key="index"
              :color="l.privilege === 'admin' ? 'red' : 'green'"
              :ref="`floor-${l.index}`"
              :id="`floor-${l.index}`">
            <div v-if="l.type === 'report'" slot="dot" class="timeline-time-dot ivu-tag-warning hand">
              <Icon type="ios-hand" :size="isMobile ? 13 : 20"></Icon>
            </div>
            <div v-else-if="l.type === 'reply'" slot="dot" class="timeline-time-dot ivu-tag-geekblue reply">
              <Icon type="ios-text" :size="isMobile ? 13 : 20" class="ivu-tag-text"></Icon>
            </div>
            <div v-else-if="l.type === 'banAppeal'" slot="dot"
                 class="timeline-time-dot ivu-tag-magenta ban_appeal">
              <Icon type="md-bookmark" :size="isMobile ? 13 : 20" class="ivu-tag-text"></Icon>
            </div>
            <div v-else-if="l.type === 'judgement'" slot="dot"
                 class="timeline-time-dot ivu-tag-primary ban_appeal">
              <Icon type="ios-medical" :size="isMobile ? 13 : 20" class=""></Icon>
            </div>
            <div v-else-if="l.type === 'verify'" slot="dot" class="timeline-time-dot trophy">
              <Icon type="ios-share-alt" :size="isMobile ? 13 : 20"></Icon>
            </div>
            <div v-else-if="l.type === 'historyUsername'" slot="dot"
                 class="timeline-time-dot ivu-tag-gold">
              <Icon type="ios-time" :size="isMobile ? 13 : 20" class="ivu-tag-text"></Icon>
            </div>
            <div v-else slot="dot" class="timeline-time-dot ivu-tag-border ivu-tag-text out">
              <Icon type="ios" :size="isMobile ? 13 : 20" class=""></Icon>
            </div>

            <!-- 历史名称 S -->
            <div v-if="l.type === 'historyUsername'" class="timeline-content">
              <div class="timeline-time">
                <Row>
                  <Col flex="1">
                    {{ $t('detail.appeal.info.changeName') }}
                  </Col>
                  <Col align="right">
                    <Time :time="l.fromTime" v-if="l.fromTime" type="datetime"></Time>
                  </Col>
                </Row>
              </div>
              <Card :padding="0" dis-hover
                    class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"
                    style="padding: 15px 0">
                <Dropdown :transfer="isMobile" placement="bottom-start" style="width: 100%">
                  <Row :gutter="16" type="flex" justify="center" align="middle">
                    <Col>
                      {{ l.beforeUsername }}
                    </Col>
                    <Col class="mobile-hide">
                      <Icon type="md-arrow-round-forward" size="20" style="opacity: .6"/>
                    </Col>
                    <Col class="desktop-hide" align="center" :xs="{span: 24}">
                      <Icon type="md-arrow-round-forward" size="20" style="opacity: .6;transform: rotate(90deg)"/>
                    </Col>
                    <Col>
                      <b>{{ l.nextUsername }}</b>
                    </Col>
                  </Row>

                  <!-- 历史ID -->
                  <DropdownMenu slot="list"
                                style="width: 100%"
                                v-if="cheater && cheater.history && cheater.history.length >= 0">
                    <Row style="margin: 5px 18px">
                      <Col flex="1">
                        <b>{{ $t('detail.info.historyID') }}</b>
                      </Col>
                    </Row>
                    <div style="overflow: auto; max-height: 80vh">
                      <div v-for="(origin, origin_index) in cheater.history" :key="origin_index">
                        <Row :gutter="5" type="flex" align="middle"
                             style="padding: 0 16px;margin: 10px 0 ; width:100%">
                          <Col>
                            <Time :time="origin.fromTime"
                                  v-if="origin.fromTime && l.fromTime != origin.fromTime"></Time>
                            <b v-else>
                              <Time :time="origin.fromTime" v-if="origin.fromTime"></Time>
                            </b>
                          </Col>
                          <Col flex="1">
                            <Divider dashed style="margin: 0"/>
                          </Col>
                          <Col>
                            <template v-if="l.fromTime == origin.fromTime">
                              <Tag color="primary">{{ origin.originName }}</Tag>
                            </template>
                            <template v-else>
                              {{ origin.originName }}
                            </template>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </DropdownMenu>
                </Dropdown>
              </Card>

              <Row type="flex" align="middle">
                <Col flex="auto">
                  <template v-if="isLogin">
                    <Button size="small" @click="updateCheaterModal = true;">
                      {{ $t('detail.info.updateButton') }}
                    </Button>
                  </template>
                </Col>
              </Row>
            </div>
            <!-- 历史名称 E -->

            <!-- 举报:any S -->
            <div :id="`floor-${l.id}`" v-if="l.type === 'report'" class="timeline-content">
              <div class="timeline-time">
                <Row>
                  <Col flex="1">
                    <router-link :to="{name: 'account', params: {uId: `${l.byUserId}`}}">
                      <BusinessCard :id="l.byUserId">
                        <u><b>{{ l.username || l.byUserId }}</b></u>
                      </BusinessCard>
                    </router-link>
                    <!-- 举报 -->
                    {{ $t('detail.info.report') }}
                    <a><u><b>{{ l.toOriginName }}</b></u></a>

                    <template v-if="l.cheatGame">
                      <!-- 在 -->
                      {{ $t('detail.info.inGame') }}

                      <router-link :to="{name: 'player', query: {game: l.cheatGame, status: -1 } }">
                        <Tooltip :content="$t('basic.games.' + l.cheatGame)">
                          <Tag type="border">
                            <img height="12"
                                 :src="require('/src/assets/images/games/' + l.cheatGame + '/logo.png')"/>
                          </Tag>
                        </Tooltip>
                      </router-link>
                    </template>

                    <!-- 游戏中 -->
                    {{ $t('detail.info.gaming') }}

                    <Tag type="border" color="orange"
                         v-for="(methods, methodsIndex) in l.cheatMethods"
                         :key="methodsIndex">
                      <Poptip trigger="hover" :transfer="true" word-wrap width="200"
                              :content='$t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".describe")'>
                        {{ $t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".title") }}
                      </Poptip>
                    </Tag>
                  </Col>
                  <Col align="right">
                    <Time :time="l.createTime" v-if="l.createTime" type="datetime"></Time>
                  </Col>
                </Row>
              </div>

              <template v-if="l.videoLink">
                <Row :gutter="10" type="flex" align="middle" v-for="(link, linkindex) in l.videoLink"
                     :key="linkindex">
                  <Col class="user-select-none">
                    <Tag size="default" color="geekblue">{{ $t('detail.info.videoLink') }}</Tag>
                  </Col>
                  <Col style="max-width: 60%">
                          <span style="display: block;white-space: nowrap; overflow: hidden;text-overflow: ellipsis;">
                            <a :href="link.href" target="_blank">
                              <span style="opacity: .8" v-if="link.href">
                                <htmllink :href="encodeURI(link.href)" :text="encodeURI(link.href)"></htmllink>
                              </span>
                            </a>
                          </span>
                  </Col>
                  <Col flex="1">
                    <Divider dashed style="margin: 0;min-width: 100px"></Divider>
                  </Col>
                  <Col class="user-select-none">
                    {{ linkindex + 1 }}
                  </Col>
                </Row>
              </template>

              <HtmlWidget class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"
                          :html="l.content" v-if="l.content"></HtmlWidget>
            </div>
            <!-- 举报:any E -->

            <!-- 申诉:any S -->
            <div :id="`floor-${l.id}`" v-if="l.type === 'banAppeal'" class="timeline-content">
              <div class="timeline-time">
                <Row>
                  <Col flex="auto">
                    <router-link :to="{name: 'account', params: {uId: `${l.byUserId}`}}">
                      <BusinessCard :id="l.byUserId">
                        <u><b>{{ l.username || l.byUserId }}</b></u>
                      </BusinessCard>
                    </router-link>

                    {{ $t('detail.appeal.info.content') }}

                    <Tag>
                      {{
                        handleTimeLineContent(l.content).appealType ? handleTimeLineContent(l.content).appealType : 'none'
                      }}
                    </Tag>

                    <BusinessCard :id="l.originUserId">
                      <router-link :to="{name: 'cheater', ouid: `${l.originUserId}`}">
                        <u>{{ l.cheaterGameName }}</u>
                      </router-link>
                    </BusinessCard>

                    <router-link :to="{name: 'cheater', query: {game: `${l.cheatGame}`} }" v-if="l.cheatGame">
                      <Tooltip :content="$t('basic.games.' + l.cheatGame)">
                        <Tag type="border">
                          <img height="12"
                               :src="require('/src/assets/images/games/' + l.cheatGame + '/logo.png')"/>
                        </Tag>
                      </Tooltip>
                    </router-link>
                  </Col>

                  <Col>
                    <Time :time="l.createTime" v-if="l.createTime" type="datetime"></Time>
                    <Divider type="vertical"/>
                    <Tag type="border" color="primary">
                      {{ $t('detail.appeal.deal.stats.' + (l.appealStatus ? l.appealStatus : 'unprocessed')) }}
                    </Tag>
                  </Col>
                </Row>
              </div>
              <HtmlWidget :html="isValidJson(l.content) ? handleTimeLineContent(l.content).content : l.content"
                          v-if="l.content"
                          class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"></HtmlWidget>
            </div>
            <!-- 申诉:any E -->

            <!-- 认为:any S -->
            <div :id="`floor-${l.id}`" v-if="l.type === 'verify' || l.type === 'judgement'"
                 class="timeline-content bookmark">
              <div class="timeline-time">
                <Row>
                  <Col flex="1">
                    <router-link :to="{name: 'account', params: {uId: `${l.byUserId}`}}">
                      <BusinessCard :id="l.byUserId">
                        <u><b>{{ l.username || l.byUserId }}</b></u>
                      </BusinessCard>
                    </router-link>

                    {{ $t('detail.info.judge') }}

                    <Poptip trigger="hover" :transfer="true" word-wrap width="200"
                            :content="$t(`basic.action.${util.queryAction(l.judgeAction)}.describe`)">
                      <Tag color="warning">
                        {{ $t(`basic.action.${util.queryAction(l.judgeAction)}.text`) }}
                      </Tag>
                    </Poptip>

                    <template v-if="l.cheatGame">
                      <!-- 在 -->
                      {{ $t('detail.info.inGame') }}

                      <Tooltip :content="$t('basic.games.' + l.cheatGame)">
                        <Tag type="border">
                          <img height="12"
                               :src="require('/src/assets/images/games/' + l.cheatGame + '/logo.png')"/>
                        </Tag>
                      </Tooltip>
                    </template>

                    <!-- 作弊方式 -->
                    <template v-if="l.cheatMethods && l.cheatMethods.length > 0">
                      {{ $t('detail.info.cheatMethod') }}

                      <Tag type="border" color="orange"
                           v-for="(methods, methodsIndex) in l.cheatMethods"
                           :key="methodsIndex">
                        <Poptip trigger="hover" :transfer="true" word-wrap width="200"
                                :content='$t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".describe")'>
                          {{ $t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".title") }}
                        </Poptip>
                      </Tag>
                    </template>
                  </Col>
                  <Col align="right">
                    <Time v-if="l.createTime" :time="l.createTime" type="datetime"></Time>
                  </Col>
                </Row>
              </div>

              <HtmlWidget :html="l.content" v-if="l.content"
                          class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"></HtmlWidget>
            </div>
            <!-- 认为:any E -->

            <!-- 回复:any S -->
            <div :id="`floor-${l.id}`" v-if="l.type === 'reply'" class="timeline-content">
              <div class="timeline-time">
                <Row>
                  <Col flex="1">
                    <router-link :to="{name: 'account', params: {uId: `${l.byUserId}`}}">
                      <BusinessCard :id="l.byUserId">
                        <u><b>{{ l.username || l.byUserId }}</b></u>
                      </BusinessCard>
                    </router-link>

                    {{ $t('basic.button.reply') }}
                  </Col>
                  <Col align="right">
                    <Time v-if="l.createTime" :time="l.createTime" type="datetime"></Time>
                  </Col>
                </Row>
              </div>

              <div class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover">
                <template v-if="l.quote">
                  <div @click="onFloor(`floor-${l.quote.id}`)"
                       class="timeline-description timeline-reply-description user-select-none ivu-card ivu-card-bordered ivu-card-dis-hover">
                    <Row type="flex" align="middle" class="timeline-reply-description-title">
                      <Col flex="1">
                        <BusinessCard :id="l.quote.byUserId">
                          <p>
                            <u><b>{{ l.quote.username }}</b></u>
                          </p>
                        </BusinessCard>
                        :
                      </Col>
                      <Col>
                        <Time :time="l.quote.createTime" type="datetime"></Time>
                      </Col>
                    </Row>
                    <Html
                        :html="l.quote.content.length > 80 ? `${l.quote.content.substr(0, 80)}...` : l.quote.content"></Html>
                  </div>
                </template>

                <HtmlWidget :html="l.content" v-if="l.content"></HtmlWidget>
              </div>
            </div>
            <!-- 回复:any E -->

            <Row class="timeline-content-footer" type="flex" align="middle">
              <Col flex="auto" v-if="l.type != 'historyUsername'">
                <template v-if="isLogin">
                  <!-- 禁言 -->
                  <template v-if="isSuper">
                    <Tooltip placement="top" v-if="!l.isMute">
                      <Button size="small" @click.native="showMuteAlert(l.byUserId)">
                        <Icon type="md-mic" title="mute user"/>
                      </Button>
                      <div slot="content">
                        disable permission to reply
                      </div>
                    </Tooltip>
                    <Button size="small" v-else @click.native="muteUser('remove', l.byUserId)">
                      <Icon type="md-mic-off" title="remove mute"/>
                    </Button>
                    <Divider type="vertical"/>
                  </template>
                  <!-- 回复 -->
                  <Button size="small"
                          v-voice-button
                          @click="handleReply(l.floor || index, l.byUserId)">
                    {{ $t('basic.button.reply') }}
                  </Button>
                  <Divider type="vertical"/>
                </template>

                <!-- 申诉操作 -->
                <template v-if="isLogin && isAdmin && l.type === 'banAppeal'">
                  <Button size="small" @click="openAppealDealModal(l.id)">
                    {{ $t('basic.button.dealAppeal') }}
                  </Button>
                  <Divider type="vertical"/>
                </template>

                <Poptip width="400" transfer>
                  <Button size="small" v-voice-button>
                    <Icon type="md-share"/>
                  </Button>
                  <div slot="content">
                    <Form :label-width="40" label-position="left">
                      <FormItem label="Url">
                        <Input :value="getShareFloor(l.id)" :autosize="{minRows: 2,maxRows: 2}" type="textarea"
                               readonly v-if="l.id"></Input>
                      </FormItem>
                      <FormItem label="Code">
                        <Input :value="`{floor:${l.id}}`" readonly v-if="l.id"></Input>
                      </FormItem>
                      <FormItem label="" v-if="l.id">
                        <Card dis-hover :padding="5">
                          <Html :html="`<p>{floor:${l.id}}</p>`" v-if="l.id"/>
                        </Card>
                      </FormItem>
                    </Form>
                  </div>
                </Poptip>
              </Col>
              <Col align="right" class="user-select-none" v-if="l.type != 'historyUsername'">
                # {{ (timeline.skip * timeline.limit) - timeline.limit + l.index + 1}}-<u><span style="opacity: .4">{{ l.id }}</span></u>
              </Col>
            </Row>

            <Divider v-if="index < timelineList.length - 1"></Divider>
          </TimelineItem>
        </div>

        <div align="center">
          <Page :page-size="timeline.limit"
                :current="timeline.page"
                :total="timeline.total"
                @on-change="handlePageChange"
                simple
                class="page"
                size="small"/>
          <br>
        </div>

        <!-- 用户回复 S -->
        <div class="ivu-card ivu-card-bordered ivu-card-dis-hover" id="reply" v-if="isLogin">
          <div class="ivu-card-body">
            <Alert show-icon>{{ $t('detail.info.appealManual1') }}</Alert>
            <Textarea v-model="reply.content"
                      style="margin: 0 -16px;"
                      ref="replyTextarea"
                      :height="'120px'"
                      :placeholder="$t(`detail.info.giveOpinion`)"></Textarea>
          </div>
          <div class="ivu-card-body">
            <Row :gutter="10">
              <Col :xs="{span: 24}" :lg="{span: 12}">
                <Input type="text" size="large" v-model="reply.captcha"
                       maxlength="4"
                       :placeholder="$t('captcha.title')">
                  <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                    <Captcha :id="'replyPlayerCaptcha'" ref="replyPlayerCaptcha"></Captcha>
                  </div>
                </Input>
              </Col>
              <Col :xs="{span: 24, push: 0}" :lg="{span: 8, push: 7}">
                <ButtonGroup>
                  <Button type="primary"
                          size="large"
                          v-voice-button
                          :long="isMobile"
                          :loading="replySpinShow"
                          :disabled="!reply.content"
                          @click.stop.prevent="onReply">
                    {{ $t('basic.button.reply') }}
                  </Button>
                  <Button size="large" type="dashed">
                    <Poptip word-wrap width="280" trigger="hover" transfer>
                      <Icon type="ios-help-buoy"/>
                      <div slot="content">
                        <span>{{ $t('detail.info.replyManual1') }}</span>
                        <b><a href="https://sm.ms/" target="_blank">{{
                            $t('detail.info.uploadPicButton')
                          }}</a></b>，
                        <span>{{ $t('detail.info.replyManual2') }}</span>
                      </div>
                    </Poptip>
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </div>
        </div>
        <Alert type="warning" show-icon v-else>
          <template slot="desc">
            {{ $t('detail.info.replyManual3') }}
          </template>
        </Alert>
        <!-- 用户回复 E -->
      </Col>

      <!-- 申诉按钮 -->
      <Col :xs="{span: 23, push: 1}" :lg="{span: 6, push: 0}" order="1" class="mobile-hide"
           v-if="appeal.disable">
        <Button type="primary"
                v-voice-button
                @click="appeal.show = true"
                :disabled="!isLogin || (cheater.status != 1)">
          {{ $t('detail.info.appeal') }}
        </Button>
        <p><br>{{ $t('detail.appeal.describe') }}</p>
      </Col>
    </Row>

    <div v-if="cheater.status === '1'">
      <Divider/>
    </div>

    <br>
    <Spin size="large" fix v-show="spinShow">
      <Icon type="ios-loading" size="50" class="spin-icon-load"></Icon>
    </Spin>
  </Card>
</template>

<script setup>
import Application from "/src/assets/js/application";

export default new Application({
  props: {
    isMobile: Boolean,
    spinShow: Boolean,
    i: Object
  },
  data () {
    return {

    }
  }
});
</script>

<style scoped lang="less">

</style>
