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
	// This string represents player's avatar
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
	var exists = function():boolean{if(GameObject.Find(nickname))return true; else return false;};
	public var object:GameObject;
	var position = function():Vector3{return Player.object.transform.position;};
	
	/*******************************************************
	|	Player spawning
	*******************************************************/	
	function GetSpawnPoint(scene:String):Vector3 {
		return GameObject.Find("SpawnPoint" + scene).transform.position;
	}
	
	function GetSpawnPoint():Vector3 {
		return GetSpawnPoint(LevelManager.GetCurrentScene());
	}
	
	function Spawn(_name:String, spawnPoint:Vector3, _skinString:String) {//: IEnumerator {
		Server.Log("debug", "Spawning " + _name + " at " + spawnPoint);
		object = null;
		if (!GameObject.Find(_name)){
			var newPlayer:GameObject = PhotonNetwork.Instantiate("Prefabs/player", spawnPoint, Quaternion.identity, 0) as GameObject;

			if(newPlayer != null && _name != null && _skinString != null) {
				//var playerSetup:Component = newPlayer.GetComponent("PlayerSetup") as Component;
				// The name of the player is changed for everyone
				Server.GetPhotonView().RPC("SyncObject", PhotonTargets.AllBuffered, 
					newPlayer.GetComponent(PhotonView).viewID.ToString(), "playerName", _name);
				// The skin of the player is changed for everyone
				Server.GetPhotonView().RPC("SyncObject", 
					PhotonTargets.AllBuffered, newPlayer.GetComponent(PhotonView).viewID.ToString(), "playerSkin", _skinString);
			
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
	function Reposition(newPosition:Vector3){
		GameObject.Find(nickname).transform.position = newPosition;
	}
	
	/*******************************************************
	|	skinString retrieving and syncing
	*******************************************************/
	// skinString downloading from database
	public function RetrieveSkinString() : IEnumerator {
		var url : String = Paths.GetPlayerQuery() + "/get_skin.php/?player=" + WWW.EscapeURL(nickname);
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
		if(skinString.Equals("") || skinString == null) {
			Server.Log("warning", Player.nickname + " doesn't have skinString");
		}
	}
	
	// Syncing database's skinString when it's changed
	private function ChangeSkinString(skinString : String) : IEnumerator {
		var url : String = Paths.GetPlayerQuery() + "/set_skin.php/?player=" 
							+ WWW.EscapeURL(nickname) + "&skinstring=" + skinString;
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		if(!www.text.Equals("OK")) {
			Debug.LogError("Change skin string error (" + www.text + ") url = " + url);
		}
	}

}