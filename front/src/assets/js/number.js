import i18n from "@/i18n";

export default class Number {
    format(num) {
        const lang = i18n.locale
        const formatter = new Intl.NumberFormat(lang, {
            notation: "compact",
            maximumSignificantDigits: 3,
            compactDisplay: "short"
        });
        return formatter.format(num);
    }
}
