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
