js-promise
==========

Promise/A+
----------
Js-promise is a relatively small (<2KB minified) library fully implementing [the Promise/A+ specification](http://promises-aplus.github.io/promises-spec/). It passes all tests in the [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests). For more on promises and what their point is, see [this artivle by Domenic Denicola](http://domenic.me/2012/10/14/youre-missing-the-point-of-promises/).

To make a promise, create and return it:
	new Promise(function (resolve, reject) {
		// do what you would have done if you hadn't made the promise
		// if it works out, call resolve() with whatever you would have returned as its argument
		// otherwise, call reject() with an Error() specifying a reasing for failure
	});
To use a promise, call then():
	promise.then(
		function (value)  { /* it worked! do something with the value */ },
		function (reason) { /* problems: fail based on the error provided */ }
	);
