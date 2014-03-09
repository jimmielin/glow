/**
 * Glowstone
 * A modern, web-based and oriented, extensible Operating System
 *
 * Developed by Jimmie Lin <jimmie.lin@gmail.com> (c) 2013-2014
 * Copyright 2013-2014 Jimmie Lin, All Rights Reserved.
 *
 +-----------------------------------
 * LICENSE
 +-----------------------------------
 * You are granted a perpetual, free-of-charge, non-exclusive license for usage of this file
 * without any modifications except when granted or made by the original author.
 * There is no warranty, express or implied, when using this bit of code.
 * I am also not responsible for thermonuclear war, bricks, or loss of hair resulted from usage.
 * You may not copy portions of this code, partly or complete, without express consent from the author.
 * You are allowed to implement your own version of Lockdown software and use it with the Glow Environment
 * if you choose to, by analysing the methods that Lockdown provides to the rest of the system.
 * 
 * This is pretty much the only non-free component in the heart of Glow.
 * I am considering opening this up eventually, but not for now.
 +-----------------------------------
 *
 * @author        Jimmie Lin <jimmie.lin@gmail.com>
 * @since         2013.6.10
 *
 * File Description: System/Core/Lockdown.js
 * Controls all protected parts of the Glowstone Environment, Licensing, API Access Instances, Interaction with Slate, etc.
 */

var Lockdown = {
	Instances: {},

	InstanceManager: {
		Processes: {},
		New: function(name) {
			/**
			 * The Instance ID has been updated with a better composition.
			 * 44301d79                          323742a512b744a67a7b    6939
			 * Application ID (Substr of MD5)    Secret ID (Hidden)      Process ID
			 */
			instance = System.Crypto.MD5(System.InitialSeed + name).toString().substr(0, 8) + System.Crypto.MD5("LDVM" + System.microtime()).toString().substr(0, 24);

			Lockdown.Instances[instance] = {
				ID: instance,
				Start: System.microtime(),
				Permissions: {
					Check: Lockdown.Permissions.Virtual.Check.bind(null, instance)
				},
				IsElevated: Lockdown.InstanceManager.IsElevated.bind(null, instance),
				Framework: {}
			}

			/**
			 * Provide some Instance-Specific Functions.
			 * Dangerous code below. eval'd code below is clean as the only variable injected is safe, though.
			 */
			eval("\
			Lockdown.Instances[instance].Debug = {\
				Write: function(message) { System.Debug.Write('LDVM/" + instance + "', message); },\
				Read: function() {\
					if(Lockdown.InstanceManager.IsElevated('" + instance + "'))\
						return System.Debug.Messages();\
					else {\
						System.Debug.Write('LDVM/" + instance + "', \"Permission Overrun (Instance).Debug.Read\");\
						return new Array;\
					}\
				}\
			}");

			eval("\
			Lockdown.Instances[instance].Framework = {\
				Load: function(name, callback, options) {\
					return System.Framework.Load(name, '" + instance + "', callback, options);\
				}\
			}");

			eval("\
			Lockdown.Instances[instance].Permissions.List = function() {\
					return Lockdown.InstanceManager.Processes['" + instance + "'].Permissions;\
				}");

			/**
			 * Get Permissions through the Lookup-Table
			 */
			perms = Lockdown.Permissions.Get(name);

			Lockdown.InstanceManager.Processes[instance] = { 
				Name: name, 
				Start: Lockdown.Instances[instance].Start, 

				/**
				 * Don't get me wrong here - Elevated is *not* managed by the Permissions except for the detault-state.
				 * After that the InstanceManager will do everything independently.
				 */
				Elevated: Lockdown.Permissions.Check(name, "Elevated"),
				Permissions: perms
			};
			
			return Lockdown.Instances[instance];
		},

		/**
		 * Elevation-Related Operations
		 */
		IsElevated: function(instance) {
			return Lockdown.InstanceManager.Processes[instance].Elevated;
		},

		Elevate: function(source, instance) {
			Lockdown.InstanceManager.Processes[instance].Elevated = true;
			Lockdown.Permissions.Virtual.Override(source, instance, "Elevated", true);

			System.Debug.Write("LDVM/" + instance, "[" + source + "] is elevating this instance");
			return true;
		},

		DeElevate: function(source, instance) {
			Lockdown.InstanceManager.Processes[instance].Elevated = false;
			Lockdown.Permissions.Virtual.Override(source, instance, "Elevated", false);

			System.Debug.Write("LDVM/" + instance, "[" + source + "] is de-elevating this instance");
			return true;
		},

		/**
		 * Framework-Related Operations
		 */
		FrameworkIsLoaded: function(name, instance, options) {
			return (
				typeof Lockdown.Instances[instance].Framework[name] != "undefined" &&
					   (typeof options.requiredVersion != "undefined" ? Lockdown.Instances[instance].Framework[name].Data.Version == options.requiredVersion :
					   		(typeof options.minimumVersion != "undefined" ? Lockdown.Instances[instance].Framework[name].Data.Version >= options.minimumVersion : true))
			);
		},

		FrameworkAssign: function(framework, name, instance, callback) {
			Lockdown.Instances[instance].Framework[name] = {};
			for(key in framework) {
				if(typeof framework[key] == "function" && key != "Init") {
					Lockdown.Instances[instance].Framework[name][key] = System.Framework[name][key].bind(null, instance);
				}
				else {
					Lockdown.Instances[instance].Framework[name][key] = System.Framework[name][key];
				}
			}

			System.Debug.Write("LDVM/" + instance, "Framework " + name + " is being assigned.");

			if(typeof callback == "function") callback(true);
		}
	},

	Permissions: {
		Get: function(name) {
			/**
			 * Get the Permissions Lookup Table.
			 * Today is an ugly day, you'll have to live with a synchronous request. When unhappy, please fix for me.
			 */
			if(typeof this.LookupTable == "undefined") {
				$.ajax(
					"System/SecurityLookupTable.json",
					{
						success: function(data) {
							Lockdown.Permissions.LookupTable = data;
						},
						async: false,
						cache: false,
						dataType: "json"
					}
				); 
			}

			// Lookup the table.
			if(typeof this.LookupTable[name] == "undefined") {
				return {};
			}
			else {
				return this.LookupTable[name];
			}
		},

		Check: function(name, permission) {
			if(typeof this.LookupTable[name] == "undefined" || typeof this.LookupTable[name][permission] == "undefined") return false;
			else return this.LookupTable[name][permission];
		},

		/**
		 * LD Virtualization.
		 */
		Virtual: {
			OverrideTable: {},
			Check: function(instance, permission) {
				if(Lockdown.InstanceManager.Processes[instance].Elevated)
					return true;

				if(typeof this.OverrideTable[instance] != "undefined" && this.OverrideTable[instance][permission] != "undefined")
					return this.OverrideTable[instance][permission];

				return Lockdown.Permissions.Check(Lockdown.InstanceManager.Processes[instance].Name, permission);
			},

			/**
			 * Override permissions for a given instance.
			 * This can be manipulated by any elevated instance as part of the System.AHW toolkit (Airtight HatchWay)
			 * Don't call this to directly Elevate a instance, as this will not work. You'll have to trigger InstanceManager manually.
			 */
			Override: function(source, instance, permission, value) {
				System.Debug.Write("[" + source + "] is Overriding permission " + permission + " to value " + value, "LDVirtualMachine/" + instance);
				this.OverrideTable[instance][permission] = value;

				return true;
			},

			/**
			 * Get Override Table
			 * Get the overriden (virtualized) permissions of this instance.
			 */
			GetOverrides: function(instance) {
				if(typeof this.OverrideTable[instance] == "undefined") return {};
				else return this.OverrideTable[instance];
			}
		}
	}
}
