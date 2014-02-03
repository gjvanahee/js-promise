// http://domenic.me/2012/10/14/youre-missing-the-point-of-promises/
// https://github.com/domenic/promises-unwrapping/
// http://promises-aplus.github.io/promises-spec/
var Promise = (function () {
	"use strict";
	var is_type					= function (item, type) {
			return !!Object.prototype.toString.call(item).match(new RegExp(type));
		},
		move_to_end_of_stack    = function (promise, link) {
			return function () {
				try {
					// 2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
					if (
						promise.state === Promise.State.FULFILLED &&
						is_type(link.fulfilled, "Function")
					) {
						promise_resolution(
							link.promise,
							link.fulfilled.call(undefined, promise.value_or_reason)
						);
					}
					else if (
						promise.state === Promise.State.REJECTED &&
						is_type(link.rejected, "Function")
					) {
						promise_resolution(
							link.promise,
							link.rejected.call(undefined, promise.value_or_reason)
						);
					}
					// 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value.
					// 2.2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason.
					else {
						transition(link.promise, promise.state, promise.value_or_reason);
					} // no callback given
				}
				//  2.2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
				catch (e) {
					generate_reject(link.promise)(e);
				}
			};
		},
		generate_resolve	= function (promise) { return function (resolution) { transition(promise, Promise.State.FULFILLED, resolution); }; },
		generate_reject		= function (promise) { return function (reason) { transition(promise, Promise.State.REJECTED, reason); }; },
		transition			= function (promise, state, value_or_reason) {
			if (state === Promise.State.PENDING) {
				return;
	//            throw new Error("Cannot transition into PENDING state");
			}
			if (promise.state !== Promise.State.PENDING) {
				return;
	//            throw new Error("Cannot transition out of final state");
			}
			promise.state              = state;
			promise.value_or_reason    = value_or_reason;

			resolve(promise);
		},
		/**
		 * @param {Promise} promise2
		 * @param {mixed} x variable returned thenned functions
		 */
		promise_resolution    = function (promise2, x) {
			// 2.3.1 promise and x refer to the same object, reject promise with a TypeError as the reason.
			if (promise2 === x) {
				transition(promise2, Promise.State.REJECTED, new TypeError("Function return value is same as promise linked.")); 
			}

			// 2.3.2 If x is a promise, adopt its state 3.4:
			if (
				is_type(x, "Object") &&
				is_type(x.chain, "Object") &&
				is_type(x.then, "Function")
			) {
				// 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
				x.then(
					// 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
					generate_resolve(promise2),
					// 2.3.2.3 If/when x is rejected, reject promise with the same reason.
					generate_reject(promise2)
				);
			}
			// 2.3.3 Otherwise, if x is an object or function,
			else if (is_type(x, 'Object|Function')) {
				var callable    = true;
				// 2.3.3.1 Let then be x.then. 3.5
				// 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
				try {
					var then    = x.then;
					// 2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
					//  2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
					//  2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
					//  2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
					// if (typeof then === "function") {
					if (is_type(then, 'Function')) {
						// 2.3.3.4 If calling then throws an exception e,
						//  2.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
						//  2.3.3.4.2 Otherwise, reject promise with e as the reason.
						then.call(
							x,
							function (y) {
								if (callable) {
									callable    = false;
									promise_resolution(promise2, y);
								}
							},
							function (r) {
								if (callable) {
									callable    = false;
									transition(promise2, Promise.State.REJECTED, r);
								}
							}
						);
					}
					// 2.3.3.4 If then is not a function, fulfill promise with x.
					else {
						transition(promise2, Promise.State.FULFILLED, x);
					}
				}
				// 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
				catch (e) {
					if (callable) {
						transition(promise2, Promise.State.REJECTED, e);
					}
				}
			}
			// 2.3.4 If x is not an object or function, fulfill promise with x.
			else {
				transition(promise2, Promise.State.FULFILLED, x);
			}
		},
		resolve   = function (promise) {
			if (promise.state !== Promise.State.PENDING) {
				var link    = promise.chain.shift();
				while (link) {
					setTimeout(move_to_end_of_stack(promise, link), 0);
					link    = promise.chain.shift();
				} // no link to fulfill/reject
			} // still PENDING
		},
		/**
		 * “promise” is an object or function with a then method whose behavior conforms to this specification.
		 * “thenable” is an object or function that defines a then method.
		 * “value” is any legal JavaScript value (including undefined, a thenable, or a promise).
		 * “exception” is a value that is thrown using the throw statement.
		 * “reason” is a value that indicates why a promise was rejected.
		 */
		Promise = function (resolver) {
			this.chain              = [];
			this.state              = Promise.State.PENDING;
			this.value_or_reason    = undefined;

			try {
				resolver.call(
					undefined,
					generate_resolve(this),
					generate_reject(this)
				);
			}
			catch (e) {
				transition(this, Promise.State.REJECTED, e);
			}
		};

	/**
	 * When pending, a promise:
	 *  may transition to either the fulfilled or rejected state.
	 * When fulfilled, a promise:
	 *  must not transition to any other state.
	 *  must have a value, which must not change.
	 * When rejected, a promise:
	 *  must not transition to any other state.
	 *  must have a reason, which must not change.
	 */
	Promise.State   = {
		PENDING:     0,
		FULFILLED:   1,
		REJECTED:   -1
	};
	/**
	 * Registers callbacks to receive either a promise’s eventual value or the reason why the promise cannot be fulfilled.
	 * @param {function} fulfilled the succes, taking the eventual value
	 * @param {function} rejected the failure, taking the reason
	 * @return {Promise} the new promise
	 */
	Promise.prototype.then  = function (fulfilled, rejected) {
		var link    = {
			promise:    new Promise(function (/*resolve, reject*/) {}),
			fulfilled:  fulfilled,
			rejected:   rejected
		};
		this.chain.push(link);
		// if (this.state !== Promise.State.PENDING)	transition(link.promise, this.state, this.value_or_reason);
		// console.log('then', this.state, link.promise.state);
		resolve(this);
		return link.promise;
	};

	// return the class
	return Promise;
} ());
if (typeof exports !== "undefined") {
	exports.Promise    = Promise;
}
