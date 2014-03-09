/**
 * Glowstone
 * A modern, web-based and oriented, extensible Operating System
 *
 * Developed by Jimmie Lin <jimmie.lin@gmail.com> (c) 2013-2014
 * Licensed under the MIT License
 *
 * @author        Jimmie Lin <jimmie.lin@gmail.com>
 * @since         2013.7.22
 *
 * File Description: System/Frameworks/Event/Main.js
 * Manages any interval-related code, does garbage collection for these now and then when things are gone.
 */

System.Framework.Event = {
	EventTable: {},

	Init: function(callback) {
		if(typeof callback != "undefined")
			callback();
	},

	/**
	 * Create or Destroy Events using Dot Notation (Namespaced)
	 */
	NewEvent: function(instance, key, call, interval) {
		if(typeof call != "function") return false;
		if(typeof interval != "number") return false;

		obj = System.Framework.Event.EventTable;

		key = "LDVM" + instance + ".";
		var tags = key.split('.'), length = tags.length - 1;
		for(var i = 0; i < length; i++) {
			if(typeof obj[tags[i]] == "undefined") obj[tags[i]] = {};
			obj = obj[tags[i]];
		}

		obj[tags[length]] = setInterval(call, interval);


		return obj[tags[length]];
	},

	/**
	 * Garbage Collection: Tell me which namespace you are in and I'll handle the rest for you.
	 * I know that any CoreFramework can come here and kill all events available - that *is* the point - Lockdown will protect namespaces
	 * and terminate them automatically using this later.
	 * This will simply terminate the event if passed as an event, or any things nested within otherwise, in a recursive call
	 */
	DestroyEvent: function(instance, key) {
		obj = System.Framework.Event.EventTable;
		key = "LDVM" + instance + ".";
		var tags = key.split('.'), length = tags.length - 1;
		for(var i = 0; i < length; i++) {
			if(typeof obj[tags[i]] == "undefined") obj[tags[i]] = {};
			obj = obj[tags[i]];
		}

		if(typeof obj[tags[length]] == "number" || typeof obj[tags[length]] == "object")
			System.Framework.Event._DestroyEvent(obj[tags[length]]);

		delete obj[tags[length]];
		console.log(obj);

		return true;
	},

	_DestroyEvent: function(obj, cursor) {
		if(typeof obj == "object") {
			for(var key in obj) {
				if(obj.hasOwnProperty(key)) {
					System.Framework.Event._DestroyEvent(obj[key]);
				}
			}
		}
		else {
			clearInterval(obj);
		}

		return true;
	}
}