// Parameter array destructuring
function foo([x, y, ...args]) { // We expect a single array argument we want to breakd down
  // or spread out, into individual parameters x and y.
  // any other values in the array are gathetern into args
  console.log(x, y, args)
}

foo([1, 2, 3])

/**
 * Sometimes, there is no ability to change the declaration of the function
 * to use array destructuring. Example
 * 
 * These two functions are incompatible, and often u cannot change their signatures 
 * for external reasons
 */

function fo(x, y) {
  console.log(x, y)
  console.log(x + y)
}
function bar(fn) {
  fn([3, 9])
}
bar(fo)

// We define a helper to adapt a function so that it spreads out a single received 
// array as individual args. In Ramda this is called apply(..)
const spreadArgs = fn =>
  argsArr =>
    fn(...argsArr)
bar(spreadArgs(fo))

// A helper to do the opposite of spreadARgs. 
// IN Ramda this is called unapply(..)
// We can use this to gather individual arguments into a single array,
const gatherArgs = fn =>
  (...argsArr) =>
    fn(argsArr)

// Example
function combineFirstTwo([v1, v2]) {
  return v1 + v2
}
const arr = [1, 2, 3, 4, 5]
const reducedArr = arr.reduce(gatherArgs(combineFirstTwo))
console.log(reducedArr)

