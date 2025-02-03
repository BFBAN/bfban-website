<template>
  <div class="container">
    <div class="content">
      <template v-if="!isFull">
        <br>
        <Row>
          <Col :xs="{push: 1}" :lg="{push: 0}">
            <Breadcrumb>
              <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
              <BreadcrumbItem :to="{name: 'player_list'}">{{ $t("list.title") }}</BreadcrumbItem>
              <BreadcrumbItem>{{ $t("detail.info.cheatersInfo") }}</BreadcrumbItem>
            </Breadcrumb>
          </Col>
        </Row>
        <br>
      </template>

      <AdsGoogle id="7930151828"></AdsGoogle>
      <br>

      <Card id="getSharePicture" v-if="isCheaterExist" dis-hover>
        <Row :gutter="10">
          <Col :xs="{span: 22, pull: 1, push: 1}" :lg="{span: 4, pull: 0, push: 0}">
            <div class="default-avatar-box">
              <!-- EA头像 S -->
              <Avatar shape="square"
                      class="default-avatar"
                      :src="cheater.avatarLink"
                      :size="'100%'"
                      :title="$t('detail.info.originAvatar')"
                      v-if="cheater.avatarLink">
              </Avatar>
              <template v-else>
                <Avatar shape="square"
                        class="default-avatar"
                        :size="180">
                </Avatar>
              </template>
              <!-- EA头像 E -->
            </div>
            <br class="desktop-hide">
          </Col>
          <Col :xs="{span: 24, pull: 0, push: 0}" :lg="{span: 20, pull: 0, push: 0}"
               flex="1"
               class="detail-userinfo-card">

            <Row class="" justify="space-between">
              <Col span="24">
                <Row :gutter="10" type="flex" justify="space-between" align="top">
                  <Col :flex="isMobile ? 1 : null" :xs="isMobile ? {span: 24, order:1} : {}"
                       :lg="isMobile ? {span: 12, order: 1} : {}" class="tags">
                    <cheater-status-view :status="cheater.status"/>

                    <!-- 被举报的游戏 S -->
                    <router-link :to="{name: 'player_list', query: { game: cheater.games,status: -1 }}"
                                 v-if="cheater.games">
                      <Poptip trigger="hover"
                              v-for="(game,gameindex) in cheater.games" :key="gameindex">
                        <Tag type="border" :alt="$t('detail.info.reportedGames')">
                          <img height="12" :src="require('/src/assets/images/games/' + game + '/logo.png')"/>
                        </Tag>
                        <div slot="content">{{ $t(`basic.games.${game}`) }}</div>
                      </Poptip>
                    </router-link>

                    <!-- 被举报的类型 E -->
                    <template v-if="cheater.cheatMethods && cheater.cheatMethods.length > 0">
                      <Tag color="warning" v-for="(method_item, method_index) in cheater.cheatMethods"
                           :key="method_index">
                        {{ $t("cheatMethods." + util.queryCheatMethodsGlossary(method_item) + ".title") }}
                      </Tag>
                    </template>

                    <Dropdown placement="bottom-end" class="desktop-hide">
                      <ButtonGroup type="button">
                        <Button size="small" type="primary" icon="md-more"></Button>
                      </ButtonGroup>
                      <DropdownMenu slot="list" style="min-width: 200px">
                        <DropdownItem @click.native.stop="$router.push({name: 'cheater_app'})" v-if="!isMobile">
                          <Icon type="md-qr-scanner"/>
                          {{ $t('detail.info.app_qr.title') }}
                        </DropdownItem>
                        <DropdownItem @click.native.stop="updateCheaterModal = true">
                          <Icon type="md-cloud"/>
                          {{ $t('detail.info.updateButton') }}
                        </DropdownItem>
                        <DropdownItem :divided="true" @click.native.stop="$router.push({name: 'cheater_share'})">
                          <!-- 分享 share S -->
                          <Icon type="md-share"/>
                          {{ $t('share.title') }}
                          <!-- 分享 share E -->
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Col>
                  <template v-if="!isFull">
                    <Col :xs="isMobile ? {span: 24} : {}" :lg="isMobile ? {span: 12} : {}"
                         class="html2canvas-ignore buttons">
                      <!-- Subscribes S -->
                      <template v-if="isLogin">
                        <Dropdown placement="bottom-end">
                          <ButtonGroup type="button">
                            <Button @click="onSubscribes" :loading="subscribes.load"
                                    :disabled="!$store.state.configuration.subscribes">
                              <template v-if="subscribes.static">
                                <Icon type="md-notifications-off" size="20"/>
                                {{ $t('detail.subscribes.cancelTrack') }}
                              </template>
                              <template v-else>
                                <Icon type="md-notifications-outline" size="20"/>
                                {{ $t('detail.subscribes.tracking') }}
                              </template>
                            </Button>
                          </ButtonGroup>
                          <DropdownMenu slot="list" v-if="$store.state.configuration.subscribes">
                            <DropdownItem :selected="!subscribes.static">
                              <h4>
                                <Icon type="md-notifications-outline"/>
                                {{ $t('detail.subscribes.tracking') }}
                              </h4>
                              <p>{{ $t('detail.subscribes.trackingDescribe') }}</p>
                            </DropdownItem>
                            <DropdownItem :selected="subscribes.static">
                              <h4>
                                <Icon type="md-notifications-off"/>
                                {{ $t('detail.subscribes.cancelTrack') }}
                              </h4>
                              <p>{{ $t('detail.subscribes.cancelTrackDescribe') }}</p>
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                        <Divider type="vertical"/>
                      </template>
                      <!-- Subscribes E -->

                      <Dropdown placement="bottom-end" class="mobile-hide">
                        <ButtonGroup type="button">
                          <Button shape="circle-outline" size="default" icon="md-more"></Button>
                        </ButtonGroup>
                        <DropdownMenu slot="list" style="min-width: 200px">
                          <DropdownItem @click.native.stop="$router.push({name: 'cheater_app'})" v-if="!isMobile">
                            <Icon type="md-qr-scanner"/>
                            {{ $t('detail.info.app_qr.title') }}
                          </DropdownItem>
                          <DropdownItem @click.native.stop="updateCheaterModal = true">
                            <Icon type="md-cloud"/>
                            {{ $t('detail.info.updateButton') }}
                          </DropdownItem>
                          <DropdownItem :divided="true" @click.native.stop="$router.push({name: 'cheater_share'})">
                            <!-- 分享 share S -->
                            <Icon type="md-share"/>
                            {{ $t('share.title') }}
                            <!-- 分享 share E -->
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </Col>
                  </template>
                  <Col :xs="{span: 24}" :lg="{span: 24}">
                    <Dropdown :transfer="isMobile" placement="bottom-start">
                      <h1>
                        <ExposedName>
                          {{ cheater.originName || 'User Name' }}
                        </ExposedName>
                      </h1>

                      <!-- 历史ID -->
                      <DropdownMenu slot="list"
                                    :style="isMobile ? '' : 'min-width: 630px'"
                                    v-if="cheater && cheater.history && cheater.history.length >= 0">
                        <Row style="margin: 5px 18px">
                          <Col flex="1">
                            <b>{{ $t('detail.info.historyID') }}</b>
                          </Col>
                          <Col>
                            <Button size="small" @click="updateCheaterModal = true;">
                              {{ $t('detail.info.updateButton') }}
                            </Button>
                          </Col>
                        </Row>
                        <div style="overflow: auto; max-height: 80vh">
                          <div v-for="(origin, origin_index) in cheater.history" :key="origin_index">
                            <Row :gutter="5" type="flex" align="middle"
                                 style="padding: 0 16px;margin: 10px 0 ; width:100%">
                              <Col class="mobile-hide">
                                <TimeView :time="origin.fromTime">
                                  <Time :time="origin.fromTime" v-if="origin.fromTime" type="datetime"></Time>
                                </TimeView>
                              </Col>
                              <Col flex="1" class="mobile-hide">
                                <Divider dashed style="margin: 0"/>
                              </Col>
                              <Col>
                                <ExposedName>
                                  {{ origin.originName }}
                                </ExposedName>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </DropdownMenu>
                    </Dropdown>
                  </Col>
                </Row>
              </Col>
              <Col span="24">
                <Row :gutter="10" class="cards">
                  <Col :xs="{span: 12}" :sm="{span: 12}" :md="{span: 6}" :lg="{span: 4}">
                    <Poptip transfer width="400" placement="bottom-start">
                      <Card :padding="isMobile ? 5 : 10" dis-hover>
                        <h3>{{ cheater.id || 0 }}</h3>
                        <span>IDs <Icon type="md-more"/></span>
                      </Card>
                      <div slot="content">
                        <Row :gutter="10" type="flex" align="middle">
                          <Col>id:</Col>
                          <Col flex="1">
                            <Divider dashed/>
                          </Col>
                          <Col>{{ cheater.id || 'cheater id' }}</Col>
                        </Row>
                        <Row :gutter="10" type="flex" align="middle">
                          <Col>User id
                            <Poptip transfer :content="$t(`report.labels.types.originUserId.hint`)">
                              <Icon type="md-help"></Icon>
                            </Poptip>
                            :
                          </Col>
                          <Col flex="1">
                            <Divider dashed/>
                          </Col>
                          <Col>{{ cheater.originUserId || 'user id' }}</Col>
                        </Row>
                        <Row :gutter="10" type="flex" align="middle">
                          <Col>Persona id
                            <Poptip transfer :content="$t(`report.labels.types.originPersonaId.hint`)">
                              <Icon type="md-help"></Icon>
                            </Poptip>
                            :
                          </Col>
                          <Col flex="1">
                            <Divider dashed/>
                          </Col>
                          <Col>{{ cheater.originPersonaId || 'persona id' }}</Col>
                        </Row>
                      </div>
                    </Poptip>
                  </Col>
                  <Col :xs="{span: 12}" :sm="{span: 12}" :md="{span: 6}" :lg="{span: 4}">
                    <Card :padding="isMobile ? 5 : 10" dis-hover>
                      <!-- 浏览次数 -->
                      <h3>{{ cheater.viewNum || 0 }}</h3>
                      <span>{{ $t('detail.info.viewTimes') }}</span>
                    </Card>
                  </Col>
                  <Col :xs="{span: 12}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 4}">
                    <Card :padding="isMobile ? 5 : 10" dis-hover>
                      <!-- 回复次数 -->
                      <h3>{{ cheater.commentsNum || 0 }}</h3>
                      <span>{{ $t('basic.button.reply') }}</span>
                    </Card>
                  </Col>
                  <Col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 12}" :lg="{span: 6}">
                    <Card :padding="isMobile ? 5 : 10" dis-hover>
                      <!-- 第一次被举报时间 -->
                      <h3>
                        <TimeView :time="cheater.createTime">
                          <Time v-if="cheater.createTime" :time="cheater.createTime" type="datetime"></Time>
                        </TimeView>
                      </h3>
                      <span>{{ $t('detail.info.firstReportTime') }}</span>
                    </Card>
                  </Col>
                  <Col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 12}" :lg="{span: 6}">
                    <Card :padding="isMobile ? 5 : 10" dis-hover>
                      <!-- 最近更新时间 -->
                      <h3>
                        <TimeView :time="cheater.updateTime">
                          <Time v-if="cheater.updateTime" :time="cheater.updateTime" type="datetime"></Time>
                        </TimeView>
                      </h3>
                      <span>{{ $t('detail.info.recentUpdateTime') }}</span>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <template v-if="!isFull">
        <br>
        <Card id="recordLink" dis-hover>
          <h2><a href="javascript:void(0)">#</a> {{ $t('detail.info.gameScores') }}</h2>
          <br>
          <!-- 战绩链接 S -->
          <RecordLink ref="recordLink" v-show="cheater.originUserId"></RecordLink>
          <!-- 战绩链接 E -->
        </Card>
        <br>
        <Card id="timeline" style="overflow: hidden" dis-hover :padding="isMobile ? 15 : 20">
          <Row :gutter="20" slot="title" type="flex" justify="center" align="middle">
            <Col flex="1" class="mobile-hide">
              {{ $t('detail.info.timeLine') }}
              <Tag type="border" v-if="$refs.timeline && $refs.timeline.timeline.total">
                {{ $refs.timeline.timeline.total || 0 }}
              </Tag>
            </Col>
            <Col>
              <Row>
                <Col v-if="$refs.timeline">
                  <!-- 时间轴筛选 S -->
                  <ButtonGroup type="button">
                    <Select v-model="$refs.timeline.timeline.seeType" size="small"
                            @on-change="() => $refs.timeline.onUpdateSeeType()">
                      <Option v-for="(item, index) in $refs.timeline.timeline.seeTypeList"
                              :value="item.value"
                              :key="index">
                        {{ $t('detail.timeline.' + item.label) }}
                      </Option>
                    </Select>
                  </ButtonGroup>
                  <Divider type="vertical"/>
                  <RadioGroup v-model="$refs.timeline.timeline.order" @on-change="() =>  $refs.timeline.getTimeline()"
                              type="button" size="small">
                    <Radio label="asc">
                      <span class="iconfont md-asc"></span>
                    </Radio>
                    <Radio label="desc">
                      <span class="iconfont md-desc"></span>
                    </Radio>
                  </RadioGroup>
                  <Divider type="vertical"/>
                  <!-- 时间轴筛选 E -->
                </Col>
                <Col class="mobile-hide">
                  <Page :page-size="$refs.timeline.timeline.limit"
                        :current="$refs.timeline.timeline.page"
                        :total="$refs.timeline.timeline.total"
                        v-if="$refs.timeline"
                        @on-change="$refs.timeline.handlePageChange"
                        simple
                        class="page"
                        size="small"/>
                </Col>
                <Col>
                  <Divider type="vertical" class="mobile-hide"/>
                  <Button size="small" type="dashed" @click="() => $refs.timeline.getTimeline()">
                    <Icon type="md-refresh"/>
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col :xs="{span: 23, push: 1}" :lg="appeal.disable ? {span: 7, push: 0} : {span: 1, push: 0}"
                 class="mobile-hide">
              <template v-if="appeal.disable">
                <Button @click="onLeftAppealPlan" size="small">
                  <Icon type="md-contract"/>
                </Button>
              </template>
              <template v-else>
                <Button @click="onLeftAppealPlan" size="small">
                  <Icon type="md-expand"/>
                </Button>
              </template>
            </Col>
          </Row>
          <Row :gutter="20" type="flex">
            <Col :xs="{span: 24, push: 0, pull: 0}" :lg="appeal.disable ? {span: 17, push: 0} : {span: 24, push: 0}"
                 order="1" class="tabs-style">

              <div class="content">
                <TimelineView :id="getParamsIds('personaId')"
                              @click-update-name="() => updateCheaterModal = true"
                              @click-reply="(id,byUserId) => handleReply(id, byUserId)"
                              ref="timeline"/>
              </div>

              <!-- 用户回复 S -->
              <Card :padding="0" id="reply" dis-hover v-if="!isLogin">
                <div class="ivu-card-body">
                  <TextareaView v-model="reply.content"
                                style="margin: -10px -16px;"
                                ref="replyTextarea"
                                :toolbar="[['bold'], ['link', 'image']]"
                                :height="'150px'"
                                :maxlength="5000"
                                :showMaxlengthLabel="true"
                                :placeholder="$t('detail.info.giveOpinion')">
                    <template v-slot:footer>
                      <div class="ivu-card-body">
                        <Row :gutter="10">
                          <Col :xs="{span: 14}" :lg="{span: 12}">
                            <Captcha ref="captcha" size="large"
                                     @getCaptchaData="(value) => getCaptchaData('captcha',value)"></Captcha>
                          </Col>
                          <Col :xs="{span: 10, push: 0}" :lg="{span: 12, push: 0}">
                            <Row type="flex" justify="end" align="middle">
                              <Col>
                                <ButtonGroup>
                                  <Button type="primary"
                                          size="large"
                                          v-voice-button
                                          :loading="replySpinShow"
                                          :disabled="!reply.content"
                                          @click.stop.prevent="$refs.timeline.onReply('default')">
                                    {{ $t('basic.button.reply') }}
                                  </Button>
                                  <Button size="large">
                                    <Poptip word-wrap width="280" trigger="hover" transfer>
                                      <Icon type="ios-help-buoy"/>
                                      <div slot="content">
                                        <span>{{ $t('detail.info.replyManual1') }}</span>
                                        <b>
                                          <a href="https://sm.ms/" target="_blank">{{
                                              $t('detail.info.uploadPicButton')
                                            }}</a>
                                        </b>，
                                        <span>{{ $t('detail.info.replyManual2') }}</span>
                                      </div>
                                    </Poptip>
                                  </Button>
                                </ButtonGroup>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </div>
                    </template>
                  </TextareaView>
                </div>
              </Card>
              <Alert type="warning" v-else>
                <Row :gutter="5" type="flex" align="middle">
                  <Col flex="1">
                    <Icon type="ios-alert" color="#FF9800"></Icon>
                    {{ $t('detail.info.replyManual3') }}
                  </Col>
                  <Col>
                    <Button type="warning" size="small" ghost :to="{name: 'signin'}">
                      {{ $t('signin.title') }}
                    </Button>
                  </Col>
                </Row>
              </Alert>
              <!-- 用户回复 E -->
            </Col>

            <Col :xs="{span: 23, push: 0}" :lg="{span: 7, push: 0}" order="2" class="mobile-hide"
                 v-if="appeal.disable">
              <AdsGoogle id="1760339032">
                <br>
              </AdsGoogle>

              <!-- 申诉按钮 -->
              <Card dis-hover>
                <h1 style="text-align: center">📥</h1>
                <p>{{ $t('detail.info.appealManual1') }}</p>
                <br>
                <p>{{ $t('detail.appeal.describe') }}</p>
                <br>
                <div>
                  <Tag :size="'default'" type="border" color="error">{{ $t(`basic.status.1.text`) }}</Tag>
                  <Tag :size="'default'" type="border">{{ $t(`basic.status.2.text`) }}</Tag>
                </div>
              </Card>
              <br>

              <Row>
                <Col flex="1">
                  <b>{{ $t('sitestats.trend') }}</b>
                </Col>
                <Col>
                  <i>{{ $t('sitestats.timeRange.weekly') }}</i>
                </Col>
              </Row>

              <TrendWidget></TrendWidget>
            </Col>
          </Row>

          <div v-if="cheater.status === '1'">
            <Divider/>
          </div>
        </Card>
        <br v-if="isAdmin">

        <Card dis-hover v-if="isAdmin">
          <JudgementActionView :cheater="cheater"></JudgementActionView>
        </Card>

        <div v-if="!isCheaterExist">
          <Empty></Empty>
        </div>
      </template>
    </div>

    <br>
    <AdsGoogle id="6674125493" style="margin-bottom: 8px;"></AdsGoogle>

    <template v-if="!isFull">
      <Affix :top="100">
        <Card dis-hover class="detail-affix">
          <a href="javascript:void(0)" @click="onRollingNode(0)">
            <Icon type="md-arrow-round-up" size="30"/>
          </a>
          <Dropdown placement="left-start" trigger="contextMenu" @on-click="onRollingDropdowns">
            <a href="javascript:void(0)" v-if="isLogin" @click="onRollingComment">
              <Icon type="md-chatboxes" size="30"/>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="recordlink">{{ $t('detail.info.gameScores') }}</DropdownItem>
              <DropdownItem name="timeline">{{ $t('detail.info.timeLine') }}</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <a href="javascript:void(0)" @click="() => $refs.timeline && $refs.timeline.getTimeline()">
            <Icon type="md-refresh" size="30"/>
          </a>
          <template v-if="isLogin && isAdmin">
            <Divider></Divider>
            <a href="javascript:void(0)" @click="onWorkflowAddPlayer">
              <Icon type="md-hammer" size="25"/>
            </a>
          </template>
        </Card>
      </Affix>

      <!-- 用户-小窗口回复 S -->
      <Modal v-model="replyModal">
        <div slot="header">
          <b>{{ `${$t('basic.button.reply')}` }}</b>
          <Divider type="vertical"></Divider>
          <BusinessCard :id="reply.toReplyId"
                        v-if="reply.toReplyId">
            <Icon type="md-open"></Icon>
          </BusinessCard>
        </div>
        <Form ref="replyForm" style="margin: -17px;" v-if="isLogin">
          <TextareaView v-model="reply.miniModeContent"
                        ref="replyMiniModeTextarea"
                        :toolbar="[['bold'], ['link', 'image']]"
                        :height="'320px'"
                        :maxlength="5000"
                        :showMaxlengthLabel="true"
                        :placeholder="$t('detail.info.giveOpinion')">
          </TextareaView>
        </Form>
        <div v-else>{{ $t('detail.info.replyManual4') }}</div>

        <div slot="footer">
          <Row :gutter="30">
            <Col flex="1">
              <Captcha ref="captcha"
                       @getCaptchaData="(value) => getMiniCaptchaData('miniModeCaptcha', value)"></Captcha>
            </Col>
            <Col>
              <Button @click="cancelReply" v-voice-button>{{ $t('basic.button.cancel') }}</Button>
              <Button @click="onReply('mini')"
                      type="primary"
                      :disabled="(!reply.miniModeContent || !reply.miniModeCaptcha) || false"
                      :loading="replySpinShow"
                      v-voice-button>
                {{ $t('basic.button.submit') }}
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
      <!-- 用户-小窗口回复 E -->

      <!-- Upload Player S -->
      <Modal v-model="updateCheaterModal">
        <div sort="title">
          <PrivilegesTag :data="['admin','super','root','dev','bot']"></PrivilegesTag>
        </div>
        <div>
          <Card style="margin: 2.5rem 0 1rem 0;" dis-hover>
            <Row :gutter="16" type="flex" justify="center" align="middle">
              <Col>
                <Icon type="md-cloud" color="#535353" size="40"/>
              </Col>
              <Col>
                <Icon type="md-code-working" color="#aaa" size="20"/>
              </Col>
              <Col>
                <Icon type="ios-albums" color="#535353" size="40"/>
              </Col>
            </Row>
          </Card>
          <br/>
          <p class="hint">
            {{ $t('detail.info.description1') }}，
            <Tag>{{ $t('detail.info.updateButton') }}</Tag>
            <span>{{ $t('detail.info.description2') }}</span>
          </p>
          <p class="hint"> {{ $t('detail.info.description3') }} </p>
          <p class="hint"> {{ $t('detail.info.description4') }} </p>
        </div>
        <div slot="footer">
          <Row :gutter="16">
            <Col>
              <Button type="dashed" size="large" long @click.prevent="updateCheaterModal = false;">
                {{ $t('basic.button.cancel') }}
              </Button>
            </Col>
            <Col flex="1">
              <Button type="primary" size="large"
                      :loading="updateUserInfoSpinShow"
                      :disabled="updateUserInfoSpinShow"
                      v-voice-button
                      long @click.prevent="updateCheaterInfo">
                {{ $t('detail.info.updateButton') }}
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
      <!-- Upload Player E -->
    </template>
  </div>
</template>

<script>
import {account_storage, api, application, http, http_token, storage, time, util,} from '../assets/js/index'
import {formatTextarea} from "@/mixins/common";

import AdsGoogle from "@/components/ads/google/index.vue";
import Empty from '@/components/Empty.vue'
import TextareaView from "@/components/textarea/index.vue";
import BusinessCard from "@/components/BusinessCard.vue";
import RecordLink from "@/components/RecordLink.vue";
import cheaterStatusView from "@/components/CheaterStatusView.vue";
import JudgementActionView from "@/components/judgementActionView.vue";
import Captcha from "@/components/captcha/index";
import TimeView from "@/components/TimeView.vue"
import TimelineView from "@/components/timeline/index.vue";
import HtmlCore from "@/components/Html";
import HtmlWidget from "@/components/HtmlWidget";
import Htmllink from "@/components/HtmlLink";
import PrivilegesTag from "@/components/PrivilegesTag";
import UserAvatar from "@/components/UserAvatar.vue"
import TrendWidget from "@/components/TrendWidget"
import ExposedName from "@/components/ExposedName.vue"

export default new application({
  data() {
    return {
      util,
      mute: {
        value: 0,
        id: '',
        isNoticeIntraStationUser: false,
        show: false
      },
      subscribes: {
        load: false,
        static: false
      },

      appeal: {
        load: false,
        disable: this.$store.state.configuration.detailLeftAppealPanel ?? false,
      },

      cheater: {
        originId: '',
        createTime: time.appStart(),
        updateTime: time.appStart(),
        isSubscribes: false
      },

      reply: {
        miniModeContent: '',
        miniModeCaptcha: {},
        cheaterId: '',
        userId: '',
        content: '',
        toReplyId: null,
        toUserId: '',
        captcha: {},
      },

      replyModal: false,
      replySpinShow: false,
      isCheaterExist: true,
      updateUserInfoSpinShow: false,
      updateCheaterModal: false
    }
  },
  components: {
    AdsGoogle,
    Empty,
    TextareaView,
    BusinessCard,
    RecordLink,
    cheaterStatusView,
    JudgementActionView,
    TimelineView,
    TimeView,
    Captcha,
    HtmlCore,
    HtmlWidget,
    Htmllink,
    PrivilegesTag,
    UserAvatar,
    TrendWidget,
    ExposedName,
  },
  watch: {
    '$route': 'loadData',
    'fastReply.selected': function () {
      this.verify.suggestion = '' + this.fastReply.selected.map(i => i);
    },
  },
  created() {
    this.http = http_token.call(this);
    this.loadData();
  },

  methods: {
    async loadData() {
      try {
        this.$Loading.start();

        // set Token Http mode
        this.http = http_token.call(this);

        // get Detail data
        await this.getPlayerInfo();

        // get Timeline data
        if (this.$refs.timeline) {
          await this.$refs.timeline.getPlayerInfo();
          await this.$refs.timeline.getTimeline();
        }

        this.$Loading.finish();
      } finally {
        this.$Loading.finish();
      }
    },
    /**
     * 追踪此玩家
     * 此项操作会存进账户配置字段内
     */
    checkPlayerSubscribes() {
      const {id} = this.cheater;

      if (!this.isLogin || !this.$store.state.configuration.subscribes) return;

      this.subscribes.load = true;
      this.http.post(api["user_isSubscribes"], {
        data: {id}
      }).then(res => {
        const d = res.data;
        if (res.data.success === 1)
          this.subscribes.static = d.data;
      }).finally((err) => {
        this.subscribes.load = false;
      });
    },
    /**
     * 追踪此玩家
     * 此项操作会存进账户配置字段内
     */
    async onSubscribes() {
      this.subscribes.load = true;

      switch (this.subscribes.static) {
        case false:
          await this.http.post(api["user_subscribes_add"], {
            data: {playerIds: [this.cheater.id]}
          }).then(res => {
            if (res.data.success === 1)
              this.subscribes.static = true;
          });
          break;
        case true:
          await this.http.post(api["user_subscribes_delete"], {
            data: {playerIds: [this.cheater.id]}
          }).then(res => {
            if (res.data.success === 1)
              this.subscribes.static = false;
          });
          break;
      }

      this.subscribes.load = false;
    },
    /**
     * 更新游览值
     */
    async onUpdateViewed() {
      let viewed = storage.local.get("viewed");
      const id = this.cheater.id;
      const historyTime = new Date().getTime();

      if (!id) return;
      // 校验,含id且1天内，则不更新游览值
      if (viewed != undefined && viewed.data?.value[id] < viewed.data?.value[id] + 24 * 60 * 60 * 1000)
        return;

      storage.local.set("viewed", viewed && viewed.data ? {
        ...viewed.data.value,
        [id]: historyTime
      } : {[id]: historyTime})

      // 创建完整 Object
      if (!(viewed && viewed.data && viewed.data.value)) {
        viewed = {
          data: {value: {}}
        }
      }

      await http.post(api["player_viewed"], {data: {data: {id}}});
      this.cheater.viewNum++;
    },
    /**
     * 获取基本字段
     * 从[url]中整理
     * @param {string} name
     * @returns {*|{dbId: *, userId: *, personaId: *}}
     */
    getParamsIds(name) {
      const object_id = this.$route.params.ouid.split('.');
      const object = {
        userId: object_id[1],
        personaId: object_id[0],
        dbId: object_id[2],
      };
      return name ? object[name] : object;
    },
    /**
     * 获取举报玩家档案
     */
    async getPlayerInfo() {
      const that = this;
      return new Promise(resolve => {
        let params = Object.assign({
          history: true
        }, {
          personaId: this.$route.params.ouid
        });

        // 旧网站URL, 兼容
        if (this.$route.query.oldUrl && this.$route.params.ouid) {
          params = Object.assign({
            history: true
          }, {
            userId: this.$route.params.ouid
          });
          delete params.personaId;
        }

        that.cheater = {};

        http.get(api["player"], {params}).then(res => {
          const d = res.data;

          if (d.success === 1) {
            // 历史名称排序
            d.data.history = d.data.history.sort(function (a, b) {
              let aTime = new Date(a.fromTime).getTime();
              let bTime = new Date(b.fromTime).getTime();
              return aTime > bTime ? 1 : -1;
            })

            that.cheater = d.data;
            that.$refs.recordLink.generateTable(this.cheater);

            document.title = document.title + ' - ' + this.cheater.originName + ' - ' + this.cheater.games.map(i => this.$i18n.t(`basic.games.${i}`));
            return;
          }

          switch (d.code) {
            case "player.bad":
            case "player.notFound":
              that.$router.push({name: 'player_list'})
              break;
          }

          that.$Message.info(this.$t('basic.tip.notFound'));
        }).finally(() => {
          that.onUpdateViewed();
          that.checkPlayerSubscribes();

          resolve()
        });
      })
    },
    /**
     * 获取验证码
     * @param value
     */
    getCaptchaData(id, value) {
      this.reply[id || 'captcha'] = value;
    },

    onRollingDropdowns(name) {
      switch (name) {
        case 'recordlink':
          this.onRollingRecordLink();
          break;
        case 'timeline':
          this.onRollingTimeline();
          break;
      }
    },
    /**
     * 滚动到评论文本框
     */
    onRollingComment() {
      const commentNode = document.getElementById('reply');

      this.onRollingNode(commentNode.offsetTop + commentNode.offsetHeight);
    },
    /**
     * 滚动到战绩
     */
    onRollingRecordLink() {
      const commentNode = document.getElementById('recordLink');

      this.onRollingNode(commentNode.offsetTop - 50);
    },
    /**
     * 滚动到时间轴
     */
    onRollingTimeline() {
      const commentNode = document.getElementById('timeline');

      this.onRollingNode(commentNode.offsetTop - 50);
    },
    /**
     * 玩家添加到工作流
     */
    onWorkflowAddPlayer() {
      const {query} = this.$route;
      this.$router.push({
        name: 'workflow_adds',
        query: {
          type: "persona",
          ids: this.cheater.originPersonaId,
          ...query
        }
      })
    },
    /**
     * 滚动位置
     * @param scrollTopNumber
     */
    onRollingNode(scrollTopNumber) {
      document.documentElement.scrollTop = scrollTopNumber;
    },
    /**
     * 主动更新玩家信息
     * update cheater
     */
    updateCheaterInfo() {
      if (!this.$store.state.user) {
        this.$Message.error(this.$i18n.t('detail.messages.signIn'));
        return;
      }

      this.updateUserInfoSpinShow = true;

      this.http.post(api["player_update"], {
        data: {personaId: this.cheater.originPersonaId}
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          const {cheaterGameName: originId, originUserId, avatarLink} = d.data.origin;

          this.cheater.originId = originId;
          this.cheater.originUserId = originUserId;
          this.cheater.avatarLink = avatarLink;

          this.$Message.success(this.$t(`basic.tip['${d.code}']`));
          return;
        }

        this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        }));
      }).finally(async () => {
        this.updateUserInfoSpinShow = false;
        this.updateCheaterModal = false;

        await this.getPlayerInfo()
        await this.$refs.timeline.getTimeline();
      });
    },
    /**
     * 右侧侧栏，申诉显示
     */
    onLeftAppealPlan() {
      this.appeal.disable = !this.appeal.disable;

      account_storage.updateConfiguration("detailLeftAppealPanel", this.appeal.disable);
    },


    /**
     * 用户评论/回复
     * @param {string} replyType
     */
    onReply(replyType = 'default') {
      const cheaterId = this.cheater.id;
      const {content = '', miniModeContent = '', captcha, miniModeCaptcha} = this.reply;
      let message = "";
      let data = {};

      if (this.$store.state.$userinfo && !(this.$store.state.$userinfo.origin && this.$store.state.$userinfo.origin.originUserId)) {
        this.$Message.error({content: this.$i18n.t("basic.tip.needBindEaAccount"), duration: 3});

        setTimeout(() => {
          this.$router.push({path: '/profile/information'})
        }, 3000)

        return
      }

      // 依照不同回复窗口模式来填充提交表单
      switch (replyType) {
        case "default":
          data = {
            data: {
              toPlayerId: cheaterId,
              content: formatTextarea(content),
            },
            captcha,
          };
          break;
        case "mini":
          data = {
            data: {
              toPlayerId: cheaterId,
              toCommentId: this.reply.toReplyId, // 楼中楼，填充回复的dbId
              content: formatTextarea(miniModeContent),
            },
            captcha: miniModeCaptcha,
          };
          break;
      }

      this.replySpinShow = true;
      this.http.post(api["player_reply"], {data}).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }));

          this.replyModal = false;
          this.reply.toReplyId = null;
          this.reply.content = "";
          this.reply.captcha = {};
          this.reply.miniModeContent = "";
          this.reply.miniModeCaptcha = {};

          // Actively update text
          if (this.$refs.replyTextarea)
            this.$refs.replyTextarea.updateContent('');
          if (this.$refs.replyMiniModeTextarea)
            this.$refs.replyMiniModeTextarea.updateContent('');

          return;
        }

        message = typeof d.message == 'object' ? d.message.forEach((i) => message += `${i.param}: ${i.msg}`) : this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        });
        this.$Message.error({content: message, duration: 10});
      }).finally(() => {
        this.replySpinShow = false;

        if (message.playSendVoice)
          message.playSendVoice();

        this.cancelReply(false);
        this.getPlayerInfo();
        this.$refs.timeline.getTimeline();
      });
    },
    /**
     * 展开回复小窗口
     * @param {string} replyId 楼层id
     * @param {string} userId 回复id
     */
    handleReply(replyId, userId) {
      console.log(replyId, userId)
      this.reply.toReplyId = replyId === null ? '' : replyId;
      this.reply.toUserId = userId === 'undefined' ? '' : userId;

      // open reply modal
      this.replyModal = true;
    },
    /**
     * 触发小窗口评论取消时
     * 重置前端评论内容值
     * @param {boolean} isOffMode
     */
    cancelReply(isOffMode = false) {
      if (isOffMode)
        this.replyModal = false;
      this.reply = Object.assign(this.reply, {
        miniModeContent: '',
        miniModeCaptchaUrl: {
          content: '',
          hash: '',
        }
      });
    },

  },

});
</script>

<style lang="less">
@import "@/assets/css/icon.less";
@import "@/assets/css/avatar.less";

.detail-userinfo-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;

  > div {
    display: flex;
    height: 100%;
    flex-wrap: wrap;
    align-content: space-between;
  }

  h1 {
    font-size: 2.2rem;
  }

  .cards .ivu-poptip,
  .cards .ivu-poptip-rel {
    width: 100%;
  }
}

.default-avatar-box {
  text-align: center;
  overflow: hidden;
}

.detail-affix {
  position: fixed !important;
  top: 30%;
  transform: translateY(-30%) !important;;
  z-index: 100;

  a {
    display: block;
    padding: 10px 5px;
  }
}

@media screen and (min-width: 2048px) {
  .detail-affix {
    right: calc(50% - (1400px / 2) - 85px) !important;
  }
}

@media screen and (min-width: 1024px) {
  .detail-affix {
    right: calc(50% - (1200px / 2) - 85px);
  }
}

@media screen and (max-width: 1080px) {
  .detail-affix {
    display: none !important;
  }
}

@media screen and (max-width: 990px) {
  .detail-userinfo-card .cards .ivu-card {
    margin-bottom: 10px !important;
  }

  .detail-userinfo-card .buttons {
    margin-top: 5px;
  }
}

@media screen and (max-width: 480px) {
  .detail-userinfo-card .buttons,
  .detail-userinfo-card .tags {
    margin-bottom: 10px;
    margin-top: 5px;
  }
}
</style>
