
const unary = fn => arg => fn(arg)
const uncurried = fn =>
  (...args) => {
    let ret = fn
    args.forEach(arg => ret = ret(arg))
    return ret
  }
function partialRight(fn, ...presentArgs) {
  // reverse the args of the partial, making it apply them from right to left
  return reverseArgs(
    // also reverse the args of the function sent in, and reverese the presentArgs
    partial(reverseArgs(fn), ...presentArgs.reverse())
  )
}
/**
 * A popular coding style in FP is to reduce some of the visual clutter
 * by removing the unnecessary parameter argument mapping. This is called
 * point-free style, the term point is referring to a funtions parameter
 * 
 * The key thing to look for is if there are function with parameters that are directly
 * passed to an inner function call.
 */

// A simple example
const arr = [1, 2, 3, 4, 5]
const double = x => x * 2
let mapped = arr.map(function mapper(v) { return double(v) })
console.log(mapped)

// Mapper and double have the same signature. The parameter v can directly map
// to the corresponding argument in the double(..) call. THe mapper function is
// unnecessary
mapped = arr.map(double)
console.log(mapped)

// Another example
// Here, the mapping function servers a purpose, which is to discard the index
// argument that map would pass in, because parseInt would incorrectly interpret 
// it as the radix.
const numbersish = ['1', '2', '3']
mapped = numbersish.map(v => parseInt(v))
console.log(mapped)

// Unaryr can help Here
mapped = numbersish.map(unary(parseInt))
console.log(mapped)


// Another example
function output(txt) {
  console.log(txt) // avoid potential binding issue trying to use console.log as a function
}

function printIf(predicate, msg) {
  if (predicate(msg)) {
    output(msg)
  }
}

function isShortEnought(str) {
  return str.length <= 5
}

const msg1 = 'Hello'
const msg2 = `${msg1} World!`

printIf(isShortEnought, msg1)
printIf(isShortEnought, msg2)

// Now lets print a message only if it's long enough.
// Our first thought would probably be this function.
// It is easy but points. Lets refactor this to point free
// function isLongEnough(str) {
//   return !isShortEnought(str)
// }

// Defining a not(..) negation helper, often referred to as complement(..) in FP libraries
function not(predicate) {
  return function negated(...args) {
    return !predicate(...args)
  }
}

const isLongEnough = not(isShortEnought)

printIf(isLongEnough, msg2)

// We can keep on going, the definition of the printIf function
// can actually be refactored to be point-free itself
// We can express the if conditional part with a when(..) utility
function when(predicate, fn) {
  return function conditional(...args) {
    if (predicate(...args)) {
      return fn(...args)
    }
  }
}

const newPrintIf = uncurried(partialRight(when, output))
newPrintIf(isShortEnought(msg1))
newPrintIf(isLongEnough(msg2))