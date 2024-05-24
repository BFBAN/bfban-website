export default class Number {
    format(num, locale) {
        const formatter = new Intl.NumberFormat(locale, {
            notation: "compact",
            compactDisplay: "short"
        });
        return formatter.format(num);
    }
}