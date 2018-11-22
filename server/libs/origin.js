const axios = require('axios');
const request = require('request-promise-native');
const xml2js = require('xml2js');
const { parseString } = require('xml2js');
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const tokenFile = path.resolve(__dirname, 'token.json');

let fooToken = {};

function readToken() {
  // return new Promise((resolve, reject)=> {
  //   // {
  //   //   expires: '',
  //   //   token: '',
  //   // }
  //   let access_token = '';
  //   fs.readFile(tokenFile, (err, data) => {
  //     if (err) {
  //       resolve(access_token)
  //     } else {
  //       let d = JSON.parse(data.toString());
  //       let { expires, token } = d;
  //
  //       let currentDatetime = moment().format();
  //
  //       if (moment(currentDatetime).isBefore(expires)) {
  //         access_token = token;
  //       }
  //       resolve(access_token);
  //     }
  //   });
  //
  // });

  if (fooToken && fooToken.expires && fooToken.token) {
    if (moment().isBefore(fooToken.expires)) {
      return fooToken.token;
    }
    return '';
  }
}

function writeToken(token) {
  const expires = moment().add(50, 'minutes');
  // let data = {
  //   expires,
  //   token,
  // };
  // return new Promise((resolve, reject) => {
  //   fs.writeFile(tokenFile, JSON.stringify(data), (err) => {
  //     if (err) {
  //       reject(err)
  //     } else {
  //       resolve()
  //     }
  //   })
  // })

  fooToken = {
    expires,
    token,
  };
}

// 60 days expires
const rememberedCookie = `
sid=U3R0ZkVLeTFnSm1aWDJ5M3J5YnN4a1IwR0E3djVSWWpVa2ZFUmpZakNSNERYcDU0M3pHRjJ6WnVlY01aSw.gphyM6HSUbeiG-BVuqjVJmtdF3qZIm4Od5phPcD0-XA; 
remid=TUU6YzJBSXJZY0s3bkpMQ1B3Z01zVXdueXFVenZTd25wMHg5czR0ajdVRDoxMTE2MzAzNDU.3e5Pi0rJ1kcq3hVJREqkEOfmMR4l1exxTc8qe2do; 
_nx_mpcid=88dcddef-0228-4ec8-89ab-094167815a11; ealocale=en-us; 
utag_main=v_id:0165563086cf00028826445f825e03079005d07100bd0$_sn:6$_ss:0$_st:1542357932930$ses_id:1542354253832%3Bexp-session$_pn:6%3Bexp-session
`;

// one hour expires (3600 expires)
async function getToken() {
  const j = request.jar();

  const cookie = request.cookie(rememberedCookie);
  const url = 'https://accounts.ea.com/connect/auth?client_id=ORIGIN_JS_SDK&response_type=token&redirect_uri=nucleus:rest&prompt=none&release_type=prod';
  j.setCookie(cookie, url);

  const re = await readToken();
  if (re) {
    return re;
  }

  return request({
    method: 'get',
    url,
    jar: j,
    headers: {
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
    },
  })
    .then(async (body) => {
      const cookies = j.getCookies(url);
      console.log(JSON.parse(body), cookies);

      const { access_token: accessToken } = JSON.parse(body);

      await writeToken(accessToken);

      return accessToken;
    });
}

// token
async function getSelfPid() {
  const token = await getToken();
  const url = 'https://gateway.ea.com/proxy/identity/pids/me';
  return request({
    method: 'get',
    auth: {
      bearer: token,
    },
    url,
  })
    .then((body) => {
      const pidObj = JSON.parse(body).pid;
      console.log(pidObj);

      const {
        pidId, email, dob, country, locale, status, dateCreated, dateModified, dateAuthDate,
      } = pidObj;

      return pidId;
    });
}

// pid
async function getSelfInfo() {
  const token = await getToken();
  const pidId = await getSelfPid();

  const url = `https://gateway.ea.com/proxy/identity/pids/${pidId}/personas?namespaceName=cem_ea_id`;
  return request({
    method: 'get',
    url,
    auth: {
      bearer: token,
    },
    headers: {
      Origin: 'https://www.origin.com',
      'X-Expand-Results': true,
    },
  })
    .then((body) => {
      const d = JSON.parse(body);
      if (d && d.personas && d.personas.persona && d.personas.persona.length) {
        const persona = d.personas.persona[0];

        console.log(persona);
        const {
          personaId, pidId, displayName, name, isVisible, status, dateCreated, lastAuthenticated,
        } = persona;

        return persona;
      }
      return new Error(`getSelfInfo: not found ${pidId}`);
    });
}

// token, originId
async function getUserPid(originId) {
  const url = `https://api3.origin.com/xsearch/users?userId=1004303030345&searchTerm=${originId}&start=0`;
  const token = await getToken();

  let pid = '';
  return request({
    method: 'get',
    url,
    headers: {
      authtoken: token,
    },
  })
    .then((body) => {
      const d = JSON.parse(body);
      if (d.error) {
        console.log(d.error);
      } else
      if (d.totalCount >= 1 && d.infoList && d.infoList.length) {
        pid = d.infoList[0].friendUserId;
        console.log(pid);
      }

      return pid;
    });
}

// pid, token
// e.g. BattIefieId-Vl
async function getUserInfo({ originId = '', userpid = '' }) {
  let pid = '';
  try {
    const token = await getToken();

    if (originId) {
      pid = await getUserPid(originId);
      if (pid === '') {
        throw (new Error('getUserPid, user pid not found'));
      }
    } else {
      pid = userpid;
    }

    const url = `https://api4.origin.com/atom/users?userIds=${pid}`;
    return request({
      method: 'get',
      url,
      headers: {
        authtoken: token,
      },
    })
      .then(body => new Promise((resolve, reject) => {
        parseString(body, async (err, result) => {
          console.log(JSON.parse(JSON.stringify(result)));
          const {
            userId, personaId, EAID, firstName, lastName,
          } = JSON.parse(JSON.stringify(result)).users.user[0];

          console.log(userId, personaId, EAID, firstName, lastName);
          console.log(JSON.parse(JSON.stringify(result)).users.user);

          // it is the one
          if (originId !== '' && originId.toLowerCase() === EAID[0].toLowerCase()) {
            const avatarLink = await getUserAvatar({ pid, token });
            resolve({
              userId: userId[0],
              personaId: personaId[0],
              EAID: EAID[0],
              firstName: firstName ? firstName[0] : '',
              lastName: lastName ? lastName[0] : '',
              avatarLink,
            });
          } else {
            console.log(originId.toLowerCase(), EAID[0].toLowerCase());
            reject(new Error(`originId ${originId} do not match found user's EAID`));
          }
        });
      }))
      .catch(e => ({
        error: e.message,
      }));
  } catch (e) {
    // console.log('getUserInfo error', e);
    return {
      error: e.message,
    };
  }
}

// selfpid, reportpid, token
async function report(originId) {
  const xml = buildReportXml('cheating');
  let selfpid;
  let reportpid;
  let url;
  let token;

  try {
    token = await getToken();

    selfpid = await getSelfPid();
    reportpid = await getUserPid({ originId });

    if (selfpid && reportpid) {
      url = `https://api2.origin.com/atom/users/${selfpid}/reportUser/${reportpid}`;
      // const url = `https://api2.origin.com/atom/users/1004303030345/reportUser/1005570625617`;
    } else {
      console.log(selfpid, reportpid);
      return;
    }
  } catch (e) {
    console.log(e);
    return;
  }


  request({
    method: 'post',
    url,
    headers: {
      authtoken: token,
    },
    body: xml,
  })
    .then((body) => {
      parseString(body, (err, result) => {
        console.log(JSON.parse(JSON.stringify(result)));
      });
    })
    .catch((e) => {
      console.log(e);
    });
}

function buildReportXml(comments) {
  const xmlbuilder = new xml2js.Builder();
  const xml = xmlbuilder.buildObject({
    reportUser: {
      contentType: 'In Game',
      reportReason: 'Cheating',
      comments,
    },
  });

  console.log(xml, typeof xml);
  return xml;
}

async function getUserAvatar({ pid, token }) {
  const authtoken = token || await getToken();
  const url = `https://api1.origin.com/avatar/user/${pid}/avatars?size=1`;

  return request({
    method: 'get',
    url,
    headers: {
      authtoken,
    },
  })
    .then(body => new Promise((resolve, reject) => {
      parseString(body, async (err, result) => {
        console.log((JSON.stringify(result)));

        try {
          const avatarLink = JSON.parse(JSON.stringify(result)).users.user[0].avatar[0].link[0];
          resolve(avatarLink);
        } catch (e) {
          reject(new Error('getUserAvatar can not find link'));
        }
      });
    }))
    .catch(e => ({
      error: e.message,
    }));
}

// e.g.
//
// getUserInfo({originId: 'yqewoemratnmmmmm'});
// getUserInfo({userpid: '10026669368'});
// getSelfInfo();

// buildReportXml(`
// aimbot
// hacking...
// `);

// report('VincentGFB');

// getUserAvatar({pid: 2432777765});

module.exports = {
  getToken,
  getSelfPid,
  getSelfInfo,
  getUserPid,
  getUserInfo,
  getUserAvatar,
  report,
};
