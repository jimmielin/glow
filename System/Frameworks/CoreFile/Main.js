/**
 * Glowstone
 * A modern, web-based and oriented, extensible Operating System
 *
 * Developed by Jimmie Lin <jimmie.lin@gmail.com> (c) 2013-2014
 * Licensed under the MIT License
 *
 * @author        Jimmie Lin <jimmie.lin@gmail.com>
 * @since         2013.7.15
 *
 * File Description: System/Frameworks/CoreFile/Main.js
 * Handles FileSystem related functions. Requires System.RT and Lockdown.
 */

System.Framework.CoreFile = {
	Init: function(callback) {
		if(typeof callback != "undefined")
			callback();
	},

	/**
	 * CoreFile.Read
	 * Reads a file of the specified path, restricting the user to the locked-down directory (if not Elevated) or the Glow root (if elevated)
	 */
	Read: function(instance, path, callback) {
		if(typeof callback != "function") return false;

		/**
		 * Validate permissions.
		 */
		var fullFS = Lockdown.Permissions.Virtual.Check(instance, "System.CoreFile.FullFSAccess") && false;

		/**
		 * Call RT. Path is not validated here - it's RT's job
		 */
		System.RT.API.call("Files", "Read", 
			{
				restrict: (fullFS ? false : Lockdown.InstanceManager.Processes[instance].Name),
				path: path
			},
			function(data) {
				callback(data);
			}
		);
	}


}