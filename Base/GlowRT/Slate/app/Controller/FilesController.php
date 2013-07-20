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
	function __cleanPath($path, $restrict) {
		$fp = "";
		if($restrict !== false) {
			// validate the path to fit in AppContainer
			// create the AppContainer if this one does not exist
			if(realpath(GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict) === false)
				mkdir(GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict);

			$fp = realpath(dirname(GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict . DS . $path));
			if(!$fp || strpos($fp, GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict . DS) === false) {
				// /everybody stand back/
				// I know regular expressions.
				$fp = realpath(dirname(GLOW_ROOT_PATH . DS . "Virtual" . DS . $restrict . DS . preg_replace("/\.{2,}/", ".", $path)));
			}
		}
		else {
			// validate the path to fit in Glow root
			$fp = realpath(dirname(GLOW_ROOT_PATH . DS . $path));
			if(strpos($fp, GLOW_ROOT_PATH) === false) {
				$fp = realpath(dirname(GLOW_ROOT_PATH . DS . preg_replace("/\.{2,}/", ".", $path)));
			}
		}

		return $fp;
	}

	function Read() {
		$path = $this->input->path;
		$fp = $this->__cleanPath($path, $this->input->restrict);

		$fp = $fp . DS . basename($this->input->path);

		if(!file_exists($fp)) {
			$result = array("code" => 0, "result" => null);
		}
		else {
			$file = file_get_contents($fp);
			$result = array("code" => 1, "result" => $file);
		}

		$this->set("data", json_encode($result));

		$this->render("/Rt/default");
	}

	function Write() {
		$fp = $this->__cleanPath($this->input->path, $this->input->restrict) . DS . basename($this->input->path);
		$wt = file_put_contents($fp, $this->input->contents, ($this->input->exclusive ? LOCK_EX : 0));

		$this->set("data", json_encode(array(
			"code" => (int) ($wt !== false),
			"result" => $wt
		)));

		$this->render("/Rt/default");
	}

	function LS() {
		$fp = $this->__cleanPath("." . $this->input->path, $this->input->restrict);
		/*if(!$fp || !is_dir($fp)) {
			$this->set("data", json_encode(array("code" => 0, "result" => array())));
		}
		else {
			$result = scandir($fp, ($this->input->sortDesc ? SCANDIR_SORT_DESCENDING : SCANDIR_SORT_ASCENDING));
			$this->set("data", json_encode(array("code" => 1, "result" => $result)));
		}*/
		$this->set("data", json_encode(array("fp" => $fp)));

		$this->render("/Rt/default");
	}

	function DiskInfo() {
		// notImplemented: alternate file systems
		$this->set("data", json_encode(array(
			"code" => 1,
			"disk_total_space" => disk_total_space("/"),
			"disk_free_space" => disk_free_space("/")
		)));

		$this->render("/Rt/default");
	}
}