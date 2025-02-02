import {Node} from '@tiptap/core';
import {mergeAttributes, VueNodeViewRenderer} from "@tiptap/vue-2";
import Component from "./view.vue";

const UserMention = Node.create({
    name: 'userMention',
    group: 'inline',
    topNode: true,
    atom: true,
    inline: true,
    selectable: false,
    draggable: false,

    addAttributes() {
        return {
            mentionType: {
                default: null,
            },
            mentionId: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span',
                getAttrs: (node) => {
                    const text = node.textContent
                    const match = text.match(/{(user|player):(\d+)}/)
                    if (match) {
                        return {
                            mentionType: match[1],
                            mentionId: parseInt(match[2]),
                        }
                    }
                    return null
                },
            },
        ]
    },
    renderHTML({HTMLAttributes}) {
        const attrs = mergeAttributes(HTMLAttributes);
        return ['span', attrs, 0]
    },

    addNodeView() {
        return VueNodeViewRenderer(Component)
    },

    addCommands() {
        return {
            insertMention: (mentionType, mentionId) => ({ commands }) => {
                return commands.insertContent({ type: this.name, attrs: { mentionType, mentionId } })
            },
        }
    },
});

export default UserMention;
