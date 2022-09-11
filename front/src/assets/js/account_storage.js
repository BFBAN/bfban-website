/**
 * 账户数据
 */

import Storage from './storage';

export default class AccountStorage extends Storage {
    ACCOUNTDATA = [{
        type: 'local',
        name: 'viewed'
    },
    {
        type: 'local',
        name: 'captcha'
    },
    {
        type: 'local',
        name: 'language'
    },
    {
        type: 'local',
        name: 'search.history'
    },
    {
        type: 'local',
        name: 'theme'
    },
    {
        type: 'local',
        name: 'user.subscribes'
    },
    {
        type: 'session',
        name: 'captcha'
    },
    {
        type: 'session',
        name: 'business'
    }];

    // 清除数据
    clearAll () {
        this.ACCOUNTDATA.forEach(i => {
            switch (i.type) {
                case 'session':
                    super.session().rem(super.STORAGENAME + i.name);
                    break;
                case 'local':
                    super.local().rem(super.STORAGENAME + i.name);
                    break;
            }
        })
    }
}