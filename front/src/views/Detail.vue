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
                      :title="$t('detail.info.originAvatar', { msg: 'originAvatar' })"
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
          </Col>
          <Col :xs="{span: 22, pull: 1, push: 1}" :lg="{span: 19, push: 2}">
            <Row :gutter="10" type="flex" justify="space-between" align="top">
              <Col flex="1">
                <Tag color="error">
                  {{ $t(`basic.status.${cheater.status}`) }}
                </Tag>

                <!-- 被举报的游戏 S -->
                <router-link :to="{name: 'player_list', query: { game: cheater.games }}" v-if="cheater.games">
                  <Tag color="gold" :alt="$t('detail.info.reportedGames')"
                       v-for="(game,gameindex) in cheater.games" :key="gameindex">
                    {{ $t(`basic.games.${game}`, {game: game}) }}
                  </Tag>
                </router-link>

                <!-- 被举报的类型 E -->
                <template v-if="cheater.cheatMethods && cheater.cheatMethods.length > 0" >
                  <Tag color="warning" v-for="(method_item, method_index) in cheater.cheatMethods" :key="method_index">
                    {{ $t("cheatMethods." + method_item + ".title") }}
                  </Tag>
                </template>

                <h1 :style="`font-size: 1.6rem;${cheater.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''}`">
                  {{ cheater.originName || 'user id' }}
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
<!--                  <Divider type="vertical"/>-->
<!--                  <ButtonGroup type="button">-->
<!--                    <Button>-->
<!--                      跟踪-->
<!--                    </Button>-->
<!--                    <Button>-->
<!--                      <Icon type="md-arrow-dropdown"/>-->
<!--                    </Button>-->
<!--                  </ButtonGroup>-->
                  <Divider type="vertical"/>
                  <!-- 分享 share S -->
                  <router-link :to="{name: 'cheater_share'}">
                    <Button type="primary">
                      <Icon type="md-share"/>
                    </Button>
                  </router-link>
                  <!-- 分享 share E -->
                </Col>
              </template>
            </Row>
            <Row>
              <Col>
                <span>id:  {{ cheater.originUserId || 'id' }}</span>

                <template v-if="!isFull">
                  <Divider type="vertical"/>
                  <Dropdown>
                    <a href="javascript:void(0)">
                      {{ $t('detail.info.historyID', {msg: 'historyID'}) }}
                      <Icon type="ios-arrow-down"></Icon>
                    </a>
                    <DropdownMenu slot="list" v-if="cheater && cheater.history && cheater.history.length >= 0">
                      <!-- 历史ID -->
                      <DropdownItem v-for="origin in cheater.history" :key="origin.originName">
                        <Time :time="origin.fromTime" v-if="origin.fromTime"></Time>
                        <Divider type="vertical"/>
                        {{ origin.originName }}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Divider type="vertical"/>
                  <a @click="updateCheaterModal = true;"><Icon type="md-cloud" /> {{ $t('detail.info.updateButton') }}</a>

                  <Modal v-model="updateCheaterModal">
                    <div sort="title">
                      <PrivilegesTag :data="['admin','super','root','dev','bot']"></PrivilegesTag>
                    </div>
                    <div>
                      <Card style="margin: 2.5rem 0 1rem 0;" dis-hover>
                        <Row :gutter="16" type="flex" justify="center" align="middle">
                          <Col>
                            <Icon type="md-cloud" color="#535353" size="40" />
                          </Col>
                          <Col>
                            <Icon type="md-code-working" color="#aaa" size="20" />
                          </Col>
                          <Col>
                            <Icon type="ios-albums" color="#535353" size="40" />
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
                <Card>
                  <!-- 浏览次数 -->
                  <h3>{{ cheater.viewNum || 0 }}</h3>
                  <span>{{ $t('detail.info.viewTimes', {msg: 'viewTimes'}) }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card>
                  <!-- 回复次数 -->
                  <h3>{{ cheater.commentsNum || 0 }}</h3>
                  <span>{{ $t('detail.info.reply', {msg: 'reply'}) }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card>
                  <!-- 第一次被举报时间 -->
                  <h3>
                    <Time v-if="cheater.createTime" :time="cheater.createTime"></Time>
                  </h3>
                  <span>{{ $t('detail.info.firstReportTime', {msg: 'firstReportTime'}) }}</span>
                </Card>
              </Col>
              <Col :xs="{span: 12}" :lg="{span: 6}">
                <Card>
                  <!-- 最近更新时间 -->
                  <h3>
                    <Time v-if="cheater.updateTime" :time="cheater.updateTime"></Time>
                  </h3>
                  <span>{{ $t('detail.info.recentUpdateTime', {msg: 'recentUpdateTime'}) }}</span>
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
        <Card style="overflow: hidden" dis-hover>
          <Row :gutter="20" slot="title" type="flex" justify="center" align="middle">
            <Col :xs="{span: 23, push: 1}" :lg="{span: 8, push: 0}" class="mobile-hide">
              {{ $t('detail.info.assistPppeal') }}
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
            <Col :xs="{span: 22, push: 1, pull: 1}" :lg="{span: 17, push: 1}" order="2" class="tabs-style">
              <div class="content">
                <!-- 时间线 -->
                <TimelineItem
                    :id="`floor-${l.index}`"
                    pending
                    class="timeline-time-line"
                    v-show="isSeeType(index)"
                    :color="l.privilege === 'admin' ? 'red' : 'green'"
                    v-for="(l, index) in timelineList"
                    :key="index">
                  <div v-if="l.type === 'report'" slot="dot" class="timeline-time-dot ivu-tag-warning hand">
                    <Icon type="ios-hand" size="20"></Icon>
                  </div>
                  <div v-else-if="l.type === 'reply'" slot="dot" class="timeline-time-dot ivu-tag-geekblue reply">
                    <Icon type="ios-text" size="20" class="ivu-tag-text"></Icon>
                  </div>
                  <div v-else-if="l.type === 'banAppeal'" slot="dot"
                       class="timeline-time-dot ivu-tag-magenta ban_appeal">
                    <Icon type="md-bookmark" size="20" class="ivu-tag-text"></Icon>
                  </div>
                  <div v-else-if="l.type === 'judgement'" slot="dot"
                       class="timeline-time-dot ivu-tag-primary ban_appeal">
                    <Icon type="ios-medical" size="20" class=""></Icon>
                  </div>
                  <div v-else-if="l.type === 'verify'" slot="dot" class="timeline-time-dot trophy">
                    <Icon type="ios-share-alt" size="20"></Icon>
                  </div>
                  <div v-else slot="dot" class="timeline-time-dot ivu-tag-border ivu-tag-text out">
                    <Icon type="ios" size="20" class=""></Icon>
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

                          <router-link :to="{name: 'player', query: {game: `${l.cheatGame}`} }">
                            {{ l.cheatGame }}
                          </router-link>

                          <!-- 游戏中 -->
                          {{ $t('detail.info.gaming') }}

                          <Tag type="border" color="orange"
                               v-for="(methods, methodsIndex) in l.cheatMethods"
                               :key="methodsIndex">
                            {{ $t("cheatMethods." + methods + ".title") }}
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
                            <Tag size="default" color="geekblue">{{  $t('detail.info.videoLink') }}</Tag>
                            <a :href="link" target="_blank">{{ link.substr(0, 20) }}{{ link.length >= 20 ? '...' : '' }}</a>
                            <Divider type="vertical" v-if="linkindex < l.videoLink.split(',').length - 1"/>
                          </span>
                      </p>
                    </template>

                    <div class="description ivu-card ivu-card-bordered ivu-card-dis-hover">
                      <template v-if="l.content">
                        <div v-html="l.content"></div>
                      </template>
                    </div>

                    <p v-if="isLogin">
                      <!-- 回复 -->
                      <Button type="dashed"
                              @click="handleReply(l.floor || index, l.byUserId)">
                        {{ $t('detail.info.reply', {msg: 'reply'}) }}
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

                    <div v-if="l.content" v-html="l.content"
                         class="description ivu-card ivu-card-bordered ivu-card-dis-hover"></div>

                    <p v-if="isLogin">
                      <!-- 回复 -->
                      <Button type="dashed"
                              @click="handleReply(l.floor || index, l.byUserId)">
                        {{ $t('detail.info.reply', {msg: 'reply'}) }}
                      </Button>
                      <Divider type="vertical"/>
                      <!-- 申诉操作 -->
                      <Dropdown trigger="click" v-if="isAdmin" @on-click="handAdminAppeal">
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
                  <div :id="`floor-${l.id}`" v-if="l.type === 'verify' || l.type === 'judgement'" class="timeline-content bookmark">
                    <div class="timeline-time">
                      <Row>
                        <Col flex="1">
                          <router-link :to="{name: 'account', params: {uId: `${l.byUserId}`}}">
                            <BusinessCard :id="l.byUserId">
                              <u><b>{{ l.username || l.byUserId }}</b></u>
                            </BusinessCard>
                          </router-link>

                          {{ $t('detail.info.judge') }}

                          <Poptip trigger="hover" :transfer="true" word-wrap width="200" :content="$t(`basic.action.${l.judgeAction}.describe`)">
                            <Tag color="warning">
                              {{ getCheaterStatusLabel(l.judgeAction) }}
                            </Tag>
                          </Poptip>

                          <!-- 作弊方式 -->
                          <template v-if="l.cheatMethods && l.cheatMethods.length > 0">
                            {{ $t('detail.info.cheatMethod') }}

                            <Tag type="border" color="orange"
                                 v-for="(methods, methodsIndex) in l.cheatMethods"
                                 :key="methodsIndex">
                              {{$t("cheatMethods." + methods + ".title")}}
                            </Tag>
                          </template>
                        </Col>
                        <Col align="right">
                          <Time v-if="l.createTime" :time="l.createTime"></Time>
                        </Col>
                      </Row>
                    </div>

                    <div v-html="l.content" v-if="l.content"
                         class="description ivu-card ivu-card-bordered ivu-card-dis-hover"></div>

                    <p v-if="isLogin">
                      <!-- 回复 -->
                      <Button type="dashed"
                              @click="handleReply(l.floor || index, l.byUserId)">
                        {{ $t('detail.info.reply', {msg: 'reply'}) }}
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

                          {{ $t('detail.info.reply', {msg: 'reply'}) }}
                        </Col>
                        <Col align="right">
                          <Time v-if="l.createTime" :time="l.createTime"></Time>
                        </Col>
                      </Row>
                    </div>

                    <div class="description ivu-card ivu-card-bordered ivu-card-dis-hover">
                      <template v-if="l.quote">
                        <a :href="`#floor-${l.quote.id}`" >
                          <div class="description ivu-card ivu-card-bordered ivu-card-dis-hover">
                            <b>{{ l.quote.username }}</b> :
                            <div v-html="l.quote.content.substr(0, 80)" ></div>
                            ...
                          </div>
                        </a>
                      </template>
                      <div v-html="l.content" v-if="l.content"></div>
                    </div>

                    <p v-if="isLogin">
                      <!-- 回复 -->
                      <Button type="dashed"
                              @click="handleReply(l.floor || index, l.byUserId)">
                        {{ $t('detail.info.reply', {msg: 'reply'}) }}
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
                <!--              <Page :page-size="limit" show-total :current="page" :total="total" class="page" size="small"/>-->
                <br>
              </div>

              <!-- 用户回复 S -->
              <Card dis-hover :padding="0" id="reply" v-if="isLogin">
                <div slot="title" >
                  <Row :gutter="10">
                    <Col flex="1 150px">
                      {{ $t('detail.info.appealManual1') }}
                    </Col>
                    <Col flex="150px">
                      <Poptip word-wrap width="280" trigger="hover" transfer>
                        <Button type="primary"
                                size="large"
                                style="width:150px"
                                long
                                :loading="replySpinShow"
                                :disabled="!reply.content"
                                @click.stop.prevent="doReply">
                          {{ $t('detail.info.reply') }}
                        </Button>
                        <div slot="content">
                          <span>{{ $t('detail.info.replyManual1') }}</span>
                          <b><a href="https://sm.ms/" target="_blank">{{ $t('detail.info.uploadPicButton') }}</a></b>，
                          <span>{{ $t('detail.info.replyManual2') }}</span>
                        </div>
                      </Poptip>
                    </Col>
                  </Row>
                </div>
                <Textarea v-model="reply.content"
                          :height="'120px'"
                          :placeholder="$t(`detail.info.giveOpinion`)"></Textarea>
              </Card>
              <Alert type="warning" show-icon v-else>
                <template slot="desc">
                  {{ $t('detail.info.replyManual3') }}
                </template>
              </Alert>
              <!-- 用户回复 E -->
            </Col>

            <Col :xs="{span: 23, push: 1}" :lg="{span: 6, push: 0}" order="1" class="mobile-hide">
                <Button type="primary"
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
            <p>ヾ(◍°∇°◍)ﾉﾞ load...</p>
          </Spin>
        </Card>
        <br v-if="isAdmin">

        <!-- 管理员裁判 S -->
        <Card dis-hover v-if="isAdmin">
          <div :label="$t('detail.info.adminConsole', {msg: 'adminConsole'})">
            <h2 style="margin: 1rem 0;">
              <Row>
                <Col flex="1">
                  # {{ $t('detail.info.judgement', {msg: 'judgement'}) }}
                </Col>
                <Col>
                  <PrivilegesTag :data="['admin','super','root','dev','bot']"></PrivilegesTag>
                </Col>
              </Row>
            </h2>

            <Form ref='verifyForm' label-position="top">
              <Row :gutter="30">
                <Col span="12">
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
                            <Poptip trigger="hover" :transfer="true" word-wrap width="200" :content="$t(`basic.action.${v_i.value}.describe`)">
                              <Icon type="md-help-circle" size="20"/>
                            </Poptip>
                          </Col>
                        </Row>
                        <PrivilegesTag :data="v_i.privilege"></PrivilegesTag>
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span="12">
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
                          <Icon type="ios-help-buoy" />
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

                    <Row :gutter="15">
                      <Col span="24">
                        <Card :padding="0" dis-hover>
                          <Textarea v-model="verify.suggestion"
                                    :height="'250px'"
                                    :placeholder="$t(`detail.info.giveOpinion`)"></Textarea>
                        </Card>
                      </Col>
                      <Col span="24">
                        <Alert>
                          <template slot="desc">
                            <p class="hint">{{ $t('detail.info.adminManual1', {msg: 'adminManual1'}) }}</p>
                            <p class="hint">{{ $t('detail.info.adminManual2', {msg: 'adminManual2'}) }}</p>
                          </template>
                        </Alert>
                      </Col>
                    </Row>
                  </FormItem>
                </Col>
              </Row>

              <FormItem v-show="verify.status === '1'" label="fastReply">
                <CheckboxGroup v-model="fastReply.selected">
                  <Checkbox v-for="content in fastReply.content" :key='content' :label="content">
                    {{ $t(`detail.info.fastReplies.${content}`) }}
                  </Checkbox>
                </CheckboxGroup>
              </FormItem>

              <FormItem :label="$t('captcha.title')">
                <Row>
                  <Col>
                    <Input type="text" v-model="reply.captcha"
                           size="large"
                           maxlength="4"
                           :placeholder="$t('captcha.title')">
                      <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                        <Captcha ref="captcha"></Captcha>
                      </div>
                    </Input>
                  </Col>
                  <Col flex="1" align="right">
                    <Button type="primary" size="large" :loading="verifySpinShow" @click.stop.prevent="doVerify">
                      {{ $t('basic.button.submit') }}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </Form>
          </div>
        </Card>
        <!-- 管理员裁判 E -->

        <div v-if="!isCheaterExist">
          <Empty></Empty>
        </div>
      </template>
    </div>

    <template v-if="!isFull">
      <Affix :top="100">
        <Card dis-show class="detila-affix mobile-hide">
          <a href="#up">
            <Icon type="md-arrow-round-up" size="30"/>
          </a>
          <a href="#reply">
            <Icon type="md-chatboxes" size="30"/>
          </a>
        </Card>
      </Affix>

      <!-- 小窗口回复 S -->
      <Modal
          v-model="replyModal"
          :title="`${$t('detail.info.reply')} #${reply.toFloor}`"
          @on-ok="doReply"
          @on-cancel="cancelReply">
        <div v-if="isLogin">
          <Form :label-width="80" ref='replyForm' style="position: relative;">
            <FormItem v-if="timelineList[reply.toFloor]">
              <Tag>
                <BusinessCard :id="timelineList[reply.toFloor].byUserId">
                  @{{ timelineList[reply.toFloor].username }}
                </BusinessCard>
              </Tag>
            </FormItem>
            <FormItem v-if="timelineList[reply.toFloor]">
              <Card>
                <div v-html="timelineList[reply.toFloor].content" v-if="timelineList[reply.toFloor].content"></div>
              </Card>
            </FormItem>
            <FormItem>
              <Input @on-keydown="handleCmdEnter($event, 'reply')" v-model="reply.content" type="textarea"
                     :autosize="{minRows: 4}"
                     :placeholder="$t('detail.info.giveOpinion')"/>
            </FormItem>

            <FormItem :label="$t('captcha.title')">
              <Input type="text" v-model="reply.captcha"
                     size="large"
                     maxlength="4"
                     :placeholder="$t('captcha.title')">
                <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                  <Captcha ref="captcha"></Captcha>
                </div>
              </Input>
            </FormItem>
          </Form>
        </div>
        <div v-else>{{ $t('detail.info.replyManual4', {msg: 'replyManual4'}) }}</div>
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
                <Edit :content="appeal.content" @change="handleMiscChange"
                      :editorContent="$t('detail.appeal.placeholder.content')"/>
              </FormItem>
            </Form>
          </Col>
        </Row>
      </Modal>
      <!-- 小窗口申诉 E -->

      <br>
    </template>
  </div>
</template>

<script>
import BFBAN from "/src/assets/js/bfban";
import theme from "/public/conf/themes.json";

import {api, http, http_token, util, storage} from '../assets/js/index'

import Empty from '../components/Empty.vue'
import Edit from "../components/Edit";
import Textarea from "../components/Textarea";
import BusinessCard from "../components/businessCard.vue";
import RecordLink from "../components/RecordLink.vue";
import Captcha from "../components/Captcha";
import PrivilegesTag from "/src/components/PrivilegesTag";

import {formatTextarea, waitForAction} from "@/mixins/common";

export default new BFBAN({
  data() {
    return {
      getGameLabel: util.getGameLabel,
      detailLoad: true,
      privileges: [],
      appeal: {
        load: false,
        show: false,
        toPlayerId: 0,
        content: ''
      },
      cheater: {
        originId: '',
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
      games: [],
      timelineList: [],
      timeline: {
        sort: '1',
        seeType: 1,
        skip: 0,
        limit: 100,
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
      verify: {
        status: 0,
        checkbox: [],
        choice: [],
        suggestion: '',
      },
      spinShow: true,
      verifySpinShow: false,
      replySpinShow: false,
      isCheaterExist: true,
      replyModal: false,
      updateUserInfospinShow: false,
      updateCheaterModal: false,
      cheatMethodsGlossary: null,
      fastReply: {
        content: ['stats', 'evidencePic', 'evidenceVid'],
        selected: [],
      },
    }
  },
  components: {Empty, Edit, Textarea, BusinessCard, RecordLink, Captcha, PrivilegesTag},
  watch: {
    '$route': 'loadData',
    'fastReply.selected': function () {
      this.verify.suggestion = '' + this.fastReply.selected.map(i => this.$t(`detail.info.fastReplies.${i}`));
    }
  },
  created() {
    this.http = http_token.call(this);

    this.loadData();
    this.getCheatersInfo();
    this.getTimeline();
  },
  methods: {
    getCheaterStatusLabel: util.getCheaterStatusLabel,
    async loadData() {
      // set Token Http mode
      this.http = http_token.call(this);

      const privileges = await import('/public/conf/privilege.json');
      this.privileges = this.privileges.concat(privileges.child);

      await util.initUtil().then((res) => {

        this.cheaterStatus = res.cheaterStatus;

        // 裁决结果
        this.cheatMethodsGlossary = res.cheatMethodsGlossary;

        // 裁决作弊类型
        this.verify.choice = res.action;
        this.verify.status = this.verify.choice[0].value;
      });
    },
    onAvatarError () {
      this.cheater.avatarLink = "";
    },
    /**
     * 更新游览值
     */
    onViewed () {
      const viewed = storage.session().get('viewed');
      const id = this.cheater.id;

      if (!id) return;

      // 在持久下存在此id，则不请求
      if (viewed.code <= 0 || viewed?.data?.value[id]) {
        return;
      }

      http.post(api["player_viewed"], {
        data: {
          data: { id }
        }
      }).then((res) => {
        storage.session().set('viewed', {...viewed.data.value, [id]: true});
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
     * 获取作弊者档案
     */
    getCheatersInfo() {
      this.cheater = {};

      this.http.get(api["cheaters"], {
        params: Object.assign({
          history: true
        }, {
          personaId: this.getParamsIds('personaId')
        })
      }).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.cheater = d.data;
          this.cheater.games.forEach(i => {
            this.games.push({game: i});
          })
        } else {
          this.$Message.info(this.$t('basic.tip.notFound'));
          this.$router.push({name: 'player_list'})
          this.catch(res);
        }
      }).finally(() => {
        this.onViewed();
        this.spinShow = false;
      });
    },
    /**
     * 时间轴
     * 档案日历
     */
    getTimeline() {
      this.spinShow = true;

      this.http.get(`${api["account_timeline"]}`, {
        params: Object.assign({
          skip: this.timeline.skip,
          limit: this.timeline.limit
        }, {personaId: this.getParamsIds('personaId')})
      }).then((res) => {
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
    isSeeType(index) {
      const that = this;
      const list = this.timeline.seeTypeList;

      return list.filter(i => Number(that.timeline.seeType) == i.value)[0].item.indexOf(this.timelineList[index].type) >= 0;
    },
    /**
     * 赞同此决议
     */
    jumpToBookmark(e) {
      let hash = e.target.dataset.hash;
      let el = document.querySelector(hash);

      // offset top 一层层 依次累加
      let offsetY = el.offsetParent.offsetTop + el.offsetParent.offsetParent.offsetTop + el.offsetParent.offsetParent.offsetParent.offsetTop - document.querySelector('header').offsetHeight;

      document.documentElement.scrollTop = offsetY;

      el.setAttribute('style', 'background: rgba(255, 153, 1, 0.15)');
      setTimeout(function () {
        el.setAttribute('style', 'transition: background 1s ease .5s;')
      }, 100);
    },
    /**
     * 提交判决
     */
    async doVerify() {
      const {status} = this.verify;
      let {suggestion} = this.verify;
      const cheatMethods = this.verify.checkbox;

      if ((['kill','guilt'].includes(status) && cheatMethods == '') || suggestion.trim() === '') {
        this.$Message.warning(this.$i18n.t('detail.messages.fillEverything'));
        return false;
      }
      // if ((status == '3' || status == '4') && suggestion.trim().length < 5) { // too short
      //   this.$Message.warning(this.$i18n.t('detail.messages.pleaseExplain'));
      //   return false;
      // }
      if ('0123456789abcedfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,-_'.split('').indexOf(suggestion.trim()) != -1) { // one letter suggestion
        this.$Message.warning(this.$i18n.t('detail.messages.dontDoIt') + suggestion);
        return false;
      }

      this.verifySpinShow = true;
      this.http.post(api["player_judgement"], {
        data: {
          data: {
            toPlayerId: this.cheater.id,
            cheatMethods: ['kill','guilt'].includes(this.verify.status) ? cheatMethods : null,
            action: this.verify.status,
            content: formatTextarea(suggestion),
          },
          encryptCaptcha: this.reply.captchaUrl.hash,
          captcha: this.reply.captcha,
        }
      }).then((res) => {
        const d = res.data;

        if (d.success == 1) {
          // reset verifyForm
          this.verify.status = '';
          this.verify.suggestion = '';
          this.verify.checkbox = [];
          this.reply.captcha = '';
          this.cheater.status = status;

          this.$Message.success(this.$i18n.t('detail.messages.submitSuccess'));
        } else {
          this.$Message.error('failed ' + d.msg);
        }

      }).finally(() => {
        this.getCheatersInfo();
        this.getTimeline();

        this.verifySpinShow = false;
      })
    },
    /**
     * 富文本单选绑定
     */
    handleMiscChange(text) {
      this.appeal.content = text;
    },
    /**
     * 申诉
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
      this.reply = {
        content: '',
        captchaUrl: {
          content: '',
          hash: '',
        }
      };
    },
    /**
     * 评论 reply
     */
    doReply() {
      this.replySpinShow = true;

      const cheaterId = this.cheater.id;
      const {toFloor, toUserId} = this.reply;
      let {content = ''} = this.reply;

      content = formatTextarea(content);

      let data = {
        data: {
          toPlayerId: cheaterId,
          // 小窗口回复展开，则存在回复楼层
          toCommentId: this.timelineList[this.reply.toFloor].id ?? null,
          content: content,
        },
        // encryptCaptcha: this.reply.captchaUrl.hash,
        // captcha: this.reply.captcha,
      };

      if (toFloor) {
        data.data['toFloor'] = toFloor;
      }
      if (toUserId) {
        data.data['toUserId'] = toUserId;
      }

      this.http.post(api["player_reply"], {
        data,
      }).then((res) => {
        const d = res.data;

        if (d.success == 1) {
          const {createDatetime, content, status} = d.data;

          this.$Message.success(this.$i18n.t('detail.messages.replySuccess'));

          // reset reply
          this.cancelReply();

          this.cheater.status = status;
          this.reply.toFloor = "";
          this.reply = "";
        } else {
          this.$Message.error(d.message);
        }
      }).finally(() => {
        this.replySpinShow = false;

        this.getCheatersInfo();
        // update timelink
        this.getTimeline();
      });
    },
    handleCmdEnter(e, type) {
      console.log(e, type);
      if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) {
        switch (type) {
          case 'reply':
            this.doReply()
            break;
          case 'verify':
            this.doVerify();
            break;
        }
      }
    },
    /**
     * 更新玩家信息
     * update cheater
     * @param e
     * @returns {boolean}
     */
    updateCheaterInfo(e) {
      waitForAction.call(e.target, 60);

      if (!this.$store.state.user) {
        this.$Message.error(this.$i18n.t('detail.messages.signIn'));
        return false;
      }

      this.updateUserInfospinShow = true;

      this.http.post(api["player_update"], {
        data: this.getParamsIds()
      }).then((res) => {
        this.updateUserInfospinShow = false;

        const d = res.data;
        if (d.error === 0) {
          const {cheaterGameName: originId, originUserId, avatarLink} = d.data.origin;

          this.cheater.originId = originId;
          this.cheater.originUserId = originUserId;
          this.cheater.avatarLink = avatarLink;

          // this.origins.unshift(d.data.origin);

          this.$Message.success(this.$i18n.t('detail.messages.updateComplete'));
        } else {
          this.$Message.error(d.msg);
        }
      });
    },
  },
  computed: {
    isAdmin() {
      const user = this.$store.state.user;
      const is = user ? user.userinfo.privilege.concat("").includes("admin") : false;
      return Boolean(is);
    },
    isLogin() {
      return Boolean(this.$store.state.user)
    },
    isFull() {
      return Boolean(this.$route.query.full || false);
    },
    currentUser() {
      return this.$store.state.user
    },
    currentLan() {
      return this.$root && this.$root.$i18n && this.$root.$i18n.locale || 'zh-CN';
    }
  }
})
</script>

<style lang="scss">
  .cheater-desc {
    max-width: 100%;
    width: 34rem;
  }

  .description {
    font-size: 0.8rem;
    line-height: 1.5rem;
    margin: 10px 0;
    padding: 10px;

    img, video {
      width: calc(100% + 20px);
      margin: 10px -10px 10px -10px;
    }

    a[href] {
      position: relative;
      text-decoration: underline;
      cursor: default;
    }

    a[href]::after {
      content: attr(href);
      display: block;
      opacity: .3;
      font-size: .2rem !important;
    }
  }

  .timeline-time-line {
    padding-top: 10px !important;

    .ivu-timeline-item-tail {
      margin-left: 15px;
    }

    .ivu-timeline-item-head {
      margin-top: 10px !important;
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
</style>

<style lang="scss">
  .spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
  }

  @keyframes ani-demo-spin {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .detila-affix {
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
    .detila-affix {
      display: none !important;
    }
  }
</style>
