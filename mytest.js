let calculateNumber = function(num1, num2, ans) {
  return new Promise((resolve, reject) => {
    // inside the promise, we need to do the actual work that we
    // committed to doing. If we were able to successfully complete the
    // task that we promised, we will call resolve, and if we
    // were not able to complete it successfully, we will call reject.

    // for a basic example, let's do some math
    let result = num1 * num2; // this should equal ans

    // if the result doesn't equal 84, we will call reject
    // and we're returning it so that this block of code
    // stops execution, and the resolve is not called
    if (result !== ans) {
      return reject("Blah!");
    }

    // if the result was 84, we call resolve, because our promise was successful
    return resolve("yay!");
  });
};

let num1 = 4;
let num2 = 5;
let ans = 20;
calculateNumber(num1, num2, ans)
  .then(uid => {
    console.log("in then");
    // what is inside of this "then", the anonymous function that we are passing
    // is what executes when resolve() is called inside the promise
    console.log(num1 + " * " + num2 + " does = " + ans + ".");
    console.log("uid:"  + uid);  // yay!
  })
  .catch(() => {
    console.log("in catch");
    console.log(num1 + " * " + num2 + " does NOT = " + ans + ".");
    console.log("uid:"  + uid);  // doesn't execute, since 4*5 is 20
    // what is inside this "catch", the anonymous function that we are passing
    // is what executes when reject() is called inside of the promise
  })
  .then(uid => {
    num1 = 4;
    num2 = 6;
    ans = 20;
    calculateNumber(num1, num2, ans)
      .then(uid => {
        console.log("in then");
        // what is inside of this "then", the anonymous function that we are passing
        // is what executes when resolve() is called inside the promise
        console.log(num1 + " * " + num2 + " does = " + ans + ".");
        console.log("uid:"  + uid);   // doesn't execute, since 4*6 is not 20
      })
      .catch(() => {
        console.log("in catch");
        console.log(num1 + " * " + num2 + " does NOT = " + ans + ".");
        console.log("uid:"  + uid);  // undefined
        // what is inside this "catch", the anonymous function that we are passing
        // is what executes when reject() is called inside of the promise
      });
  });
