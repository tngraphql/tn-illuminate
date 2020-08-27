import { ApplicationContract } from '../Contracts/ApplicationContract';
import { NameSapceType } from './Container';

/**
 * Checks for the existence of fake on the target
 */
function hasFake (target) {
  return target.container.hasFake(target.binding)
}

/**
 * Calls the trap on the target
 */
function callTrap (target, trap, ...args) {
  if (hasFake(target)) {
    return Reflect[trap](target.container.useFake(target.binding, target.actual), ...args)
  } else {
    return Reflect[trap](target.actual, ...args)
  }
}

/**
 * Proxy handler to handle objects
 */
const objectHandler = {
  get (target, ...args) {
    return callTrap(target, 'get', ...args)
  },

  apply (target, ...args) {
    return callTrap(target, 'apply', ...args)
  },

  defineProperty (target, ...args) {
    return callTrap(target, 'defineProperty', ...args)
  },

  deleteProperty (target, ...args) {
    return callTrap(target, 'deleteProperty', ...args)
  },

  getOwnPropertyDescriptor (target, ...args) {
    return callTrap(target, 'getOwnPropertyDescriptor', ...args)
  },

  getPrototypeOf (target, ...args) {
    return callTrap(target, 'getPrototypeOf', ...args)
  },

  has (target, ...args) {
    return callTrap(target, 'has', ...args)
  },

  isExtensible (target, ...args) {
    return callTrap(target, 'isExtensible', ...args)
  },

  ownKeys (target, ...args) {
    return callTrap(target, 'ownKeys', ...args)
  },

  preventExtensions () {
    throw new Error('Cannot prevent extensions during a fake')
  },

  set (target, ...args) {
    return callTrap(target, 'set', ...args)
  },

  setPrototypeOf (target, ...args) {
    return callTrap(target, 'setPrototypeOf', ...args)
  },
}

/**
 * Proxy handler to handle classes and functions
 */
const classHandler = Object.assign({}, objectHandler, {
  construct (target, ...args) {
    return callTrap(target, 'construct', args)
  },
})

/**
 * Proxies the objects to fallback to fake, when it exists.
 */
export class IoCProxyObject {
  constructor (public binding: NameSapceType, public actual: any, public container: ApplicationContract) {
    return new Proxy(this, objectHandler)
  }
}

/**
 * Proxies the class constructor to fallback to fake, when it exists.
 */
export function IocProxyClass (binding: NameSapceType, actual: any, container: ApplicationContract) {
  function Wrapped () {}
  Wrapped.binding = binding
  Wrapped.actual = actual
  Wrapped.container = container

  return new Proxy(Wrapped, classHandler)
}
