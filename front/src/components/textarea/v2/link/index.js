import {mergeAttributes, Node, VueNodeViewRenderer} from "@tiptap/vue-2"
import Component from "./view.vue";

export default Node.create({
    name: 'Link',
    group: 'inline',
    topNode: true,
    atom: true,
    inline: true,
    selectable: true,
    draggable: false,
    addAttributes() {
        return {
            text: {
                default: null,
            },
            href: {
                default: null
            }
        }
    },
    parseHTML() {
        return [{
            tag: 'a',
            getAttrs: (node) => {
                return {
                    text: node.textContent,
                    href: node.getAttribute('href'),
                }
            },
        }]
    },
    /**
     * 内置渲染
     * @param HTMLAttributes
     * @returns {[string,{href: any},any|string]}
     */
    renderHTML({HTMLAttributes}) {
        const attrs = mergeAttributes(HTMLAttributes);
        return ['a', {href: attrs.href}, attrs.text || attrs.href || '']
    },
    addNodeView() {
        return VueNodeViewRenderer(Component)
    },
    addCommands() {
        return {
            insertLink: (href, text) => ({commands}) => {
                return commands.insertContent({
                    type: 'Link',
                    attrs: {
                        href,
                        text,
                    }
                })
            },
            setLink: (pos, href, text) => ({commands}) => {
                return commands.updateAttributes(pos, undefined, {href, text})
            }
        }
    },
});
