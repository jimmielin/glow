<?php
App::uses('Controller', 'Controller');

class AppController extends Controller {
	function beforeFilter() {
		/** UNIQUE IDENTIFIER @ DO NOT REMOVE $ START_GLOW_RT_ACCESS_KEY **/
		define("GLOW_RT_ACCESS_KEY", "cstWwDDmCpPYwxR9NneRqjYTJvIZJJaK0uPH0g3W");
		/** UNIQUE IDENTIFIER @ DO NOT REMOVE $ END_GLOW_RT_ACCESS_KEY **/

		if(!isset($_POST["GLOW_RT_ACCESS_KEY"]) || $_POST["GLOW_RT_ACCESS_KEY"] != GLOW_RT_ACCESS_KEY)
			die("Glow Runtime Access Denied");

		// Glow Core Path
		define("GLOW_ROOT_PATH", realpath("./../../../../../"));

		/**
		 * Read JSON input from $_POST["data"]
		 */
		$this->input = json_decode($_POST["data"]);
	}
}
