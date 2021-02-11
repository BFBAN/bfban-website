export default {
  header: {
    index: 'Home',
    about: 'About',
    cheaters: 'Cheaters',
    report: 'Report',
    signin: 'SignIn',
    signup: 'SignUp',
    signout: 'SignOut',
    daily: 'BanDaily',
    dashboard: 'Dashboard',
  },
  detail:{
    info:{
      viewTimes:'Views',
      reply:'Reply',
      reportedGames:'Reported game:',
      gameScores:'Score track link:',
      firstReportTime:'Firstly reported date:',
      recentUpdateTime:'Recently update time:',
      originAvatar:'Origin avatar:',
      historyID:'History ID:',
      dealRecord:'Admin operated records：',
      discription1:'If you found could not visit battlefieldtracker or he changed Origin ID,please Click',
      updateButton:'Update',
      discription2:'bfban.com can track hacker newest ID',
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
      agreeJudgement:'Agreed and confirmed this cheater',
      agreeWith:'agree with',
      thisChoice:'This judgement',
      replyManual1:'If you have new picture or video evidence to be maintained,you can report one more time.Otherwise,you can only reply text or link by replying here.if you want to add picture click here ',
      uploadPicButton:'Upload Pictures',
      replyManual2:'and then copy the picture link to reply',
      replyManual3:'You must be a BFban member to discuss with us together',
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
    },
  },
  report:{
	info:{
		reportHacker:'Report a hacker',
		reportNews:'We offer the function to report BFV hackers！',
		bf1:'battlefield 1',
		bfv:'battlefield 5',
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
	},
  },
  footer: {
    author: 'Written by mygoare',
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
          bfban: '[Recommended] BFBAN APP'
        },
        description: {
          bftracker: 'Online record query website, you can query various data in detail',
          report: 'Generate report text online',
          fairplay: 'quickly check if the player is already banned in bf3 and bf4',
          tracker: 'At the same time, it supports quick query of record and mark on computer and mobile phone',
          tools: 'Tools to help you solve game platform problems',
          bfban: 'BFBAN mobile client',
        }
      },
      qqGroup: 'QQ Group',
      bfbanQq: 'bfban qq group',
      gameTogether: 'Game Together',
    },
    bulletin: {
      title: 'Bulletin',
      webDev: 'Web developer',
      bfbanAppD: 'BFBAN app download',
      japCon: 'Japanese translation contributor',
      engCon: 'English translation contributor',
      domCost: 'Domain cost',
    }
  },
  about: {
    title: 'About',
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
  },
  list: {
    title: 'Cheaters list',
    filters: {
      game: {
        bf1: 'bf1',
        bfv: 'bfv',
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
};
