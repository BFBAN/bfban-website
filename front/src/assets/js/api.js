/**
 * api url
 */

export default class Api {
  constructor() {
    return {
      'search': 'search',
      'cheaters': 'player',
      'captcha': 'captcha',
      'statistics': 'statistics',
      'players': 'players',
      'user_info': 'user/info',
      'user_me': 'user/me',
      'player_judgement': 'player/judgement',
      'user_forgetPassword': 'user/forgetPassword', // 重置请求
      'user_forgetPasswordVerify': 'user/forgetPasswordVerify', // 重置密码验证
      'activity': 'activities',
      'user_changePassword': 'user/changePassword', // 修改密码
      'user_changeName': 'user/changeName', // 修改名称
      'cheaters_confirm': 'cheaters/confirm', // 管理员: 同意
      'player_reply': 'player/reply', // 回复
      'player_report': 'player/report',
      'player_update': 'player/update',
      'player_reset': 'reset',
      'account_timeline': 'player/timeline',
      'account_signout': 'user/signout',
      'account_signin': 'user/signin',
      'account_signup': 'user/signup',
      'account_signupVerify': 'user/signupVerify',
    };
  }
}
