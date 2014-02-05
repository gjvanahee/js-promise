(function () {// clear && node test/test.js
	"use strict";
	var Promise				= require("../src/promise").Promise,
	// var Promise				= require("../lib/promises-latest.min").Promise,
		promisesAplusTests  = require("promises-aplus-tests"),
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
			resolved:   function (value) { return new Promise(function (f   ) { f(value); }); },
			rejected:   function (value) { return new Promise(function (f, r) { r(value); }); }
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