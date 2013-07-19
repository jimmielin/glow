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
 * File Description: #SLATERT#/Controller/FilesController.php
 * The CoreFile controller.
 */

class FilesController extends AppController {
	function Read() {
		$path = $this->input->path;
		$fp = "";

		if(($restrict = $this->input->restrict) !== false) {
			// validate the path to fit in AppContainer
			// create the AppContainer if this one does not exist
			if(realpath(GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict) === false)
				mkdir(GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict);

			$fp = realpath(dirname(GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict . DS . $path));
			if(!$fp || strpos($fp, GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict . DS) === false) {
				$fp = realpath(dirname(GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict . DS . str_replace("..", ".", $path)));
			}
		}
		else {
			// validate the path to fit in Glow root
			$fp = realpath(dirname(GLOW_ROOT_PATH . DS . $path));
			if(strpos($fp, GLOW_ROOT_PATH) === false) {
				$fp = realpath(dirname(GLOW_ROOT_PATH . DS . str_replace("..", ".", $path)));
			}
		}

		$fp = $fp . DS . basename($this->input->path);

		if(!file_exists($fp)) {
			$result = array("code" => 0, "result" => null);
		}
		else {
			$file = file_get_contents($fp);
			$result = array("code" => 1, "result" => $file);
		}

		$this->set("data", json_encode($result));
	}
}