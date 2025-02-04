import {mergeAttributes, Node, VueNodeViewRenderer} from "@tiptap/vue-2"
import Component from "./view.vue";

export default Node.create({
    name: 'Emote',
    group: 'inline',
    topNode: false,
    atom: true,
    inline: true,
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            id: {
                default: null,
            },
        }
    },
    parseHTML() {
        return [{
            tag: 'span[data-type="emote"]',
            getAttrs: (node) => {
                const {id} = node.dataset;
                return {
                    id,
                }
            },
        }]
    },
    renderHTML({HTMLAttributes}) {
        const attrs = mergeAttributes(HTMLAttributes);
        return ['span', {}, `[${attrs.id}]`]
    },
    addNodeView() {
        return VueNodeViewRenderer(Component)
    },
    addCommands() {
        return {
            insertEmote: ({id}) => ({commands}) => {
                return commands.insertContent({
                    type: 'Emote',
                    attrs: {
                        id,
                    }
                })
            },
        }
    },
});
