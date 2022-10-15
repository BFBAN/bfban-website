<template>
  <div class="container" v-if="detailLoad">
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

      <Card id="getSharePicture" v-if="isCheaterExist" dis-hover>
        <Row :gutter="10">
          <Col :xs="{span: 22, pull: 1, push: 1}" :lg="{span: 3, pull: 0, push: 0}">
            <div align="center">
              <!-- Origin头像 S -->
              <Avatar shape="square"
                      @on-error="onAvatarError"
                      :src="cheater.avatarLink"
                      :size="180"
                      :title="$t('detail.info.originAvatar')"
                      v-if="cheater.avatarLink">
              </Avatar>
              <template v-else>
                <Avatar shape="square"
                        icon="ios-person"
                        size="180"
                        style="background-color: rgba(255,0,0,0.37)">
                </Avatar>
              </template>
              <!-- Origin头像 E -->
            </div>
            <br class="desktop-hide">
          </Col>
          <Col :xs="{span: 22, pull: 1, push: 1}" :lg="{span: 19, push: 2}" class="detail-userinfo-card">
            <Row :gutter="10" type="flex" justify="space-between" align="top">
              <Col flex="1">
                <Tag color="error" v-if="cheater.status >= 0">
                  {{ $t(`basic.status.${cheater.status || 0}`) }}
                </Tag>

                <!-- 被举报的游戏 S -->
                <router-link :to="{name: 'player_list', query: { game: cheater.games,status: -1 }}"
                             v-if="cheater.games">
                  <Tag color="gold" :alt="$t('detail.info.reportedGames')"
                       v-for="(game,gameindex) in cheater.games" :key="gameindex">
                    {{ $t(`basic.games.${game}`, {game: game}) }}
                  </Tag>
                </router-link>

                <!-- 被举报的类型 E -->
                <template v-if="cheater.cheatMethods && cheater.cheatMethods.length > 0">
                  <Tag color="warning" v-for="(method_item, method_index) in cheater.cheatMethods" :key="method_index">
                    {{ $t("cheatMethods." + util.queryCheatMethodsGlossary(method_item) + ".title") }}
                  </Tag>
                </template>

                <h1 :style="`${cheater.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''}`">
                  {{ cheater.originName || 'User Name' }}
                </h1>
              </Col>
              <template v-if="!isFull">
                <Col class="mobile-hide html2canvas-ignore">
                  <!-- App S -->
                  <router-link :to="{name: 'cheater_app'}">
                    <Button>
                      <Icon type="md-qr-scanner" size="20" color="#535353"/>
                      {{ $t('detail.info.app_qr.title') }}
                    </Button>
                  </router-link>
                  <!-- App E -->
                  <template v-if="isLogin">
                    <Divider type="vertical"/>
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
                        <Button :disabled="!$store.state.configuration.subscribes">
                          <Icon type="ios-arrow-down"></Icon>
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
                  </template>
                  <Divider type="vertical"/>
                  <!-- 分享 share S -->
                  <router-link :to="{name: 'cheater_share'}">
                    <Button type="primary" v-voice-button>
                      <Icon type="md-share"/>
                    </Button>
                  </router-link>
                  <!-- 分享 share E -->
                </Col>
              </template>
            </Row>
            <Row>
              <Col>
                <span>Origin id:  {{ cheater.originUserId || 'id' }}</span>
                <template v-if="!isFull">
                  <Divider type="vertical"/>
                  <Dropdown>
                    <a href="javascript:void(0)">
                      {{ $t('detail.info.historyID', {msg: 'historyID'}) }}
                      <Icon type="ios-arrow-down"></Icon>
                    </a>
                    <DropdownMenu slot="list" style="min-width: 230px"
                                  v-if="cheater && cheater.history && cheater.history.length >= 0">
                      <!-- 历史ID -->
                      <DropdownItem v-for="origin in cheater.history" :key="origin.originName">
                        <Row>
                          <Col flex="1">
                            <Time :time="origin.fromTime" v-if="origin.fromTime"></Time>
                          </Col>
                          <Col>{{ origin.originName }}</Col>
                        </Row>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Divider type="vertical"/>

                  <a @click="updateCheaterModal = true;">
                    <Icon type="md-cloud"/>
                    {{ $t('detail.info.updateButton') }}</a>
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
                        {{ $t('detail.info.discription1') }}，
                        <Tag>{{ $t('detail.info.updateButton') }}</Tag>
                        <span>{{ $t('detail.info.discription2') }}</span>
                      </p>
                      <p class="hint"> {{ $t('detail.info.discription3') }} </p>
                      <p class="hint"> {{ $t('detail.info.discription4') }} </p>
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
                                  v-voice-button
                                  long @click.prevent="updateCheaterInfo">
                            {{ $t('detail.info.updateButton') }}
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </Modal>
                </template>
              </Col>
            </Row>
            <br>

            <Row :gutter="10">
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card :padding="10" dis-hover>
                  <!-- 浏览次数 -->
                  <h3>{{ cheater.viewNum || 0 }}</h3>
                  <span>{{ $t('detail.info.viewTimes') }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card :padding="10" dis-hover>
                  <!-- 回复次数 -->
                  <h3>{{ cheater.commentsNum || 0 }}</h3>
                  <span>{{ $t('basic.button.reply') }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card :padding="10" dis-hover>
                  <!-- 第一次被举报时间 -->
                  <h3>
                    <Time v-if="cheater.createTime" :time="cheater.createTime"></Time>
                  </h3>
                  <span>{{ $t('detail.info.firstReportTime') }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card :padding="10" dis-hover>
                  <!-- 最近更新时间 -->
                  <h3>
                    <Time v-if="cheater.updateTime" :time="cheater.updateTime"></Time>
                  </h3>
                  <span>{{ $t('detail.info.recentUpdateTime') }}</span>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <template v-if="!isFull">
        <br>
        <Card dis-hover>
          <h2># {{ $t('detail.info.gameScores') }}</h2>
          <br>
          <!-- 战绩链接 S -->
          <RecordLink :cheater="cheater" v-show="cheater.originUserId"></RecordLink>
          <!-- 战绩链接 E -->
        </Card>
        <br>
        <Card style="overflow: hidden" dis-hover :padding="isMobile ? 15 : 20">
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
            </Col>
            <Col>
              <!-- 时间轴筛选 S -->
              <ButtonGroup type="button">
                <Select v-model="timeline.seeType" size="small">
                  <Option v-for="(item, index) in timeline.seeTypeList" :value="item.value" :key="index">
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
              <Button size="small" type="dashed" @click="getTimeline">
                <Icon type="md-refresh"/>
              </Button>
              <!-- 时间轴筛选 E -->
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
                    :id="`floor-${l.index}`">
                  <div v-if="l.type === 'report'" slot="dot" class="timeline-time-dot ivu-tag-warning hand">
                    <Icon type="ios-hand" :size="isMobile ? 10 : 20"></Icon>
                  </div>
                  <div v-else-if="l.type === 'reply'" slot="dot" class="timeline-time-dot ivu-tag-geekblue reply">
                    <Icon type="ios-text" :size="isMobile ? 10 : 20" class="ivu-tag-text"></Icon>
                  </div>
                  <div v-else-if="l.type === 'banAppeal'" slot="dot"
                       class="timeline-time-dot ivu-tag-magenta ban_appeal">
                    <Icon type="md-bookmark" :size="isMobile ? 10 : 20" class="ivu-tag-text"></Icon>
                  </div>
                  <div v-else-if="l.type === 'judgement'" slot="dot"
                       class="timeline-time-dot ivu-tag-primary ban_appeal">
                    <Icon type="ios-medical" :size="isMobile ? 10 : 20" class=""></Icon>
                  </div>
                  <div v-else-if="l.type === 'verify'" slot="dot" class="timeline-time-dot trophy">
                    <Icon type="ios-share-alt" :size="isMobile ? 10 : 20"></Icon>
                  </div>
                  <div v-else slot="dot" class="timeline-time-dot ivu-tag-border ivu-tag-text out">
                    <Icon type="ios" :size="isMobile ? 10 : 20" class=""></Icon>
                  </div>

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

                          <!-- 在 -->
                          {{ $t('detail.info.inGame') }}

                          <router-link :to="{name: 'player', query: {game: l.cheatGame, status: -1 } }">
                            {{ $t('basic.games.' + l.cheatGame) }}
                          </router-link>

                          <!-- 游戏中 -->
                          {{ $t('detail.info.gaming') }}

                          <Tag type="border" color="orange"
                               v-for="(methods, methodsIndex) in l.cheatMethods"
                               :key="methodsIndex">
                            {{ $t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".title") }}
                          </Tag>
                        </Col>
                        <Col align="right">
                          <Time :time="l.createTime" v-if="l.createTime"></Time>
                        </Col>
                      </Row>
                    </div>

                    <template>
                      <p v-if="l.videoLink">
                        <!-- 游戏中 -->
                        <span size="large" v-for="(link, linkindex) in l.videoLink.split(',')" :key="linkindex"
                              :href="link" target="_blank">
                            <Tag size="default" color="geekblue">{{ $t('detail.info.videoLink') }}</Tag>
                            <a :href="link" target="_blank">{{ link.substr(0, 20) }}{{
                                link.length >= 20 ? '...' : ''
                              }}</a>
                            <Divider type="vertical" v-if="linkindex < l.videoLink.split(',').length - 1"/>
                          </span>
                      </p>
                    </template>

                    <HtmlWidget class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"
                                :html="l.content" v-if="l.content"></HtmlWidget>

                    <p v-if="isLogin">
                      <!-- 回复 -->
                      <Button type="dashed"
                              v-voice-button
                              @click="handleReply(l.floor || index, l.byUserId)">
                        {{ $t('basic.button.reply') }}
                      </Button>
                    </p>
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

                          <BusinessCard :id="l.originUserId">
                            <router-link :to="{name: 'cheater', ouid: `${l.originUserId}`}">
                              <u>{{ l.cheaterGameName }}</u>
                            </router-link>
                          </BusinessCard>

                          <router-link :to="{name: 'cheater', query: {game: `${l.cheatGame}`} }">
                            {{ l.cheatGame }}
                          </router-link>
                        </Col>

                        <Col>
                          <Time :time="l.createTime" v-if="l.createTime"></Time>
                          <Divider type="vertical"/>
                          <Tag>{{ l.appealStatus }}</Tag>
                        </Col>
                      </Row>
                    </div>

                    <HtmlWidget :html="l.content" v-if="l.content"
                                class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"></HtmlWidget>

                    <p v-if="isLogin">
                      <!-- 回复 -->
                      <Button type="dashed"
                              v-voice-button
                              @click="handleReply(l.floor || index, l.byUserId)">
                        {{ $t('basic.button.reply') }}
                      </Button>
                      <Divider type="vertical"/>
                      <!-- 申诉操作 -->
                      <Dropdown trigger="click" v-if="isAdmin && !isOnlySuper" @on-click="handAdminAppeal">
                        <a href="javascript:void(0)">
                          <Button type="dashed">
                            申诉操作
                            <Icon type="ios-arrow-down"></Icon>
                          </Button>
                        </a>
                        <DropdownMenu slot="list">
                          <DropdownItem :name="`${l.id},0`">打开</DropdownItem>
                          <DropdownItem :name="`${l.id},1`">关闭</DropdownItem>
                          <DropdownItem :name="`${l.id},2`">锁定</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </p>
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

                          <!-- 作弊方式 -->
                          <template v-if="l.cheatMethods && l.cheatMethods.length > 0">
                            {{ $t('detail.info.cheatMethod') }}

                            <Tag type="border" color="orange"
                                 v-for="(methods, methodsIndex) in l.cheatMethods"
                                 :key="methodsIndex">
                              {{ $t("cheatMethods." + util.queryCheatMethodsGlossary(methods) + ".title") }}
                            </Tag>
                          </template>
                        </Col>
                        <Col align="right">
                          <Time v-if="l.createTime" :time="l.createTime"></Time>
                        </Col>
                      </Row>
                    </div>

                    <HtmlWidget :html="l.content" v-if="l.content"
                                class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover"></HtmlWidget>

                    <p v-if="isLogin">
                      <!-- 回复 -->
                      <Button type="dashed"
                              v-voice-button
                              @click="handleReply(l.floor || index, l.byUserId)">
                        {{ $t('basic.button.reply') }}
                      </Button>
                    </p>
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
                          <Time v-if="l.createTime" :time="l.createTime"></Time>
                        </Col>
                      </Row>
                    </div>

                    <div class="timeline-description ivu-card ivu-card-bordered ivu-card-dis-hover">
                      <template v-if="l.quote">
                        <a :href="`#floor-${l.quote.id}`" target="_self">
                          <div
                              class="timeline-description timeline-reply-description ivu-card ivu-card-bordered ivu-card-dis-hover">
                            <Row type="flex" align="middle" class="timeline-reply-description-title">
                              <Col flex="1">
                                <BusinessCard :id="l.quote.id">
                                  <p>
                                    <b>{{ l.quote.username }}</b>
                                  </p>
                                </BusinessCard>
                                :
                              </Col>
                              <Col>
                                <Time :time="l.quote.createTime"></Time>
                              </Col>
                            </Row>
                            <Html
                                :html="l.quote.content.length > 80 ? `${l.quote.content.substr(0, 80)}...` : l.quote.content"></Html>
                          </div>
                        </a>
                      </template>

                      <HtmlWidget :html="l.content" v-if="l.content"></HtmlWidget>
                    </div>

                    <p v-if="isLogin">
                      <!-- 回复 -->
                      <Button type="dashed"
                              v-voice-button
                              @click="handleReply(l.floor || index, l.byUserId)">
                        {{ $t('basic.button.reply') }}
                      </Button>
                    </p>
                  </div>
                  <!-- 回复:any E -->

                  <Row class="timeline-content">
                    <Col flex="auto">
                    </Col>
                    <Col align="right">
                      # {{ l.index }}
                    </Col>
                  </Row>

                  <Divider v-if="index < timelineList.length - 1"></Divider>
                </TimelineItem>

                <div align="center">
                  <Page :page-size="timeline.limit"
                        :current="timeline.page"
                        :total="timeline.total"
                        simple
                        class="page"
                        size="small"/>
                  <br>
                </div>
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
            <Col :xs="{span: 23, push: 1}" :lg="{span: 6, push: 0}" order="1" class="mobile-hide" v-if="appeal.disable">
              <Button type="primary"
                      v-voice-button
                      @click="appeal.show = true"
                      :disabled="!isLogin || cheater.status != 1">
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
        <br v-if="isAdmin && !isOnlySuper">

        <!-- 管理员裁判 S -->
        <Card dis-hover v-if="isAdmin && !isOnlySuper">
          <div :label="$t('detail.info.adminConsole')">
            <h2 style="margin: 0 0 1rem 0;">
              <Row>
                <Col flex="1">
                  # {{ $t('detail.info.judgement') }}
                </Col>
                <Col class="mobile-hide">
                  <PrivilegesTag :data="['admin','super','root','dev','bot']"></PrivilegesTag>
                </Col>
              </Row>
            </h2>

            <Form ref='verifyForm' label-position="top">
              <Row :gutter="30">
                <Col :xs="{span:24}" :lg="{span: 12}">
                  <FormItem :label="$t(`detail.judgement.behavior`)">
                    <Select v-model="verify.status">
                      <!-- 判断选项 -->
                      <Option :value="v_i.value"
                              :label="$t(`basic.action.${v_i.value}.text`)"
                              v-for="v_i in verify.choice" :key="v_i.value">
                        <Row>
                          <Col flex="1">
                            {{ $t(`basic.action.${v_i.value}.text`) }}
                          </Col>
                          <Col>
                            <Poptip trigger="hover" :transfer="true" word-wrap width="200"
                                    :content="$t(`basic.action.${v_i.value}.describe`)">
                              <Icon type="md-help-circle" size="20"/>
                            </Poptip>
                          </Col>
                        </Row>
                        <PrivilegesTag :data="v_i.privilege"></PrivilegesTag>
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col :xs="{span:24}" :lg="{span: 12}">
                  <FormItem v-show="['kill','guilt'].includes(verify.status)" :label="$t(`detail.judgement.methods`)">
                    <Select v-model="verify.checkbox" multiple>
                      <Option v-for="method in cheatMethodsGlossary" :key="method.value"
                              :value="method.value"
                              :label="$t(`cheatMethods.${method.value}.title`)">
                        <Tag>{{ $t(`cheatMethods.${method.value}.title`) }}</Tag>
                        <Divider type="vertical"/>
                        {{ $t(`cheatMethods.${method.value}.describe`) }}
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="24">
                  <FormItem>
                    <div slot="label">
                      {{ $t(`detail.judgement.content`) }}
                      <Poptip trigger="hover" word-wrap placement="right-end" :padding="'20px 30px'">
                        <Button type="dashed" size="small">
                          <Icon type="ios-help-buoy"/>
                        </Button>

                        <div slot="content" span="24">
                          <Row :gutter="60">
                            <Col flex="1">
                              <h3>
                                <Icon type="md-done-all" color="#19be6b"/>
                                {{ $t('detail.judgement.appropriateVerdict.title') }}
                              </h3>
                              <ol>
                                <li>{{ $t('detail.judgement.appropriateVerdict.1') }}</li>
                                <li>{{ $t('detail.judgement.appropriateVerdict.2') }}</li>
                              </ol>
                            </Col>
                            <Col flex="1">
                              <h3>
                                <Icon type="ios-alert-outline" color="red"/>
                                {{ $t('detail.judgement.inappropriateRuling.title') }}
                              </h3>
                              <ol>
                                <li>{{ $t('detail.judgement.inappropriateRuling.1') }}</li>
                                <li>{{ $t('detail.judgement.inappropriateRuling.2') }}</li>
                                <li>{{ $t('detail.judgement.inappropriateRuling.3') }}</li>
                              </ol>
                            </Col>
                          </Row>
                        </div>
                      </Poptip>
                    </div>

                    <Card :padding="0" dis-hover>
                      <Textarea v-model="verify.suggestion"
                                ref="judgementTextarea"
                                :height="'250px'"
                                :placeholder="$t(`detail.info.writeSomething`)"></Textarea>
                      <Row :gutter="20" style="padding: 5px 15px">
                        <Col flex="1">
                          <CheckboxGroup v-model="fastReply.selected" @on-change="onFastReply">
                            <Checkbox :label="i.content" v-for="(i, index) in fastReply.content" :key="index">
                              {{ $t('detail.info.fastReplies.' + i.text) }}
                            </Checkbox>
                          </CheckboxGroup>
                        </Col>
                        <Col>
                          <a href="javascript:void(0)" @click="fastReply.mode = true">
                            <Icon type="md-settings" size="18"/>
                          </a>
                          <Drawer :closable="fastReply.mode" v-model="fastReply.mode" width="40%">
                            <CheckboxGroup v-model="fastReply.selected" @on-change="onFastReply">
                              <div v-for="(i, index) in fastReply.content" :key="index">
                                <Checkbox :label="i.content" style="width: 100%">
                                  <b>{{ $t('detail.info.fastReplies.' + i.text) }}</b>
                                  <Input v-model="i.content" maxlength="100" :rows="4" show-word-limit
                                         type="textarea"></Input>
                                </Checkbox>
                                <Divider></Divider>
                              </div>
                            </CheckboxGroup>
                          </Drawer>
                        </Col>
                      </Row>
                    </Card>
                  </FormItem>
                </Col>
              </Row>

              <FormItem :label="$t('captcha.title')">
                <Row :gutter="50">
                  <Col :xs="{span:24}" :lg="{span: 8, flex: 1}">
                    <Input type="text" v-model="reply.captcha"
                           size="large"
                           maxlength="4"
                           :placeholder="$t('captcha.title')">
                      <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                        <Captcha ref="captcha" :seconds="5"></Captcha>
                      </div>
                    </Input>
                  </Col>
                  <Col :xs="{span:24}" :lg="{span: 8, push: 8}" align="right">
                    <br class="desktop-hide">
                    <Button type="primary"
                            size="large"
                            :long="isMobile"
                            v-voice-button :loading="verifySpinShow"
                            @click.stop.prevent="onJudgement">
                      {{ $t('basic.button.submit') }}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </Form>
          </div>

          <Spin fix v-if="$store.state.configuration.judgementTip == false">
            <div class="loader">
              <Icon type="md-lock" size="80" style="margin-bottom: 20px"/>

              <Alert>
                <template slot="desc">
                  <p class="hint">{{ $t('detail.info.adminManual1') }}</p>
                  <p class="hint">{{ $t('detail.info.adminManual2') }}</p>
                </template>
              </Alert>
              <br>
              <Button @click="onJudgementLock" v-voice-button>{{ $t('basic.button.submit') }}</Button>
            </div>
          </Spin>
        </Card>
        <!-- 管理员裁判 E -->

        <div v-if="!isCheaterExist">
          <Empty></Empty>
        </div>
      </template>
    </div>

    <template v-if="!isFull">
      <Affix :top="100">
        <Card dis-show class="detail-affix mobile-hide">
          <a href="#up">
            <Icon type="md-arrow-round-up" size="30"/>
          </a>
          <a href="#reply">
            <Icon type="md-chatboxes" size="30"/>
          </a>
        </Card>
      </Affix>

      <!-- 小窗口回复 S -->
      <Modal v-model="replyModal">
        <div slot="header">
          {{ `${$t('basic.button.reply')}` }}
          <BusinessCard :id="timelineList[reply.toFloor].byUserId" v-if="timelineList[reply.toFloor]">
            <b>{{ timelineList[reply.toFloor].username }}</b>({{ reply.toFloor }})
          </BusinessCard>
        </div>
        <div v-if="isLogin">
          <Form ref="replyForm">
            <Textarea v-model="reply.content"
                      :toolbar="['bold', 'link']"
                      :height="'320px'"
                      :placeholder="$t(`detail.info.giveOpinion`)"></Textarea>
          </Form>
        </div>
        <div v-else>{{ $t('detail.info.replyManual4') }}</div>

        <div slot="footer">
          <Row :gutter="30">
            <Col flex="1">
              <Input type="text" v-model="reply.captcha"
                     maxlength="4"
                     :placeholder="$t('captcha.title')">
                <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                  <Captcha :id="'replyCommentsCaptcha'" ref="replyCommentsCaptcha"></Captcha>
                </div>
              </Input>
            </Col>
            <Col>
              <Button @click="cancelReply" v-voice-button>{{ $t('basic.button.cancel') }}</Button>
              <Button @click="onReply"
                      type="primary"
                      :disabled="(!reply.content || !reply.captcha) || false"
                      :loading="replySpinShow"
                      v-voice-button>
                {{ $t('basic.button.submit') }}
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
      <!-- 小窗口回复 E -->

      <!-- 小窗口申诉 S -->
      <Modal v-model="appeal.show"
             width="80%"
             :loading="appeal.load"
             @on-ok="handleAppeal">
        <Row :gutter="30">
          <Col flex="1">
            <h2> {{ $t('detail.appeal.modal.modalTitle') }} </h2>
            <br>
            <h3> {{ $t('detail.appeal.modal.describe') }} </h3>
            <br>
            <Row :gutter="60" style="padding: 0 30px">
              <Col flex="1">
                <ul>
                  <li>
                    <h3>
                      <Icon type="md-done-all" color="#19be6b"/>
                      {{ $t('detail.appeal.modal.effectiveEvidence.title') }}
                    </h3>
                    <ol>
                      <li>{{ $t('detail.appeal.modal.effectiveEvidence.1') }}</li>
                      <li>{{ $t('detail.appeal.modal.effectiveEvidence.2') }}</li>
                      <li>{{ $t('detail.appeal.modal.effectiveEvidence.3') }}</li>
                    </ol>
                  </li>
                  <br>
                  <li>
                    <h3>
                      <Icon type="md-done-all" color="#19be6b"/>
                      {{ $t('detail.appeal.modal.auxiliaryProof.title') }}
                    </h3>
                    <ol>
                      <li>{{ $t('detail.appeal.modal.auxiliaryProof.1') }}</li>
                      <li>{{ $t('detail.appeal.modal.auxiliaryProof.2') }}</li>
                    </ol>
                  </li>
                </ul>
              </Col>
              <Col flex="1">
                <ul>
                  <li>
                    <h3>
                      <Icon type="ios-alert-outline" color="red"/>
                      {{ $t('detail.appeal.modal.evidenceInvalid.title') }}
                    </h3>
                    <ol>
                      <li>{{ $t('detail.appeal.modal.evidenceInvalid.1') }}</li>
                      <li>{{ $t('detail.appeal.modal.evidenceInvalid.2') }}</li>
                      <li>{{ $t('detail.appeal.modal.evidenceInvalid.3') }}</li>
                      <li>{{ $t('detail.appeal.modal.evidenceInvalid.4') }}</li>
                    </ol>
                  </li>
                </ul>
              </Col>
            </Row>
            <br>
          </Col>
          <Col flex="1">
            <Form>
              <Row :gutter="30">
                <Col flex="1">
                  <FormItem :label="$t('detail.appeal.info.player')">
                    <Input type="text"
                           :value="cheater.id"
                           disabled
                           size="large"
                           :placeholder="$t('detail.placeholder.player')"/>
                  </FormItem>
                </Col>
                <Col flex="1">
                  <FormItem :label="$t('detail.appeal.info.originName')">
                    <Input type="text"
                           :value="cheater.originName"
                           disabled
                           size="large"/>
                  </FormItem>
                </Col>
              </Row>
              <FormItem :label="$t('detail.appeal.info.content')">
                <br>
                <Card dis-hover :padding="0">
                  <Textarea v-model="appeal.content"
                            :toolbar="['bold', 'link']"
                            :height="'420px'"
                            :placeholder="$t('detail.appeal.placeholder.content')"></Textarea>
                </Card>
              </FormItem>
            </Form>
          </Col>
        </Row>
      </Modal>
      <!-- 小窗口申诉 E -->
    </template>
  </div>
</template>

<script>
import {api, http, http_token, util, message, time, storage, account_storage} from '../assets/js/index'

import BFBAN from "/src/assets/js/bfban";
import Empty from '../components/Empty.vue'
import Textarea from "../components/Textarea";
import BusinessCard from "../components/businessCard.vue";
import RecordLink from "../components/RecordLink.vue";
import Captcha from "../components/Captcha";
import Html from "@/components/Html";
import HtmlWidget from "../components/HtmlWidget";
import PrivilegesTag from "/src/components/PrivilegesTag";

import {formatTextarea, waitForAction} from "@/mixins/common";

export default new BFBAN({
  data() {
    return {
      util,

      subscribes: {
        load: false,
        static: false
      },

      appeal: {
        load: false,
        show: false,
        disable: this.$store.state.configuration.detailLeftAppealPanel ?? false,
        toPlayerId: 0,
        content: ''
      },
      cheater: {
        originId: '',
        createTime: time.appStart(),
        updateTime: time.appStart()
      },
      reply: {
        cheaterId: '',
        userId: '',
        content: '',
        toFloor: '',
        toUserId: '',
        captcha: '',
        captchaUrl: {},
      },
      fastReply: {
        content: [{
          text: 'stats',
          content: this.$i18n.t('detail.info.fastReplies.stats')
        }, {
          text: 'evidencePic',
          content: this.$i18n.t('detail.info.fastReplies.evidencePic')
        }, {
          text: 'evidenceVid',
          content: this.$i18n.t('detail.info.fastReplies.evidenceVid')
        }],
        mode: false,
        selected: [],
      },

      verify: {
        status: 0,
        checkbox: [],
        choice: [],
        suggestion: '',
      },

      timelineList: [],
      timeline: {
        sort: '1',
        skip: 0,
        limit: 100,
        total: 0,
        seeType: 1,
        seeTypeList: [
          {
            label: 'all',
            value: 1,
            item: ['report', 'reply', 'ban_appeal', 'judgement', 'verify', 'banAppeal'],
          },
          {
            label: 'verify',
            value: 2,
            item: ['judgement', 'verify'],
          },
          {
            label: 'banAppeal',
            value: 3,
            item: ['banAppeal'],
          }
        ]
      },

      detailLoad: true,
      spinShow: true,
      verifySpinShow: false,
      replySpinShow: false,
      isCheaterExist: true,
      replyModal: false,
      updateUserInfospinShow: false,
      updateCheaterModal: false,
      cheatMethodsGlossary: null,
    }
  },
  components: {Empty, Textarea, BusinessCard, RecordLink, Captcha, Html, HtmlWidget, PrivilegesTag},
  watch: {
    '$route': 'loadData',
    'fastReply.selected': function () {
      this.verify.suggestion = '' + this.fastReply.selected.map(i => i);
    }
  },
  created() {
    this.http = http_token.call(this);

    this.loadData();
  },
  methods: {
    async loadData() {
      this.$Loading.start();

      // set Token Http mode
      this.http = http_token.call(this);

      await util.initUtil().then(res => {
        this.cheaterStatus = res.cheaterStatus;

        // 裁决结果
        this.cheatMethodsGlossary = res.cheatMethodsGlossary;

        // 裁决作弊类型
        this.verify.choice = res.action;
        this.verify.status = this.verify.choice[0].value;
      });

      Promise.all([
        this.getPlayerInfo(),
        this.getTimeline()
      ]).then(_ => {
        this.$Loading.finish();
      }).catch(err => {
        this.$Loading.error();
      });
    },
    onAvatarError() {
      this.cheater.avatarLink = "";
    },
    /**
     * 追踪此玩家
     */
    onSubscribes() {
      let subscribesLocal = storage.get('user.subscribes');
      let subscribesArray = [];
      let isSubscribes = false;

      if (subscribesLocal.code < 0) {
        subscribesLocal = {data: {value: []}};
      }

      let localdata = subscribesLocal.data.value;
      subscribesArray = subscribesArray.concat(localdata);

      // 校对本地是否已订阅
      if (
          subscribesLocal.code == 0 &&
          localdata.length >= 0 &&
          localdata.includes(this.cheater.id)
      ) {
        // 若存在触发相同，则移除
        localdata.splice(localdata.indexOf(this.cheater.id), 1);
        isSubscribes = false;
      } else {
        // 添加
        isSubscribes = true;
        subscribesArray.push(this.cheater.id);
      }

      this.subscribes.load = true;
      this.http.post(api["user_me"], {
        data: {
          data: {subscribes: subscribesArray}
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          storage.set('user.subscribes', subscribesArray);
        }
      }).finally(() => {
        this.subscribes.load = false;
        this.subscribes.static = isSubscribes;
      });
    },
    /**
     * 检查用户对玩家订阅状态
     */
    checkPlayerSubscribes() {
      const subscribesLocal = storage.get('user.subscribes');
      if (subscribesLocal.code < 0) return false;

      subscribesLocal.data.value.filter(i => {
        if (i == this.cheater.id) {
          this.subscribes.static = true;
        }
      });
    },
    /**
     * 更新游览值
     */
    onViewed() {
      let viewed = storage.get("viewed");
      const id = this.cheater.id;

      if (!id) return;

      // 在持久下存在此id，则不请求
      if (viewed && viewed.data && viewed.data.value[id]) {
        return;
      }

      // 实例object
      if (!(viewed && viewed.data && viewed.data.value)) {
        viewed = {
          data: {value: {}}
        }
      }

      http.post(api["player_viewed"], {
        data: {
          data: {id}
        }
      }).then(res => {
        storage.set("viewed", {...viewed.data.value, [id]: new Date().getTime()});
      });
    },
    /**
     * 获取基本字段
     * 从[url]中整理
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
    getPlayerInfo() {
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

      this.cheater = {};

      this.http.get(api["cheaters"], {params}).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.cheater = d.data;
          return;
        }

        switch (d.code) {
          case "player.bad":
          case "player.notFound":
            this.$router.push({name: 'player_list'})
            break;
        }

        this.$Message.info(this.$t('basic.tip.notFound'));
      }).finally(() => {
        this.onViewed();
        this.checkPlayerSubscribes();
        this.spinShow = false;
      });
    },
    /**
     * 获取举报玩家时间轴
     */
    getTimeline() {
      this.spinShow = true;

      this.http.get(api["account_timeline"], {
        params: Object.assign({
          skip: this.timeline.skip,
          limit: this.timeline.limit
        }, {personaId: this.getParamsIds('personaId')})
      }).then(res => {
        let d = res.data;

        if (d.success == 1) {
          d.data.result.forEach((i, index) => {
            i.index = index;
            i.show = false;
          });

          this.timelineList = d.data.result;

          // 排序
          this.onTimeLineSort();
        }
      }).finally(() => {
        this.spinShow = false;
      })
    },
    /**
     * 时间轴排序
     */
    onTimeLineSort() {
      switch (Number(this.timeline.sort)) {
        case 1:
          this.timelineList = this.timelineList.sort(function (x, y) {
            return x.index > y.index ? 1 : -1;
          });
          break;
        case 2:
          this.timelineList = this.timelineList.sort(function (x, y) {
            return x.index < y.index ? 1 : -1;
          });
          break;
      }
    },
    /**
     * 时间轴筛选
     * 依次条件筛选
     * @param index
     * @returns {boolean}
     */
    filtrateTimelineItem(index) {
      const that = this;
      const list = this.timeline.seeTypeList;

      return list
          .filter(i => Number(that.timeline.seeType) == i.value)[0].item
          .indexOf(this.timelineList[index].type) >= 0;
    },
    /**
     * 提交判决
     */
    async onJudgement() {
      let {suggestion, status} = this.verify;
      const cheatMethods = this.verify.checkbox;

      if (this.verifySpinShow) return;
      if ((['kill', 'guilt'].includes(status) && cheatMethods == '') || suggestion.trim() === '') {
        this.$Message.warning(this.$i18n.t('detail.messages.fillEverything'));
        return false;
      }
      if (suggestion.trim().length < 5) {
        // too short
        this.$Message.warning(this.$i18n.t('detail.messages.pleaseExplain'));
        return false;
      }
      if ('0123456789abcedfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,-_'.split('').indexOf(suggestion.trim()) != -1) { // one letter suggestion
        this.$Message.warning(this.$i18n.t('detail.messages.dontDoIt') + suggestion);
        return false;
      }

      this.verifySpinShow = true;
      this.http.post(api["player_judgement"], {
        data: {
          data: {
            toPlayerId: this.cheater.id,
            cheatMethods: ['kill', 'guilt'].includes(this.verify.status) ? cheatMethods : null,
            action: this.verify.status,
            content: formatTextarea(suggestion),
          },
          encryptCaptcha: this.reply.captchaUrl.hash,
          captcha: this.reply.captcha,
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          // reset verifyForm
          this.verify.status = '';
          this.verify.suggestion = '';
          this.verify.checkbox = [];
          this.reply.captcha = '';
          this.cheater.status = status;

          this.$Message.success(this.$i18n.t('detail.messages.submitSuccess'));
          return;
        }

        this.$Message.error(d.code);
      }).finally(() => {
        this.getPlayerInfo();
        this.getTimeline();

        message.playSendVoice();

        this.verifySpinShow = false;
      })
    },
    /**
     * 发布申诉
     */
    handleAppeal() {
      const {content = ''} = this.appeal;

      this.appeal.load = true;

      this.http.post(api["player_banAppeal"], {
        data: {
          data: {
            toPlayerId: this.cheater.id,
            content
          }
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.$Message.success(d.message);
          return;
        }

        this.$Message.error(d.message);
      }).finally(() => {
        this.appeal.load = false;
        message.playSendVoice();
        this.getTimeline();
      });
    },
    /**
     * 申诉状态操作
     */
    handAdminAppeal(data) {
      if (!data) return;

      const array = data.split(',');

      this.http.post(api["player_viewBanAppeal"], {
        data: {
          data: {
            // the ban appeal id
            id: array[0],
            status: ['open', 'close', 'lock'][array[1]]
          }
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.$Message.success(d.message);
        } else {
          this.$Message.error(d.message);
        }

      }).finally(() => {
        this.getTimeline();
      })
    },
    /**
     * 回复
     * 1. 对举报的回复 2. 对回复的回复
     */
    handleReply(floor, userId) {
      this.reply.toFloor = floor === 'undefined' ? '' : floor;
      this.reply.toUserId = userId === 'undefined' ? '' : userId;

      // open reply modal
      this.replyModal = true;
    },
    /**
     * 触发评论取消时
     * 重置前端评论内容值
     */
    cancelReply() {
      this.replyModal = false;
      this.reply = {
        content: '',
        captchaUrl: {
          content: '',
          hash: '',
        }
      };
    },
    /**
     * 用户评论/回复
     */
    onReply() {
      const cheaterId = this.cheater.id;
      let {content = ''} = this.reply;

      content = formatTextarea(content);

      let data = {
        data: {
          toPlayerId: cheaterId,
          toCommentId: null,
          content: content,
        },
        encryptCaptcha: this.$refs.replyPlayerCaptcha.hash,
        captcha: this.reply.captcha,
      };

      // 楼中楼
      // 回复 评论dbID
      if (this.reply.toFloor && Number(this.reply.toFloor) >= 0) {
        data.data.toCommentId = this.timelineList[this.reply.toFloor].id;
        data.encryptCaptcha = this.$refs.replyCommentsCaptcha.hash;
      }

      this.replySpinShow = true;
      this.http.post(api["player_reply"], {data}).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.$Message.success(this.$i18n.t('detail.messages.replySuccess'));

          this.replyModal = false;
          this.reply.toFloor = "";
          this.reply = "";

          // Actively update text
          if (this.$refs.replyTextarea)
            this.$refs.replyTextarea.updateContent('');
          return;
        }

        this.$Message.error(d.code);
      }).finally(() => {
        this.replySpinShow = false;

        message.playSendVoice();

        this.cancelReply();
        this.getPlayerInfo();
        this.getTimeline();
      });
    },
    /**
     * 更新玩家信息
     * update cheater
     * @param event $event
     */
    updateCheaterInfo(event) {
      waitForAction.call(event.target, 60);

      if (!this.$store.state.user) {
        this.$Message.error(this.$i18n.t('detail.messages.signIn'));
        return false;
      }

      this.updateUserInfospinShow = true;

      this.http.post(api["player_update"], {
        data: {
          personaId: this.cheater.originPersonaId
        }
      }).then(res => {
        const d = res.data;

        if (d.error == 0) {
          const {cheaterGameName: originId, originUserId, avatarLink} = d.data.origin;

          this.cheater.originId = originId;
          this.cheater.originUserId = originUserId;
          this.cheater.avatarLink = avatarLink;

          this.$Message.error(this.$i18n.t('detail.messages.updateComplete'));
          return;
        }

        this.$Message.success(d.code);
      }).finally(() => {
        this.updateUserInfospinShow = false;
        this.updateCheaterModal = false;
      });
    },
    /**
     * 管理裁判提示锁
     */
    onJudgementLock() {
      if (this.isLogin)
        account_storage.updateConfiguration('judgementTip', true);
    },
    /**
     * 判决快速模板
     */
    onFastReply() {
      if (this.$refs.judgementTextarea && this.fastReply.selected.length > 0) {
        this.$refs.judgementTextarea.updateContent(this.fastReply.selected.toString());
      }
    },
    /**
     * 左侧申诉面板开关
     */
    onLeftAppealPlan() {
      this.appeal.disable = !this.appeal.disable;

      account_storage.updateConfiguration("detailLeftAppealPanel", this.appeal.disable);
    }
  },
  computed: {
    isOnlySuper() {
      return false;
      // return account_storage.checkPrivilegeGroup(
      //     this.$store.state?.user?.userinfo,
      //     ['root', 'super', 'dev']
      // );
    }
  }
})
</script>

<style lang="less">
@import "@/assets/css/icon.less";

.timeline-time-line {
  padding-top: 10px !important;

  .ivu-timeline-item-tail {
    margin-left: 15px;
  }

  .ivu-timeline-item-head {
    margin-top: 10px !important;
  }


  .timeline-content {
    position: relative;

    // force to wrap
    overflow-wrap: break-word;
    word-wrap: break-word;
    margin-left: 3rem;
  }

  .timeline-content .loading {
    background-image: url('/src/assets/fonts/loading.svg');
    background-repeat: no-repeat;
    min-width: 100px;
    min-height: 100px;
  }

  .ivu-timeline-item {
    padding: 1rem 0;
  }

  .ivu-timeline-item-content {
    padding: 0 .6rem 0 3rem;
  }

  .ivu-timeline-item-tail {
    top: 1rem;
    border-width: .3rem !important;
  }
}

.timeline-time-dot {
  width: 40px;
  margin-left: 15px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media screen and (max-width: 980px) {
  .timeline-time-dot {
    width: 25px;
    height: 25px;
    margin-left: 5px;
  }

  .timeline-time-line {
    .ivu-timeline-item-tail {
      margin-left: -2px;
    }

    .timeline-content {
      margin-left: 35px;
    }

    .ivu-timeline-item-head {
      margin-top: 5px !important;
    }

    .ivu-timeline-item-content {
      padding: 0 4px;
    }
  }
}

.timeline-description {
  .timeline-reply-description {
    margin: 10px 10px 0 10px;

    .timeline-reply-description-title {
      margin: 10px 15px 0 15px;
    }
  }
}

.detail-userinfo-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;

  h1 {
    font-size: 2.2rem;
  }
}

.detail-affix {
  position: fixed;
  right: calc(50% - (960px / 2) - 85px) !important;
  top: 30% !important;;
  transform: translateY(-30%) !important;;
  z-index: 100;

  a {
    display: block;
    padding: 10px 5px;
  }
}

@media screen and (min-width: 1180px) {
  .detail-affix {
    display: none !important;
  }
}
</style>
