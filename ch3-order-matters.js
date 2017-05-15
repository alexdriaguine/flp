/**
 * With currying and partial application of functions with multiple
 * parameters, arguments have to be in the right order.
 * 
 * Is there anything we can do to free ourselves from this argument ordering tyranny!?
 */

function foo({x, y} = {}) {
  console.log(x, y)
}
foo({y: 3}) // x: undefined

/**
 * We destructure the first parameter, into individual parameters x and y
 * Then we pass in that single object argument, and provide properties as desired, 
 * "Named arguments"
 * 
 * The primary advantage of named arguments os not needing to juggle argument ordering.
 * We can exploit this to improve currying/partial application
 */

function partialProps(fn, presentArgsObj) {
  return function partiallyApplied(laterArgsObj) {
    return fn(Object.assign({}, presentArgsObj, laterArgsObj))
  }
}

function curryProps(fn, arity = 1) {
  return (function nextCurried(prevArgsObj) {
    return function curried(nextArgObj = {}) {
      const [key] = Object.keys(nextArgObj)
      const allArgsObj = Object.assign({}, prevArgsObj, { [key]: nextArgObj[key]})

      if (Object.keys(allArgsObj).length >= arity)
        return fn(allArgsObj)
      else
        return nextCurried(allArgsObj)
    }
  })({})
}

// How we use these utilities
// Order does not matter anymore
function fo({x, y, z} = {}) {
  console.log(`x: ${x}, y: ${y}, z: ${z}`)
}

const f1 = curryProps(fo, 3)
const f2 = partialProps(fo, {y: 2})

f1({y: 2})({x: 1})({z: 3})
f2({z: 3, x: 1})

/**
 * This only works, because we have control over the signature of fo(..) and definded it to
 * destructure its first parameter. What if we wanted to use this with a function that had its 
 * parameters individually listed.
 */
function bar(x, y, z) {
  console.log(`x: ${x}, y: ${y}, z: ${z}`)
}

/**
 * We could define a spreadArgProps(..) helper that takes the key: value paris 
 * out of an object arguments and "spreads" the values out as individual arguments.
 * 
 * NOTE: this parameter parsing logic is far from bullet proof, we are using regular expressions to 
 * parse code, which is a faulty premise
 */
function spreadArgProps(
	fn,
	propOrder =
		fn.toString()
		.replace( /^(?:(?:function.*\(([^]*?)\))|(?:([^\(\)]+?)\s*=>)|(?:\(([^]*?)\)\s*=>))[^]+$/, "$1$2$3" )
		.split( /\s*,\s*/ )
		.map( v => v.replace( /[=\s].*$/, "" ) )
) {
	return function spreadFn(argsObj) {
		return fn( ...propOrder.map( k => argsObj[k] ) );
	};
}

const f3 = curryProps(spreadArgProps(bar), 3)
const f4 = partialProps(spreadArgProps(bar), {y: 2})

f3({y: 3})({x: 1})({z: 3})
f4({z: 3, x: 1})