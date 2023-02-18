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

                <div>
                  <Dropdown :transfer="isMobile" placement="bottom-start">
                    <h1> {{ cheater.originName || 'User Name' }} </h1>

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
                              <Time :time="origin.fromTime" v-if="origin.fromTime" type="datetime"></Time>
                            </Col>
                            <Col flex="1" class="mobile-hide">
                              <Divider dashed style="margin: 0"/>
                            </Col>
                            <Col>{{ origin.originName }}</Col>
                          </Row>
                        </div>
                      </div>
                    </DropdownMenu>
                  </Dropdown>
                </div>
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

                  <a @click="updateCheaterModal = true;">
                    <Icon type="md-cloud"/>
                    {{ $t('detail.info.updateButton') }}
                  </a>
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
                    <Time v-if="cheater.createTime" :time="cheater.createTime" type="datetime"></Time>
                  </h3>
                  <span>{{ $t('detail.info.firstReportTime') }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card :padding="10" dis-hover>
                  <!-- 最近更新时间 -->
                  <h3>
                    <Time v-if="cheater.updateTime" :time="cheater.updateTime" type="datetime"></Time>
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
              {{ $t('detail.info.timeLine') }} <Tag v-if="timeline.total">{{ timeline.total || 0 }}</Tag>
            </Col>
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
                            <a :href="link.href" target="_blank" >
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
                          <Tag type="border" color="primary">{{ l.appealStatus }}</Tag>
                        </Col>
                      </Row>
                    </div>

                    <HtmlWidget :html="l.content" v-if="l.content"
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
                        <Dropdown trigger="click" @on-click="handAdminAppeal">
                          <a href="javascript:void(0)">
                            <Button size="small">
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
                      # {{ l.index }}-<u><span style="opacity: .4">{{ l.id }}</span></u>
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

                      <!-- Fast Reply S -->
                      <Divider content-position="left" style="margin: 0"></Divider>
                      <FastReply ref="fastReply" @change="onFastReply"></FastReply>
                      <!-- Fast Reply E -->

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
                    <Poptip trigger="hover" content="content" placement="left-start" padding="30" offset="2">
                      <Button type="primary"
                              size="large"
                              :long="isMobile"
                              v-voice-button :loading="verifySpinShow"
                              @click.stop.prevent="onJudgement">
                        {{ $t('basic.button.submit') }}
                      </Button>
                      <div slot="content" align="left">
                        <div>
                          <Checkbox v-model="verify.isUpdateinformation">{{ $t('detail.info.updateButton') }}</Checkbox>
                        </div>
                        <div>
                          <Checkbox v-model="verify.isSubscribeTrace"
                                    :disabled="!$store.state.configuration.subscribes">
                            {{ $t('detail.subscribes.tracking') }}
                          </Checkbox>
                        </div>
                      </div>
                    </Poptip>

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
        <Card dis-hover class="detail-affix mobile-hide">
          <a href="javascript:void(0)" @click="onRollingNode(0)">
            <Icon type="md-arrow-round-up" size="30"/>
          </a>
          <a href="javascript:void(0)" v-if="isLogin" @click="onRollingComment">
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
                           disabled
                           size="large"
                           :value="cheater.id"
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
                            ref="textareaAppealContent"
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

      <!-- 禁言 S -->
      <Modal
          v-model="mute.show"
          @on-ok="modalOk"
          @on-cancel="mute.show = false">
        <p slot="header" style="text-align:center">
          <span>Select the time duration for mute</span>
        </p>
        <Form>
          <FormItem>
            <Select v-model="mute.value">
              <Option v-for="item in [
              {value: 0, text: '10 mins'},
              {value: 1, text: '1 hr'},
              {value: 2, text: '12 hrs'},
              {value: 3, text: '1 day'},
              {value: 4, text: '1 week'},
              {value: 5, text: '1 month'}]"
                      :value="item.value"
                      :key="item.value">
                {{ item.text }}
              </Option>
            </Select>
          </FormItem>

          <FormItem>
            <Checkbox v-model="mute.isNoticeIntraStationUser">是否将此禁令通知玩家？</Checkbox>
          </FormItem>
        </Form>
      </Modal>
      <!-- 禁言 E -->
    </template>
  </div>
</template>

<script>
import {api, http, http_token, util, message, time, storage, account_storage, mail} from '../assets/js/index'

import BFBAN from "/src/assets/js/bfban";
import Empty from '../components/Empty.vue'
import Textarea from "../components/Textarea";
import BusinessCard from "../components/businessCard.vue";
import RecordLink from "../components/RecordLink.vue";
import Captcha from "../components/Captcha";
import Html from "@/components/Html";
import HtmlWidget from "../components/HtmlWidget";
import PrivilegesTag from "/src/components/PrivilegesTag";
import FastReply from "@/components/FastReply";
import htmllink from "@/components/HtmlLink";

import {formatTextarea, waitForAction} from "@/mixins/common";

export default new BFBAN({
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
        selected: [],
      },

      verify: {
        isSubscribeTrace: false,
        isUpdateinformation: false,
        status: 0,
        checkbox: [],
        choice: [],
        suggestion: '',
      },

      timelineList: [],
      timeline: {
        sort: '1',
        skip: 1,
        limit: 20,
        total: 0,
        seeType: 1,
        seeTypeList: [
          {
            label: 'all',
            value: 1,
            item: ['report', 'reply', 'ban_appeal', 'judgement', 'verify', 'banAppeal', 'historyUsername'],
          },
          {
            label: 'coreComment',
            value: 4,
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
          },
          {
            label: 'historyName',
            value: 5,
            item: ['historyUsername'],
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
      cheatMethodsGlossary: null
    }
  },
  components: {Empty, Textarea, BusinessCard, RecordLink, Captcha, Html, HtmlWidget, PrivilegesTag, FastReply, htmllink},
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

      this.timeline.seeType = this.getSeeType();

      await util.initUtil().then(res => {
        this.cheaterStatus = res.cheaterStatus;

        // 裁决结果
        this.cheatMethodsGlossary = res.cheatMethodsGlossary;

        // 裁决作弊类型
        this.verify.choice = res.action;
        this.verify.status = this.verify.choice[0].value;
      });

      await this.getPlayerInfo()
      await this.getTimeline()

      this.onMergeHistoryName()

      this.$Loading.finish();
    },
    /**
     * 时间轴分页事件
     */
    handlePageChange(num) {
      this.timeline.skip = num;
      this.getTimeline();

      const commentNode = document.getElementById('timeline');
      this.onRollingNode(commentNode.offsetTop);
    },
    showMuteAlert(id) {
      this.mute.id = id
      this.mute.show = true
    },
    modalOk() {
      this.muteUser('add', this.mute.id, this.mute.value)
    },
    /**
     * 禁言
     * @param type 禁言or移除
     * @param id user id
     * @param muteTime 时间
     * @returns {boolean}
     */
    muteUser(type, id, muteTime = 0) {
      const {isNoticeIntraStationUser} = this.mute;

      if (!muteTime && !id && !type) return false;

      this.http.post(api["mute_user"], {
        data: {
          data: {
            type,
            id,
            value: muteTime,
          },
          isNotice: isNoticeIntraStationUser,
          language: mail.exchangeLangField(this.$root.$i18n.locale)
        },
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.getTimeline();
          this.$Message.success({content: d.message || d.code, duration: 3});
          return;
        }

        this.$Message.error({content: d.message || d.code, duration: 3});
      }).catch(err => {
        this.$Message.error(err.code);
      })
    },
    /**
     * 合并时间轴历史名称
     */
    onMergeHistoryName() {
      let _timelineList = new Array().concat(this.timelineList);
      // 处理历史名称，放置对应对应位置
      for (let hisrotyIndex = 0; hisrotyIndex < this.cheater.history.length; hisrotyIndex++) {
        let nameHistoryTime = new Date(this.cheater.history[hisrotyIndex].fromTime).getTime();
        let prevNameTimeListTime = 0;
        let nameTimeListTime = 0;

        for (let timeLineIndex = 0; timeLineIndex < _timelineList.length; timeLineIndex++) {
          if (this.timelineList[timeLineIndex - 1] && _timelineList[timeLineIndex - 1].createTime) {
            prevNameTimeListTime = new Date(_timelineList[timeLineIndex - 1].createTime).getTime();
          }
          nameTimeListTime = new Date(_timelineList[timeLineIndex].createTime).getTime();

          // 历史名称的记录大于1，history内表示举报提交时初始名称，不应当放进timeline中
          // 索引自身历史修改日期位置，放入timeline中
          if (
              hisrotyIndex >= 1 &&
              _timelineList[timeLineIndex].type != 'historyUsername' &&
              nameHistoryTime >= prevNameTimeListTime &&
              nameHistoryTime <= nameTimeListTime) {
            _timelineList.splice(timeLineIndex, 0, {
              type: 'historyUsername',
              beforeUsername: this.cheater.history[hisrotyIndex - 1]?.originName,
              nextUsername: this.cheater.history[hisrotyIndex]?.originName,
              fromTime: this.cheater.history[hisrotyIndex].fromTime
            });
            break;
          } else if (
              hisrotyIndex >= 1 &&
              hisrotyIndex == this.cheater.history.length - 1 &&
              _timelineList[timeLineIndex].type != 'historyUsername' &&
              nameHistoryTime >= nameTimeListTime
          ) {
            _timelineList.push({
              type: 'historyUsername',
              beforeUsername: this.cheater.history[hisrotyIndex - 1]?.originName,
              nextUsername: this.cheater.history[hisrotyIndex]?.originName,
              fromTime: this.cheater.history[hisrotyIndex].fromTime
            })
            break;
          }
        }
      }
      this.timelineList = _timelineList;
    },
    /**
     * 追踪此玩家
     * 此项操作会存进账户配置字段内
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

      // 校验,含id且1天内，则不更新游览值
      if (viewed &&
          viewed.data &&
          viewed.data.value[id] < viewed.data.value[id] + 24 * 60 * 60 * 1000
      ) {
        return;
      }

      // 创建完整 Object
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
        this.cheater.viewNum++;
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
    async getPlayerInfo() {
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

          resolve()
        });
      })
    },
    /**
     * 获取举报玩家时间轴
     */
    async getTimeline() {
      return new Promise(resolve => {
        const that = this;
        this.spinShow = true;

        this.http.get(api["account_timeline"], {
          params: Object.assign({
            skip: (this.timeline.skip - 1) * this.timeline.limit,
            limit: this.timeline.limit
          }, {personaId: this.getParamsIds('personaId')})
        }).then(res => {
          let d = res.data;

          if (d.success == 1) {
            d.data.result.forEach((i, index) => {
              if (i.videoLink) {
                let videoLink = i.videoLink.split(',');
                if (videoLink instanceof Array) {
                  for (let j = 0; j < videoLink.length; j++) {
                    if (videoLink[j].indexOf('http') >= 0) videoLink[j] = new URL(videoLink[j]);
                  }
                }
                i.videoLink = videoLink;
              }

              i.index = index;
              i.show = false;
            });

            this.timelineList = d.data.result;
            this.timeline.total = d.data.total;

            // 排序
            this.onTimeLineSort();
          }
        }).finally(() => {
          this.onFloor();

          this.spinShow = false;

          resolve();
        })
      })
    },
    /**
     * 滚动至楼层位置
     * @param id
     */
    onFloor(id) {
      const that = this;
      // 锚点
      that.url = new URL(window.location.href);
      if (that.url.hash || id) {
        let urlOffsetTop = document.getElementById(
            (id || that.url.hash).replaceAll('#', '')
        );
        let className = urlOffsetTop.offsetParent.className;
        urlOffsetTop.offsetParent.className = className + " timeline-scroll-floor";
        setInterval(function () {
          if (urlOffsetTop.offsetParent)
            urlOffsetTop.offsetParent.className = className;
        }, 10000);

        this.onRollingNode(urlOffsetTop.offsetParent.offsetParent.offsetTop);
      }
    },
    /**
     * 滚动到评论区
     */
    onRollingComment() {
      const commentNode = document.getElementById('reply');

      this.onRollingNode(commentNode.offsetTop + commentNode.offsetHeight);
    },
    /**
     * 滚动位置
     * @param scrollTopNumber
     */
    onRollingNode(scrollTopNumber) {
      document.documentElement.scrollTop = scrollTopNumber;
    },
    /**
     * 分享楼层
     */
    getShareFloor(id) {
      let _url = new URL(window.location.href);
      if (!id) return _url;
      _url.hash = "#floor-" + id;
      return _url.toString() || "";
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
          .filter(i => Number(that.timeline.seeType) == i.value)[0]?.item
          .indexOf(this.timelineList[index].type) >= 0;
    },
    /**
     * 时间轴更新状态
     */
    onUpdataSeeType() {
      account_storage.updateConfiguration("timelineSeeType", this.timeline.seeType);
    },
    getSeeType() {
      let value = account_storage.getConfiguration("timelineSeeType");
      if (typeof value == 'boolean' && !value) value = this.timeline.seeType;
      return value;
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
      if (suggestion.trim().length < 5 || suggestion == '') {
        // too short
        this.$Message.warning(this.$i18n.t('detail.messages.pleaseExplain'));
        return false;
      }
      if ('0123456789abcedfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,-_'.split('').indexOf(suggestion.trim()) != -1) { // one letter suggestion
        this.$Message.warning(this.$i18n.t('detail.messages.dontDoIt') + suggestion);
        return false;
      }

      // 额外事件
      if (this.verify.isUpdateinformation) {
        this.updateCheaterInfo()
      }
      if (this.verify.isSubscribeTrace) {
        this.onSubscribes()
      }

      // 判决处理
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

        this.$Message.error(d.message || d.code);
      }).finally(() => {
        this.getPlayerInfo();
        this.getTimeline();

        message.playSendVoice();

        this.verifySpinShow = false;
        this.verify.isSubscribeTrace = !this.verify.isSubscribeTrace;
        this.verify.isUpdateinformation = !this.verify.isUpdateinformation;
      })
    },
    /**
     * 发布申诉
     */
    handleAppeal() {
      const content = this.appeal.content || this.$refs.textareaAppealContent.editorContent;

      if (!content) return;

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

        this.$Message.error(d.message || d.code);
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
          this.getTimeline();
          return;
        }

        this.$Message.error(d.message || d.code);
      }).catch(err => {
        this.$Message.error(err);
      })
    },
    /**
     * 回复
     * 1. 对举报的回复 2. 对回复的回复
     * @param floor string 楼层
     * @param userId string 回复id
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
      if (this.$store.state.$userinfo) {
        if (!(this.$store.state.$userinfo.origin && this.$store.state.$userinfo.origin.originUserId)) {
          this.$Message.error({content: this.$i18n.t("detail.messages.tipBind"), duration: 3});
          setTimeout(() => {
            this.$router.push({
              path: '/profile/information'
            })
          }, 3000)
          return
        }
      }
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

        this.$Message.error({content: d.message || d.code, duration: 3});
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
     */
    updateCheaterInfo() {
      if (!this.$store.state.user) {
        this.$Message.error(this.$i18n.t('detail.messages.signIn'));
        return false;
      }

      this.updateUserInfospinShow = true;

      this.http.post(api["player_update"], {
        data: {
          personaId: this.cheater.originPersonaId
        }
      }).then(async res => {
        const d = res.data;

        if (d.error == 0) {
          const {cheaterGameName: originId, originUserId, avatarLink} = d.data.origin;

          this.cheater.originId = originId;
          this.cheater.originUserId = originUserId;
          this.cheater.avatarLink = avatarLink;

          this.$Message.error(this.$i18n.t('detail.messages.updateComplete'));
          return;
        }

        await this.getPlayerInfo()
        await this.getTimeline()

        this.onMergeHistoryName()
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
    onFastReply(data) {
      this.fastReply.selected = data;

      if (this.$refs.judgementTextarea && this.fastReply.selected.length > 0) {
        this.$refs.judgementTextarea.updateContent(this.fastReply.selected.toString());
      }

      if (data.length == 0) this.$refs.judgementTextarea.updateContent('');
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
      const {userinfo} = this.$store.state.user || {}
      const {privilege = []} = userinfo
      return privilege.includes('super') && (!privilege.includes('root') && !privilege.includes('dev'))
    },
    isSuper() {
      const {userinfo} = this.$store.state.user || {}
      const {privilege = []} = userinfo
      return privilege.includes('super') || privilege.includes('root') || privilege.includes('dev')
    }
  }
})
</script>

<style lang="less">
@import "@/assets/css/icon.less";

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
  position: fixed !important;
  right: calc(50% - (960px / 2) - 85px) !important;
  top: 30% !important;;
  transform: translateY(-30%) !important;;
  z-index: 100;

  a {
    display: block;
    padding: 10px 5px;
  }
}

@media screen and (max-width: 1080px) {
  .detail-affix {
    opacity: .2;
    display: none !important;
  }
}
</style>