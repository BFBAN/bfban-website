import {message} from "@/assets/js";
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
}