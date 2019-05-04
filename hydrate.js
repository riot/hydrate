(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('riot')) :
    typeof define === 'function' && define.amd ? define(['riot'], factory) :
    (global = global || self, global.hydrate = factory(global.riot));
}(this, function (riot) { 'use strict';

    function syncBooleanAttrProp(fromEl, toEl, name) {
        if (fromEl[name] !== toEl[name]) {
            fromEl[name] = toEl[name];
            if (fromEl[name]) {
                fromEl.setAttribute(name, '');
            } else {
                fromEl.removeAttribute(name);
            }
        }
    }

    var specialElHandlers = {
        OPTION: function(fromEl, toEl) {
            var parentNode = fromEl.parentNode;
            if (parentNode) {
                var parentName = parentNode.nodeName.toUpperCase();
                if (parentName === 'OPTGROUP') {
                    parentNode = parentNode.parentNode;
                    parentName = parentNode && parentNode.nodeName.toUpperCase();
                }
                if (parentName === 'SELECT' && !parentNode.hasAttribute('multiple')) {
                    if (fromEl.hasAttribute('selected') && !toEl.selected) {
                        // Workaround for MS Edge bug where the 'selected' attribute can only be
                        // removed if set to a non-empty value:
                        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12087679/
                        fromEl.setAttribute('selected', 'selected');
                        fromEl.removeAttribute('selected');
                    }
                    // We have to reset select element's selectedIndex to -1, otherwise setting
                    // fromEl.selected using the syncBooleanAttrProp below has no effect.
                    // The correct selectedIndex will be set in the SELECT special handler below.
                    parentNode.selectedIndex = -1;
                }
            }
            syncBooleanAttrProp(fromEl, toEl, 'selected');
        },
        /**
         * The "value" attribute is special for the <input> element since it sets
         * the initial value. Changing the "value" attribute without changing the
         * "value" property will have no effect since it is only used to the set the
         * initial value.  Similar for the "checked" attribute, and "disabled".
         */
        INPUT: function(fromEl, toEl) {
            syncBooleanAttrProp(fromEl, toEl, 'checked');
            syncBooleanAttrProp(fromEl, toEl, 'disabled');

            if (fromEl.value !== toEl.value) {
                fromEl.value = toEl.value;
            }

            if (!toEl.hasAttribute('value')) {
                fromEl.removeAttribute('value');
            }
        },

        TEXTAREA: function(fromEl, toEl) {
            var newValue = toEl.value;
            if (fromEl.value !== newValue) {
                fromEl.value = newValue;
            }

            var firstChild = fromEl.firstChild;
            if (firstChild) {
                // Needed for IE. Apparently IE sets the placeholder as the
                // node value and vise versa. This ignores an empty update.
                var oldValue = firstChild.nodeValue;

                if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder)) {
                    return;
                }

                firstChild.nodeValue = newValue;
            }
        },
        SELECT: function(fromEl, toEl) {
            if (!toEl.hasAttribute('multiple')) {
                var selectedIndex = -1;
                var i = 0;
                // We have to loop through children of fromEl, not toEl since nodes can be moved
                // from toEl to fromEl directly when morphing.
                // At the time this special handler is invoked, all children have already been morphed
                // and appended to / removed from fromEl, so using fromEl here is safe and correct.
                var curChild = fromEl.firstChild;
                var optgroup;
                var nodeName;
                while(curChild) {
                    nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
                    if (nodeName === 'OPTGROUP') {
                        optgroup = curChild;
                        curChild = optgroup.firstChild;
                    } else {
                        if (nodeName === 'OPTION') {
                            if (curChild.hasAttribute('selected')) {
                                selectedIndex = i;
                                break;
                            }
                            i++;
                        }
                        curChild = curChild.nextSibling;
                        if (!curChild && optgroup) {
                            curChild = optgroup.nextSibling;
                            optgroup = null;
                        }
                    }
                }

                fromEl.selectedIndex = selectedIndex;
            }
        }
    };

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
      const { activeElement } = document;
      const specialHandler = specialElHandlers[sourceNode.tagName];

      if (sourceNode === activeElement) {
        window.requestAnimationFrame(() => {
          targetNode.focus();
        });
      }

      if (specialHandler) {
        specialHandler(targetNode, sourceNode);
      }
    }

    /**
     * Morph the existing DOM node with the new created one
     * @param   {HTMLElement} sourceElement - the root node already pre-rendered in the DOM
     * @param   {HTMLElement} targetElement - the root node of the Riot.js component mounted in runtime
     * @returns {undefined} void function
     */
    function morph(sourceElement, targetElement) {
      const sourceWalker = createWalker(sourceElement);
      const targetWalker = createWalker(targetElement);
      // recursive function to walk source element tree
      const walk = fn => sourceWalker.nextNode() && targetWalker.nextNode() && fn() && walk(fn);

      walk(() => {
        const { currentNode } = sourceWalker;
        const targetNode = targetWalker.currentNode;

        if (currentNode.tagName === targetNode.tagName) {
          sync(currentNode, targetNode);
        }

        return true
      });
    }

    /**
     * Create a custom Riot.js mounting function to hydrate an existing SSR DOM node
     * @param   {RiotComponentShell} componentAPI - component shell
     * @returns {Function} function similar to the riot.component
     */
    function hydrate(componentAPI) {
      const mountComponent = riot.component(componentAPI);

      return (element, props) => {
        const clone = element.cloneNode(false);
        const instance = mountComponent(clone, props);

        if (instance.onBeforeHydrate)
          instance.onBeforeHydrate(instance.props, instance.state);

        // morph the nodes
        morph(element, clone);

        // swap the html
        element.parentNode.replaceChild(clone, element);

        if (instance.onHydrated)
          instance.onHydrated(instance.props, instance.state);

        return instance
      }
    }

    return hydrate;

}));
