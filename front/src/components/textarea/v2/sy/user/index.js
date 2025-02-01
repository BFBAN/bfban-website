import {Node} from '@tiptap/core';
import {VueNodeViewRenderer} from "@tiptap/vue-2";
import Component from "./view.vue";

const UserMention = Node.create({
    name: 'sy-user',
    group: 'inline',
    inline: true,
    addAttributes() {
        return {
            userId: {
                default: null,
            },
        };
    },
    parseHTML() {
        return [{ tag: 'span', class: 'user-mention' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', { class: 'user-mention', 'data-user-id': HTMLAttributes.userId }, 0];
    },
    addOptions() {
        return {
            // 默认选项
        };
    },
    addNodeView() {
        return VueNodeViewRenderer(Component)
    },
    onUpdate: ({ node, editor }) => {
        const el = editor.element.querySelector(`[data-user-id="${node.attrs.userId}"]`);
        if (el) {
            node.mountComponent(el);
        }
    },
    onMounted: ({ node, editor }) => {
        const el = editor.element.querySelector(`[data-user-id="${node.attrs.userId}"]`);
        if (el) {
            node.mountComponent(el);
        }
    },
    onUnmounted: ({ node }) => {
        node.unmountComponent();
    },
});
