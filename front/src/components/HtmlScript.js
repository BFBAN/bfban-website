import Vue from "vue";

export default {
    props: {
        html: {
            type: String,
            default: ""
        }
    },
    template: "",
    render(h) {
        let Com = Vue.extend({
            template: this.html
        });
        return h("div", "");
    },
}