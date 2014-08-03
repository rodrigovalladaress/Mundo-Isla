// Edited by Rodrigo Valladares Santana
// <rodriv_tf@hotmail.com>
// Version: 1.1
//
// 1.1: It's possible to spawn the player with a given rotation 
//		and change the camera rotation to a certain value.
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
static class Player extends MonoBehaviour{
	var nickname:String = "";
	var password:String = "";
	var skinString:String;
	var localPlayerComponents:String[] = ["ThirdPersonCamera", "Movement"];
	
	var isPlaying = function():boolean{if(Network.isClient || Network.isServer)return true; else return false;};
	var exist = function():boolean{if(GameObject.Find(nickname))return true; else return false;};
//	var object = function():GameObject{var _players:GameObject[] = GameObject.FindGameObjectsWithTag("Player"); for (var _player:GameObject in _players) if (_player.networkView.isMine) return _player;return;};
	public var object:GameObject;
	var position = function():Vector3{return Player.object.transform.position;};
	var SpawnPoint = function():Vector3{return GameObject.Find("SpawnPoint").transform.position;};
	
	private var player:GameObject;
	
	/*******************************************************
	|	Makes a player spawns
	*******************************************************/
	function Spawn(_name:String, spawnPoint:Vector3, _skinString:String){
		Spawn(_name, spawnPoint, Quaternion.identity, _skinString);
	}
	
	// Spawns a player at the given spawnPoint with the given rotation
	function Spawn(_name:String, spawnPoint:Vector3, rotation:Quaternion, _skinString:String) {
		Server.Log("debug", "Spawning " + _name + " at " + spawnPoint);
		if (!GameObject.Find(_name)){
			var newPlayer:GameObject = PhotonNetwork.Instantiate("Prefabs/player", spawnPoint, rotation, 0) as GameObject;
			// Añadido para evitar error en el Log
			if(newPlayer != null && _name != null && _skinString != null) {
				//var playerSetup:Component = newPlayer.GetComponent("PlayerSetup") as Component;
				
				Server.GetPhotonView().RPC("SyncObject", PhotonTargets.All, 
					newPlayer.GetComponent(NetworkView).viewID.ToString(), "playerName", _name);
				Server.GetPhotonView().RPC("SyncObject", 
					PhotonTargets.All, newPlayer.GetComponent(NetworkView).viewID.ToString(), "playerSkin", _skinString);
			
				if (newPlayer.networkView.isMine){
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
		/*if(LevelManager.HasCameraRotationForCurrentScene()) { 
			Camera.mainCamera.transform.rotation = LevelManager.GetCameraRotationForCurrentScene().transform.rotation;
		} else {*/
			Camera.mainCamera.transform.rotation = Quaternion.AngleAxis(25, Vector3.right);
		//}
	}
	
	/*******************************************************
	|	sets the player position
	*******************************************************/
	function reposition(newPosition:Vector3){
		GameObject.Find(nickname).transform.position = newPosition;
	}

}