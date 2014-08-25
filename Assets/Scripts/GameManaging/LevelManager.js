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

	public static function Load(name : String) {
		LevelManager.LoadScene(name);
	}

	// Loads the given level
	public static function LoadScene(name : String) {
		Player.Reposition(Player.GetSpawnPoint(name));
		SetCurrentScene(name);
		Server.Log("server", Player.GetNickname() + " is now in " + name);
	}

	public static function GetCurrentScene() : String {
		if(currentScene == null || currentScene.Equals("")) {
			SetCurrentScene("Main");
		}
		return currentScene;
	}

	public static function SetCurrentScene(currentScene : String) : String {
		this.currentScene = currentScene;
	}
}