/**
 * Glowstone
 * A modern, web-based and oriented, extensible Operating System
 *
 * Developed by Jimmie Lin <jimmie.lin@gmail.com> (c) 2013-2014
 * Licensed under the MIT License
 *
 * @author        Jimmie Lin <jimmie.lin@gmail.com>
 * @since         2013.6.21
 *
 * File Description: System/Frameworks/Lockdown/Main.js
 * Takes care of interacting with Lockdown.
 */

System.Framework.Lockdown = {
	Init: function(callback) {
		
		
		if(typeof callback != "undefined")
			callback();
	}
}