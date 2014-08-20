#pragma strict
#pragma downcast
// Loads new scenes and stores some data of the scene.
//
// Version: 1.5
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
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
//	 - 	Stores the position of the player in a Hash.
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
//	 - 	Loads scenes.
// 
// Stores the name of the current scene
private static var currentScene : String;

private static var hasBeenInitialized = false;

public static function Load(name : String) {
	LevelManager.LoadScene(name);
}

// Loads the given level
public static function LoadScene(name : String) {
	// The first scene that invokes this method is setted as the 
	// "Main" scene
	if(LevelManager.currentScene == null) {
		LevelManager.currentScene = "Main";
	}
	LevelManager.hasBeenInitialized = true;
	Debug.Log("LevelManager LoadScene " + name);
	// Destroy the player before loading a new scene
	if(Player.object != null) {
		PhotonNetwork.Destroy(Player.object);
	}
	ItemManager.FreeAllPhotonViewIDs(GetCurrentScene());
	PhotonNetwork.LoadLevel(name);
	LevelManager.currentScene = name;
}

public static function HasBeenInitialized() : boolean {
	return hasBeenInitialized;
}

public static function GetCurrentScene() : String {
	if(currentScene == null) {
		currentScene = "Main";
	}
	return currentScene;
}