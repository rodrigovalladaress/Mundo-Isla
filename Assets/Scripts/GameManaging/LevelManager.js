#pragma strict
#pragma downcast
// Loads new scenes and stores some data of the scene.
// There's only one scene with many subscenes that act like 
// independent scenes. They have different parents in the
// Unity hieararchy. 
// In order to achieve that, each subscene needs an 
// GameObject named "SpawnPoint<SceneName>" as the player 
// spawn point on that scene.
//
// Version: 2.0
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
//
// Changes in 2.0 version:
// 	-	There's only one scene with many subscenes.	
//
// Changes in 1.5 version:
//	-	The hash of items is no longer used.
//
// Changes in 1.4 version:
//	 -	Scene loading using Photon
//
// Changes in 1.3 version:
//	 - 	Stores the states of the items in the scene in a hash.
// 
// Changes in 1.2 version:
//	 - 	The class stores the position of the player in a Hash.
//		Hash[sceneName] = position of the player in that scene.
//	 - 	Whenever a new scene is loaded, LevelManager stores the
//		position of the player in that scene. Whenever that scene
//		is loaded again, LevelManager spawns the player in that
//		position.
//
// Changes in 1.1 version:
//	 - 	Stores the position of the player in the main scene.
//
// Changes in 1.0 version:
//	 - 	Scene loading.
public class LevelManager extends ScriptableObject {
	
	private static var currentScene:String;
	
	public static var kinectScene:boolean = false;

	// Loads the given level
	public static function LoadLevel(name : String) {
		var newPosition:Vector3 = Player.GetSpawnPoint(name);
		if(newPosition != Player.SpawnPointNotFound) {
			Player.Reposition(newPosition);
			SetCurrentScene(name);
			if(kinectScene) {
				DesactivateZigfu();
				Player.object.active = true;
				kinectScene = false;
			}
			Server.Log("server", Player.GetNickname() + " is now in " + name);
		} else {
			Debug.LogError("SpawnPoint" + name + " should exist to load scene " + name);
		}
	}
	
	private static function ActivateZigfu() {
		var zigfu:GameObject = GameObject.Find("Zigfu") as GameObject;
		if(zigfu != null) {
			(zigfu.GetComponent("ZigUsersRadar") as MonoBehaviour).enabled = true;
			(zigfu.GetComponent("ZigEngageSingleUser") as MonoBehaviour).enabled = true;
			(zigfu.GetComponent("ZigDepthViewer") as MonoBehaviour).enabled = true;
		} else {
			Server.Log("error", "Zigfu is not found");
			Debug.LogError("Zigfu is not found");
		}
	}
	
	private static function DesactivateZigfu() {
		var zigfu:GameObject = GameObject.Find("Zigfu") as GameObject;
		if(zigfu != null) {
			(zigfu.GetComponent("ZigUsersRadar") as MonoBehaviour).enabled = false;
			(zigfu.GetComponent("ZigEngageSingleUser") as MonoBehaviour).enabled = false;
			(zigfu.GetComponent("ZigDepthViewer") as MonoBehaviour).enabled = false;
		} else {
			Server.Log("error", "Zigfu is not found");
			Debug.LogError("Zigfu is not found");
		}
	}
	
	public static function LoadKinectLevel(name:String) {
		var kinectCamera:GameObject = GameObject.Find(name + "Camera");
		if(kinectCamera != null) {
			var cameraComponent:Camera = kinectCamera.GetComponent("Camera") as Camera;
			if(cameraComponent != null) {
				Camera.main.enabled = false;
				cameraComponent.enabled = true;
				SetCurrentScene(name);
				if(!kinectScene) {
					ActivateZigfu();
					Player.object.active = false;
					kinectScene = true;
				}
				Server.Log("server", Player.GetNickname() + " is now in " + name + "(Kinect)");
			} else {
				Server.Log("error", name + "Camera must have a Camera component to load "
								+ "kinect scene " + name);
				Debug.LogError(name + "Camera must have a Camera component to load "
								+ "kinect scene " + name);
			}
		} else {
			Server.Log("error", name + "Camera must exist to load Kinect scene " + name);
			Debug.LogError(name + "Camera must exist to load Kinect scene " + name);
		}
	}

	public static function GetCurrentScene() : String {
		if(currentScene == null || currentScene.Equals("")) {
			SetCurrentScene("Main");
		}
		return currentScene;
	}

	public static function SetCurrentScene(currentScene : String) {
		this.currentScene = currentScene;
	}
}