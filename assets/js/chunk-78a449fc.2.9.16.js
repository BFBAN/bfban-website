(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-78a449fc"],{"00fd":function(t,e,s){var a=s("9e69"),r=Object.prototype,i=r.hasOwnProperty,o=r.toString,n=a?a.toStringTag:void 0;function l(t){var e=i.call(t,n),s=t[n];try{t[n]=void 0;var a=!0}catch(l){}var r=o.call(t);return a&&(e?t[n]=s:delete t[n]),r}t.exports=l},"0b05":function(t,e,s){var a={"./images/games/bf1/logo.png":"d141","./images/games/bf6/logo.png":"a542","./images/games/bfv/logo.png":"28dd","./images/logo.png":"9d64"};function r(t){var e=i(t);return s(e)}function i(t){if(!s.o(a,t)){var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}return a[t]}r.keys=function(){return Object.keys(a)},r.resolve=i,t.exports=r,r.id="0b05"},"0b07":function(t,e,s){var a=s("34ac"),r=s("3698");function i(t,e){var s=r(t,e);return a(s)?s:void 0}t.exports=i},1368:function(t,e,s){var a=s("da03"),r=function(){var t=/[^.]+$/.exec(a&&a.keys&&a.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();function i(t){return!!r&&r in t}t.exports=i},"1a8c":function(t,e){function s(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}t.exports=s},"1c8a":function(t,e,s){t.exports=s.p+"assets/img/bf.350c4f88.jpg"},"1cec":function(t,e,s){var a=s("0b07"),r=s("2b3e"),i=a(r,"Promise");t.exports=i},"28dd":function(t,e,s){t.exports=s.p+"assets/img/logo.f39797a8.png"},"29f3":function(t,e){var s=Object.prototype,a=s.toString;function r(t){return a.call(t)}t.exports=r},"2b3e":function(t,e,s){var a=s("585a"),r="object"==typeof self&&self&&self.Object===Object&&self,i=a||r||Function("return this")();t.exports=i},"2d8f":function(t,e,s){"use strict";s("8334")},"34ac":function(t,e,s){var a=s("9520"),r=s("1368"),i=s("1a8c"),o=s("dc57"),n=/[\\^$.*+?()[\]{}|]/g,l=/^\[object .+?Constructor\]$/,c=Function.prototype,d=Object.prototype,p=c.toString,u=d.hasOwnProperty,m=RegExp("^"+p.call(u).replace(n,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function b(t){if(!i(t)||r(t))return!1;var e=a(t)?m:l;return e.test(o(t))}t.exports=b},3698:function(t,e){function s(t,e){return null==t?void 0:t[e]}t.exports=s},3729:function(t,e,s){var a=s("9e69"),r=s("00fd"),i=s("29f3"),o="[object Null]",n="[object Undefined]",l=a?a.toStringTag:void 0;function c(t){return null==t?void 0===t?n:o:l&&l in Object(t)?r(t):i(t)}t.exports=c},"560f":function(t,e,s){"use strict";s("861d4")},"585a":function(t,e,s){(function(e){var s="object"==typeof e&&e&&e.Object===Object&&e;t.exports=s}).call(this,s("c8ba"))},"762c":function(t,e,s){"use strict";s.r(e);var a=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"container"},[a("div",{staticClass:"content"},[a("br"),a("Row",[a("Col",{attrs:{xs:{push:1},lg:{push:0}}},[a("Breadcrumb",[a("BreadcrumbItem",{attrs:{to:{name:"home"}}},[t._v(t._s(t.$t("header.index")))]),a("BreadcrumbItem",[t._v(t._s(t.$t("report.info.reportHacker")))])],1)],1)],1),a("br"),a("AdsGoogle",{staticStyle:{"margin-bottom":"10px"},attrs:{id:"7930151828"}}),a("Tabs",{attrs:{type:"card"},on:{"on-tab-remove":t.doCancel},model:{value:t.tabs.count,callback:function(e){t.$set(t.tabs,"count",e)},expression:"tabs.count"}},[t._l(t.tabs.list.length,(function(e,r){return a("TabPane",{key:r,attrs:{disabled:"",label:t.tabs.list[r].formItem.originName?t.tabs.list[r].formItem.originName:e.toString()}},[0==t.tabs.list[r].statusOk?[a("Form",{ref:"formValidate_"+r,refInFor:!0,attrs:{"label-width":t.isMobile?null:150,model:t.tabs.list[r].formItem,rules:t.tabs.list[r].ruleValidate,"label-position":t.isMobile?"top":"left"}},[a("Card",{attrs:{"dis-hover":"",padding:t.isMobile?20:50}},[a("FormItem",{attrs:{prop:"gameName",label:""+t.$t("report.labels.game")}},[a("RadioGroup",{staticClass:"game-type",attrs:{size:"large",type:"button"},model:{value:t.tabs.list[r].formItem.gameName,callback:function(e){t.$set(t.tabs.list[r].formItem,"gameName",e)},expression:"tabs.list[index].formItem.gameName"}},t._l(t.games,(function(e){return a("Radio",{key:e.value,class:t.tabs.list[r].formItem.gameName==e.value?"gametype-select":"",style:"background-image: url("+s("e153")("./"+e.bk_file+"/bf.jpg")+")",attrs:{label:e.value,disabled:e.disabled,"aria-radio":""}},[a("Tooltip",{attrs:{content:t.$t("basic.games."+e.value),placement:"top-start"}},[e.logo_src?a("img",{attrs:{height:"35",src:s("0b05")("./"+e.bk_file+"/logo.png")}}):a("span",[t._v(t._s(e.full_name))])])],1)})),1),t.tabs.list[r].formItem.gameName?a("p",[t._v(" "+t._s(t.$t("basic.games."+t.tabs.list[r].formItem.gameName)))]):t._e()],1),a("FormItem",{attrs:{prop:t.tabs.list[r].type,label:t.$t("report.labels.hackerId")}},[a("Alert",{directives:[{name:"show",rawName:"v-show",value:t.failedOfNotFound,expression:"failedOfNotFound"}],staticClass:"notFoundHint",attrs:{type:"error","show-icon":""}},[a("b",[t._v(t._s(t.$t("report.info.notFoundHintTitle")))]),a("span",{attrs:{slot:"desc"},slot:"desc"},[a("p",{staticStyle:{"font-size":"14px","margin-left":"10px"}},[t._v(" Q:"+t._s(t.$t("report.info.notFoundHintQuestion1"))+" ")]),a("p",{staticStyle:{"font-size":"12px","margin-left":"20px"}},[t._v(" A:"+t._s(t.$t("report.info.notFoundHintAnswer1"))+" ")]),a("p",{staticStyle:{"font-size":"14px","margin-left":"10px"}},[t._v(" Q:"+t._s(t.$t("report.info.notFoundHintQuestion2"))+" ")]),a("p",{staticStyle:{"font-size":"12px","margin-left":"20px"}},[t._v(" A:"+t._s(t.$t("report.info.notFoundHintAnswer2"))+" ")])])]),a("Row",{attrs:{gutter:10,type:"flex",align:"middle"}},[a("Col",[a("Select",{staticStyle:{"min-width":"120px"},attrs:{size:"large"},model:{value:t.tabs.list[r].type,callback:function(e){t.$set(t.tabs.list[r],"type",e)},expression:"tabs.list[index].type"}},t._l(t.tabs.list[r].types,(function(e,s){return a("Option",{key:s,attrs:{value:e,label:t.$t("report.labels.types."+e+".name")}},[a("Row",{attrs:{gutter:5,type:"flex",align:"middle"}},[a("Col",{attrs:{lg:{span:20}}},[t._v(" "+t._s(t.$t("report.labels.types."+e+".name"))+" ")]),a("Col",{attrs:{lg:{span:4}}},[a("Poptip",{attrs:{trigger:"hover",transfer:""}},[a("Icon",{attrs:{type:"ios-help-circle-outline"}}),a("div",{attrs:{slot:"content"},slot:"content"},[t._v(t._s(t.$t("report.labels.types."+e+".hint")))])],1)],1)],1)],1)})),1)],1),a("Divider",{attrs:{type:"vertical"}}),"originName"===t.tabs.list[r].type?[a("Col",{attrs:{flex:"1"}},[a("AutoComplete",{attrs:{data:t.tabs.list[r].players.list,maxlength:"280",clearable:"",transfer:!0,"show-word-limit":"",icon:"ios-search",size:"large",placeholder:t.$t("report.labels.types."+t.tabs.list[r].type+".placeholder")},on:{"on-search":t.handleSearchReportId},model:{value:t.tabs.list[r].formItem.originName,callback:function(e){t.$set(t.tabs.list[r].formItem,"originName",e)},expression:"tabs.list[index].formItem.originName"}},[t.tabs.list&&t.tabs.list[r].players.length>0?t._l(t.tabs.list[r].players,(function(e,s){return a("div",{key:s},[e&&e.originName?a("Option",{attrs:{value:e.originName}},[a("Row",{attrs:{gutter:10,type:"flex",justify:"center",align:"middle"}},[a("Col",[a("Avatar",{attrs:{src:e.avatarLink}})],1),a("Col",{attrs:{flex:"1"}},[a("span",{staticClass:"text-distinguishing-letter"},[a("code",[t._v(t._s(e.originName))])])])],1)],1):t._e()],1)})):t._e()],2)],1),a("Col",[a("OcrWidget",{attrs:{data:{index:r}},on:{ok:t.onOcrOutput}},[a("Button",{attrs:{size:"large"}},[a("Icon",{attrs:{type:"md-qr-scanner"}}),t._v(" OCR ")],1)],1)],1)]:"originPersonaId"==t.tabs.list[r].type?[a("Col",{attrs:{flex:"1"}},[a("Input",{attrs:{maxlength:"280",clearable:"","show-word-limit":"",size:"large",type:"number",transfer:!0,placeholder:t.$t("report.labels.types."+t.tabs.list[r].type+".placeholder")},model:{value:t.tabs.list[r].formItem.originPersonaId,callback:function(e){t.$set(t.tabs.list[r].formItem,"originPersonaId",e)},expression:"tabs.list[index].formItem.originPersonaId"}})],1)]:"originUserId"==t.tabs.list[r].type?[a("Col",{attrs:{flex:"1"}},[a("Input",{attrs:{maxlength:"280",clearable:"","show-word-limit":"",size:"large",type:"number",transfer:!0,placeholder:t.$t("report.labels.types."+t.tabs.list[r].type+".placeholder")},model:{value:t.tabs.list[r].formItem.originUserId,callback:function(e){t.$set(t.tabs.list[r].formItem,"originUserId",e)},expression:"tabs.list[index].formItem.originUserId"}})],1)]:t._e()],2),"originName"==t.tabs.list[r].type?a("Card",{staticClass:"report-hackrid",attrs:{"dis-hover":""}},[a("div",{attrs:{slot:"title"},slot:"title"},[t.tabs.list[r].formItem.originName?a("h1",{staticClass:"text-distinguishing-letter"},[a("code",[t._v(t._s(t.tabs.list[r].formItem.originName))])]):a("span",[t._v("ID")])]),a("p",{staticClass:"hint hint-seriousness"},[t._v(" "+t._s(t.$t("report.info.idNotion1"))+" ")]),a("p",{staticClass:"hint hint-seriousness"},[a("code",[t._v(t._s(t.$t("report.info.idNotion2")))])])]):t._e()],1),a("FormItem",{attrs:{prop:"checkbox",label:t.$t("report.labels.cheatMethod")}},[a("CheckboxGroup",{model:{value:t.tabs.list[r].formItem.checkbox,callback:function(e){t.$set(t.tabs.list[r].formItem,"checkbox",e)},expression:"tabs.list[index].formItem.checkbox"}},t._l(t.cheatMethodsGlossary,(function(e){return a("Checkbox",{key:e.value,staticStyle:{"margin-bottom":"10px"},attrs:{border:"",indeterminate:!1,label:e.value}},[a("Tag",{attrs:{color:"primary"}},[t._v(t._s(t.$t("cheatMethods."+e.value+".title")))]),a("Divider",{attrs:{type:"vertical"}}),a("span",[t._v(t._s(t.$t("cheatMethods."+e.value+".describe")))])],1)})),1)],1)],1),a("br"),a("Card",{attrs:{"dis-hover":"",padding:t.isMobile?20:50}},[a("FormItem",{attrs:{label:t.$t("detail.info.videoLink")}},[a("Row",{attrs:{gutter:30}},[a("Col",{attrs:{xs:{span:24},lg:{span:12}}},[a("Alert",{attrs:{"show-icon":"",type:"warning"}},[t._v(" "+t._s(t.$t("report.info.uploadManual1"))+" ")])],1),a("Col",{attrs:{xs:{span:24},lg:{span:24}}},[t._l(t.tabs.list[r].formItem.videoLink,(function(e,s){return a("FormItem",{key:s,attrs:{prop:"videoLink["+s+"]",rules:{validator:t.checkVideoLink,trigger:"blur"}}},[a("Row",{attrs:{gutter:0}},[a("Col",{attrs:{flex:"auto"}},[a("Input",{staticStyle:{"margin-bottom":"5px"},attrs:{clearable:"",placeholder:t.$t("report.info.required")},model:{value:t.tabs.list[r].formItem.videoLink[s],callback:function(e){t.$set(t.tabs.list[r].formItem.videoLink,s,e)},expression:"tabs.list[index].formItem.videoLink[blinkindex]"}})],1),a("Col",[t.tabs.list[r].formItem.videoLink.length>0?a("Divider",{attrs:{type:"vertical"}}):t._e(),t.tabs.list[r].formItem.videoLink.length>0?a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}],on:{click:function(e){return t.tabs.list[r].formItem.videoLink.splice(s,1)}}},[a("Icon",{attrs:{type:"md-trash"}})],1):t._e()],1)],1)],1)})),a("Row",{attrs:{gutter:"10"}},[a("Col",[t.tabs.list[r].formItem.videoLink.length<3?a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}],attrs:{type:"primary"},on:{click:t.handleVideoLink}},[a("Icon",{attrs:{type:"md-add"}}),a("span",[t._v("  ("+t._s(t.tabs.list[r].formItem.videoLink.length||0)+" / 3)")])],1):t._e()],1),a("Col",[a("div",{staticClass:"hint hint-caution"},[t._v(t._s(t.$t("report.info.uploadManual2")))])])],1)],2)],1)],1),a("FormItem",{attrs:{prop:"description",label:t.$t("report.labels.description")}},[a("Card",{attrs:{padding:0,"dis-hover":""}},[a("Textarea",{attrs:{toolbar:[[{list:"ordered"},{list:"bullet"}],["bold","hr"],["link","image"]],placeholder:t.$t("report.info.description"),index:r,height:"520px",maxlength:6e4,showMaxlengthLabel:!0},model:{value:t.tabs.list[r].formItem.description,callback:function(e){t.$set(t.tabs.list[r].formItem,"description",e)},expression:"tabs.list[index].formItem.description"}})],1)],1)],1),a("br"),a("Card",{attrs:{"dis-hover":"",padding:t.isMobile?20:50}},[a("FormItem",{attrs:{prop:"captcha",label:t.$t("captcha.title")}},[a("Captcha",{ref:"captcha",refInFor:!0,on:{getCaptchaData:t.getCaptchaData}})],1),a("FormItem",[a("Row",{attrs:{gutter:10,type:"flex",align:"middle"}},[a("Col",[a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}],attrs:{type:"dashed",size:"large",disabled:t.tabs.list.length<=1},on:{click:t.doCancel}},[t._v(" "+t._s(t.$t("basic.button.cancel"))+" ")])],1),a("Divider",{attrs:{type:"vertical"}}),a("Col",[a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}],attrs:{size:"large"},on:{click:function(e){return t.resetFieldsReport(r)}}},[t._v(" "+t._s(t.$t("basic.button.reset"))+" ")])],1),a("Col",[a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}],attrs:{loading:t.tabs.list[r].load,type:"primary",size:"large"},on:{click:function(e){return t.doReport(r)}}},[t._v(" "+t._s(t.$t("basic.button.report"))+" ")])],1)],1)],1)],1),a("br"),a("Spin",{directives:[{name:"show",rawName:"v-show",value:t.spinShow,expression:"spinShow"}],attrs:{size:"large",fix:""}})],1)]:-1==t.tabs.list[r].statusOk?a("div",{staticClass:"ivu-alert-error",attrs:{shadow:""}},[a("div",{staticClass:"report-done"},[a("Icon",{attrs:{type:"md-bug",size:"200",color:"error"}}),a("h1",{staticClass:"tip"},[t._v(t._s(t.$t("report.messages.failureTitle")))]),a("p",{staticClass:"tip"},[t._v(t._s(t.$t("report.messages.failureSubtitle",{msg:t.tabs.list[r].statusMsg||":("})))]),a("Divider",{attrs:{dashed:""}}),a("Row",{attrs:{gutter:10,type:"flex",justify:"center",align:"middle"}},[a("Col",[a("router-link",{attrs:{to:{name:"home"}}},[a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}]},[t._v(t._s(t.$t("report.button.leave")))])],1)],1)],1)],1)]):1==t.tabs.list[r].statusOk?a("div",{staticClass:"ivu-alert-success",attrs:{shadow:""}},[a("div",{staticClass:"report-done"},[a("Icon",{attrs:{type:"md-cloud-done",size:"200",color:"success"}}),a("h1",{staticClass:"tip"},[t._v(t._s(t.$t("report.messages.successTitle")))]),a("p",{staticClass:"tip"},[t._v(t._s(t.$t("report.messages.successSubtitle")))]),a("Divider",{attrs:{dashed:""}}),a("Row",{attrs:{gutter:10,type:"flex",justify:"center",align:"middle"}},[a("Col",[a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}]},[a("a",{attrs:{href:"/report"}},[t._v(t._s(t.$t("report.button.continue")))])])],1),a("Col",[a("router-link",{attrs:{to:{name:"home"}}},[a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}],attrs:{type:"primary"}},[t._v(t._s(t.$t("report.button.leave")))])],1)],1)],1)],1)]):t._e()],2)})),a("Button",{directives:[{name:"voice-button",rawName:"v-voice-button"}],attrs:{slot:"extra",size:"small",disabled:""},on:{click:t.handleTabsAdd},slot:"extra"},[a("Icon",{attrs:{type:"md-add"}})],1)],2)],1)])},r=[],i=s("e4b4"),o=s("ad43"),n=s("7f22"),l=s("1b08"),c=s("45ce"),d=s("5d71"),p=s("54c4"),u=s("4360"),m=s("1cec"),b=s.n(m),h=s("02bc"),g=s("617b"),f=new o["a"]({data(){return{voiceReportManagement:i["r"],games:[],tabs:{count:0,list:[]},spinShow:!1,failedOfNotFound:!1,cheatMethodsGlossary:[],captcha:""}},components:{AdsGoogle:n["a"],Textarea:d["a"],Html:l["a"],HtmlWidget:g["a"],OcrWidget:p["a"],Captcha:c["a"],Empty:h["a"]},created(){const t=u["a"].state.configuration["voice_message"];this.http=i["f"].call(this),this.voiceReportManagement.addVoice("success",this.voiceReportManagement.voiceData({src:[s("628d")],volume:t&&t.value||1})),this.handleTabsAdd(),this.loadData()},watch:{$route:"loadData"},methods:{loadData(){i["q"].initUtil().then(t=>{this.cheatMethodsGlossary=t.cheatMethodsGlossary,this.games=t.gameName})},getCaptchaData(t){this.captcha=t},handleSearchReportId(t){!t||t.length<4||i["e"].get(i["c"]["search"],{params:{param:t,type:"player",scope:"current",limit:"6"}}).then(t=>{const e=t.data;1!==e.success?this.catch(t):this.tabs.list[Number(this.tabs.count)].players=e.data}).catch(t=>{this.tabs.list[Number(this.tabs.count)].players=[]})},handleTabsAdd(){let t={load:!1,type:"originName",types:["originName","originUserId","originPersonaId"],players:{list:[]},formItem:{gameName:"",originName:"",originUserId:"",originPersonaId:"",videoLink:[],checkbox:[],description:"",avatarLink:""},ruleValidate:{gameName:[{required:!0,trigger:"change"}],originName:[{required:!0,trigger:"blur"}],originUserId:[{required:!0,min:1,max:280,trigger:"blur"}],originPersonaId:[{required:!0,min:1,max:280,trigger:"blur"}],checkbox:[{required:!0,type:"array",min:1,trigger:"change"}],description:[{required:!0,type:"string",min:5,trigger:"change"}]},statusOk:0,captchaUrl:{}};this.tabs.list.push(t)},handleVideoLink(){const t=this.tabs.list[this.tabs.count];t.formItem.videoLink.splice(t.formItem.videoLink.length+1,0,"")},checkVideoLink(t,e,s){const a=this.$i18n.t("report.messages.videoBadFormat"),r=e;if(!r)return s(this.$i18n.t("report.messages.videoEmpty"));if(e.length>255)return s("The address is too long and it is recommended that evidence of the link be placed in the 'description'");const o=i["m"].check("link",r);0==o.code?s():s(new Error(this.$i18n.t(a)))},doCancel(){this.tabs.list.length<=1||(this.tabs.count=0,this.tabs.list.splice(this.tabs.count,1))},async doReport(t){const e=this;let s=this.tabs.list[t];try{if(!this.$store.state.$userinfo&&!this.$store.state.$userinfo.origin.originUserId)return this.$Message.error({content:this.$i18n.t("report.messages.tipBind"),duration:3}),void setTimeout(()=>{e.$router.push({path:"/profile/information"})},3e3);if(this.$refs["formValidate_"+t][0])return void this.$refs["formValidate_"+t][0].validate(async a=>{a?(s.load=!0,await e.handleReport(s,t),s.load=!1):e.$Message.error(this.$t("report.messages.videoBadFormat"))});this.$Message.error({content:this.$i18n.t("basic.tip.needBindEaAccount"),duration:3}),setTimeout(()=>{this.$router.push({path:"/profile/information"})},3e3)}catch(a){this.$Message.error(a.toString())}finally{s.load=!1}},resetFieldsReport(t){this.$refs["formValidate_"+t][0].resetFields()},handleReport(t,e){if(!this.captcha)return void this.$Message.error(this.$t("basic.tip.captcha.expired"));const{gameName:s,originName:a,originUserId:r,originPersonaId:o}=t.formItem,n=t.formItem.checkbox,l=t.formItem.description.trim(),c=t.formItem.videoLink.filter(t=>""!=t||void 0!=t||null!=t).toString().trim()||null,d={data:{game:s,cheatMethods:n,videoLink:c,description:l},captcha:this.captcha};let p="";switch(this.spinShow=!0,d.type){case"originUserId":p=i["c"]["player_reportById"],d.data.originUserId=r;break;case"originPersonaId":p=i["c"]["player_reportById"],d.data.originPersonaId=o;break;case"originName":default:p=i["c"]["player_report"],d.data.originName=a;break}return new b.a(t=>{this.http.post(p,{data:d}).then(t=>{const s=t.data;if(1===s.success)return this.tabs.list[e].statusOk=1,this.voiceReportManagement.play("success"),void this.$Message.success(this.$t(`basic.tip['${s.code}']`,{message:s.message||""})).then(()=>{this.$router.push({name:"cheater",params:{ouid:s.data.originPersonaId}})});this.tabs.list[e].statusMsg=s.message,this.$Message.error(this.$t(`basic.tip['${s.code}']`,{message:s.message||""}))}).finally(()=>{t(),this.captcha="",this.spinShow=!1})})},onOcrOutput(t){t.value&&(this.tabs.list[t.index].formItem.originName=t.value)}}}),v=f,y=(s("2d8f"),s("2877")),x=Object(y["a"])(v,a,r,!1,null,"21b03820",null);e["default"]=x.exports},"7f22":function(t,e,s){"use strict";var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return t.adId&&t.adsSwitch?s("Card",{staticClass:"ad-container",class:t.adId&&t.ads[t.adId].class||[],style:t.ads[t.adId].style,attrs:{"dis-hover":"",padding:0}},[s("div",{staticClass:"ad-off",on:{click:t.offAds}},[s("Icon",{attrs:{size:"10",type:"md-close"}})],1)]):t._e()},r=[],i=s("e4b4"),o={name:"AdsGoogle",props:{id:{type:[Number,String],default:()=>"7930151828"}},watch:{id:{handler(t){this.adId=t}}},data(){return{account_storage:i["a"],adId:"",adClient:"ca-pub-6625226616103631",ads:{7930151828:{style:"width: 100%;min-height: 80px;",class:[],adFormat:"true",fullWidthResponsive:"true"},1760339032:{name:"right",style:"width: 100%;min-height: 300px;margin-bottom: 10px;",class:[],adFormat:"true",fullWidthResponsive:"true"},6674125493:{name:"bfban-x",style:"width: 100%;min-height: 200px;",class:[],adFormat:"autorelaxed",fullWidthResponsive:"true"}}}},created(){this.adId=this.id},methods:{offAds(){i["a"].updateConfiguration("ads-switch",!1),this.$router.push({name:this.$router.name,query:{...this.$route.query,skipAds:!0}})}},computed:{adsSwitch(){const t=this.$route.query["skipAds"]||!1,e=i["a"].getConfiguration("ads-switch")||!1;return!t&&e}}},n=o,l=(s("560f"),s("2877")),c=Object(l["a"])(n,a,r,!1,null,null,null);e["a"]=c.exports},8334:function(t,e,s){},"861d4":function(t,e,s){},9520:function(t,e,s){var a=s("3729"),r=s("1a8c"),i="[object AsyncFunction]",o="[object Function]",n="[object GeneratorFunction]",l="[object Proxy]";function c(t){if(!r(t))return!1;var e=a(t);return e==o||e==n||e==i||e==l}t.exports=c},"9e69":function(t,e,s){var a=s("2b3e"),r=a.Symbol;t.exports=r},a542:function(t,e,s){t.exports=s.p+"assets/img/logo.dbc12e75.png"},d141:function(t,e,s){t.exports=s.p+"assets/img/logo.6ffd12a1.png"},da03:function(t,e,s){var a=s("2b3e"),r=a["__core-js_shared__"];t.exports=r},dc57:function(t,e){var s=Function.prototype,a=s.toString;function r(t){if(null!=t){try{return a.call(t)}catch(e){}try{return t+""}catch(e){}}return""}t.exports=r},e124:function(t,e,s){t.exports=s.p+"assets/img/bf.b384c970.jpg"},e153:function(t,e,s){var a={"./images/games/bf1/bf.jpg":"e953","./images/games/bf6/bf.jpg":"1c8a","./images/games/bfv/bf.jpg":"e124"};function r(t){var e=i(t);return s(e)}function i(t){if(!s.o(a,t)){var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}return a[t]}r.keys=function(){return Object.keys(a)},r.resolve=i,t.exports=r,r.id="e153"},e953:function(t,e,s){t.exports=s.p+"assets/img/bf.41bffcdf.jpg"}}]);
//# sourceMappingURL=chunk-78a449fc.2.9.16.js.map