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
      'activity': 'activities',
      'account_signout': 'user/signout',
      'account_signin': 'user/signin',
      'account_reset': 'account/reset',
      'account_signup': 'user/signup',
      'account_signupVerify': 'user/signupVerify',
    };
  }
}
