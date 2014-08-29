#pragma strict
#pragma downcast
// Loads new scenes and stores some data of the scene.
// There's only one scene with many subscenes that act like 
// independent scenes. They have different parents in the
// Unity hieararchy. 
// In order to achieve that, each subscene needs an 
// GameObject named "SpawnPoint<SceneName>" as the spawn 
// point on that scene.
// There are special subscenes where the Kinect device is
// needed. In those cases, instead of a spawn point, that
// subscene needs a GameObject with a Camera component
// called "<SceneName>Camera".
//
// Version: 2.1
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
//
// Changes in 2.1 version:
//	-	Kinect levels loading.
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
	
	private static var currentLevel:String;
	
	public static function IsKinectLevel():boolean {
		return GlobalData.inKinectScene;
	}
	public static function SetKinectLevel(kinectLevel:boolean) {
		GlobalData.inKinectScene = kinectLevel;
	}
	
	public static var mainCamera:GameObject;

	// Loads the given level
	public static function LoadLevel(name : String) {
		var newPosition:Vector3;
		if(IsKinectLevel()) {
			var camera:GameObject = mainCamera;
			var cameraComponent:Camera = camera.GetComponent("Camera") as Camera;
			var audioListenerComponent:AudioListener = camera.GetComponent("AudioListener")
														as AudioListener;
			// Desactivation of the Kinect camera
			(Camera.main.GetComponent("AudioListener") as AudioListener).enabled = false;
			(Camera.main.GetComponent("Camera") as Camera).enabled = false;
			(Camera.main.GetComponent("KinectLevelManager") as KinectLevelManager).Revert();
			// Activation of Main Camera
			audioListenerComponent.enabled = true;
			cameraComponent.enabled = true;
			
			DesactivateZigfu();
			//ActivatePlayer();
			Server.GetPhotonView().RPC("ActivatePlayer", PhotonTargets.AllBuffered, Player.object.GetComponent(PhotonView).viewID);
			SetKinectLevel(false);
		}
		newPosition = Player.GetSpawnPoint(name);
		if(newPosition != Player.SpawnPointNotFound) {
			Player.Reposition(newPosition);
			SetCurrentLevel(name);
			Server.Log("server", Player.GetNickname() + " is now in " + name);
		} else {
			Debug.LogError("SpawnPoint" + name + " should exist to load scene " + name);
		}
	}
	
	// Kinect level loading
	public static function LoadKinectLevel(name:String) {
		var kinectCamera:GameObject = GameObject.Find(name + "Camera");
		if(kinectCamera != null) {
			var cameraComponent:Camera = kinectCamera.GetComponent("Camera") as Camera;
			var audioListenerComponent:AudioListener = kinectCamera.GetComponent("AudioListener")
														as AudioListener;
			var kinectManagerComponent:KinectLevelManager = kinectCamera.GetComponent("KinectLevelManager")
															as KinectLevelManager;
			if(cameraComponent != null) {
				(mainCamera.GetComponent("AudioListener") as AudioListener).enabled = false;
				(mainCamera.GetComponent("Camera") as Camera).enabled = false;
				audioListenerComponent.enabled = true;
				cameraComponent.enabled = true;	
				kinectManagerComponent.Initialize();
				SetCurrentLevel(name);
				if(!IsKinectLevel()) {
					ActivateZigfu();
					SetKinectLevel(true);
					//DesactivatePlayer();
					Server.GetPhotonView().RPC("DesactivatePlayer", PhotonTargets.AllBuffered, Player.object.GetComponent(PhotonView).viewID);
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
	
	// Activation of the Components of Zigfu that track player
	private static function ActivateZigfu() {
		var zigfu:GameObject = GameObject.Find("zigfu") as GameObject;
		if(zigfu != null) {
			(zigfu.GetComponent("ZigUsersRadar") as MonoBehaviour).enabled = true;
			(zigfu.GetComponent("ZigEngageSingleUser") as MonoBehaviour).enabled = true;
			(zigfu.GetComponent("ZigDepthViewer") as MonoBehaviour).enabled = true;
		} else {
			Server.Log("error", "zigfu is not found");
			Debug.LogError("zigfu is not found");
		}
	}
	
	// Desactivation of the Components of Zigfu that track player
	private static function DesactivateZigfu() {
		var zigfu:GameObject = GameObject.Find("zigfu") as GameObject;
		if(zigfu != null) {
			(zigfu.GetComponent("ZigUsersRadar") as MonoBehaviour).enabled = false;
			(zigfu.GetComponent("ZigEngageSingleUser") as MonoBehaviour).enabled = false;
			(zigfu.GetComponent("ZigDepthViewer") as MonoBehaviour).enabled = false;
		} else {
			Server.Log("error", "zigfu is not found");
			Debug.LogError("zigfu is not found");
		}
	}

	public static function GetCurrentLevel() : String {
		if(currentLevel == null || currentLevel.Equals("")) {
			SetCurrentLevel("Main");
		}
		return currentLevel;
	}

	public static function SetCurrentLevel(currentLevel : String) {
		this.currentLevel = currentLevel;
	}
}