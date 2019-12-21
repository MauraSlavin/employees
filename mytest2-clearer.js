var promisefunction = new Promise((resolve, reject) => {
  resolve('data');
});

var promisefunction2 = new Promise((resolve, reject) => {
  resolve('data');
});

var otherparam = 'More data';

// passing in the anonymous function and     **** otherparam (passed in )  ****
promisefunction.then(function(value) {
  console.log(value, otherparam);
  // expected output: "data" "more data"
}, otherparam);

// passing in the anonymous function and   *** otherparam used as global ***
promisefunction2.then(function(value) {
  console.log(value, otherparam);
  // expected output: "data" "more data"
});