/**
 * 应用通知
 */
import Voice from "@/assets/js/voice";
import store from "@/store";

export default class appMessage {
    VoiceManagement;

    constructor() {
        this.VoiceManagement = new Voice();
        const message = store.state.configuration['voice_message']
        this.VoiceManagement.addVoice(
            'open',
            this.VoiceManagement.voiceData({
                src: [
                    require('@/assets/voice/dinDon.mp3'),
                    require('@/assets/voice/send.mp3')
                ],
                volume: (message && message.value) || 1
            })
        )
    }

    /**
     * 播放消息通知声音
     */
    playMessageVoice () {
        if (store.state.configuration['voice_message'].state)
            this.VoiceManagement.play('open');
    }
}