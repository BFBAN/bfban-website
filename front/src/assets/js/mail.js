import mail from '../../../public/config/mail.json'

export default class Mail {
    /**
     * 字典兑换后台语言
     * 保持后台一致性
     * @lang Current Website language
     */
    exchangeLangField (lang) {
        if (lang) return mail.child[mail.default].value;

        if (mail.child[lang])
            return mail.child[lang].value;
    }
}
