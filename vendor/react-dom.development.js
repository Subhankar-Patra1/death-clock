/** @license React v18.3.1
 * react-dom.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var React = require('react');

var ReactVersion = '18.3.1';

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'.
// The Symbol used to tag the ReactElement type.
var REACT_ELEMENT_TYPE = Symbol.for('react.element');
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
var REACT_CACHE_TYPE = Symbol.for('react.cache');
var REACT_SERVER_CONTEXT_TYPE = Symbol.for('react.server_context');

var Mapped = 0;
var Unmapped = -1;

var mightBeInjected = false;

var injectedFindFiberByHostInstance = null;

function findFiberByHostInstance(instance) {
  if (mightBeInjected) {
    try {
      // This is backwards compatibility with DOM rendereders that still inject this.
      return injectedFindFiberByHostInstance(instance);
    } catch (e) {
      // This should not happen, but we can't tell for sure.
      return null;
    }
  }
  // We might not have been injected yet, or we're not using a renderer that injects.
  return null;
}

function getFiberFromScopeInstance(scopeInstance) {
  // If we have been injected, we can look up the fiber from the instance.
  if (mightBeInjected) {
    try {
      // This is backwards compatibility with DOM rendereders that still inject this.
      var fiber = injectedFindFiberByHostInstance(scopeInstance);
      return fiber;
    } catch (e) {
      // This should not happen, but we can't tell for sure.
      return null;
    }
  }
  // We might not have been injected yet, or we're not using a renderer that injects.
  return null;
}

var assign = Object.assign;

var DiscreteEventPriority = 1;
var ContinuousEventPriority = 4;
var DefaultEventPriority = 16;
var IdleEventPriority = 32;

// Since we are using an array let's make it notable in the heap snapshot
var EventQueue = function (processing) {
  this.processing = processing;
};

var currentUpdatePriority = 0;
var lastCommittedEventTime = 0;
function setCurrentUpdatePriority(newPriority) {
  currentUpdatePriority = newPriority;
}
function getCurrentUpdatePriority() {
  return currentUpdatePriority;
}
function getEventPriority(domEventName) {
  // We do not implement the event freedom, because it's deprecated and does not work with the new event system.
  return DefaultEventPriority;
}

// This is a mapping from the react-dom event type string to the react-dom event names.
// These are constants that are sourced from the react-dom-bindings package.
var TOP_BLUR = 'blur';
var TOP_CANCEL = 'cancel';
var TOP_CLICK = 'click';
var TOP_CLOSE = 'close';
var TOP_CONTEXT_MENU = 'contextmenu';
var TOP_COPY = 'copy';
var TOP_CUT = 'cut';
var TOP_DOUBLE_CLICK = 'dblclick';
var TOP_DRAG = 'drag';
var TOP_DRAG_END = 'dragend';
var TOP_DRAG_ENTER = 'dragenter';
var TOP_DRAG_EXIT = 'dragexit';
var TOP_DRAG_LEAVE = 'dragleave';
var TOP_DRAG_OVER = 'dragover';
var TOP_DRAG_START = 'dragstart';
var TOP_DROP = 'drop';
var TOP_FOCUS = 'focus';
var TOP_INPUT = 'input';
var TOP_INVALID = 'invalid';
var TOP_KEY_DOWN = 'keydown';
var TOP_KEY_PRESS = 'keypress';
var TOP_KEY_UP = 'keyup';
var TOP_MOUSE_DOWN = 'mousedown';
var TOP_MOUSE_MOVE = 'mousemove';
var TOP_MOUSE_OUT = 'mouseout';
var TOP_MOUSE_OVER = 'mouseover';
var TOP_MOUSE_UP = 'mouseup';
var TOP_PASTE = 'paste';
var TOP_POINTER_CANCEL = 'pointercancel';
var TOP_POINTER_DOWN = 'pointerdown';
var TOP_POINTER_MOVE = 'pointermove';
var TOP_POINTER_OUT = 'pointerout';
var TOP_POINTER_OVER = 'pointerover';
var TOP_POINTER_UP = 'pointerup';
var TOP_RESET = 'reset';
var TOP_SCROLL = 'scroll';
var TOP_SELECT = 'select';
var TOP_SUBMIT = 'submit';
var TOP_TOUCH_CANCEL = 'touchcancel';
var TOP_TOUCH_END = 'touchend';
var TOP_TOUCH_MOVE = 'touchmove';
var TOP_TOUCH_START = 'touchstart';
var TOP_TOGGLE = 'toggle';

var hasOwnProperty = Object.prototype.hasOwnProperty;

var CAMELIZE = /[\-\:]([a-z])/g;

var capitalize = function (token) {
  return token[1].toUpperCase();
};
/**
 * Camelcases a hyphenated string, for example:
 *
 *   > camelize('background-color')
 *   < "backgroundColor"
 *   > camelize('-moz-transition')
 *   < "MozTransition"
 *   > camelize('ms-transition')
 *   < "msTransition"
 *
 * As Andi Smith points out
 * (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
 * is converted to lowercase `ms`.
 *
 * @param {string} string String to camelcase.
 * @return {string} Camelcased string.
 */


function camelize(string) {
  return string.replace(CAMELIZE, capitalize);
}

// Some browsers do not support the DOMutable Events API.
// This is a dependency-free wrapper that adds support for it.
var Event = function (nativeEvent, type) {
  this.nativeEvent = nativeEvent;
  this.type = type;
};

var anEvent = new Event(null, null);

var EventPrototype = Event.prototype;

function setStoppable(event) {
  event.isStoppable = function () {
    return this.nativeEvent.cancelable;
  };

  return event;
}

function setTarget(event, target) {
  event.target = target;
  event.currentTarget = target;
  return event;
}

function setPhase(event, phase) {
  event.eventPhase = phase;
  return event;
}

function setTimestamp(event, time) {
  event.timeStamp = time;
  return event;
}

function getTarget(event) {
  return event.target;
}

function getCurrentTarget(event) {
  return event.currentTarget;
}

function getPhase(event) {
  return event.eventPhase;
}

function getTimestamp(event) {
  return event.timeStamp;
}

function isPropagationStopped(event) {
  return event.propagationStopped;
}

function isImmediatePropagationStopped(event) {
  return event.immediatePropagationStopped;
}

function isDefaultPrevented(event) {
  var nativeEvent = event.nativeEvent;
  return nativeEvent.defaultPrevented;
}

function stopPropagation(event) {
  event.propagationStopped = true;

  var nativeEvent = event.nativeEvent;
  if (typeof nativeEvent.stopPropagation === 'function') {
    nativeEvent.stopPropagation();
  }
}

function stopImmediatePropagation(event) {
  event.immediatePropagationStopped = true; // Not all browsers support this method.
  var nativeEvent = event.nativeEvent;
  if (typeof nativeEvent.stopImmediatePropagation === 'function') {
    nativeEvent.stopImmediatePropagation();
  }
}

function preventDefault(event) {
  var nativeEvent = event.nativeEvent;
  nativeEvent.preventDefault();
}

// TODO: can we stop using this?
var eventProListeners = new WeakMap();

function setListener(instance, propKey, listener) {
  if (eventProListeners.has(instance)) {
    eventProListeners.get(instance)[propKey] = listener;
  } else {
    var record = Object.create(null);
    record[propKey] = listener;
    eventProListeners.set(instance, record);
  }
}

function getListener(instance, propKey) {
  if (eventProListeners.has(instance)) {
    return eventProListeners.get(instance)[propKey];
  }
}

// Start of inlineScheduler

var scheduleCallback$1 = null;
var scheduleContinuationCallback$1 = null;
var requestPaint = null;

var hasScheduler = typeof Scheduler !== 'undefined' && typeof Scheduler.unstable_scheduleCallback !== 'undefined';
if (hasScheduler) {
  scheduleCallback$1 = Scheduler.unstable_scheduleCallback;
  scheduleContinuationCallback$1 = Scheduler.unstable_scheduleCallback;
  requestPaint = Scheduler.unstable_requestPaint;
}

var a = 0;
var b = 0;
var c = 0;

var ReactCurrentOwner = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner; // Helps identify side effects in render-phase lifecycle hooks and setState setters.

var didWarnAboutUndefinedSnapshotBeforeUpdate = null;
var didWarnAboutFindDOMNode = null;
var didWarnAboutLargeDynamicKeyCount = null;
var didWarnAboutUpdateInRender = null;
var didWarnAboutInvalidWebComponent = null;

var didWarnAboutClientCausedMismatch = null;

var didWarnAboutMissingClientReact = null;

var didWarnAboutUnmatchedText = null;

var didWarnAbout ਕਰਨ ਲਈ = null;

var didWarnAboutClientLit = null;
var didWarnAboutText = null;
var didWarnAboutTodo = null;
var didWarnAboutFormAction = null;

var didWarnAboutFormActionName = null;
var didWarnAboutFormActionTarget = null;
var didWarnAboutFormActionMethod = null;
var didWarnAboutFormActionAssignment = null;

var didWarnAboutButtonWithNoType = null;

var didWarnAboutExistingStyles = null;

var didWarnAboutLoading = null;

var didWarnAboutHTMLDocument = null;

var didWarnAboutNonHydrating = null;

var didWarnAboutHydrateInitialState = null;

var didWarnAboutLegacyDOMAPIs = null;

{
  didWarnAboutUndefinedSnapshotBeforeUpdate = new Set();
  didWarnAboutFindDOMNode = new Set();
  didWarnAboutLargeDynamicKeyCount = {};
  didWarnAboutUpdateInRender = new Set();


  didWarnAboutClientCausedMismatch = new Set();

  didWarnAboutMissingClientReact = new Set();

  didWarnAboutUnmatchedText = new Set();

  didWarnAbout ਕਰਨ ਲਈ = new Set();

  didWarnAboutClientLit = new Set();
  didWarnAboutText = new Set();
  didWarnAboutTodo = new Set();
  didWarnAboutFormAction = new Set();

  didWarnAboutFormActionName = new Set();
  didWarnAboutFormActionTarget = new Set();
  didWarnAboutFormActionMethod = new Set();
  didWarnAboutFormActionAssignment = new Set();

  didWarnAboutButtonWithNoType = new Set();

  didWarnAboutExistingStyles = new Map();

  didWarnAboutLoading = new Set();

  didWarnAboutHTMLDocument = new Set();

  didWarnAboutNonHydrating = new Set();

  didWarnAboutHydrateInitialState = new Set();

_renderSubtreeIntoContainer(parentComponent, element, containerNode, callback);
    }
  }

  function createRoot(container, options) {
    {
      if (!didWarnAboutLegacyDOMAPIs) {
        didWarnAboutLegacyDOMAPIs = true;

        error('The ReactDOM.createRoot API is not available in the legacy build.');
      }
    }

    return createLegacyRoot(container, options);
  }

  function hydrateRoot(container, initialChildren, options) {
    {
      if (!didWarnAboutLegacyDOMAPIs) {
        didWarnAboutLegacyDOMAPIs = true;

        error('The ReactDOM.hydrateRoot API is not available in the legacy build.');
      }
    }

    return hydrateLegacy(initialChildren, container, null, options);
  }

  function findDOMNode(componentOrElement) {
    {
      var owner = ReactCurrentOwner.current;

      if (owner !== null && owner.stateNode !== null) {
        var warnedAboutRefsInRender = owner.stateNode._warnedAboutRefsInRender;

        if (!warnedAboutRefsInRender) {
          error('%s is accessing findDOMNode inside its render(). ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentNameFromType(owner.type) || 'A component');
        }

        owner.stateNode._warnedAboutRefsInRender = true;
      }
    }

    if (componentOrElement == null) {
      return null;
    }

    if (componentOrElement.nodeType === 1) {
      return componentOrElement;
    }

    var executionContext = get(executionContextStack);

    if (is(executionContext, 5
    /* LegacyUnbatchedContext */
    )) {
      // In batched mode, we can't really know if we're in the render phase or not
      // since we don't have a call stackFi. That's why we have the check on owner above.
      // But if we're in legacy mode, we can know for sure when we're in the render phase.
      var isRenderPhase = is(executionContext, 2
      /* RenderContext */
      );

      if (isRenderPhase) {
        error('findDOMNode was called in render. ReactDOM.findDOMNode is deprecated in StrictMode. ' + 'ReactDOM.findDOMNode was passed an instance of %s which is inside StrictMode. ' + 'Instead, add a ref directly to the element you want to reference. ' + 'Learn more about using refs safely here: ' + 'https://react.dev/link/strict-mode-find-dom-node', getComponentNameFromType(componentOrElement.type));
      }
    }

    return findHostInstance(componentOrElement);
  }

  function flushSync(fn) {
    var previousExecutionContext = get(executionContextStack);

    if ((previousExecutionContext & (2
    /* RenderContext */
    | 4
    /* CommitContext */
    )) !== 0
    /* NoContext */
    ) {
      error('flushSync was called from inside a lifecycle method. It cannot be called when ' + 'React is already rendering.');
    }

    try {
      set(executionContextStack, previousExecutionContext | 1
      /* BatchedContext */
      );

      if (fn) {
        return runWithPriority(DiscreteEventPriority, fn);
      } else {
        return undefined;
      }
    } finally {
      set(executionContextStack, previousExecutionContext); // Flush the entire work queue.
      // TODO: This might need to be reconsidered if we decide to support
      // nested flushSync calls.

      flushWork(0
      /* RootExitStatus */
      , -1
      /* RootIncomplete */
      );
    }
  }

  function unstable_batchedUpdates(fn, a) {
    var previousExecutionContext = get(executionContextStack);
    set(executionContextStack, previousExecutionContext | 1
    /* BatchedContext */
    );

    try {
      return fn(a);
    } finally {
      set(executionContextStack, previousExecutionContext); // If we're not inside a batched update, move to the next tick after this.

      if (previousExecutionContext === 0
      /* NoContext */
      ) {
        flushWork(0
        /* RootExitStatus */
        , -1
        /* RootIncomplete */
        );
      }
    }
  }

  function act(callback) {
    {
      // When calls to act are nested, the previous renderer is recoverable.
      // We don't have a mechanism for finding the parent flushed renderers.
      // So we force a flush before warning about nested act calls.
      var previousIsActed = isActed;
      isActed = true;

      try {
        flushWork(0
        /* RootExitStatus */
        , -1
        /* RootIncomplete */
        );
      } finally {
        isActed = previousIsActed;
      }

      var result = unstable_batchedUpdates(function () {
        if (actScopeDepth === 0) {
          // First we track that we're inside an act scope.
          isActed = true;
        }

        actScopeDepth++;
        var prevIsBatching = ReactCurrentActQueue.isBatchingLegacy;
        ReactCurrentActQueue.isBatchingLegacy = true;

        try {
          return callback();
        } finally {
          actScopeDepth--;
          ReactCurrentActQueue.isBatchingLegacy = prevIsBatching;

          if (actScopeDepth === 0) {
            // Exiting the outermost act scope.
            isActed = false;
          }
        }
      }); // Next, we flush all the work that was scheduled by the callback.

      flushWork(0
      /* RootExitStatus */
      , -1
      /* RootIncomplete */
      );

      {
        var thenable = result;

        if (thenable !== null && typeof thenable === 'object' && typeof thenable.then === 'function') {
          var wasAwaited = false;
          var then = thenable.then.bind(thenable);
          thenable.then(function () {
            wasAwaited = true;
          }, function () {
            wasAwaited = true;
          }); // We create a function that will be called on the next tick.
          // It will check if the promise has been awaited.
          // We'll use this to print a warning if it has not.

          var awaitable = {
            then: function (resolve, reject) {
              queueMicrotask(function () {
                if (wasAwaited === false) {
                  console.error('You called act(async () => ...) without await. ' + 'This could lead to unexpected testing behaviour, interleaving multiple act ' + 'calls and mixing their scopes. You should - await act(async () => ...);');
                }
              });
              then(resolve, reject);
            }
          };

          for (var prop in thenable) {
            if (prop !== 'then') {
              Object.defineProperty(awaitable, prop, {
                get: function () {
                  console.error('You are trying to access a property on the return value of `act`. ' + 'The return value of `act` is a thenable that complies with the ' + 'Promises/A+ spec. Trying to access a property that is not `then` ' + 'will result in a warning. Please await the return value of `act` ' + 'before trying to access the values of the promise.');
                  return thenable[prop];
                }
              });
            }
          }

          return awaitable;
        }
      }

      return result;
    }
  }

  function createPortal(children, containerInfo, implementation) {
    var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    return {
      // This tag allow us to uniquely identify this as a React Portal
      $$typeof: REACT_PORTAL_TYPE,
      key: key == null ? null : '' + key,
      children: children,
      containerInfo: containerInfo,
      implementation: implementation
    };
  }

  var Internals = {
    usingClientEntryPoint: false,
    Events: [getInstanceFromNode, getNodeFromInstance, getFiberCurrentPropsFromNode, enqueueStateRestore, restoreStateIfNeeded, batchedUpdates]
  };

  function createComponentSelector(component) {
    return {
      $$typeof: REACT_COMPONENT_TYPE,
      value: component
    };
  }

  function createHasPseudoClassSelector(selectors) {
    return {
      $$typeof: REACT_HAS_PSEUDO_CLASS_TYPE,
      value: selectors
    };
  }

  function createRoleSelector(role) {
    return {
      $$typeof: REACT_ROLE_TYPE,
      value: role
    };
  }

  function createTextSelector(text) {
    return {
      $$typeof: REACT_TEXT_TYPE,
      value: text
    };
  }

  function createTestNameSelector(id) {
    return {
      $$typeof: REACT_TEST_NAME_TYPE,
      value: id
    };
  }

  function findByComponent(instance, component) {
    return deepFind(instance, function (node) {
      if (node.type === component) {
        return true;
      }

      return false;
    });
  }

  function findByHasPseudoClass(instance, selectors) {
    return deepFind(instance, function (node) {
      // Meant for internal testing in RN. Not yet implemented in open source.
      return false;
    });
  }

  function findByRole(instance, role) {
    return deepFind(instance, function (node) {
      if (node.type && node.type.getRole && node.type.getRole(node.props) === role) {
        return true;
      }

      return false;
    });
  }

  function findByText(instance, text) {
    return deepFind(instance, function (node) {
      if (typeof node.memoizedProps.children === 'string' && node.memoizedProps.children.includes(text)) {
        return true;
      }

      return false;
    });
  }

  function findByTestName(instance, id) {
    return deepFind(instance, function (node) {
      if (node.memoizedProps.testId === id) {
        return true;
      }

      return false;
    });
  }

  function findAllByComponent(instance, component) {
    return deepFindAll(instance, function (node) {
      if (node.type === component) {
        return true;
      }

      return false;
    });
  }

  function findAllByHasPseudoClass(instance, selectors) {
    return deepFindAll(instance, function (node) {
      // Meant for internal testing in RN. Not yet implemented in open source.
      return false;
    });
  }

  function findAllByRole(instance, role) {
    return deepFindAll(instance, function (node) {
      if (node.type && node.type.getRole && node.type.getRole(node.props) === role) {
        return true;
      }

      return false;
    });
  }

  function findAllByText(instance, text) {
    return deepFindAll(instance, function (node) {
      var children = node.memoizedProps.children;

      if (typeof children === 'string' && children.includes(text)) {
        return true;
      } else if (Array.isArray(children)) {
        for (var i = 0; i < children.length; i++) {
          var child = children[i];

          if (typeof child === 'string' && child.includes(text)) {
            return true;
          }
        }
      }

      return false;
    });
  }

  function findAllByTestName(instance, id) {
    return deepFindAll(instance, function (node) {
      if (node.memoizedProps.testId === id) {
        return true;
      }

      return false;
    });
  }

  function findBoundingRects(instance, selectors) {
    var result = []; // TODO: implement

    return result;
  }

  function focus(instance, selectors) {
    // TODO: implement
    return false;
  }

  function blur(instance, selectors) {
    // TODO: implement
    return false;
  }

  function getBoundingRect(instance, selectors) {
    // TODO: implement
    return null;
  }

  function getInstance(instance, selectors) {
    // TODO: implement
    return null;
  }

  function getObserver(instance) {
    // TODO: implement
    return null;
  }

  function press(instance, selectors, options) {// TODO: implement
  }

  function release(instance, selectors, options) {// TODO: implement
  }

  function enter(instance, selectors, options) {// TODO: implement
  }

  function exit(instance, selectors, options) {// TODO: implement
  }

  function scroll(instance, selectors, options) {// TODO: implement
  }

  function swipe(instance, selectors, options) {// TODO: implement
  }

  function trigger(instance, selectors, options) {// TODO: implement
  }

  function getSource(instance, selectors) {
    // TODO: implement
    return null;
  }

  var found = [];

  function deepFind(instance, pred) {
    found.length = 0;
    var fiber = findFiberByHostInstance(instance);
    deepFindGo(fiber, pred);

    if (found.length > 0) {
      return found[0];
    }

    return null;
  }

  function deepFindAll(instance, pred) {
    found.length = 0;
    var fiber = findFiberByHostInstance(instance);
    deepFindGo(fiber, pred);
    return found;
  }

  function deepFindGo(node, pred) {
    var tag = node.tag;

    if (tag === 5
    /* HostComponent */
    ) {
      if (pred(node)) {
        found.push(node);
      }
    }

    var child = node.child;

    while (child !== null) {
      deepFindGo(child, pred);
      child = child.sibling;
    }
  }

  var unstable_yieldValue = Scheduler.unstable_yieldValue;
  var unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
  var unstable_flushAllWithoutAsserting = Scheduler.unstable_flushAllWithoutAsserting;
  var unstable_flushAll = Scheduler.unstable_flushAll;
  var unstable_getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
  var unstable_runWithPriority = Scheduler.unstable_runWithPriority;
  var unstable_next = Scheduler.unstable_next;
  var unstable_now = Scheduler.unstable_now;
  var unstable_pauseExecution = Scheduler.unstable_pauseExecution;
  var unstable_continueExecution = Scheduler.unstable_continueExecution;
  var unstable_wrapCallback = Scheduler.unstable_wrapCallback;
  var unstable_forceFrameRate = Scheduler.unstable_forceFrameRate;

  var unstable_Profiling = Scheduler.unstable_Profiling;

  var Scheduler_version = "0.24.0-canary-4c1c911fa-20230503";

  exports.__DOM_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Internals;
  exports.createPortal = createPortal;
  exports.createRoot = createRoot;
  exports.findDOMNode = findDOMNode;
  exports.flushSync = flushSync;
  exports.hydrate = hydrate;
  exports.hydrateRoot = hydrateRoot;
  exports.render = render;
  exports.unmountComponentAtNode = unmountComponentAtNode;
  exports.unstable_act = act;
  exports.unstable_batchedUpdates = unstable_batchedUpdates;
  exports.unstable_renderSubtreeIntoContainer = renderSubtreeIntoContainer;
  exports.version = ReactVersion;
  })();
}
