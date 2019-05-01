import { component } from 'riot'
import morphdom from 'morphdom'

/**
 * Morph the existing DOM node with the new created one
 * @param   {HTMLElement} clone - clone of the original DOM node to replace
 * @param   {HTMLElement} element - node to replace
 * @returns {undefined} void function
 */
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

/**
 * Create a custom Riot.js mounting function to hydrate an existing SSR DOM node
 * @param   {RiotComponentShell} componentAPI - component shell
 * @returns {function} function similar to the riot.component
 */
export default function hydrate(componentAPI) {
  const mountComponent = component(componentAPI)

  return (element, props) => {
    const clone = element.cloneNode(false)
    const instance = mountComponent(clone, props)

    if (instance.onBeforeHydrate)
      instance.onBeforeHydrate(instance.props, instance.state)

    // morph the nodes
    morph(clone, element)
    // swap the html
    element.parentNode.replaceChild(clone, element)

    if (instance.onHydrated)
      instance.onHydrated(instance.props, instance.state)

    return instance
  }
}