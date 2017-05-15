const {partialRight, partial} = require('./ch2-functional-input')
/**
 * We have already seen a few examplex of function composition, for example:
 * unary(adder(3))
 * 
 * To compose two functions together, pass the output of the first function call as 
 * the input of the second function call.
 * In unary(adder(3)) the adder(3) call returns a value(a function), that value is
 * directly passed as an argument to unary(..) which also returns a function
 * 
 * functionValue <-- unary <-- adder <-- 3
 * 
 * 3 is the input to the adder(..)
 * The output of adder(..) is the input to unary
 * The output of unary(..) is functionValue
 * This is the composition of unary(..) and adder(..)
 * 
 * 
 */

// Concider these two utilities that might be in a program

function words(str) {
  return String(str)
    .toLowerCase()
    .split(/\s|\b/)
    .filter(v => /^[\w]+$/.test(v))
}

function unique(list) {
  let uniqList = []

  for (let i = 0; i < list.length; i++) {
    if (uniqList.indexOf(list[i]) === -1) {
      uniqList.push(list[i])
    }
  }
  return uniqList
}

// We use them as such
const text = `To compose two functions together, pass the \
output of the first function call as the input of the \
second function call.`

const wordsFound = words(text)
const wordsUsed = unique(wordsFound)
console.log(wordsUsed)

// We could just use these two functions together
const wordsUsed2 = unique(words(text))
console.log(wordsUsed2)

// lets define a compoint function that combines these 2
function uniqueWords(str) {
  return unique(words(str))
}

/**
 * utility function to compose 2 functions
 * Notice that the params are ordered fn2, fn2. The functions compose from right to left
 * Most typical FP libraries define their compose to work right-to-left
 * 
 * Why? We are listing them to match the order they are written if done manually,
 * the order we envounter them when reading from left to right
 * 
 * unique(words(str)) lists the functions in the left-to-right order, unique words, also
 * we make compose2(..) utility accept them in that order too.
 */ 
function compose2(fn2, fn1) {
  return function composed(origValue) {
    return fn2(fn1(origValue))
  }
}

const uniqueWordsComposed = compose2(unique, words)
console.log(uniqueWordsComposed(text))

/**
 * <-- unique <-- words combination might seem to be the only one, but we can compose
 * them in the opposite order to create a utility with a different purpose
 * 
 * This words cus the words(..) for value-type safety first coerces its input to a string using String().
 * So the array that unique returns, now the input to words(..) becoms the string "H,o,w, ,a,r,e,y,u,n"
 * and the rest of the behaviour in words(..) processes that string into the chars array.
 */
const letters = compose2(words, unique)
const chars = letters('How are you Alex?')
console.log(chars)

/**
 * We can define composition to support composing any number of functions.
 * 
 * finalValue <-- func1 <-- func2 <-- ... <-- funcN <-- originalValue
 *
 * This is the implementation
 */
function compose(...fns) {
  return function composed(result) {
    let list = fns.slice()
    
    while (list.length > 0) {
      // take the last function off the end of the list and execute it
      result = list.pop()(result)
    }
    return result
  }
}

// Another function to compose
function skipShortWords(list) {
  return list.filter(word => word.length > 4)
}

/**
 * Defining biggerWords that includes skipShortWords
 * The manual composition would be
 * skipShortWords(unique(words(text)))
 */
const biggerWords = compose(skipShortWords, unique, words)
const bigWords = biggerWords(text)
console.log(bigWords)

/**
 * Using partialRight we can do something more intresting with composition.
 * We can build a right partial application of compose(..), prespecifying the second and third arguments (unique and words)
 * 
 * Then we can complete the composition multiple times by calling filterWords but 
 * with different first arguments
 * 
 * right-partial apply allows us to specify ahead of time the first steps of a composition
 * and then create specialized variations of that composition with different subsequent steps
 * 
 * you can also curry(..) a composition, and then create specialized variations of that composition.
 * This is one of the most powerful FP tricks.
 */
function skipLongWords(list) {
  return list.filter(word => word.length <= 4)
}

const filterWords = partialRight(compose, unique, words)
const biggerWords2 = filterWords(skipShortWords)
const shorterWords = filterWords(skipLongWords)

console.log(biggerWords2(text))
console.log(shorterWords(text))

/**
 * While you may never implement your own compose to use in production, it is good to understand how it words
 * Code is more concise an also uses a well-known FP construct, reduce(..).
 * 
 * This implementation is limited in that the outer composed function (aka the first function in the composition)
 * can only receive a single argument. Most other implementations pass aslong all arguments to that first call.
 * 
 * If u want more args, u want a different implementation
 */
function composeWithReduce(...fns) {
  return function composed(result) {
    return fns.reverse().reduce((result, fn) => {
      return fn(result)
    }, result)
  }
}

/**
 * A compose that can take multiple arguments, with a lazy-evaluation function wrapping
 * 
 * We return the result of the reduce(..) call directly, which itself is a function.
 * That function lets us pass in as many arguments as we want, passing them down the line
 * to the first function call in the composition
 * 
 * Instead of calculating the running result and passing it along as the reduce looping proceeds,
 * this runs the reduce looping once up front at composition time, and defers all the function call calculations,
 * referred to as lazy calculation. Each partial result of the reduction is a succesicly more wrapped function
 * 
 * When the final composed function is called and provided one or more arguments, all levels of the big nested func1
 * are executed in reverse succession
 */

const composeMultipleArgs = (...fns) =>
  fns.reverse().reduce((fn1, fn2) => (...args) =>
    fn2(fn1(...args))
  )

/**
 * We can also implement compose with recursion
 */
const composeRecursion = (...fns) => {
  const [fn1, fn2, ...rest] = fns.reverse()
  const composedFn = (...args) =>
    fn2(fn1(...args))
  
  if (rest.length == 0) return composedFn
  return compose(...rest.reverse(), composedFn)
}


/**
 * Reordered composition
 * 
 * The reverse ordering of composition, composing left-to-right, has a common name: pipe.
 * It is identical to compose(..) execpt it processes throight the list of functions left-to-right
 * 
 * It could be defined like this aswell
 * const pipe = reverseArgs(compose)
 * 
 * It's advantage is that it lists the functions in order of execution, which can reduce reader confusion
 * It is also handy if we are in a situation where we want to partially apply the first function(s) that execute
 */
function pipe(...fns) {
  return function piped(result) {
    const list = fns.slice()

    while (list.length > 0) {
      // Take the first function from the list and execute it
      result = list.shift()(result)
    }
    return result
  }
}

const pipedBiggerWords = pipe(words, unique, skipShortWords)
console.log(pipedBiggerWords(text))



/**
 * Points again.
 * Now that composition is covered, lets watch in it action with a scenario thats a fair bit more complex to refacter
 */

function ajax(url, data, cb) {
  console.log(url, data, cb)
}
function output(text) {
  console.log(text)
}

const getPerson = partial(ajax, 'api/person')
const getLastOrder = partial(ajax, 'api/order', {id: -1})

getLastOrder(order => {
  getPerson({id: order.personId})
})

