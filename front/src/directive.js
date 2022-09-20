import {message, voice} from "@/assets/js";
import store from "@/store";

export default (vue) => {
    /**
     * 单击播放交互音效
     */
    vue.directive('voice-button', {
        bind (el) {
            if (
                store.state.configuration.voice &&
                store.state.configuration['voice_interaction'] &&
                store.state.configuration['voice_interaction'].state
            ) {
                el.addEventListener('click',() => {
                    message.playMessageVoice()
                })
            }
      }
    })

    /**
     * egg
     */
    vue.directive('saknan', {
        bind(el) {
            voice.addVoice('skn', voice.voiceData({src: [require('@/assets/voice/eggs_sakana.mp3')]}))

            if (
                store.state.configuration.voice &&
                store.state.configuration['voice_interaction'] &&
                store.state.configuration['voice_interaction'].state
            ) {
                el.addEventListener('click', () => {
                    voice.play('skn');
                })
            }
        }
    })
}