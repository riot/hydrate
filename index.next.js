import { component } from 'riot'
import morphdom from 'morphdom'

function morph(clone, element) {
  const { activeElement } = document

  morphdom(clone, element, {
    onBeforeElUpdated: function(fromEl, toEl) {
      if (toEl === activeElement) {
        fromEl.isActive = true
      }

      return true
    },
    onElUpdated(node) {
      if (node.isActive) {
        delete node.isActive

        requestAnimationFrame(() => {
          node.focus()
        })
      }
    }
  })
}

export default function hydrate(element, componentAPI, props) {
  const clone = element.cloneNode(false)
  const instance = component(componentAPI)(clone, props)

  if (instance.onBeforeHydrate)
    instance.onBeforeHydrate(instance.props, instance.state)

  morph(clone, element)
  element.parentNode.replaceChild(clone, element)

  if (instance.onHydrated)
    instance.onHydrated(instance.props, instance.state)

  return instance
}