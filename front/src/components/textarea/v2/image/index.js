import {mergeAttributes, Node, VueNodeViewRenderer} from "@tiptap/vue-2"
import Component from "./view.vue";

export default Node.create({
    name: 'Image',
    group: 'block',
    atom: true,
    selectable: false,
    draggable: false,
    addAttributes() {
        return {
            src: {
                default: null,
            },
        }
    },
    parseHTML() {
        return [{
            tag: 'img',
            getAttrs: (node) => {
                return {
                    src: node.getAttribute('src'),
                }
            },
        }]
    },
    renderHTML({HTMLAttributes}) {
        const attrs = mergeAttributes(HTMLAttributes);
        return ['img', {src: attrs.src}]
    },
    addNodeView() {
        return VueNodeViewRenderer(Component)
    },
    addCommands() {
        return {
            insertImage: (options) => ({commands}) => {
                return commands.insertContent({type: this.name, ...options})
            },
        }
    },
});
