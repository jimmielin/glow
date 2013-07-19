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
			// if(typeof Lockdown.Instances[name] != "undefined") return false;
			instance = md5(name + System.microtime() + Math.random()); // name + microtime + nonce

			Lockdown.Instances[instance] = {
				ID: instance,
				Start: System.microtime(),
				Permissions: {
					Check: Lockdown.Permissions.Virtual.Check.bind(null, instance)
				},
				IsElevated: Lockdown.InstanceManager.IsElevated.bind(null, instance)
			}

			/**
			 * Provide some Instance-Specific Functions.
			 * Dangerous code below. eval'd code below is clean as the only variable injected is safe, though.
			 */
			eval("\
			Lockdown.Instances[instance].Debug = {\
				Write: function(message) { System.Debug.Write(message, '" + instance + "'); },\
				Read: function() {\
					if(Lockdown.InstanceManager.IsElevated('" + instance + "'))\
						return System.Debug.Messages();\
					else {\
						System.Debug.Write(\"Permission Overrun (Instance).Debug.Read\", '" + instance + "');\
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

			System.Debug.Write("[" + source + "] is elevating this instance", "LDVirtualMachine/" + instance);
			return true;
		},

		DeElevate: function(source, instance) {
			Lockdown.InstanceManager.Processes[instance].Elevated = false;
			Lockdown.Permissions.Virtual.Override(source, instance, "Elevated", false);

			System.Debug.Write("[" + source + "] is de-elevating this instance", "LDVirtualMachine/" + instance);
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
			if(typeof this.LookupTable[name][permission] == "undefined") return false;
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

/**
 * MD5 Implementation (Joseph Meyer)
 */
function md5cycle(e,t){var n=e[0],r=e[1],i=e[2],s=e[3];n=ff(n,r,i,s,t[0],7,-680876936);s=ff(s,n,r,i,t[1],12,-389564586);i=ff(i,s,n,r,t[2],17,606105819);r=ff(r,i,s,n,t[3],22,-1044525330);n=ff(n,r,i,s,t[4],7,-176418897);s=ff(s,n,r,i,t[5],12,1200080426);i=ff(i,s,n,r,t[6],17,-1473231341);r=ff(r,i,s,n,t[7],22,-45705983);n=ff(n,r,i,s,t[8],7,1770035416);s=ff(s,n,r,i,t[9],12,-1958414417);i=ff(i,s,n,r,t[10],17,-42063);r=ff(r,i,s,n,t[11],22,-1990404162);n=ff(n,r,i,s,t[12],7,1804603682);s=ff(s,n,r,i,t[13],12,-40341101);i=ff(i,s,n,r,t[14],17,-1502002290);r=ff(r,i,s,n,t[15],22,1236535329);n=gg(n,r,i,s,t[1],5,-165796510);s=gg(s,n,r,i,t[6],9,-1069501632);i=gg(i,s,n,r,t[11],14,643717713);r=gg(r,i,s,n,t[0],20,-373897302);n=gg(n,r,i,s,t[5],5,-701558691);s=gg(s,n,r,i,t[10],9,38016083);i=gg(i,s,n,r,t[15],14,-660478335);r=gg(r,i,s,n,t[4],20,-405537848);n=gg(n,r,i,s,t[9],5,568446438);s=gg(s,n,r,i,t[14],9,-1019803690);i=gg(i,s,n,r,t[3],14,-187363961);r=gg(r,i,s,n,t[8],20,1163531501);n=gg(n,r,i,s,t[13],5,-1444681467);s=gg(s,n,r,i,t[2],9,-51403784);i=gg(i,s,n,r,t[7],14,1735328473);r=gg(r,i,s,n,t[12],20,-1926607734);n=hh(n,r,i,s,t[5],4,-378558);s=hh(s,n,r,i,t[8],11,-2022574463);i=hh(i,s,n,r,t[11],16,1839030562);r=hh(r,i,s,n,t[14],23,-35309556);n=hh(n,r,i,s,t[1],4,-1530992060);s=hh(s,n,r,i,t[4],11,1272893353);i=hh(i,s,n,r,t[7],16,-155497632);r=hh(r,i,s,n,t[10],23,-1094730640);n=hh(n,r,i,s,t[13],4,681279174);s=hh(s,n,r,i,t[0],11,-358537222);i=hh(i,s,n,r,t[3],16,-722521979);r=hh(r,i,s,n,t[6],23,76029189);n=hh(n,r,i,s,t[9],4,-640364487);s=hh(s,n,r,i,t[12],11,-421815835);i=hh(i,s,n,r,t[15],16,530742520);r=hh(r,i,s,n,t[2],23,-995338651);n=ii(n,r,i,s,t[0],6,-198630844);s=ii(s,n,r,i,t[7],10,1126891415);i=ii(i,s,n,r,t[14],15,-1416354905);r=ii(r,i,s,n,t[5],21,-57434055);n=ii(n,r,i,s,t[12],6,1700485571);s=ii(s,n,r,i,t[3],10,-1894986606);i=ii(i,s,n,r,t[10],15,-1051523);r=ii(r,i,s,n,t[1],21,-2054922799);n=ii(n,r,i,s,t[8],6,1873313359);s=ii(s,n,r,i,t[15],10,-30611744);i=ii(i,s,n,r,t[6],15,-1560198380);r=ii(r,i,s,n,t[13],21,1309151649);n=ii(n,r,i,s,t[4],6,-145523070);s=ii(s,n,r,i,t[11],10,-1120210379);i=ii(i,s,n,r,t[2],15,718787259);r=ii(r,i,s,n,t[9],21,-343485551);e[0]=add32(n,e[0]);e[1]=add32(r,e[1]);e[2]=add32(i,e[2]);e[3]=add32(s,e[3])}function cmn(e,t,n,r,i,s){t=add32(add32(t,e),add32(r,s));return add32(t<<i|t>>>32-i,n)}function ff(e,t,n,r,i,s,o){return cmn(t&n|~t&r,e,t,i,s,o)}function gg(e,t,n,r,i,s,o){return cmn(t&r|n&~r,e,t,i,s,o)}function hh(e,t,n,r,i,s,o){return cmn(t^n^r,e,t,i,s,o)}function ii(e,t,n,r,i,s,o){return cmn(n^(t|~r),e,t,i,s,o)}function md51(e){txt="";var t=e.length,n=[1732584193,-271733879,-1732584194,271733878],r;for(r=64;r<=e.length;r+=64){md5cycle(n,md5blk(e.substring(r-64,r)))}e=e.substring(r-64);var i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(r=0;r<e.length;r++)i[r>>2]|=e.charCodeAt(r)<<(r%4<<3);i[r>>2]|=128<<(r%4<<3);if(r>55){md5cycle(n,i);for(r=0;r<16;r++)i[r]=0}i[14]=t*8;md5cycle(n,i);return n}function md5blk(e){var t=[],n;for(n=0;n<64;n+=4){t[n>>2]=e.charCodeAt(n)+(e.charCodeAt(n+1)<<8)+(e.charCodeAt(n+2)<<16)+(e.charCodeAt(n+3)<<24)}return t}function rhex(e){var t="",n=0;for(;n<4;n++)t+=hex_chr[e>>n*8+4&15]+hex_chr[e>>n*8&15];return t}function hex(e){for(var t=0;t<e.length;t++)e[t]=rhex(e[t]);return e.join("")}function md5(e){return hex(md51(e))}function add32(e,t){return e+t&4294967295}var hex_chr="0123456789abcdef".split("")