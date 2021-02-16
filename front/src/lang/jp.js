export default {
  header: {
    index: 'ホーム',
    about: '概要',
    cheaters: 'チーター',
    report: '報告',
    signin: 'サインイン',
    signup: '新規登録',
    signout: 'サインアウト',
    daily: '今日の報告数',
    dashboard: 'ダッシュボード',
    searchBar: '検索履歴IDをサポート...',
    searchInfo: '取得されたIDは次のとおりです。:',
    searchResult: 'の検索結果：',
    search: '探す'
  },
  detail:{
    info:{
      viewTimes:'閲覧',
      reply:'返信',
      reportedGames:'報告されたゲーム:',
      gameScores:'TrackerLink:',
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
      thisChoice:'the judgement',
      replyManual1:'新しい画像または動画の証拠がある場合は、もう一度報告できます。それ以外の場合は、ここに返信してテキストまたはリンクのみを返信できます。画像を追加する場合は、',
      uploadPicButton:'ここをクリックして画像をアップロード',
      replyManual2:'したのち、画像のリンクを貼り付けてください',
      replyManual3:'コメントするにはBFbanのメンバーになる必要があります',
      adminConsole:'管理者コンソール',
      adminManual1:'自分の意思で判断せず、確定的ではない場合には上記の返信機能を使用して証拠が増えるのを待ってください',
      adminManual2:'管理者によるアクションは、報告されたプレイヤーの判定を変更します。100％確定されていない場合は、上記の返信機能を使用してください',
      judgement:'判定',
      choice1:'確定的なチーター',
      choice2:'怪しいプレイヤー',
      choice3:'無実のプレイヤー',
      choice4:'ゴミ箱に入れる',
      commit:'決定',
      replyManual4:'返信するにはログインしてください',
      action: 'アクション',
      operatingTime: '稼働時間',
      writeSomething: '何か書いて',
      giveOpinion: 'あなたの意見は何ですか？',
    },
  },
  report:{
    info:{
      reportHacker:'チーターを報告',
      reportNews:'私たちはチーターを報告・情報共有する機能を提供します！',
      bf1:'Battlefield 1',
      bfv:'Battlefield 5',
      idNotion1:'一度に1つのIDのみを報告できます。小隊名を含めないでください。また、あなたのIDを記入しないでください。',
      idNotion2:'アルファベットの文字小文字は区別されませんが、i I 1 l L o O 0に注意してください。',
      uploadManual1:'BilibiliやYoutubeなどの動画サイトに登録したくない場合は→',
      uploadManual2:'動画リンクを下に貼り付けてください',
      uploadManual3:'Bilibili、Youtube、Youku、Tudouなどに対応しています',
      uploadPic1:'png、jpg、jpeg、gifなどの形式でスクリーンショットをアップロードすることをお勧めします。',
      uploadPic2:'画像データが2Mより大きい場合は→',
      uploadPic3:'画像URLタグを選択し、下に画像リンクを貼り付けます。',
      uploadPic4:'チートの証拠を説明してください。画像をアップロードすることもできます（データ上限：2M）',
      getCaptcha:'Captchaを取得',
      report:'報告',
      description: '報告された人物の不正行為の証拠を可能な限りリストします',
      captcha: '验证码',
      required: '必須',
      onlyOneId: '一度に1つのオリジンIDのみ',
    },
    labels: {
      cheatMethod: 'チート法',
      hackerId: 'ハッカーのID',
      game: 'ゲーム',
      description: '説明',
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
        mark: '意志',
        as: 'として扱われる'
      },
    },
    howToUse: {
      title: '使い方',
      description: `<a href="https://bfban.com">サイト</a> は、報告された人物のゲームIDを <b>永続的に追跡し、検索履歴ID</b>  をサポート  <b>できます</b> 。どなたでも積極的にご報告いただけます。
      <p>ハングアップに遭遇した場合は、</p>
      <p>1、 公式レポートへの最初の使用 <a target="_blank" href="https://bf1.mygoare.com/">バトルフィールド1プラグインレポートアシスタント</a>  。</p>
      <p>2、 それが <router-link :to="{path: 'signup'}">報告した</router-link> 後の彼ら自身のウェブサイト <router-link :to="{path: 'report'}">登録で ;</router-link></p>
      <p>3、レポート後に記録され、IDが変更されても追跡できます</p>`,
      tools: {
        main: 'ツール',
        name: {
          report: '【推奨】バトルフィールド1プラグインレポートアシスタント',
          tracker: '【推奨】バトルフィールドPC /モバイル記録クイックチェックツール',
          tools: '戦場周辺ツール',
          bfban: '【推奨】BFBANアプリ',
          apiGametools: 'top.gg/bot/714524944783900794',
          botGametools: 'api.gametools.network',
        },
        description: {
          bftracker: 'オンライン記録クエリWebサイトでは、さまざまなデータを詳細にクエリできます',
          report: 'オンラインでレポートテキストを生成する',
          fairplay: 'BF3とBF4の現在のIDのレコードをすばやく照会してマークを付け、異常にマークを付け、UnionBanの履歴を照会します',
          tracker: '同時に、それはマークするためにコンピュータと携帯電話の記録の迅速なクエリをサポートします',
          tools: 'ゲームプラットフォームの問題を解決するのに役立つツール',
          bfban: 'BFBANモバイルクライアント',
          apiGametools: 'バトルフィールドシリーズのパブリックAPI',
          botGametools: 'バトルフィールドシリーズの不和統計ボット',
        }
      },
      qqGroup: 'QQグループ',
      bfbanQq: '連合禁止局QQグループ',
      gameTogether: 'Game Together',
    },
    bulletin: {
      title: '速報',
      webDev: 'ウェブ開発',
      bfbanAppD: 'BFBANAPPダウンロード',
      japCon: '日本語翻訳寄稿者',
      engCon: '英語翻訳寄稿者',
      domCost: 'ドメインコスト',
    }
  },
  about: {
    title: '概要',
    description: `<h2>ユナイテッドBAN調査局</h2>
    <p>
      2018年1月29日生まれ。
      これは、フィールドのプレーヤーによって形成された<b>プラグインのボイコット</ b>組織です。
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
    <p>主に、大多数のプレーヤーにレポート、リスト、検索、追跡、ディスカッションなどのサービスを提供します。</p>`,
    contact: `
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
    hint1: 'メッセージングシステムはまだありませんが、以下のステータスを確認して進捗状況を確認できます',
    hint2: 'すべてのレポートは、ディスカッションに参加するために返信できます',
    hint3: '証拠を追加するために、同じIDを繰り返し報告できます',
    userInfo: '個人情報',
    username: 'ユーザー名：',
    role: '身元：',
    admin: '管理者',
    normal: '普通',
    super: 'スーパー管理者',
    joinedAt: '参加日：',
    reports: '個人レポート',
    noReports: 'まだ報告はありません',
    reported: '報告',
    status: '状態',
    recentlyUpdated: '最新のアップデート',
  },
  notFound: '履歴レコードが見つからない場合は、ウェブサイトの上部にある検索機能を使用して、検索履歴IDをサポートできます。',
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
    success: 'ログイン成功',
  },
  signup: {
    title: '新規登録',
    form: {
      username: 'ユーザー名',
      password: 'パスワード',
      originId: 'OriginID',
      qq: 'QQ',
      captcha: 'Captcha',
      getCaptcha: 'Captchaを取得',
      submit: '送信',
      submitHint: '既にアカウントをお持ちですか？サインイン',
    },
  },
  list: {
    title: 'チーター一覧',
    filters: {
      game: {
        bf1: 'BF1',
        bfv: 'BFV',
      },
      status: {
        all: '全て',
      },
      refresh: '更新',
    },
    reportTime: '時間範囲を報告する',
    updateTime: '時間範囲を更新する',
    colums: {
      playerId: 'ゲームID',
      reportTime: 'レポート時間',
      updateTime: '更新時間'
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
};
