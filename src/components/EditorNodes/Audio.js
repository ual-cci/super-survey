/* eslint semi: ["error", "never"] */
/* eslint class-methods-use-this: "off" */

import { Node } from 'tiptap'

export default class Audio extends Node {
  get name() {
    return 'audio'
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      attrs: {
        src: {
          default: null,
        },
        controls: {
          default: true,
        },
        class: {
          default: '',
        },
      },
      group: 'block',
      selectable: true,
      draggable: true,
      defining: true,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [{
        tag: 'audio',
        getAttrs: dom => ({
          src: dom.getAttribute('src'),
        }),
      }],
      toDOM: node => ['audio', {
        src: node.attrs.src,
        controls: true,
        controlslist: 'nodownload',
        class: node.attrs.class,
      }],
    }
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state
      let position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos
      if (attrs.class === 'diversity') {
        position = state.tr.doc.content.size
      }
      const node = type.create(attrs)
      const transaction = state.tr.insert(position, node)
      dispatch(transaction)
    }
  }
}
