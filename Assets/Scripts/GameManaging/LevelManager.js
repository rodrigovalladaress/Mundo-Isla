#pragma strict
#pragma downcast
// Loads new scenes and stores some data of the scene.
//
// Version: 2.0
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
//
// Changes in 2.0 version:
// -	There's only one scene with many subscenes.
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
private static var hasBeenInitialized = false;

private static var currentScene:String;

public static function Load(name : String) {
	LevelManager.LoadScene(name);
}

// Loads the given level
public static function LoadScene(name : String) {
	LevelManager.hasBeenInitialized = true;
	Player.Reposition(GameObject.Find("SpawnPoint" + name).transform.position);
	SetCurrentScene(name);
	Server.Log("server", Player.nickname + " is now in " + name);
}

public static function HasBeenInitialized() : boolean {
	return hasBeenInitialized;
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