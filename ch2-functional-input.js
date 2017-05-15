/**
 * Design the functions to take a single param if possible
 */

/**
 * Partial application, strictly a reduction in a functions arity 
 */
const ajax = (url, data, cb) => {
  console.log('url: ', url)
  console.log('data: ', data)
  console.log('cb: ', cb)
  if (typeof cb === 'function') {
    cb(data)
  }
}

/**
 * Take the function and the first laterArgs
   Return a function that takes the rest of the args and calls the first function

   The terminology comes from the notion that arguments are applied to parameters at 
   the function call-site. We only apply some of the arguments upfront, while leaving the
   rest to be applied later
   
   f2 = partial(add, 7)
   f2(5) // returns 12
 */
const partial = (fn, ...presentArgs) =>
    (...laterArgs) =>
      fn(...presentArgs, ...laterArgs)

// More verbose version
// First tkae the function and the first args, store them in an array
// f2 = partial(add, 7)
function partialVerbose(fn, ...presentArgs) {
  // return a new function that takes the other args, gathered in an array
  // res = f2(5)
  return function partiallyApplied(...laterArgs) {
    // The function sent in at the start is called with
    // all the args
    // add(7, 5) => 12
    return fn(...presentArgs, ...laterArgs)
  }
}
    
const add = (a, b) => a + b
const add7 = partial(add, 7)
const add20 = partial(add, 20)
add7(5) // => 12
add20(10) // => 30

const getPerson = partial(ajax, 'http://some.api/person')
const getOrder = partial(ajax, 'http://some.api/order')
// The internals of getPerson will looks something like this
// The same is true about getOrder
const getPersonVerbose = function(...laterArgs) {
  return ajax('http://some.api/peprson', ...laterArgs)
}
const getOrderVerbose = function(...laterArgs) {
  return ajax('http://some.api/orders', ...laterArgs)
}


const getCurrentUser = partial(getPerson, {user: 'CURRENT_USER_ID'})
// The internals of getCurrentUser will look something like this
const getCurrentUserVerbose = function outerPartiallyApplied(...outerLaterArgs) {
	const getPerson = function innerPartiallyApplied(...innerLaterArgs){
		return ajax( "http://some.api/person", ...innerLaterArgs );
	};

	return getPerson( { user: 'CURRENT_USER_ID' }, ...outerLaterArgs );
}
getCurrentUser()
getCurrentUserVerbose()

/**
 * Another example of usefulness of partial application, using the add
 * function and the array#map function
 */
const arr = [1, 2, 3, 4, 5]
const mapped = arr.map(val => add(3, val))

// We cant pass add directly to map, because the signature of add doesnt 
// match the mapping function of map. Thats where partial application can help us,
// we can adapt the signature of add to something that will match
const a = [1, 2, 3, 4, 5]
const partiallyMapped = arr.map(partial(add, 3))

/**
 * Reversing arguments.
 * What if we wanted to specify but data and url later from ajax(url, data, cb) ?
 * We can create a utility that wraps a function to reverse its arguments order
 */

const reverseArgs = fn => (...args) => fn(...args.reverse())
function reverseArgsVerbose(fn) {
  return function argsReversed(...args) {
    return fn(...args.reverse())
  }
}

// Now we can reverse the order of the ajax() arguments, so we can partially apply
// from right to left. To restore the expected order, well then reverse the partially applied function

const cache = {}
const cacheResult = reverseArgs(
  partial(reverseArgs(ajax), function onResult(obj) {
    cache[obj.id] = obj
  })
)


cacheResult('http://some.api/person', {user: 'asd', id: 1})
console.log(cache)

/**
 * Now we can define a partialRight which partially applies from the right,
 * using the same reverse-partial-apply trick
 */
function partialRight(fn, ...presentArgs) {
  // reverse the args of the partial, making it apply them from right to left
  return reverseArgs(
    // also reverse the args of the function sent in, and reverese the presentArgs
    partial(reverseArgs(fn), ...presentArgs.reverse())
  )
}

const cacheResultRighht = partialRight(ajax, function onResult(obj) {
  cache[obj.id] = obj
})

cacheResult('http://some.api/person', {user: 'hehe', id: 2})
console.log(cache)

// This implementation does not guarantee that a specifi parameter will receive a 
// specific partially applied value; it only ensures that the right-partially applied value(s)
// appear as the right most argument(s) passed to the original function

function foo(x, y, z) {
  const rest = [].slice.call(arguments, 3)
  console.log(x, y, z, rest)
}
const f = partialRight(foo, 'z:last')
f(1, 2)
f(1)
f(1, 2, 3)
f(1, 2, 3, 4)
// The value 'z:last' is only applied to the z parameter in the case where f(..) is called
// with exactly two arguments, matching x and y. In all other cases the z:last will be just the right most argument
// how many arguments precede it

module.exports = {
  partialRight,
  partial
}