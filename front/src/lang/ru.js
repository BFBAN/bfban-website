export default {
  header: {
    index: 'Главная',
    about: 'О Нас',
    cheaters: 'Читеры',
    report: 'Сообщить',
    signin: 'Войти',
    signup: 'Зарегестрироваться',
    signout: 'Выйти',
    daily: 'BanDaily',
    dashboard: 'Dashboard',
    searchBar: 'Поиск по Origin ID (и предыдущему ID)...',
    searchInfo: 'Результат поиска по ID для: ',
    searchResult: 'Результат поиска:',
    search: 'Поиск',
    none: 'ничего не найдено.',
    signoutSuccess: 'Выход произведён успешно',
  },
  detail:{
    info:{
      viewTimes:'Просмотров',
      reply:'Ответить',
      reportedGames:'В игре:',
      gameScores:'Ссылка на статистику:',
      firstReportTime:'Дата первого репорта:',
      recentUpdateTime:'Последнее время обновления:',
      originAvatar:'Origin аватар:',
      historyID:'ID Истории:',
      dealRecord:'Записи администратора：',
      discription1:'Если не удаётся посетить battlefieldtracker или он сменил Origin ID, нажмите',
      updateButton:'Обновить',
      discription2:'bfban.com может отслеживать новый ID игрока',
      discription3:'server can update hacker who is on the list on schedule',
      discription4:'history ID which they used before can be found too',
      timeLine:'Time line',
      administrator:'Master',
      report:'Report',
      inGame:'in',
      gaming:'gaming',
      videoLink:'Video link',
      judge:'judge as',
      cheatMethod:'Cheat method',
      agreeJudgement:'Agree and confirm this cheater',
      agreeWith:'agree with',
      thisChoice:'This judgement',
      replyManual1:'If you have new picture or video evidence to be maintained,you can report one more time.Otherwise,you can only reply text or link by replying here.if you want to add picture click here ',
      uploadPicButton:'Upload Pictures',
      replyManual2:'and then copy the picture link to reply',
      replyManual3:'You must be a BFban member to discuss with us together',
	  appealManual1:'Ban Appeals: Please send this case\'s web page link and appealing to ban-appeals@bfban.com .',
      adminConsole:'Master console',
      adminManual1:'Do not judge by your will,if you are not confirmed,then use the reply function above,and waiting for more evidence',
      adminManual2:'any action here by admin will make a status change for this reported player，if you are not 100% confirmed,please use reply function above',
      judgement:'Judgement',
      choice1:'Confirmed hacker',
      choice2:'Suspicious player',
      choice3:'Innocent clean player',
      choice4:'Remove to Recycle Bin',
      commit:'Confirmed',
      replyManual4:'You must log in to reply',
      action: 'Action',
      operatingTime: 'Operating Time',
      writeSomething: 'Write something',
      giveOpinion: 'What\'s your opinion?',
      fastReplies: {
        stats: 'Abnormal player stats',
        evidencePic: 'As the evidence showed in the picture',
        evidenceVid: 'As the evidence showed in the video'
      }
    },
    messages: {
      fillEverything: 'Please fill in everything',
      pleaseExplain: 'Please explian your decision in details',
      dontDoIt: 'Do not just give a ',
      replySuccess: 'Your reply was successfully added',
      signIn: 'Please sign in',
      updateComplete: 'Update completed',
      submitSuccess: 'Submitted successfully',
      changeHacker: 'The current person is in confirmed hacker state, are you sure you want to change it to {code} status?',
    },
  },
  report:{
	  info:{
	  	reportHacker:'Report a hacker',
	  	reportNews:'We offer the function to report BFV hackers！',
	  	bf1:'battlefield 1',
	  	bfv:'battlefield 5',
		bf6:'battlefield 6',
	  	idNotion1:'You can only report one ID one time，do not write the platoon name，do not write your ID',
	  	idNotion2:'Origin ID has no match for lower case and upper case，but you must identify i I 1 l L o O 0，offer correct ID',
	  	uploadManual1:'if you do not want to register video site member such as Bilibili and Youtube,you can go to',
	  	uploadManual2:'and then paste the video link below',
	  	uploadManual3:'you can offer your video by Bilibili,Youtube,Youku,Tudou and more',
	  	uploadPic1:'We recommend you to upload those types of screenshot such as png, jpg, jpeg, gif',
	  	uploadPic2:'picture which is larger than 2M would upload failed,you can go to ',
	  	uploadPic3:'and then choose Image URL Tag，paste the image link below',
	  	uploadPic4:'please make a discription for this hacker with evidence，Text editor offer image upload service（Size limits:2M）',
	  	getCaptcha:'Get Captcha',
	  	report:'Report',
      description: 'List as much evidence as possible about the reported person',
      captcha: 'Captcha',
      required: 'Required',
      onlyOneId: 'Only one origin ID at a time',
	  },
    labels: {
      cheatMethod: 'Cheat method',
      hackerId: 'Hacker\'s ID',
      game: 'Game',
      description: 'Description',
    },
    error: {
      mediaEvidence: 'Please upload a picture or fill in the video link',
      originId: 'Origin ID does not exist, please check spelling',
      success: 'Submitted successfully',
    }
  },
  footer: {
    author: 'Written by mygoare',
    feedback: 'Give feedback'
  },
  home: {
    activity: {
      title: 'Activity',
      description: 'bfban.com was made on the 4th of november 2018 and received <b>{report}</b> reports, and has a total of <b>{cheater}</b> banned hackers. Thanks for the hard work everyone!',
      activities: {
        report: 'reported',
        join: 'registered to bfban, welcome!',
        admin: 'Administrator',
        mark: 'marked',
        as: 'as'
      }
    },
    howToUse: {
      title: 'How to use',
      description: `<a href="https://bfban.com">This site</a> can <b>permanently track</b> a player\'s id, and we also support <b>searching of the id history!</b> Everyone is welcome to report hackers.
      <p>if there is a hacker you can:</p>
      <p>1. Use <a target="_blank" href="https://bf1.mygoare.com/">the bf1 report assistance</a> to report hacker to dice</p>
      <p>2. <router-link :to="{path: 'signup'}">Register on the website</router-link> and <router-link :to="{path: 'report'}">report on bfban</router-link></p>
      <p>3. The user id will be recorded. even if he changes his id, we can still find him</p>`,
      tools: {
        main: 'Tools',
        name: {
          report: '[Recommended] Battlefield 1 plug-in report assistant',
          tracker: '[Recommended] Battlefield PC/mobile record quick check tool',
          tools: 'Battlefield related tools',
          bfban: '[Recommended] BFBAN APP',
          apiGametools: 'api.gametools.network',
          botGametools: 'top.gg/bot/714524944783900794',
          serverManager: 'manager.gametools.network',
        },
        description: {
          bftracker: 'Online record query website, you can query various data in detail',
          report: 'Generate report text online',
          fairplay: 'quickly check if the player is already banned in bf3 and bf4',
          tracker: 'At the same time, it supports quick query of record and mark on computer and mobile phone',
          tools: 'Tools to help you solve game platform problems',
          bfban: 'BFBAN mobile client',
          apiGametools: 'Public api for the Battlefield series',
          botGametools: 'Discord stats bot for the Battlefield series',
          serverManager: 'BF1 servermanager, this tool can also autokick people marked as hacker within bfban.com',
        }
      },
      qqGroup: 'QQ group/Discord',
      bfbanQq: 'Contact BFBan QQ/Community network discord for ban appeals',
      gameTogether: 'Game Together',
    },
    bulletin: {
      title: 'Информация',
      webDev: 'Веб разработчик',
      bfbanAppD: 'Скачать приложение BFBAN',
      japCon: 'Japanese translation contributor',
      engCon: 'English translation contributor',
	  lanCon: 'переводчик',
	  localManager: 'Менеджер сервера BF1',
      domCost: 'Оплата домена',
    }
  },
  about: {
    title: 'О нас',
    description: `<h2>BFBAN</h2>
    <p>
    cсоздан 2018.1.29; Организация, созданная <b>в противовес хакерам</b>
    </p>

    <p>
      Состав управления bfban включает:
    </p>
    <ul style="padding: .5rem 1rem .5rem;">
      <li>Владельцев серверов</li>
      <li>Лидеров кланов</li>
      <li>Bf1 стримеров</li>
    </ul>`,
    clanInfo: `
    <p>
      <b>На данный момент всего {clans} кланов присоединились: </b>
      (Ищите <b>LB</b> чтобы найти сервера присоеденившиеся bfban)
    </p>`,
    website: `
    <h2>Сайт bfban.com</h2>
    <p>
      <a href="https://bfban.com">bfban.com</a>  relies on bfban Bureau of Investigations, the original idea originated from enthusiastic players, it is developed by <a target="_blank" href="https://mygoare.com">mygoare</a> and launched on November 4, 2018
    </p>
    <p>Bfban is mainly used to report players and discuss if a player is a hacker or not.</p>`,
    contact: `
    <h2>Ban Appeals</h2>
    <p>Please send the case's web page link and appealing to ban-appeals@bfban.com .</p>
    <br/>
    <h2>Contact us</h2>
    <p>
      <a target="_blank" href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=-5GQjZqPk4bOv52ZnZ6R0ZyQkg">
        Complaint mailbox
      </a>
    </p>
    <p>
      <a target="_blank" href="https://support.qq.com/products/64038">
        Suggestions
      </a>
    </p>`
  },
  reset: {
    title: 'Reset Password',
    form: {
      qq: 'QQ',
      password: 'New Password',
      passwordRepeat: 'Confirm Password',
      submit: 'Submit',
    },
  },
  account: {
    title: 'User info',
    hint1: 'We dont have a message system yet, but you can use this menu to see the status of your reports.',
    hint2: 'Everyone can post responses on the report page.',
    hint3: 'If you have more evidence for a hacker, please report the same id twice.',
    userInfo: 'Account info',
    username: 'Username:',
    role: 'Role:',
    admin: 'Administrator',
    normal: 'Normal user',
    super: 'Super admin',
    joinedAt: 'Joined at:',
    reports: 'Personal reports',
    noReports: 'No reports yet',
    reported: 'Reported',
    status: 'Status',
    recentlyUpdated: 'last updated',
  },
  notFound: 'if you can’t find the history log use the “search” on the top of the webpage. History id tracking is supported',
  signin: {
    title: 'Sign In',
    form: {
      username: 'Username',
      password: 'Password',
      captcha: 'Captcha',
      getCaptcha: 'getCaptcha',
      submit: 'Submit',
      submitHint: 'Do not have account? Go Sign up',
    },
    failed: 'Login failed',
    success: 'login successful',
    loginFirst: 'Please login first',
  },
  signup: {
    title: 'Sign Up',
    form: {
      username: 'Username',
      password: 'Password',
      originId: 'originId',
      qq: 'QQ',
      captcha: 'Captcha',
      getCaptcha: 'Get Captcha',
      submit: 'Submit',
      submitHint: 'Hava account? Go Sign In',
    },
    placeholder: {
      username: 'More than 4 characters',
      password: 'More than 6 characters',
      originId: 'optional',
      qq: 'optional',
    },
    fillIn: 'Please fill the form',
    failed: 'Registration failed',
  },
  list: {
    title: 'Cheaters list',
    filters: {
      game: {
        bf1: 'BF1',
		bf1: 'BF6',
        bfv: 'BFV',
      },
      status: {
        all: 'all',
      },
      refresh: 'refresh',
    },
    reportTime: 'Report time range',
    updateTime: 'Update time range',
    colums: {
      playerId: 'Player ID',
      reportTime: 'Report time',
      updateTime: 'Update time'
    } 
  },
  cheatMethods: {
    stealth: 'stealth',
    wallhack: 'wallhack',
    aimbot: 'aimbot',
    oneShotKill: 'oneShotKill',
    gadgetModify: 'gadgetModify',
    damageChange: 'damageChange',
    shootingThroughWalls: 'bulletThroughWalls',
  },
  misc: {
    uploadImage: {
      info: 'Upload pictures, no more than 2MB',
      mobile: 'Double-tap the screen to upload...',
      desktop: 'Click or drag to upload...',
      fail: 'Exceeded the maximum upload limit, the picture is over 2MB',
    },
    uploadVideo: {
      info: 'Upload video, no more than 30MB',
      desktop: 'Click or drag files here to upload',
    },
    progress: 'uploading...',
  },
};
