export default {
  header: {
    index: '首页',
    about: '关于',
    cheaters: '外挂公示',
    report: '举报作弊',
    signin: '登录',
    signup: '注册',
    signout: '注销',
    daily: 'ban日报',
    dashboard: '管理后台',
    searchBar: '支持搜索历史ID啦...',
    searchInfo: '检索的ID为：',
    searchResult: '检索结果：',
    search: '检索',
    none: '无',
    signoutSuccess: '注销成功',
  },
  detail:{
	  info:{
		  viewTimes:'浏览次数',
		  reply:'回复',
		  reportedGames:'被举报的游戏:',
		  gameScores:'战绩链接',
		  firstReportTime:'第一次被举报时间:',
		  recentUpdateTime:'最近更新时间:',
		  originAvatar:'Origin头像',
		  historyID:'曾用名',
		  dealRecord:'管理员处理记录',
		  discription1:'若发现 链接失效 或 改名，请点击',
		  updateButton:'更新资料',
		  discription2:'bfban.com 有能力永久追踪被举报者的行踪',
		  discription3:'服务器也会定期抓取、更新被举报人的信息',
		  discription4:'历史ID也可以用来搜索',
		  timeLine:'时间线',
		  administrator:'管理员',
		  report:'举报',
		  inGame:'在',
		  gaming:'游戏中',
		  videoLink:'视频链接',
		  judge:'认为',
		  cheatMethod:'作弊方式',
		  agreeJudgement:'赞同上处理 并 石锤',
		  agreeWith:'赞同了',
		  thisChoice:'该决定',
		  replyManual1:'如果有新的证据图片或视频需要补充，可以再次举报。回复功能只能回复文本或链接。如需回复图片，请移步这里',
		  uploadPicButton:'上传图片',
		  replyManual2:'然后复制图片链接进行回复。',
		  replyManual3:'注册登录后才可以参与讨论',
		  appealManual1:'误BAN申诉：如有误BAN，请将 该案件页面链接 及 详细申诉信息 发送邮件至 ban-appeals@bfban.com 管理员将会处理。',
		  adminConsole:'管理员专区',
		  adminManual1:'不要轻易下判断，如果不能做出处理判断，就使用上方回复 参与讨论，等待举报者回复',
		  adminManual2:'管理员的任何处理操作都会对作弊者的 现有状态 造成改变，如果不是100%确定，请使用回复留言讨论',
		  judgement:'处理意见',
		  choice1:'石锤',
		  choice2:'嫌疑再观察',
		  choice3:'没有问题不是挂',
		  choice4:'回收站',
		  commit:'提交',
		  replyManual4:'请登录后参与回复',
      action: '行动',
      operatingTime: '工作时间',
      writeSomething: '写一些东西',
      giveOpinion: '你怎么看？',
      fastReplies: {
        stats: '玩家数据异常',
        evidencePic: '证据如图所示',
        evidenceVid: '证据如视频所示'
      }
	  },
    messages: {
      fillEverything: '请填写完整',
	    pleaseExplain: '请详细解释您的裁决',
      dontDoIt: '不准',
      replySuccess: '回复成功',
      signIn: '请登录',
      updateComplete: '更新完成',
      submitSuccess: '提交成功',
      changeHacker: '当前是 confirmed hacker 状态，你确定要处理成 {code} 吗？',
    },
  },
  report:{
	  info:{
      notFoundHintTitle: '我们无法找到该玩家',
      notFoundHintQuestion1: '但是我刚刚在游戏里见过他/我在查战绩app上查得到他？',
      notFoundHintAnswer1: '请至origin.com搜索该玩家，如确实能搜索到而无法举报，可至首页下方的联系方式处反馈bug',
      notFoundHintQuestion2: 'origin上无法搜索到，这是怎么一回事？',
      notFoundHintAnswer2: '这可能是EA数据库更新不及时，或是EA官方的bug，我们没有办法替他们解决，如果您想出一份力，可以至 \
      https://answers.ea.com/t5/Origin-Client-Web-Technical/bd-p/origin-technical-issues-en \
      官方反馈论坛反馈bug，此情况可以描述为 I can\'t search my friend by name on origin',
	  	reportHacker:'举报作弊',
	  	reportNews:'已经支持 战地V 举报啦！',
	  	bf1:'战地1',
	  	bfv:'战地5',
		  bf6:'战地6',
	  	idNotion1:'一次只填写一个ID，不要把战队名字写进来，不要写成自己的ID',
	  	idNotion2:'游戏ID是不区分大小写的，但请特别注意区分 i I 1 l L o O 0，正确填写举报ID',
	  	uploadManual1:'不想注册国内账号、嫌麻烦，上传视频可以前往',
	  	uploadManual2:'然后地址贴在下方',
	  	uploadManual3:'可以是 优酷，土豆，AB站等 视频网站链接',
	  	uploadPic1:'推荐上传 png, jpg, jpeg, gif 格式的图片',
	  	uploadPic2:'图片大于 2M 或 上传失败，可以前往',
	  	uploadPic3:'然后选择 Image URL 选项卡，把图片链接贴在下方',
	  	uploadPic4:'请列出阐明足够的证据，编辑器支持上传图片（限制2M）',
	  	getCaptcha:'获得验证码',
	  	report:'举报',
      description: '尽可能详细的列举被举报人的作弊证据',
      captcha: '验证码',
      required: '基本的',
      onlyOneId: '一次只有一个Origin ID',
      loginExpired: '您的登录已过期，请重新登录',
	  },
    labels: {
      cheatMethod: '作弊方法',
      hackerId: '挂逼id',
      game: '游戏',
      description: '描述',
    },
    error: {
      mediaEvidence: '请上传图片或填写视频链接',
      originId: '游戏ID不存在，请检查拼写',
      success: '提交成功',
    }
  },
  footer: {
    author: '由 mygoare 开发',
    feedback: '意见反馈'
  },
  home: {
    activity: {
      title: '网站动态',
      description: 'bfban.com  于 2018年11月4日 上线，收到 <b>{report}</b> 次举报，已石锤了 <b>{cheater}</b> 个挂壁，感谢大家的共同努力！',
      activities: {
        report: '举报了',
        join: '注册了 bfban ， 欢迎！',
        admin: '管理员',
        mark: '将',
        as: '处理为'
      },
    },
    howToUse: {
      title: '如何使用本站',
      description: `<a href="https://bfban.com">本站</a> 可以 <b>永久追踪</b> 被举报者的游戏ID，并支持 <b>搜索历史ID</b> ！欢迎大家积极举报。
      <p>如果遇到挂，可以</p>
      <p>1、先使用 <a target="_blank" href="https://bf1.mygoare.com/">战地1外挂举报助手</a> 给官方举报</p>
      <p>2、自己在网站 <router-link :to="{path: 'signup'}">注册</router-link> 后，自己 <router-link :to="{path: 'report'}">举报</router-link></p>
      <p>3、举报后即会被纪录在案，即使修改了ID也能被追踪到</p>`,
      tools: {
        main: '小工具',
        name: {
          report: '【推荐】战地1外挂举报助手',
          tracker: '【推荐】战地PC/手机战绩速查工具',
          tools: '战地周边工具',
          bfban: '【推荐】BFBAN APP',
          apiGametools: 'api.gametools.network',
          botGametools: 'top.gg/bot/714524944783900794',
          serverManager: 'manager.gametools.network',
        },
        description: {
          bftracker: '在线战绩查询网站，可以详细查询到各类数据',
          report: '在线生成举报文本',
          fairplay: '快速查询标记当前ID在BF3、BF4中的战绩进行异常标记，查询联ban史',
          tracker: '同时支持电脑手机快速查询战绩进行标记',
          tools: '帮助你解决游戏平台问题的工具',
          bfban: 'BFBAN手机客户端',
          apiGametools: '《战地风云》系列的公共API',
          botGametools: '《战地风云》系列的Discord统计机器人',
          serverManager: 'BF1服务器管理器，此工具还可以自动踢bfban.com中标记为黑客的人',
        }
      },
      qqGroup: 'QQ群/Discord',
      bfbanQq: '联系BFBan QQ/Community Network处理争议',
      gameTogether: '开黑',
    },
    bulletin: {
      title: '公告栏',
      webDev: '网站开发',
      bfbanAppD: 'BFBAN APP下载',
      japCon: '日语翻译者',
      engCon: '英语翻译者',
	    lanCon: '翻译',
	    localManager: '战地1服管工具',
      domCost: '支付域名',
    },
    special: {
      universityBFStats: '为你的大学争战地的光！浏览并参与各大学Battlefield 1战绩排行榜！戳：'
    }
  },
  about: {
    title: '关于',
    description: `<h2>BFBAN</h2>
    <p>
      诞生于2018年1月29日；
      是战地玩家一起组建的 <b>抵制外挂</b> 组织。
    </p>

    <p>
      目前主要成员组成：
    </p>
    <ul style="padding: .5rem 1rem .5rem;">
      <li>私服主</li>
      <li>战队队长</li>
      <li>战地UP</li>
    </ul>`,
    clanInfo: `
    <p>
      <b>目前加盟服务器，共 {clans} 个：</b>
      （ 搜索 <b>LB</b> 都可以找到加入联BAN局的服务器 ）
    </p>`,
    website: `
    <h2>bfban.com 网站</h2>
    <p>
      <a href="https://bfban.com">bfban.com</a> 网站依托于联BAN调查局，最初想法起源于热心玩家，由 <a target="_blank" href="https://mygoare.com">mygoare</a> 开发，于 2018年11月4日 上线‘
    </p>
    <p>主要为广大玩家提供举报、列举、搜索、追踪、讨论等服务；</p>`,
    contact: `
    <h2>误BAN申诉</h2>
    <p>如有误BAN，请将 案件页面链接 及 详细申诉信息 发送邮件至 ban-appeals@bfban.com 管理员将会处理。</p>
    <br/>
    <h2>联系我们</h2>
    <p>
      <a target="_blank" href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=-5GQjZqPk4bOv52ZnZ6R0ZyQkg">
        投诉邮箱
      </a>
    </p>
    <p>
      <a target="_blank" href="https://support.qq.com/products/64038">
        意见建议
      </a>
    </p>`
  },
  reset: {
    title: '重置密码',
    form: {
      qq: 'QQ',
      password: '新密码',
      passwordRepeat: '确认密码',
      submit: '提交',
    },
  },
  account: {
    title: '用户中心',
    hint1: '我们还没有 消息系统，但可以在下方举报的状态 来得知进度',
    hint2: '所有举报都可以 回复参与讨论',
    hint3: '若要补充证据，可以重复举报同一ID',
    userInfo: '个人信息',
    username: '用户名：',
    role: '身份：',
    admin: '管理员',
    normal: '普通',
    super: '超级管理员',
    joinedAt: '参加：',
    reports: '个人举报',
    noReports: '还没有任何举报',
    reported: '举报了',
    status: '状态',
    recentlyUpdated: '最近更新',
  },
  notFound: '如果历史记录找不到，可以使用网站顶部 搜索功能，支持搜索历史ID',
  signin: {
    title: '登录',
    form: {
      username: '用户名',
      password: '密码',
      captcha: '验证码',
      getCaptcha: '获得验证码',
      submit: '提交',
      submitHint: '没有账号？去注册',
    },
    failed: '登录失败',
    success: '登录成功',
    loginFirst: '请先登录',
  },
  signup: {
    title: '注册',
    prev: '上一步',
    next: '下一步',
    form: {
      username: '用户名',
      password: '密码',
      originId: '橘子ID',
      qq: 'QQ',
      email: '邮箱',
      captcha: '验证码',
      getCaptcha: '获得验证码',
      submit: '提交',
      submitHint: '已有账号？去登录',
    },
    placeholder: {
      username: '4位以上用户名',
      password: '6位以上密码',
      originId: 'origin名字',
      qq: '选填',
      email: 'origin绑定的邮箱地址'
    },
    checkemail: '请查看您的邮箱（包括垃圾箱）',
    usernameExist: '该用户名已被注册',
    playerNotFound: '找不到该玩家(请确认已允许按邮箱搜索)',
    originIdExist: '该origin账号已被绑定',
    success: '注册成功',
    badcode: '注册码无效/已被注册',
    fillIn: '请规范填写',
    failed: '注册失败',
  },
  list: {
    title: '外挂公示',
    filters: {
      game: {
        bf1: '战地1',
		bf6: '战地6',
        bfv: '战地V',
      },
      status: {
        all: '全部',
      },
      refresh: '刷新',
    },
    reportTime: '举报时间范围',
    updateTime: '更新时间范围',
    colums: {
      playerId: '游戏ID',
      reportTime: '举报时间',
      updateTime: '更新时间'
    } 
  },
  cheatMethods: {
    stealth: '隐身',
    wallhack: '透视',
    aimbot: '自瞄',
    oneShotKill: '秒杀',
    gadgetModify: '改装备',
    damageChange: '改伤',
    shootingThroughWalls: '子弹穿墙',
  },
  misc: {
    uploadImage: {
      info: '上传图片，不要超过2M',
      mobile: '双击屏幕上传...',
      desktop: '单击 或 拖拽 上传...',
      fail: '超过上传最大限制，图片2M',
    },
    uploadVideo: {
      info: '上传视频，不要超过30M',
      desktop: '点击或者拖动文件到这里上传',
    },
    progress: '上传中...',
  },
};
