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
	 *
	 * Reads a file of the specified path, restricting the user to the locked-down directory (if not Elevated) or the Glow root (if elevated)
	 */
	Read: function(instance, path, callback) {
		if(typeof callback != "function") return false;

		/**
		 * Validate permissions.
		 */
		var fullFS = Lockdown.Permissions.Virtual.Check(instance, "System.CoreFile.FullFSAccess");

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
	},

	/**
	 * CoreFile.Write
	 *
	 * Writes a file of the specified path with contents, optionally acquiring an exclusive lock on this file while writing.
	 * Is, of course, restricted by the locked-down directory constraints
	 */
	Write: function(instance, path, contents, callback, exclusive) {
		if(typeof callback != "function") return false;

		/**
		 * Validate permissions.
		 */
		var fullFS = Lockdown.Permissions.Virtual.Check(instance, "System.CoreFile.FullFSAccess");

		/**
		 * Call RT. Path is not validated here - it's RT's job
		 */
		System.RT.API.call("Files", "Write", 
			{
				restrict: (fullFS ? false : Lockdown.InstanceManager.Processes[instance].Name),
				path: path,
				contents: contents,
				exclusive: (typeof exclusive != "undefined" && exclusive)
			},
			function(data) {
				callback(data);
			}
		);
	},

	/**
	 * CoreFile.List (ls)
	 *
	 * Reads a directory within locked-down directory constraints
	 * Set sortDesc = true if you want files sorted in descending order. by default its false
	 */
	List: function(instance, path, callback, sortDesc) {
		if(typeof callback != "function") return false;
		if(typeof sortDesc == "undefined") sortDesc = false;

		/**
		 * Validate permissions.
		 */
		var fullFS = Lockdown.Permissions.Virtual.Check(instance, "System.CoreFile.FullFSAccess");

		System.RT.API.call("Files", "LS", 
			{
				restrict: (fullFS ? false : Lockdown.InstanceManager.Processes[instance].Name),
				path: path,
				sortDesc: sortDesc
			},
			function(data) {
				callback(data);
			}
		);
	},

	/**
	 * CoreFile.DiskInfo
	 * 
	 * Returns disk information.
	 */
	DiskInfo: function(instance, callback) {
		if(typeof callback != "function") return false;
		System.RT.API.call("Files", "DiskInfo", 
			{},
			function(data) {
				callback(data);
			}
		);
	}
}