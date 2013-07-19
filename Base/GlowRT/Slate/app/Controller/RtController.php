<?php
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
 * File Description: #SLATERT#/Controller/RtController.php
 * The Glow Runtime Controller.
 */

class RtController extends AppController {
	public function index() {

	}

	public function lscpu() {
		$result = array();
		exec("lscpu", $result);

		foreach($result as $v) {
			$s = explode(":", $v);
			$result2[trim($s[0])] = trim($s[1]);
		}

		die(json_encode($result2));
	}
}