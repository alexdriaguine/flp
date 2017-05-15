/**
 * One at a time
 * Currying, similar to partial application, where a function that expects
 * multiple arguments is broken down into successive chained functions that
 * each take a single argument (arity: 1) and return another function to accept
 * the next argument
 */

/**
 * Instead of taking all the arguments at once, or some of the arguments up front 
 * and the rest later via partial(), this function receives one argument at a time,
 * each in a separate function call.
 * 
 * Currying is similar to partial application, each successive curried call kind of 
 * partially applied another argument, until all arguments have been passed
 * 
 * The main difference is that the curried function will explicitly return a function,
 * that expects only the next argment.
 */
function curriedAjax(url) {
  return function(data) {
    return function(callback) {
      console.log('Fetching user from ' + url)
      callback(data)
    }
  }
}
const personFetcher = curriedAjax('http://some.api/person')
const getCurrentUser = personFetcher({user: 1})
getCurrentUser(user => console.log(user))

/**
 * Utility function to do currying
 */

function curryVerbose(fn, arity = fn.length) {
  // Start a collection of argumnets in prevArgs as an empty array, hence the 
  // immediate function invocation.
  // Add eac received received nextArg to the args
  // while args.length is less than arity, make and return another curried function
  // to collect the nextArg arguments, passing the running args collection along 
  // ass the prevArgs. Once we have enought args (dvs as much args as the uncurried ),
  // exectute the original function
  return (function nextCurried(prevArgs) {
    // 2. return a function that takes the next argument, i.e. a of add(a, b)
    return function curried(nextArg) {
      // 3. add it to a list of the prevArgs
      const args = prevArgs.concat([nextArg])
      // 4. if the number of arguments are 
      // the number of expected, call the original 
      // function with all args
      if (args.length >= arity) {
        return fn(...args)
      }
      // else, call the nextCurried function with the args again 
      // and repeat 
      else {
        return nextCurried(args)
      }
    }
  })([]) // 1. Send in empty arr ass prevArgs
}
// ES6 =>
const curry = (fn, arity = fn.length, nextCurried) =>
  (nextCurried = prevArgs =>
    nextArg => {
      const args = [...prevArgs, nextArg]
      return args.length >= arity ? fn(...args) : nextCurried(args)
    }
  )([])

const add = (a, b) => a + b
const curriedAdd = curry(add)
const addTen = curriedAdd(10)
console.log(addTen(32))

const arr = [1, 2, 3, 4, 5]
const curryMapped = arr.map(curry(add)(3))
console.log(curryMapped)

// THe difference here betweend partial(add, 3) and curry(add)(3) is that
// we might choose curry if we know ahead of time that add is the function 
// to be adapted, but the value 3 is not known yet.
const adder = curry(add)
const curryAdderMapped = arr.map(adder(3))
console.log(curryAdderMapped)

// another numbers example, adding a list together
function sum(...args) {
  let sum = 0
  for(let i = 0; i < args.length; i++) {
    sum += args[i]
  }
  console.log(sum)
  return sum
}

sum(1, 2, 3, 4, 5)
// now with currying, 5 to indicated how many we should wait for
const curriedSum = curry(sum, 5)
curriedSum(1)(2)(3)(4)(5)

/**
 * The advantage of curring is that each call to pass in an argument 
 * produces another function thats more specialized, and we can capture and
 * use that new function later in the rogram. Partial application specifies all the
 * partially applied arguments up fron, producing a function thats waitin for the
 * rest of the arguments
 * 
 * If we want to use partial application to specify one paramater at a time, we have to keep 
 * calling partialApply on each successive function. Curried functions do this 
 * automatically
 * 
 * In js, currying and partial application use closure to remember the arguments over time 
 * 
 * With either currying stule sum(1)(2)(3) or partial application style
 * partial(sum, 1, 2)(3), the call-site looks strange.
 * First reason to use this approach is to separate in time/space when and where separate
 * arguments ar specified. You dont have to know all the arguments up front.
 * 
 * Another reason, which applies most to currying, is that composition of functions is much
 * easier when there is only one argument.
 */

/**
 * Loosly curry the function, allowing more than one arguments to be passed,
 * ex: curriedFunc(1)(2, 3)(4, 5)
 * 
 * Each curried-call accepts one or more arguments as nextArgs, collected to an array
 * and then passed to the args
 */
function looseCurryVerbose(fn, arity = fn.length) {
  return (function nextCurried(prevArgs) {
    return function curried(...nextArgs) {
      const args = [...prevArgs, ...nextArgs]
      return args.length >= arity ? fn(...args) : nextCurried(args)
    }
  })([])
}

const looseCurry = (fn, arity = fn.length, nextCurried) => 
  (nextCurried = prevArgs =>
    (...nextArgs) => {
      const args = [...prevArgs,  ...nextArgs]
      return args.length >= arity ? fn(...args) : nextCurried(args)
    }

  )([])

const looseCurriedSum = looseCurry(sum, 5)
console.log(looseCurriedSum(1, 2, 3, 4, 5))

/**
 * Uncurrying a function
 * turn f(1)(2)(3) => f(1, 2, 3)
 * 
 * A simple and naive implementation
 */

function uncurryVerbose(fn) {
  return function uncurried(...args) {
    let ret = fn
    for (let i = 0; i < args.length; i++) {
      ret = ret(args[i])
    }
    return ret
  }
}

// ES6 => arrow form
const uncurried = fn =>
  (...args) => {
    let ret = fn
    args.forEach(arg => ret = ret(arg))
    return ret
  }

const cSum = curry(sum, 5)
const uSum = uncurried(curriedSum)

console.log(cSum(1)(2)(3)(4)(5))
console.log(uSum(1, 2, 3, 4, 5))
console.log(uSum(1, 2, 3)(4)(5))

/**
 * Imagine passing a function to a utility where it will send multiple arguments to your function
 * but you only want to receive a single arguments. THis is true if u have a loosely curried function
 * that can accept more arguments than you you would want.
 * 
 * We can design a simple utility that wraps a funciton call to  ensure only one argument willn pass
 * This is enforcing that a function is treated as unary
 */
const unary = fn => arg => fn(arg)

// Example with map. It calls the mapping function with value, index, and list.
// We only want one.

const looseAdder = looseCurry(sum, 2)
console.log(arr.map(adder(3)))
console.log(arr.map(unary(adder(3))))

const numbers = ['1', '2', '3']
console.log(numbers.map(parseFloat))
console.log(numbers.map(parseInt)) // passes the index to the second argument of parseInt - radix
console.log(numbers.map(unary(parseInt))) // does not pass anything, we enforce only one argument


/**
 * Identity. It takes one argument and leaves the value untouched, returning it
 * 
 * Example: Imagine splitting a string using a regular expression.
 * It can contain empty spaces, but we want to filter it. We can pass the identity to 
 * the filter to discard those white spaces
 */
const identity = v => v
const words = '       Now is the time for all...'.split(/\s|\b/)
const filteredWords = words.filter(identity)
console.log(words)
console.log(filteredWords)

// Another example of identity is a default function in place of a transformation
function output(msg, formatFn = identity) {
  msg = formatFn(msg)
  console.log(msg)
}
function upper(txt) {
  return txt.toUpperCase()
}
output('Hello World', upper)
output('Hello World')

// if output(..) didnt have a default formatFn, we could bring out 
// our earlier friend partialRight(..)
const {partialRight} = require('./ch2-functional-input')

const specialOutput = partialRight(output, upper)
const simpleOutput = partialRight(output, identity)
specialOutput('Alex YAOO')
simpleOutput('alex yaoo')

/**
 * CONSTANT
 * certain APIs dont let you pass a value directly into a method, but require uSum
 * to pass a function, even if that function just returns a value. One api is the then(..)
 * on a JS Promise.
 */
const foo = (val) => console.log(val)
const bar = (val) => console.log(val)
const constant = v => () => v
Promise.resolve(2)
  .then(foo)
  .then(constant(5))
  .then(bar)

module.exports = {
  unary
}
