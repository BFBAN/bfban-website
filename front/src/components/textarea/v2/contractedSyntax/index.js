import {Node} from '@tiptap/core';
import {mergeAttributes, VueNodeViewRenderer} from "@tiptap/vue-2";
import Component from "./view.vue";

const UserMention = Node.create({
    name: 'contractedSyntax',

    group: 'inline',
    topNode: false,
    atom: true,
    inline: true,
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            csType: {
                default: null,
            },
            csValue: {
                default: null,
            },
            type: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-type="contracted-syntax"]',
                getAttrs: (node) => {
                    const {csType, csValue, type} = node.dataset;
                    return {
                        csType,
                        csValue,
                        type,
                    }
                },
            },
        ]
    },
    renderHTML({HTMLAttributes}) {
        const attrs = mergeAttributes(HTMLAttributes);
        return ['span', {}, `{${attrs.csType}${attrs.csValue ? ':' : ''}${attrs.csValue}}`]
    },
    addNodeView() {
        return VueNodeViewRenderer(Component)
    },
    addCommands() {
        return {
            insertContractedSyntax: ({csType, csValue}) => ({commands}) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        csType,
                        csValue,
                    },
                    // content: `${csType}${csValue ? ':' : ''}${csValue}`
                })
            },
            setContractedSyntax: ({csType, csValue}) => ({commands}) => {
                return commands.setContent({
                    type: this.name,
                    attrs: {
                        csType,
                        csValue,
                    },
                    content: `${csType}${csValue ? ':' : ''}${csValue}`
                })
            }
        }
    },
});

export default UserMention;
