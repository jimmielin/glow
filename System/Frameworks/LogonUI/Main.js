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
 * File Description: System/Frameworks/LogonUI/Main.js
 * Pseudo-Framework, an actual Application that shows a Logon UI.
 */

System.Framework.LogonUI = {
	Init: function(callback) {
		System.Framework.LogonUI.LD = Lockdown.InstanceManager.New("LogonUI");
		System.Framework.LogonUI.LD.Framework.Load("Event", function() {
			System.Framework.i18n.Load(System.Framework.LogonUI.LD.ID, function() {
				// Get the LogonUI Interface
				$.ajax({
					url: "Library/LogonUI/LogonUI.html",
					success: function(data) {
						$("#System_boot").remove();
						$("#System_boot_css").remove();

						$('head').append('<link rel="stylesheet" type="text/css" id="logonUI_css" href="Library/LogonUI/LogonUI.css?nc">');
						$("body").append(data);

						$("#logonUI_html").i18n();
						calculatedHeight = $(window).height() / 2 - 100;
						$("#logonUI_main").css("margin-top", calculatedHeight);

						//$("#logonUI_watermark").html("<strong>" + System.Branding + "</strong> &middot; Build " + System.HumanVersion + " (Build " + System.Version + (System.Debug.Debug ? " DBG" : "") + ")" + (System.TestSigning ? " &middot; Secure Boot is not configured properly." : ""));

						for(uID in System.User.UserData) {
							uData = System.User.UserData[uID];
							$("#logonUI_userSelectAvatars").append("<td><img src='/Users/" + uData.Name + uData.Picture +"' alt='' /></td>");
							$("#logonUI_userSelectNames").append("<td onclick='logonUI_initiateLogon(" + uID + ")' style='color:" + uData.Accent + ";border-bottom: 1px solid " + uData.Accent + ";box-shadow: 0 10px 10px -10px " + uData.Accent + "'><a>" + uData.Username +"</a></td>");
						}

						System.Framework.LogonUI.LD.Debug.Write("Retrieved User Data, User Interface Loaded.");

						if(System.Debug.Debug) {
							$("#logonUI_controls").prepend("<a href='javascript:logonUI_debug()'><i class='icon'>&#xF09A;</i></a>&nbsp;");
						}

						if(typeof callback == "function") callback();
					}
				});
			});
		});
	},
}