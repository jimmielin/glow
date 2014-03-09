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
		var PostData = {};
		PostData.GLOW_RT_ACCESS_KEY = System.RTKey;
		PostData.data = JSON.stringify(Data);

		$.post("http://localhost/Base/GlowRT/Slate/" + Component + "/" + Action, PostData, function(result) {
			Callback(result);
			System.Debug.Write("RT/Slate", "RT Call Complete to " + Component + "/" + Action);
		}, "json");

		System.Debug.Write("RT/Slate", "RT Call Attempt to " + Component + "/" + Action);
	}
}