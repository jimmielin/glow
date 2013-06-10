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
 * File Description: System/Core/RT/Slate.js
 * Slate Runtime Wrapper.
 */

__RTAPI = {
	call: function(Component, Action, Data, Callback) {
		Data.GLOW_RT_ACCESS_KEY = System.RTKey;
		$.post("http://localhost/Base/GlowRT/Slate/" + Component + "/" + Action, Data, function(result) {
			Callback(result);
			System.Debug.Write("RT Call Complete to " + Component + "/" + Action, "GlowRT/Slate");
		}, "json");

		System.Debug.Write("RT Call Attempt to " + Component + "/" + Action, "GlowRT/Slate");
	}
}