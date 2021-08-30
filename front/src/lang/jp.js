export default {
  header: {
    index: 'ホーム',
    about: '概要',
    cheaters: 'チーター',
    report: '報告',
    signin: 'サインイン',
    signup: '新規登録',
    signout: 'サインアウト',
    daily: '今日のBAN数',
    dashboard: 'ダッシュボード',
    searchBar: '以前のOrigin IDを含む...',
    searchInfo: '該当するIDは次の通りです:',
    searchResult: '検索結果：',
    search: '検索',
    none: '該当なし',
    signoutSuccess: 'サインアウトしました',
  },
  detail:{
    info:{
      viewTimes:'閲覧',
      reply:'返信',
      reportedGames:'報告されたゲーム:',
      gameScores:'Trackerリンク:',
      firstReportTime:'最初の報告日時:',
      recentUpdateTime:'直近の更新:',
      originAvatar:'Originアバター:',
      historyID:'以前のID:',
      dealRecord:'管理履歴：',
      discription1:'battlefieldtrackerで見つけられない場合、IDが変更されたかもしれません。こちらをクリック',
      updateButton:'更新',
      discription2:'bfban.comはチーターの最新のOriginIDを追跡しています',
      discription3:'リストに載っているチーターの情報を更新できます',
      discription4:'以前のIDも見ることができます',
      timeLine:'タイムライン',
      administrator:'管理者',
      report:'報告',
      inGame:'in',
      gaming:'gaming',
      videoLink:'動画のリンク',
      judge:'judge as',
      cheatMethod:'チートの種類',
      agreeJudgement:'チーターと判定します',
      agreeWith:'agree with',
      thisChoice:'this judgement',
      replyManual1:'新しい画像または動画の証拠がある場合は、新たに報告してください。追加の証拠がある場合は、テキストまたはリンクを返信機能で追加してください。画像を追加する場合はここをクリックして',
      uploadPicButton:'画像をアップロード',
      replyManual2:'したのち、画像のリンクを貼り付けてください',
      replyManual3:'コメントをするにはサインインが必要です',
	  appealManual1:'不当なBANを申し立てるには、このページのURLと一緒にban-appeals@bfban.comまでお問い合わせください .',
      adminConsole:'管理者コンソール',
      adminManual1:'自分の意思で判断せず、確定的ではない場合には上記の返信機能を使用して証拠が増えるのを待ってください',
      adminManual2:'管理者によるアクションは、報告されたプレイヤーの判定を変更します。100％確定でない場合は、上記の返信機能を使用してください',
      judgement:'判定',
      choice1:'確定的なチーター',
      choice2:'怪しいプレイヤー',
      choice3:'無実のプレイヤー',
      choice4:'ゴミ箱に入れる',
      commit:'決定',
      replyManual4:'返信するにはサインインが必要です',
      action: 'アクション',
      operatingTime: '日時',
      writeSomething: '記入してください',
      giveOpinion: '動画や画像のリンクを記入してください',
      fastReplies: {
        stats: 'Abnormal player stats',
        evidencePic: 'As the evidence showed in the picture',
        evidenceVid: 'As the evidence showed in the video'
      }
    },
    messages: {
      fillEverything: 'すべて記入してください',
      pleaseExplain: 'Please explian your decision in details',
      dontDoIt: 'Do not just give a ',
      replySuccess: '返信しました',
      signIn: 'サインインしてください',
      updateComplete: '更新しました',
      submitSuccess: '送信しました',
      changeHacker: 'このプレイヤーはチーターと判定されています。本当に{code}にしますか？',
    },
  },
  report:{
    info:{
      notFoundHintTitle: 'We can\'t find this player',
      notFoundHintQuestion1: 'But I\'ve just met him in game/I can find him on battlefield tracker?',
      notFoundHintAnswer1: 'Please visit origin.com to search that player. If this player can be found but the report can\'t be made, you can send us bug report via the contact methods on the bottom of the frontpage.',
      notFoundHintQuestion2: 'I can\'t find him on origin, what can I do?',
      notFoundHintAnswer2: 'That is probably because EA didnot update their database in time，or their system bugged, and we are unable to help them fix that bug. If you do wish to help, you can visit \
      https://answers.ea.com/t5/Origin-Client-Web-Technical/bd-p/origin-technical-issues-en \
      , the official froum to send bug report，you can describe this situation as: I can\'t search my friend by name on origin.',
      reportHacker:'チーターを報告',
      reportNews:'私たちはチーターを報告・情報共有する機能を提供します！',
      bf1:'Battlefield 1',
      bfv:'Battlefield 5',
      bf6:'Battlefield 6',
      idNotion1:'一度に1つのIDのみを報告できます。小隊名を含めないでください。また、あなたのIDを記入しないでください',
      idNotion2:'大文字小文字は区別されませんが、i I 1 l L o O 0に注意してください。',
      uploadManual1:'BilibiliやYoutubeなどの動画サイトに登録したくない場合は→',
      uploadManual2:'動画リンクを下に貼り付けてください',
      uploadManual3:'Bilibili、Youtube、Youku、Tudouなどに対応しています',
      uploadPic1:'png、jpg、jpeg、gifなどの形式でスクリーンショットをアップロードすることをお勧めします。',
      uploadPic2:'画像データが2Mより大きい場合は→',
      uploadPic3:'画像URLタグを選択し、下に画像リンクを貼り付けます。',
      uploadPic4:'チートの証拠を説明してください。画像をアップロードすることもできます（データ上限：2MB）',
      getCaptcha:'Captchaを取得',
      report:'報告',
      description: 'チートの証拠を記入してください',
      captcha: 'Captcha',
      required: '必須',
      onlyOneId: '一度に1つのOrigin IDのみ',
      loginExpired: 'Your login has expired, please re-login.',
    },
    labels: {
      cheatMethod: 'チートの種類',
      hackerId: 'チーターのID',
      game: 'ゲーム',
      description: '説明',
    },
    error: {
      mediaEvidence: '写真をアップロードするか、ビデオリンクに記入してください',
      originId: 'Origin IDが存在しません。スペルを確認してください',
      success: '送信されました',
    }
  },
  footer: {
    author: 'mygoareによって書かれました',
    feedback: 'フィードバック'
  },
  home: {
    activity: {
      title: 'アクティビティ',
      description: 'bfban.comは2018年11月4日にオンラインになり、 <b>{report}</b> 件のレポートを受け取り、<b>{cheater}</b> 件のレポートが報告されました。ご協力いただきありがとうございます。',
      activities: {
        report: '報告',
        join: 'bfbanに登録しました、ようこそ！',
        admin: '管理者',
        mark: 'marked',
        as: 'as'
      },
    },
    howToUse: {
      title: '使い方',
      description: `<a href="https://bfban.com">このサイト</a> は、報告されたプレイヤーのOrigin IDを <b>永続的に追跡し、検索をサポートします</b> 。どなたでも簡単にご報告いただけます。
      <p>チーターに遭遇した場合は、</p>
      <p>1. 公式の通報機能を使用 <a target="_blank" href="https://bf1.mygoare.com/">バトルフィールド1通報支援ツール</a>  </p>
      <p>2.  <router-link :to="{path: 'signup'}">bfbanに登録し、チーターを報告</router-link>  <router-link :to="{path: 'report'}"> </router-link></p>
      <p>3. IDが記録され、もし変更されても追跡できます</p>`,
      tools: {
        main: 'ツール',
        name: {
          report: '【推奨】バトルフィールド1通報支援ツール',
          tracker: '【推奨】バトルフィールドPC /モバイル記録クイックチェックツール',
          tools: '戦場周辺ツール',
          bfban: '【推奨】BFBANアプリ',
          apiGametools: 'api.gametools.network',
          botGametools: 'top.gg/bot/714524944783900794',
          serverManager: 'manager.gametools.network',
        },
        description: {
          bftracker: '様々なデータを詳細に閲覧できます',
          report: '通報用のテキストを簡単に生成することができます',
          fairplay: 'UnionBanの履歴を照会し、BF3とBF4でのBAN履歴をチェックできます',
          tracker: 'PCと携帯で迅速にデータベースを参照できます',
          tools: 'ゲームプラットフォームの問題を解決するのに役立ちます',
          bfban: 'BFBANモバイルクライアント',
          apiGametools: 'バトルフィールドシリーズのパブリックAPI',
          botGametools: 'バトルフィールドシリーズのDiscord統計ボット',
          serverManager: 'BF1サーバーマネージャー、このツールは、bfban.com内でチーター判定されているプレイヤーを自動でキックすることもできます',
        }
      },
      qqGroup: 'QQグループ/Discord',
      bfbanQq: '連合BFBan QQグループ/Community Networkグループ',
      gameTogether: 'Game Together',
    },
    bulletin: {
      title: '速報',
      webDev: 'ウェブ開発',
      bfbanAppD: 'BFBANAPPダウンロード',
      japCon: '日本語翻訳寄稿者',
      engCon: '英語翻訳寄稿者',
      lanCon: '翻訳寄稿者',
      localManager: 'BF1サーバーマネージャー',
      domCost: 'ドメインコスト',
    },
    special: {
      universityBFStats: ''
    }
  },
  about: {
    title: '概要',
    description: `<h2>ユナイテッドBAN調査局</h2>
    <p>
      2018年1月29日生まれ。
      これは、フィールドのプレーヤーによって形成された<b>プラグインのボイコット</ b>組織です
    </p>

    <p>
      主なメンバーの現在の構成：
    </p>
    <ul style="padding: .5rem 1rem .5rem;">
      <li>プライベートサーバー</li>
      <li>チームのキャプテン</li>
      <li>バトルフィールドUP</li>
    </ul>`,
    clanInfo: `
    <p>
      <b>現在、{clans} 台のサーバーが参加しています。:</b>
      （ <b> LB </b>を検索して、BANビューローに参加しているサーバーを見つけます ）
    </p>`,
    website: `
    <h2>bfban.comのウェブサイト</h2>
    <p>
      <a href="https://bfban.com">bfban.com</a> ウェブサイトはユニオンBAN調査局に依存しています。元のアイデアは熱狂的なプレーヤーから生まれました。 <a target="_blank" href="https://mygoare.com">mygoare</a> 2018年11月4日に開発および発売されました‘
    </p>
    <p>主に、大多数のプレーヤーにレポート、リスト、検索、追跡、ディスカッションなどのサービスを提供します</p>`,
    contact: `
    <h2>Ban Appeals</h2>
    <p>Please send the case's web page link and appealing to ban-appeals@bfban.com .</p>
    <br/>
    <h2>お問い合わせ</h2>
    <p>
      <a target="_blank" href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=-5GQjZqPk4bOv52ZnZ6R0ZyQkg">
        苦情メールボックス
      </a>
    </p>
    <p>
      <a target="_blank" href="https://support.qq.com/products/64038">
        提案
      </a>
    </p>`
  },
  reset: {
    title: 'パスワードのリセット',
    form: {
      qq: 'QQ',
      password: '新しいパスワード',
      passwordRepeat: 'パスワードの確認',
      submit: '送信',
    },
  },
  account: {
    title: 'ユーザーセンター',
    hint1: 'メッセージ機能はまだありませんが、以下のステータスで進捗状況を確認できます',
    hint2: 'すべてのレポートは、ディスカッションに参加するために返信できます',
    hint3: '同じIDを繰り返し報告して証拠を追加できます',
    userInfo: 'ユーザー情報',
    username: 'ユーザー名：',
    role: '役職：',
    admin: '管理者',
    normal: '普通',
    super: '上級管理者',
    joinedAt: '加入日：',
    reports: '個人レポート',
    noReports: 'まだ報告はありません',
    reported: '報告',
    status: '状態',
    recentlyUpdated: '最近の更新',
  },
  notFound: '記録が見つからない場合は、ウェブサイトの上部にある検索機能を使用して、ID検索をサポートできます',
  signin: {
    title: 'サインイン',
    form: {
      username: 'ユーザー名',
      password: 'パスワード',
      captcha: 'Captcha',
      getCaptcha: 'Captchaを取得',
      submit: '送信',
      submitHint: 'アカウントを持っていませんか？新規登録',
    },
    failed: 'サインインに失敗しました',
    success: 'サインインしました',
    loginFirst: '最初にサインインしてください',
  },
  signup: {
    title: '新規登録',
    form: {
      username: 'ユーザー名',
      password: 'パスワード',
      originId: 'Origin ID',
      qq: 'QQ',
      captcha: 'Captcha',
      getCaptcha: 'Captchaを取得',
      submit: '送信',
      submitHint: '既にアカウントをお持ちですか？サインイン',
    },
    placeholder: {
      username: '4文字以上のユーザー名(必須)',
      password: '6文字以上のパスワード(必須)',
      originId: 'Origin ID',
      qq: 'QQグループ',
    },
    fillIn: '必須事項を記入してください',
    failed: '登録に失敗しました',
  },
  list: {
    title: 'チーター一覧',
    filters: {
      game: {
        bf1: 'BF1',
        bf6: 'BF6',
        bfv: 'BFV',
      },
      status: {
        all: 'すべて',
      },
      refresh: '更新',
    },
    reportTime: '報告された時間',
    updateTime: '更新された時間',
    colums: {
      playerId: 'ゲームID',
      reportTime: '報告された時間',
      updateTime: '更新された時間'
    }
  },
  cheatMethods: {
    stealth: '透明',
    wallhack: 'ウォールハック',
    aimbot: 'エイムボット',
    oneShotKill: 'ワンショット',
    gadgetModify: 'ガジェットチート',
    damageChange: 'ダメージ変更',
    shootingThroughWalls: '壁抜き',
  },
  misc: {
    uploadImage: {
      info: '写真をアップロードする、2MB以下',
      mobile: '画面をダブルタップしてアップロード...',
      desktop: 'クリックまたはドラッグしてアップロード...',
      fail: 'アップロードできる上限を越えています。画像の大きさは2MBまでです',
    },
    uploadVideo: {
      info: '動画のアップロード、30MB以下',
      desktop: 'ファイルをクリックまたはドラッグしてアップロード',
    },
    progress: 'アップロード中...',
  },
};
