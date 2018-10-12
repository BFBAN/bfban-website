const cheerio = require('cheerio');
const request = require('request-promise');
const moment = require('moment');
const tz = require('moment-timezone');
const util = require('util');

const obj = {};
const url = 'http://wiki.teamliquid.net/starcraft2/2017_AfreecaTV_GSL_Super_Tournament_2';
// const url = 'http://wiki.teamliquid.net/starcraft2/2017_StarCraft_II_StarLeague_Season_2/Premier'
// const url = 'http://wiki.teamliquid.net/starcraft2/2017_StarCraft_II_StarLeague_Season_2/Challenge'
// const url = 'http://wiki.teamliquid.net/starcraft2/2017_WCS_Global_Finals'
// const url = 'http://wiki.teamliquid.net/starcraft2/OlimoLeague/2017/October'
// const url = 'http://wiki.teamliquid.net/starcraft2/OlimoLeague/2017/Week_105'
// const url = 'http://wiki.teamliquid.net/starcraft2/BaseTradeTV_Star_League/S7_R1'

function checkTimezone(tz) {
  const t = tz.split(':').join('');
  return (t.length == 4) ? (`${t.slice(0, 1)}0${ t.slice(1)}`) : t;
}

function getMatchDate($) {
  const el = $(this).find('span.timer-object')[0];

  console.log('el', el);

  try {
    return el ? el.children[0].data + checkTimezone(el.children[1].attribs['data-tz']) : '';
  } catch (err) {
    return '';
  }
}

function getTableMatches($) {
  if ($('.matchlist.table.table-bordered.collapsible').length) {
    $('.matchlist.table.table-bordered.collapsible').each(function (i, el) {
      const stage_obj = {};
      stage_obj.vods = [];
      stage_obj.name = $(this).find('th').text();

      const self = this;

      $(this).find(' tbody > tr').each(function (i) {
        const vod_obj = {};

        if (!$(this).find('.matchlistslot').length) {
          return;
        }

        vod_obj.blue_player = $(this).find('td').first().text();
        vod_obj.red_player = $(this).find('td').last().text();
        vod_obj.score = `${$(this).find('td:nth-child(2)').text().trim()}-${ $(this).find('td:nth-child(3)').text().trim()}`;
        vod_obj.show_id = '';

        vod_obj.match_date = getMatchDate.call(self, $);

        stage_obj.vods.push(vod_obj);
      });
      obj.stages.push(stage_obj);
    });
  }
}

function getColumnMatchew($) {
  if ($('.bracket-column-matches').length) {
    $('.bracket-column-matches').each(function (i, el) {
      const stage_obj = {};
      stage_obj.vods = [];
      stage_obj.name = $(this).find('.bracket-header').text();

      $(this).find('.bracket-game').each(function (i, e) {
        const vod_obj = {};
        vod_obj.blue_player = $(this).find('.bracket-player-top > span').text();
        vod_obj.red_player = $(this).find('.bracket-player-bottom > span').text();
        vod_obj.score = $(this).find('.bracket-score').text().split('')
          .join('-');
        vod_obj.yk_v = '';
        vod_obj.yt_v = $(this).find('.bracket-popup-footer.plainlinks > a[title="Watch VOD"]').attr('href');

        match_date = getMatchDate.call(this, $);
        vod_obj.match_date = match_date;

        // console.log(match_date)
        // console.log(moment(match_date, "MMMM DD, YYYY - kk:mm Z"))
        // console.log(moment(match_date, "MMMM DD, YYYY - kk:mm Z").tz('asia/shanghai').format('LLLL'))

        stage_obj.vods.push(vod_obj);
      });
      obj.stages.push(stage_obj);
    });
  }
}

function getTournamentDate($) {
  if ($('.infobox-cell-2.infobox-description').length) {
    $('.infobox-cell-2.infobox-description').each(function (i) {
      let k = $(this).text().toLowerCase();
      if (k.indexOf('date') !== -1) {
        k = k.replace(/\:/, '').trim();
        k = k.split(' ').join('_');
        obj[k] = $(this).next().text();
      }
    });
  }
}


// 第一种方式, 返回 value
// var grabTeamliquid = async function(url) {
//     let uri = baseUrl + url
//     await request(uri)
//     .then(function(html){

//         const $ = cheerio.load(html)

//         obj.name = $("#firstHeading > span").text()
//         obj.stages = []

//         getTournamentDate.call(this, $)
//         getTableMatches.call(this, $)
//         getColumnMatchew.call(this, $)


//         // debug
//         // console.log(util.inspect(JSON.stringify(obj), false, null));

//     })

//     return JSON.stringify(obj)
// }


// 第二种方式, 返回 promise value
const grabTeamliquid = url => request(url)
  .then(function (html) {
    const $ = cheerio.load(html);

    obj.name = $('#firstHeading > span').text();
    obj.stages = [];

    getTournamentDate.call(this, $);
    getTableMatches.call(this, $);
    getColumnMatchew.call(this, $);


    // debug
    // console.log(util.inspect(JSON.stringify(obj), false, null));

    return obj;
  });

module.exports = grabTeamliquid;


// const tournament = {
//     name: '2017_AfreecaTV_GSL_Super_Tournament_2',
//     stages: [
//         {
//             name: 'Round of 16 (Bo5)',
//             vods: [
//                 {
//                     blue_player: 'INoVation',
//                     red_player: 'TIME',
//                     score: '3-1',
//                     match_date: '',
//                     yk_v: '',
//                     yt_v: '',
//                 },
//                 {
//                     blue_player: 'Classic',
//                     red_player: 'aLive',
//                     score: '3-2',
//                     match_date: '',
//                     yk_v: '',
//                     yt_v: '',
//                 }
//             ]
//         }
//     ]
// }
