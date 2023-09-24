import {Quill} from 'vue-quill-editor'

let BlockEmbed = Quill.import('blots/block/embed');

class ImageBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.setAttribute('src', value);
        return node;
    }

    static value(node) {
        return {
            url: node.getAttribute('data-src')
        };
    }
}

ImageBlot.blotName = 'image';
ImageBlot.tagName = 'img';

export default ImageBlot;
