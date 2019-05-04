import { component } from 'riot'
import specialElHandlers from 'morphdom/src/specialElHandlers'

/**
 * Create a DOM tree walker
 * @param   {HTMLElement} node - root node where we will start the crawling
 * @returns {TreeWalker} the TreeWalker object
 */
function createWalker(node) {
  return document.createTreeWalker(
    node,
    NodeFilter.SHOW_ELEMENT,
    { acceptNode: () => NodeFilter.FILTER_ACCEPT },
    false
  )
}

/**
 * Sync a source node with the one rendered in runtime
 * @param   {HTMLElement} sourceNode - node pre-rendered in the DOM
 * @param   {HTMLElement} targetNode - node generated in runtime
 * @returns {undefined} void function
 */
function sync(sourceNode, targetNode) {
  const { activeElement } = document
  const specialHandler = specialElHandlers[sourceNode.tagName]

  if (sourceNode === activeElement) {
    window.requestAnimationFrame(() => {
      targetNode.focus()
    })
  }

  if (specialHandler) {
    specialHandler(targetNode, sourceNode)
  }
}

/**
 * Morph the existing DOM node with the new created one
 * @param   {HTMLElement} sourceElement - the root node already pre-rendered in the DOM
 * @param   {HTMLElement} targetElement - the root node of the Riot.js component mounted in runtime
 * @returns {undefined} void function
 */
function morph(sourceElement, targetElement) {
  const sourceWalker = createWalker(sourceElement)
  const targetWalker = createWalker(targetElement)
  // recursive function to walk source element tree
  const walk = fn => sourceWalker.nextNode() && targetWalker.nextNode() && fn() && walk(fn)

  walk(() => {
    const { currentNode } = sourceWalker
    const targetNode = targetWalker.currentNode

    if (currentNode.tagName === targetNode.tagName) {
      sync(currentNode, targetNode)
    }

    return true
  })
}

/**
 * Create a custom Riot.js mounting function to hydrate an existing SSR DOM node
 * @param   {RiotComponentShell} componentAPI - component shell
 * @returns {Function} function similar to the riot.component
 */
export default function hydrate(componentAPI) {
  const mountComponent = component(componentAPI)

  return (element, props) => {
    const clone = element.cloneNode(false)
    const instance = mountComponent(clone, props)

    if (instance.onBeforeHydrate)
      instance.onBeforeHydrate(instance.props, instance.state)

    // morph the nodes
    morph(element, clone)

    // swap the html
    element.parentNode.replaceChild(clone, element)

    if (instance.onHydrated)
      instance.onHydrated(instance.props, instance.state)

    return instance
  }
}