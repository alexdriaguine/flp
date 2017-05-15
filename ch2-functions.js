// Collection arguments
// ...args collects the rest of the arguments to an array
function collect(x, y, ...args) {
  console.log(x, y, args)
}

collect(1, 2, 3) // 1 2 [ 3 ]
collect(1, 2, 3, 4, 5) // 1 2 [ 3 4 5 ]

// ... in the function call spreads the array to single args
// ... in the param list collects them again to an array
// In a value-list position, it spreads. 
// In an assignment position -- like a parameter list, 
// because arguments get assigned to parameters -- it gathers.
function spread(...args) {
  console.log(args)
}

let arr = [1, 2, 3, 4, 5]
spread(...arr)

arr = [2]
spread(1, ...arr, 3, ...[4, 5])

// default values in functions
// this expression is lazy, not evaluated until needed
function defaultValues(x = 3) {
  console.log('Default value function, x: ', x)
}

defaultValues() // 3
defaultValues(undefined) // 3
defaultValues(null) // null
defaultValues(0) // 0

// Destructuring is a way to declaratively describe a pattern
// for the kind of structure(obj, arr) that you expect to see
function destructArray([x, y, ...args] = []) {
  console.log(x, y, args)
}

function destructureObj({x, y} = {}) {
  console.log(x, y)
}

destructArray([1, 2, 3, 4]) // 1 2 [3, 4]
destructureObj({y: 3}) // undefined 3


// multiple returns
function multiple() {
  const retValue1 = 11
  const retValue2 = 12
  return [retValue1, retValue2]
}

const [x, y] = multiple()

// Higher order functions, take functions or return functions
function forEach(list, fn) {
  for(let i = 0; i < list.length; i++) {
    fn(list[i])
  }
}

forEach([1, 2, 3, 4, 5], console.log) // 1 2 3 4 5

// can also output a funciton
function retFunc() {
  const fn = msg => console.log(msg)
  return fn
}

const f = retFunc()
f('Hello')

// return ist not the only way to output a function
function noRetFunc() {
  const fn = msg => console.log(msg)
  callRetFunc(fn)

}
function callRetFunc(func) {
  func('Hello')
}
noRetFunc()

// Keeping scope, closures. Functions remember the variables from it's outer scope
function person(id) {
  // The inner function has closure over 2 variables, id and randNumber
  const randNumber = Math.random()

  return function identify() {
    console.log(`I am ${id}; ${randNumber}`)
  }
}

const alex = person('Alex')
const yolo = person('Yolo')
alex()
yolo()

// Access to closures is not only readonly. This is probably something to avoid
function runnintCounter(start) {
  let val = start
  return function current(increment = 1) {
    val = val + increment
    console.log(val)
    return val
  }
}
const score = runnintCounter(0)
score()
score()
score(13)

// Operation that needs two inputs but one will be specified later
function makeAdder(x) {
  return function add(y) {
    console.log(x + y)
    return x + y
  }
}

const addTo10 = makeAdder(10)
const addTo37 = makeAdder(37)

addTo10(3)
addTo10(90)
addTo37(13)

// Sinces functions are just values, we can remember function values via closures
function formatter(formatterFn) {
  return function inner(str) {
    return formatterFn(str)
  }
}

const lower = formatter(v => v.toLowerCase())
const upperFirst = formatter(v => v[0].toUpperCase() + lower(v.substring(1)))

console.log(lower('WOW'))
console.log(upperFirst('Hello'))

// WHat is this=

function sum() {
  console.log(this.x + this.y)
  return this.x + this.y
}

const context = {x: 1, y: 2}
sum.call(context)
context.sum = sum
context.sum()
const s = sum.bind(context)
s()

spread('word shalala')