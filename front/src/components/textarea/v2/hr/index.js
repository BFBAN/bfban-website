import {Node, VueNodeViewRenderer} from "@tiptap/vue-2"
import Component from "./view.vue";

export default Node.create({
    name: 'HR',
    group: 'block',
    topNode: true,
    atom: true,
    selectable: true,
    draggable: false,
    parseHTML() {
        return [{tag: 'horizontal'}, {tag: 'p'}]
    },
    renderHTML({HTMLAttributes}) {
        return ['hr']
    },
    addNodeView() {
        return VueNodeViewRenderer(Component)
    },
    addCommands() {
        return {
            insertHr: () => ({chain}) => {
                return chain()
                    .insertContent([
                        {
                            type: this.name,
                            updateSelection: true,
                        },
                        {type: 'paragraph'}
                    ])
                    .run();
            },
        }
    },
});
