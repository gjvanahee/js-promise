(function () {// clear && node test/promise_test.js
	"use strict";
	// var Promise				= require("../js/promise/").Promise,
	var Promise				= require("../lib/promises-latest.min").Promise,
		promisesAplusTests  = require("promises-aplus-tests"),
		stub    = function (status) {
			return function (value) {
				try {
					var promise = new Promise(function (f, r) {
						(status === Promise.State.FULFILLED ? f : r)(value);
					});
					return promise;
				}
				catch (e) {
					console.log("ohoh while moving to state: " + status, e);
					console.log(e.trace);
					throw e;
				}
			};
		},
		adapter = {
			deferred: function () {
				var fulfil, reject, promise = new Promise(function (f, r) { 
					fulfil  = f; 
					reject  = r;
				});
				return {
					promise:    promise,
					resolve:    function (v) { fulfil(v); },
					reject:     function (r) { reject(r); }
				};
			},
			resolved:   stub(Promise.State.FULFILLED),
			rejected:   stub(Promise.State.REJECTED)
		};

	promisesAplusTests(
		adapter,
		{
			// reporter: 'markdown' 
			// reporter: 'html' 
			// reporter: 'nyan' 
			// reporter: 'landing' 
		},
		function (err) {
			if (err) {
				console.log(err);
			}
		}
	);
} ());