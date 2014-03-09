/**
 * Glowstone
 * A modern, web-based and oriented, extensible Operating System
 *
 * Developed by Jimmie Lin <jimmie.lin@gmail.com> (c) 2013-2014
 * Licensed under the MIT License
 *
 * @author        Jimmie Lin <jimmie.lin@gmail.com>, I18Next Authors
 * @since         2014.3.8
 *
 * File Description: System/Frameworks/i18n/Main.js
 * Handles internationalization work, requires Lockdown.
 */

System.Framework.i18n = {
	Init: function(callback) {
		i18n.init({
			resGetPath: "Library/__ns__/i18n/__lng__.json",
			fallbackLng: false,
			ns: "System",
			lng: "en"
		}, function(t) {
			if(typeof callback != "undefined")
				callback();
		});
	},

	/**
	 * I18N.Load
	 *
	 * Loads i18n file from /Library/<application>/i18n/<language>.json
	 */
	Load: function(instance, callback) {
		i18n.loadNamespace(Lockdown.InstanceManager.Processes[instance].Name, function() {
			if(typeof callback == "function") callback();
		})
	}
}