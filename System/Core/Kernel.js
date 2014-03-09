/**
 * Glowstone
 * A modern, web-based and oriented, extensible Operating System
 *
 * Developed by Jimmie Lin <jimmie.lin@gmail.com> (c) 2013-2014
 * Licensed under the MIT License
 *
 * @author        Jimmie Lin <jimmie.lin@gmail.com>
 * @since         2013.6.9
 *
 * File Description: System/Core/Kernel.js
 * Loads everything in the Glow System, taking over the Web-Browser
 */

"use strict";

/**
 * The Glow API, accessible through System either in-app or via Global.
 * Note that the global System is completely different than the one provided by lockdown - Lockdown emulates a whole System, with frameworks (in .Frameworks[]), etc.
 * loaded as it requests.
 */
var System = {
	/**
	 * Branding and Versioning Information.
	 *
	 * System.Version is the build number (real version) and System.HumanVersion will contain the human-readable buildtag.
	 * All libraries should implement their own .Version and .HumanVersion to tag their releases.
	 */
	Version: 59,
	HumanVersion: "1.0-030814_1724-main(jimmielin)",

	Branding: "Codename \"Glowstone\"",

	/**
	 * Are we a debug build? This sets security parameters Lockdown & the System will follow.
	 * TestSigning: Allow any executable to run? This will suppress any signature checking.
	 * Debug.Debug:   Show debuggers system-wide?
	 */
	TestSigning: true,

	/**
	 * Access key to GlowRT. ...g3W is used in a Pre-Installed Environment, then changed after install.
	 * Set RTProvider to the Runtime Provider.
	 */
	RTKey: "cstWwDDmCpPYwxR9NneRqjYTJvIZJJaK0uPH0g3W",
	RTProvider: "Slate",

	/**
	 * Framework Loading Class.
	 * Handles loading of core frameworks.
	 */
	Framework: {
		/**
		 * Load a Framework.
		 * Accepts parameters in (name, instance, callback, options { minimumVersion, requiredVersion }
		 */
		Load: function(name, instance, callback, options) {
			if(typeof options == "undefined") options = {};
			if(Lockdown.InstanceManager.FrameworkIsLoaded(name, instance, options))
				if(typeof callback == "function") callback(true);

			if(typeof instance == "undefined") instance = System.Isolated.ID;

			$.ajax({
				url: "System/Frameworks/" + name + "/info.json",
				dataType: "json",
				success: function(data) {
					if(typeof options.requiredVersion != "undefined") {
						if(data.Version != options.requiredVersion) {
							System.Debug.Write(instance, "Framework " + name + " requiredVersion (" + options.requiredVersion + ") not met (" + data.Version + "), load error.");
							if(typeof callback == "function") callback(false);
						}
					}
					else if(typeof options.minimumVersion != "undefined") {
						if(data.Version < options.requiredVersion) {
							System.Debug.Write(instance, "Framework " + name + " minimumVersion (" + options.requiredVersion + ") not met (" + data.Version + "), load error.");
							if(typeof callback == "function") callback(false);
						}
					}

					$.getScript("System/Frameworks/" + name + "/Main.js", function() {
						System.Framework[name].Init(function() {
							$.ajax({
								url: "System/Frameworks/" + name + "/Lockdown.json",
								dataType: "json"
							}).done(function(lddata) {
									if(typeof lddata.PermissionCode != "undefined") {
										if(!Lockdown.Permissions.Virtual.Check(instance, lddata.PermissionCode)) {
											System.Debug.Write("LDVM/" + instance, "Failed to Load Framework: " + name + " (LD Permission Check Failed)");
											// abort loading ...
											if(typeof callback == "function") callback(false);
										}
									}

									System.Framework[name].Data = data; // copy info.json into it
									System.Framework[name].LDData = lddata; // copy lockdown.json into it
									System.Debug.Write("LDVM/" + instance, "Loaded Framework " + name);
									Lockdown.InstanceManager.FrameworkAssign(System.Framework[name], name, instance, callback);
							}).fail(function(obj, error) {
									// no Lockdown.json declared
									System.Framework[name].Data = data; // copy info.json into it
									System.Debug.Write("LDVM/" + instance, "Loaded Framework " + name + " (Lockdown Config File = No)");
									Lockdown.InstanceManager.FrameworkAssign(System.Framework[name], name, instance, callback);
							});

						});
					});
				},
				error: function(obj, error) {
					if(typeof callback == "function") callback(false, error);
				}
			});
		}
	},

	/**
	 * Debug
	 * Provides a few tools for logging and stuff.
	 */
	Debug: {
		/**
		 * Debugging Build Usage.
		 * Set Debug to true in order to console.log everything that is sent to this part.
		 */
		Debug: true,

		/**
		 * Push a debug message
		 */
		Messages: new Array,
		Write: function(instance, message) {
			this.Messages.push({time: (System.microtime() - System.Start).toFixed(8), message: message, instance: instance});
			if(this.Debug == true)
				console.log({time: (System.microtime() - System.Start).toFixed(8), message: message, instance: instance});
		},
		Read: function() {
			return this.Messages;
		}
	},

	/**
	 * Keep a timer
	 */
	microtime: function() {
		return ((new Date().getTime()) / 1000);
	},

	/**
	 * RT Access
	 */
	RT: {
		Init: function() {
			$.getScript("System/Core/RT/" + System.RTProvider + ".js", function() {
				System.RT.API = __RTAPI;

				// make a test call
				System.RT.API.call("Rt", "lscpu", {}, function(data) {
					System.RT.lscpu = data;
					System.Debug.Write("RT", "RT Access Test Passed");
				})
			});
		}
	},

	/**
	 * User Authentication System
	 */
	User: {
		Init: function() {
			$.ajax({
				url: "Users/UserData.json",
				dataType: "json",
				success: function(data) {
					System.User.UserData = data;
				}
			});
		}

	},

	/**
	 * Boot Glow
	 * Initializes the API, loads basic dependencies, libraries, timers, debug, etc.
	 */
	Boot: function() {
		System.Start = System.microtime();
		System.Debug.Write("Kernel", System.Branding);
		System.Debug.Write("Kernel", "(c) 2012-2014 Jimmie Lin, All Rights Reserved.");
		System.Debug.Write("Kernel", "Version " + System.HumanVersion + " (Internal Versioning Build " + System.Version + ")");
		if(System.Debug.Debug)
			System.Debug.Write("Kernel", "<b>Warning:</b> External Kernel Debugger Enabled. This may slow down the performance of the system.");
		if(System.TestSigning)
			System.Debug.Write("Kernel", "<b>Warning:</b> Secure Boot isn't configured correctly.");

		System.User.Init();
		System.RT.Init();

		/**
		 * Initiate Cryptography Classes (Standard Implementations from CryptoJS)
		 */
		System.Crypto = CryptoJS;
		System.InitialSeed = CryptoJS.lib.WordArray.random(128/8).toString();

		System.Isolated = Lockdown.InstanceManager.New("System");

		/**
		 * Initiate the LogonUI and pass everything off to CoreUI.
		 */
		System.Framework.Load("i18n", System.Isolated.ID, function() {
			System.Framework.Load("LogonUI", System.Isolated.ID);
		});

		/* 
		$(function() {
			var widget = document.getElementById("widget");
			widget.contentWindow.System = System.Isolated;
			widget.contentWindow.parent = null;
			widget.contentWindow.top = null;
		}); */
	}
}


System.Boot();