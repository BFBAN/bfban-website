<template>
  <div>
    <Row>
      <Col>
        <Checkbox v-model="globalState" @on-change="switchAll">全局状态</Checkbox>
      </Col>
      <Col>
        <Tag>BETA</Tag>
      </Col>
    </Row>
    <br>

    <Alert show-icon type="info">
      此功能正在测试中，暂时没有翻译与完全实装。
    </Alert>

    <Row :gutter="50" type="flex" justify="end" align="middle" v-for="(i, index) in voiceType" :key="index">
      <Col span="8">
        <Checkbox v-model="i.state" @on-change="switchVoiceAttr(i.loaclValue,  i)"></Checkbox>
        {{ i.name }}
      </Col>
      <Col flex="1">
        <Slider :min="i.min"
                :max="i.max"
                show-input
                v-model="i.value"
                :disabled="!i.state"
                @on-change="switchVoiceAttr(i.loaclValue,  i)"></Slider>
      </Col>
    </Row>
  </div>
</template>

<script>
import {account_storage} from "@/assets/js";

export default {
  name: "voice",
  data () {
    return {
      globalState: true,
      voiceType: {
        message: {
          name: 'message.title',
          loaclValue: 'voice_message',
          value: 80,
          min: 0,
          max: 100,
          state: true
        },
        interaction: {
          name: 'interaction.title',
          loaclValue: 'voice_interaction',
          value: 40,
          min: 0,
          max: 100,
          state: true
        },
        backgroundMusic: {
          name: 'backgroundMusic.title',
          loaclValue: 'voice_backgroundMusic',
          value: 60,
          min: 0,
          max: 100,
          state: true
        },
        video: {
          name: 'video.title',
          loaclValue: 'voice_mp4',
          value: 80,
          min: 0,
          max: 100,
          state: true
        }
      }
    }
  },
  created() {
    for (let key in this.voiceType) {
      let _i = account_storage.getConfiguration(this.voiceType[key].loaclValue);
      this.voiceType[key].state = _i.state;
      this.voiceType[key].value = _i.value;
    }
  },
  methods: {
    switchAll (val) {
      for (let key in this.voiceType) {
        this.voiceType[key].state = val;
        this.switchVoiceAttr(this.voiceType[key].loaclValue, this.voiceType[key]);
      }
    },
    switchVoiceAttr (key, val) {
      if (!key) return;
        account_storage.updateConfiguration(key, {
          state: val.state,
          value: val.value,
        });
    }
  }
}
</script>

<style scoped>

</style>