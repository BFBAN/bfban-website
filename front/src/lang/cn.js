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
    none: '无'
  },
  detail:{
	  info:{
		  viewTimes:'浏览次数',
		  reply:'回复',
		  reportedGames:'被举报的游戏:',
		  gameScores:'战绩链接:',
		  firstReportTime:'第一次被举报时间:',
		  recentUpdateTime:'最近更新时间:',
		  originAvatar:'Origin头像:',
		  historyID:'历史ID:',
		  dealRecord:'管理员处理记录：',
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
	  },
  },
  report:{
	  info:{
	  	reportHacker:'举报作弊',
	  	reportNews:'已经支持 战地V 举报啦！',
	  	bf1:'战地1',
	  	bfv:'战地5',
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
	  },
    labels: {
      cheatMethod: '作弊方法',
      hackerId: '挂逼id',
      game: '游戏',
      description: '描述',
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
          apiGametools: 'top.gg/bot/714524944783900794',
          botGametools: 'api.gametools.network',
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
        }
      },
      qqGroup: 'QQ群',
      bfbanQq: '联ban局QQ群',
      gameTogether: '开黑',
    },
    bulletin: {
      title: '公告栏',
      webDev: '网站开发',
      bfbanAppD: 'BFBAN APP下载',
      japCon: '日语翻译者',
      engCon: '英语翻译者',
      domCost: '支付域名',
    }
  },
  about: {
    title: '关于',
    description: `<h2>联BAN调查局</h2>
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
    success: '登录成功',
  },
  signup: {
    title: '注册',
    form: {
      username: '用户名',
      password: '密码',
      originId: '橘子ID',
      qq: 'QQ',
      captcha: '验证码',
      getCaptcha: '获得验证码',
      submit: '提交',
      submitHint: '已有账号？去登录',
    },
  },
  list: {
    title: '外挂公示',
    filters: {
      game: {
        bf1: '战地1',
        bfv: '战地v',
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
};
