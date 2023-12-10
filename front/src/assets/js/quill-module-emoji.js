import Quill from 'quill';

const Embed = Quill.import('blots/embed');

class EmojiBlot extends Embed {
    static create(value) {
        let node = super.create();
        if (value.name)
            node.innerText = `{emoji:${value.name}}`;
        return node;
    }

    static value(node) {
        return node.innerText;
    }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.tagName = 'span';

export default EmojiBlot;
