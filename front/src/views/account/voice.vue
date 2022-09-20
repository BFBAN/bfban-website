<template>
  <div class="voice" v-if="$store.state.configuration.voice">
    <div v-for="(i, index) in voiceType" :key="index" :class="[
        globalState ? '' : 'disabled'
    ]">
      <Row :gutter="10" type="flex" align="middle" class="voice-item" v-voice-button>
        <Col>
          <Checkbox v-model="i.state" @on-change="switchVoiceAttr(i.loaclValue,  i)"></Checkbox>
        </Col>
        <Col span="8">
          <b class="title">{{ $t(i.name) }}</b>
          <p class="describe" v-if="i.describe">{{ $t(i.describe) }}</p>
        </Col>
        <Col flex="1">
          <Slider :min="i.min"
                  :max="i.max"
                  show-input
                  v-model="i.value"
                  :disabled="!i.state"
                  @on-change="switchVoiceAttr(i.loaclValue,  i)"></Slider>
        </Col>
        <Divider type="vertical"></Divider>
        <Col>
          <Select v-model="i.voiceFileName">
            <Option v-for="(file, fileIndex) in voiceFiles" :key="fileIndex" :value="file.name">{{file.name}}.mp4</Option>
          </Select>
        </Col>
      </Row>
      <div class="voice-divider ivu-divider ivu-divider-horizontal"></div>
    </div>
  </div>
  <div v-else>
    Disable Component
  </div>
</template>

<script>
import {account_storage} from "@/assets/js";

export default {
  name: "voice",
  data () {
    return {
      globalState: true,
      voiceFiles: [{
        name: 'dinDon'
      }],
      voiceType: {
        voice_message: {
          name: 'profile.voice.message',
          describe: 'profile.voice.messageDescribe',
          loaclValue: 'voice_message',
          voiceFileName: 'dinDon',
          value: 80,
          min: 0,
          max: 150,
          state: true
        },
        voice_interaction: {
          name: 'profile.voice.interaction',
          describe: 'profile.voice.interactionDescribe',
          loaclValue: 'voice_interaction',
          voiceFileName: 'dinDon',
          value: 40,
          min: 0,
          max: 150,
          state: false
        },
        voice_backgroundMusic: {
          name: 'profile.voice.backgroundMusic',
          describe: 'profile.voice.backgroundMusicDescribe',
          loaclValue: 'voice_backgroundMusic',
          voiceFileName: 'dinDon',
          value: 60,
          min: 0,
          max: 150,
          state: false
        },
        video_mp4: {
          name: 'profile.voice.video',
          describe: 'profile.voice.videoDescribe',
          loaclValue: 'video_mp4',
          voiceFileName: 'dinDon',
          value: 80,
          min: 0,
          max: 150,
          state: false
        }
      }
    }
  },
  created() {
    for (let key in this.voiceType) {
      let _i = account_storage.getConfiguration(this.voiceType[key].loaclValue);
      this.voiceType[key].state = _i != null ? _i.state : this.voiceType[key].state;
      this.voiceType[key].value = _i != null ? _i.value * 100 : this.voiceType[key].value;
    }
  },
  methods: {
    switchAll (val) {
      for (let key in this.voiceType) {
        this.voiceType[key].state = val;

        this.switchVoiceAttr('voice', val);
        this.switchVoiceAttr(this.voiceType[key].loaclValue, this.voiceType[key]);
      }
    },
    switchVoiceAttr (key, val) {
      console.log(val.state)
      if (!key) return;
        account_storage.updateConfiguration(key, {
          state: val.state,
          value: val.value * .01,
        });
    }
  }
}
</script>

<style lang="less">
.voice {
  .voice-item {
    margin: 20px 0;

    .title {
      margin-bottom: 15px;
    }

    .describe {
      font-size: 12px;
      opacity: .6;
    }

  }

  .voice-divider {
    margin: 0 -20px !important;
    opacity: .3;
    width: calc(100% + 40px);
  }

  .disabled {
    opacity: .6;
  }
}
</style>