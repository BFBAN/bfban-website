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

      <AdsGoogle id="3340268100"></AdsGoogle>
      <br>

      <Card id="getSharePicture" v-if="isCheaterExist" dis-hover>
        <Row :gutter="10">
          <Col :xs="{span: 22, pull: 1, push: 1}" :lg="{span: 4, pull: 0, push: 0}">
            <div class="default-avatar-box">
              <!-- EA头像 S -->
              <Avatar shape="square"
                      class="default-avatar"
                      :src="player.avatarLink"
                      :size="'100%'"
                      :title="$t('detail.info.originAvatar')"
                      v-if="player.avatarLink">
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
                    <CheaterStatusView :status="player.status"/>
                    <CheaterStatusLevel :hackerLevel="player.hackerLevel" v-if="player.hackerLevel && player.status == 1" />

                    <!-- 被举报的游戏 S -->
                    <router-link :to="{name: 'player_list', query: { game: player.games,status: -1 }}"
                                 v-if="player.games">
                      <Poptip trigger="hover"
                              v-for="(game,gameindex) in player.games" :key="gameindex">
                        <Tag type="border" :alt="$t('detail.info.reportedGames')">
                          <img height="12" :src="require('/src/assets/images/games/' + game + '/logo.png')"/>
                        </Tag>
                        <div slot="content">{{ $t(`basic.games.${game}`) }}</div>
                      </Poptip>
                    </router-link>

                    <!-- 被举报的类型 E -->
                    <template v-if="player.cheatMethods && player.cheatMethods.length > 0">
                      <Tag color="warning" v-for="(method_item, method_index) in player.cheatMethods"
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
                          {{ player.originName || 'User Name' }}
                        </ExposedName>
                      </h1>

                      <!-- 历史ID -->
                      <DropdownMenu slot="list"
                                    :style="isMobile ? '' : 'min-width: 630px'"
                                    v-if="player && player.history && player.history.length >= 0">
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
                          <div v-for="(origin, origin_index) in player.history" :key="origin_index">
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
                        <h3>{{ player.id || 0 }}</h3>
                        <span>IDs <Icon type="md-more"/></span>
                      </Card>
                      <div slot="content">
                        <Row :gutter="10" type="flex" align="middle">
                          <Col>id:</Col>
                          <Col flex="1">
                            <Divider dashed/>
                          </Col>
                          <Col>{{ player.id || 'player id' }}</Col>
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
                          <Col>{{ player.originUserId || 'user id' }}</Col>
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
                          <Col>{{ player.originPersonaId || 'persona id' }}</Col>
                        </Row>
                      </div>
                    </Poptip>
                  </Col>
                  <Col :xs="{span: 12}" :sm="{span: 12}" :md="{span: 6}" :lg="{span: 4}">
                    <Card :padding="isMobile ? 5 : 10" dis-hover>
                      <!-- 浏览次数 -->
                      <h3>{{ player.viewNum || 0 }}</h3>
                      <span>{{ $t('detail.info.viewTimes') }}</span>
                    </Card>
                  </Col>
                  <Col :xs="{span: 12}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 4}">
                    <Card :padding="isMobile ? 5 : 10" dis-hover>
                      <!-- 回复次数 -->
                      <h3>{{ player.commentsNum || 0 }}</h3>
                      <span>{{ $t('basic.button.reply') }}</span>
                    </Card>
                  </Col>
                  <Col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 12}" :lg="{span: 6}">
                    <Card :padding="isMobile ? 5 : 10" dis-hover>
                      <!-- 第一次被举报时间 -->
                      <h3>
                        <TimeView :time="player.createTime">
                          <Time v-if="player.createTime" :time="player.createTime" type="datetime"></Time>
                        </TimeView>
                      </h3>
                      <span>{{ $t('detail.info.firstReportTime') }}</span>
                    </Card>
                  </Col>
                  <Col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 12}" :lg="{span: 6}">
                    <Card :padding="isMobile ? 5 : 10" dis-hover>
                      <!-- 最近更新时间 -->
                      <h3>
                        <TimeView :time="player.updateTime">
                          <Time v-if="player.updateTime" :time="player.updateTime" type="datetime"></Time>
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
          <RecordLink ref="recordLink" v-show="player.originUserId"></RecordLink>
          <!-- 战绩链接 E -->
        </Card>
        <br>
        <Card id="timeline" style="overflow: hidden" dis-hover :padding="isMobile ? 15 : 20">
          <Row :gutter="20" slot="title" type="flex" justify="center" align="middle">
            <Col flex="1" class="mobile-hide">
              <h2># {{ $t('detail.info.timeLine') }}
                <Tag type="border" v-if="$refs.timeline && $refs.timeline.timeline.total">
                  {{ $refs.timeline.timeline.total || 0 }}
                </Tag>
              </h2>
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
                <Button @click="onSidebarSwitch" size="small">
                  <Icon type="md-contract"/>
                </Button>
              </template>
              <template v-else>
                <Button @click="onSidebarSwitch" size="small">
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
                              @click-reply="(id,byUserId,commentData) => openReplyModel(id, byUserId, commentData)"
                              ref="timeline"/>
              </div>

              <!-- 用户回复 S -->
              <Card :padding="0" id="reply" dis-hover v-if="isLogin">
                <div class="ivu-card-body">
                  <TextareaView v-model="reply.content"
                                style="margin: -10px -16px;"
                                ref="replyTextarea"
                                :toolbar="[['bold'], ['emote','link', 'image', 'cs']]"
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
                                          @click.stop.prevent="onReply('default')">
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
              <AdsGoogle id="8672485837">
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

          <div v-if="player.status === '1'">
            <Divider/>
          </div>
        </Card>
        <br v-if="isAdmin">

        <Card dis-hover v-if="isAdmin">
          <JudgeActionCardView :cheater="player"
                               @submit-complete="onJudgementSubmitComplete"
                               @additional-event="onJudgementAdditionalEvent"></JudgeActionCardView>
        </Card>

        <div v-if="!isCheaterExist">
          <Empty></Empty>
        </div>
      </template>
    </div>

    <br>
    <AdsGoogle id="6397676285" style="margin-bottom: 8px;"></AdsGoogle>

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
              <DropdownItem name="recordLink">{{ $t('detail.info.gameScores') }}</DropdownItem>
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
          <BusinessCard :id="reply.toUserId"
                        v-if="reply.toUserId">
            {{ reply.toReplyData.username }}
            <Icon type="md-open"></Icon>
          </BusinessCard>
        </div>
        <Form ref="replyForm" style="margin: -16px;background-color: rgba(0, 0, 0, 0.01);" v-if="isLogin">
          <TextareaView v-model="reply.miniModeContent"
                        ref="replyMiniModeTextarea"
                        :toolbar="[['bold'], ['emote','link', 'image', 'cs']]"
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
                       height="35px"
                       size="default"
                       @getCaptchaData="(value) => getCaptchaData('miniModeCaptcha', value)"></Captcha>
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
          <br>
          <Card :padding="20" dis-hover>
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
          <p class="hint hint-seriousness">
            {{ $t('detail.info.description1') }}，
            <u><b>{{ $t('detail.info.updateButton') }}</b></u>
            {{ $t('detail.info.description2') }}
          </p>
          <p class="hint hint-seriousness"> {{ $t('detail.info.description3') }} </p>
          <p class="hin hint-seriousness"> {{ $t('detail.info.description4') }} </p>
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
                      long @click.prevent="updatePlayerInfo">
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
import {account_storage, api, application, http, http_token, message, storage, time, util,} from "@/assets/js"
import {formatTextarea} from "@/mixins/common";

import AdsGoogle from "@/components/ads/google";
import Empty from '@/components/Empty'
import TextareaView from "@/components/textarea";
import BusinessCard from "@/components/BusinessCard";
import RecordLink from "@/components/RecordLink";
import CheaterStatusView from "@/components/CheaterStatusView";
import CheaterStatusLevel from "@/components/CheaterStatusLevel.vue";
import JudgeActionCardView from "@/components/JudgeActionCardView.vue";
import Captcha from "@/components/captcha";
import TimeView from "@/components/TimeView"
import TimelineView from "@/components/timeline";
import HtmlCore from "@/components/Html";
import HtmlWidget from "@/components/HtmlWidget";
import Htmllink from "@/components/HtmlLink";
import PrivilegesTag from "@/components/PrivilegesTag";
import UserAvatar from "@/components/UserAvatar"
import TrendWidget from "@/components/TrendWidget"
import ExposedName from "@/components/ExposedName"

export default new application({
  name: "detailPlayer",
  data() {
    return {
      subscribes: {
        load: false,
        static: false
      },

      appeal: {
        load: false,
        disable: this.$store.state.configuration.detailLeftAppealPanel ?? false,
      },

      player: {
        originId: '',
        createTime: time.appStartDate,
        updateTime: time.appStartDate,
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
    CheaterStatusView,
    CheaterStatusLevel,
    JudgeActionCardView,
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
    $route: "loadData",
  },
  created() {
    this.http = http_token.call(this);
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        this.$Loading.start();
        this.player = {};

        // get Detail data
        await this.getPlayerInfo();

        // get Timeline data
        if (this.$refs.timeline) {
          this.$refs.timeline
              .setPlayerInfo(this.player)
              .getTimeline();
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
    async checkPlayerSubscribes() {
      try {
        const {id} = this.player;

        if (!this.isLogin || !this.$store.state.configuration.subscribes) return;

        this.subscribes.load = true;
        const result = await this.http.post(api["user_isSubscribes"], {
          data: {id}
        });

        if (result.data.success === 1)
          this.subscribes.static = result.data.data;
      } finally {
        this.subscribes.load = false;
      }
    },
    /**
     * 追踪此玩家
     * 此项操作会存进账户配置字段内
     */
    async onSubscribes() {
      this.subscribes.load = true;

      switch (this.subscribes.static) {
        case false: {
          let res = await this.http.post(api["user_subscribes_add"], {
            data: {playerIds: [this.player.id]}
          })
          if (res.data.success === 1)
            this.subscribes.static = true;
        }
          break;
        case true: {
          let res = await this.http.post(api["user_subscribes_delete"], {
            data: {playerIds: [this.player.id]}
          });
          if (res.data.success === 1)
            this.subscribes.static = false;
        }
          break;
      }

      this.subscribes.load = false;
    },
    /**
     * 更新游览值
     */
    async onUpdateViewed() {
      let viewed = storage.local.get("viewed");
      const id = this.player.id;
      const historyTime = new Date().getTime();

      if (!id) return;
      // 校验,含id且1天内，则不更新游览值
      if (viewed !== undefined && viewed.data?.value[id] < viewed.data?.value[id] + 24 * 60 * 60 * 1000)
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
      this.player.viewNum++;
    },
    /**
     * 获取基本字段
     * 从[url]中整理
     * @param {string} name
     * @returns {*|{dbId: *, userId: *, personaId: *}}
     */
    getParamsIds(name) {
      const routeParamsIds = this.$route.params.ouid.split('.');
      const ids = {
        userId: routeParamsIds[1],
        personaId: routeParamsIds[0],
        dbId: routeParamsIds[2],
      };
      return name ? ids[name] : ids;
    },
    /**
     * 获取举报玩家档案
     */
    async getPlayerInfo() {
      try {
        let params = {
          history: true,
          personaId: this.$route.params.ouid
        };

        // 旧网站URL, 兼容
        if (this.$route.query.oldUrl && this.$route.params.ouid) {
          params = Object.assign(params, {
            history: true,
            userId: this.$route.params.ouid
          });
          delete params.personaId;
        }

        const result = await http.get(api["player"], {params}),
            d = result.data;

        if (d.error === 1) {
          switch (d.code) {
            case "player.bad":
            case "player.notFound":
              setTimeout(() =>
                  this.$router.push({name: 'notFound'}), 3000)
              break;
          }
          throw new Error(this.$t('basic.tip.notFound'));
        }

        // sort history player name
        d.data.history = d.data.history.sort(function (a, b) {
          let aTime = new Date(a.fromTime).getTime();
          let bTime = new Date(b.fromTime).getTime();
          return aTime > bTime ? 1 : -1;
        })

        this.player = d.data;
        if (this.$refs.recordLink)
          this.$refs.recordLink.generateTable(this.player);

        // update player page website title
        document.title = `${this.$i18n.t('name')} / ${this.player.originName} - ${this.player.games.map(i => this.$i18n.t(`basic.games.${i}`))}`;
      } catch (e) {
        if (e instanceof Error) {
          this.$Message.info(e.message);
          return;
        }
        this.$Message.error(e.toString())
      } finally {
        await this.onUpdateViewed();
        await this.checkPlayerSubscribes();
      }
    },
    /**
     * 获取验证码
     * @param id captcha id
     * @param value
     */
    getCaptchaData(id, value) {
      this.reply[id || 'captcha'] = value;
    },
    /**
     * 判决完成触发事件
     */
    onJudgementSubmitComplete() {
      this.getPlayerInfo();
      if (this.$refs.timeline)
        this.$refs.timeline
            .setPlayerInfo(this.player)
            .getTimeline();
    },
    /**
     * 判决额外事件
     * @param eventName
     */
    onJudgementAdditionalEvent(eventName) {
      switch (eventName) {
        case 'updatePlayerInfo':
          this.updatePlayerInfo();
          break;
        case 'subscribes':
          this.onSubscribes();
          break;
        case 'updateTimeline':
          if (this.$refs.timeline)
            this.$refs.timeline
                .setPlayerInfo(this.player)
                .getTimeline();
          break;
      }
    },
    /**
     * 右键菜单滚动选项
     * @param dropdownsName
     */
    onRollingDropdowns(dropdownsName) {
      switch (dropdownsName) {
        case 'recordLink':
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
          ids: this.player.originPersonaId,
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
     * update player
     */
    updatePlayerInfo() {
      if (!this.isLogin) {
        this.$Message.error(this.$i18n.t('signin.loginFirst'));
        return;
      }

      this.updateUserInfoSpinShow = true;

      this.http.post(api["player_update"], {
        data: {personaId: this.player.originPersonaId}
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          const {cheaterGameName: originId, originUserId, avatarLink} = d.data.origin;

          this.player.originId = originId;
          this.player.originUserId = originUserId;
          this.player.avatarLink = avatarLink;

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

        if (this.$refs.timeline)
          this.$refs.timeline
              .setPlayerInfo(this.player)
              .getTimeline();
      });
    },
    /**
     * 右侧侧栏，申诉显示
     */
    onSidebarSwitch() {
      this.appeal.disable = !this.appeal.disable;

      account_storage.updateConfiguration("playerDetailSidebarPanel", this.appeal.disable);
    },
    /**
     * 用户评论/回复
     * @param replyType 回复窗口模式
     */
    onReply(replyType = 'default') {
      try {
        const cheaterId = this.player.id;
        const {content = '', miniModeContent = '', captcha, miniModeCaptcha} = this.reply;
        let message = "";
        let data = {};

        if (this.$store.state.$userinfo && !(this.$store.state.$userinfo.origin && this.$store.state.$userinfo.origin.originUserId)) {
          setTimeout(() => {
            this.$router.push({path: '/profile/information'})
          }, 3000)

          throw new Error(this.$i18n.t("basic.tip.needBindEaAccount"));
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
          case "mini": {
            const {toReplyId} = this.reply;
            data = {
              data: {
                toPlayerId: cheaterId,
                toCommentId: toReplyId, // 楼中楼，填充回复的dbId
                content: formatTextarea(miniModeContent),
              },
              captcha: miniModeCaptcha,
            };
          }
            break;
        }

        this.replySpinShow = true;
        const result = this.http.post(api["player_reply"], {data}),
            d = result.data;

        if (d.error === 1) {
          message = typeof d.message == 'object' ? d.message.forEach((i) => message += `${i.param}: ${i.msg}`) : this.$t(`basic.tip['${d.code}']`, {
            message: d.message.toString() || ""
          });
          throw new Error(message);
        }

        this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        }));

        // Reset the content and validator
        this.reply = Object.assign(this.reply, {
          toReplyId: null,
          content: '',
          captcha: {},
          miniModeContent: '',
          miniModeCaptcha: {}
        })
      } catch (e) {
        if (e instanceof Error)
          this.$Message.error({content: e.message, duration: 10});
      } finally {
        this.replySpinShow = false;
        this.replyModal = false;

        // Actively update text
        if (this.$refs.replyTextarea)
          this.$refs.replyTextarea.updateContent('');
        if (this.$refs.replyMiniModeTextarea)
          this.$refs.replyMiniModeTextarea.updateContent('');

        if (message.playSendVoice)
          message.playSendVoice();

        this.cancelReply(false);
        this.getPlayerInfo();
        if (this.$refs.timeline)
          this.$refs.timeline
              .setPlayerInfo(this.player)
              .getTimeline();
      }
    },
    /**
     * 展开回复小窗口
     * @param {string} replyId 楼层id
     * @param {string} userId 回复id
     */
    openReplyModel(replyId, userId, commentData) {
      this.reply.toReplyData = commentData;
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
  computed: {
    util: () => util,
  }
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
