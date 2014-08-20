// Edited by Rodrigo Valladares Santana
// <rodriv_tf@hotmail.com>
// Version: 1.3
//
// Changes in 1.3 version:
//	-	skinString retrieving.
//	-	skinString syncing.
//
// Changes in 1.2 version:
// 	-	Instantiation of player using Photon.
//	-	SyncObject using Photon.
/*******************************************************
|	Player Script
|
|	This script provide functions to manage many things
|	referent to the player's prefab game object found in
|	"Resources/Prefabs/Players/" and named "player",
|	like player name, skin, or the spawn method. 
|
|	Versión: 		1.0
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
#pragma strict

import System.Text.RegularExpressions;

static class Player extends MonoBehaviour{
	var nickname:String = "";
	var password:String = "";
	private var skinString:String;
	public function GetSkinString() : String {
		return skinString;
	}
	public function SetSkinString(skinString : String) {
		this.skinString = skinString;
		if(Server.IsPlayerSkinPersistence()) {
			Server.StartCoroutine(ChangeSkinString(skinString));
		}
	}
	
	var localPlayerComponents:String[] = ["ThirdPersonCamera", "Movement"];
	
	var isPlaying = function():boolean{if(Network.isClient || Network.isServer)return true; else return false;};
	var exist = function():boolean{if(GameObject.Find(nickname))return true; else return false;};
//	var object = function():GameObject{var _players:GameObject[] = GameObject.FindGameObjectsWithTag("Player"); for (var _player:GameObject in _players) if (_player.networkView.isMine) return _player;return;};
	public var object:GameObject;
	var position = function():Vector3{return Player.object.transform.position;};
	var SpawnPoint = function():Vector3{return GameObject.Find("SpawnPoint").transform.position;};
	
	//private var player:GameObject;
	
	/*******************************************************
	|	Makes a player spawns
	*******************************************************/
	/*function Spawn(_name:String, spawnPoint:Vector3, _skinString:String){
		Spawn(_name, spawnPoint, Quaternion.identity, _skinString);
	}*/
	
	
	
	function Spawn(_name:String, spawnPoint:Vector3, _skinString:String) : IEnumerator {
		Server.Log("debug", "Spawning " + _name + " at " + spawnPoint);
		object = null;
		if (!GameObject.Find(_name)){
			var objects : Object[] = [LevelManager.GetCurrentScene()];
			var newPlayer:GameObject = PhotonNetwork.Instantiate("Prefabs/player", spawnPoint, Quaternion.identity, 0, objects) as GameObject;

			if(newPlayer != null && _name != null && _skinString != null) {
				//var playerSetup:Component = newPlayer.GetComponent("PlayerSetup") as Component;
				
				Server.GetPhotonView().RPC("SyncObject", PhotonTargets.All, 
					newPlayer.GetComponent(PhotonView).viewID.ToString(), "playerName", _name);
				Server.GetPhotonView().RPC("SyncObject", 
					PhotonTargets.All, newPlayer.GetComponent(PhotonView).viewID.ToString(), "playerSkin", _skinString);
			
				if (newPlayer.GetPhotonView().isMine) {
					// Debug.Log("Attaching camera.");
					Player.AttachCamera(newPlayer);
					// Debug.Log("Instancing minimap.");
					Minimap.New(newPlayer);
				
					Player.object = newPlayer.gameObject;
				
					// Debug.Log("Disabling label.");
					GameObject.Destroy(newPlayer.GetComponent("Label"));
					// Debug.Log("Enabling local components.");
					for (var component:String in localPlayerComponents) {
						newPlayer.AddComponent(component);
					}
				}
				Server.Log("Game event", _name + " spawned.");
			}
		}
	}
	
	/*******************************************************
	|	Attach the camera to a game object (usually the player)
	*******************************************************/
	function AttachCamera(parent:GameObject){
		Camera.mainCamera.transform.parent = parent.transform;
		Camera.mainCamera.transform.position = parent.transform.position + Vector3(0,4,-5);
		Camera.mainCamera.transform.rotation = Quaternion.AngleAxis(25, Vector3.right);
	}
	
	/*******************************************************
	|	sets the player position
	*******************************************************/
	function reposition(newPosition:Vector3){
		GameObject.Find(nickname).transform.position = newPosition;
	}
	
	
	/*******************************************************
	|	skinString retrieving and syncing
	*******************************************************/
	// Downloading of the database's skinString
	public function RetrieveSkinString() : IEnumerator {
		var url : String = Paths.GetPlayerQuery() + "/get_skin.php/?player=" + nickname;
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		if(Regex.Matches(www.text, ".*ERROR.*", RegexOptions.IgnoreCase).Count > 0) {
			Debug.LogError("Error in skinstring retrieve (" + www.text + ")");
			skinString = "";
		} else {
			skinString = www.text;
		}
	}
	
	// Syncing database's skinString
	private function ChangeSkinString(skinString : String) : IEnumerator {
		var url : String = Paths.GetPlayerQuery() + "/set_skin.php/?player=" 
							+ nickname + "&skinstring=" + skinString;
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		if(!www.text.Equals("OK")) {
			Debug.LogError("Change skin string error (" + www.text + ") url = " + url);
		}
	}

}