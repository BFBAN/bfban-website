import {message, voice} from "@/assets/js";
import store from "@/store";

export default (vue) => {
    /**
     * 单击播放交互音效
     */
    vue.directive('voice-button', {
        bind(el) {
            if (
                store.state.configuration.voice &&
                store.state.configuration['voice_interaction'] &&
                store.state.configuration['voice_interaction'].state
            ) {
                el.addEventListener('click', () => {
                    if (message.playMessageVoice)
                        message.playMessageVoice()
                })
            }
        }
    })

    /**
     * text select all
     */
    vue.directive('selectable-text', {
        bind: function (el) {
            el.addEventListener('click', function () {
                const range = document.createRange();
                range.selectNodeContents(el);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            });
        }
    });

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
