#pragma strict
#pragma downcast
// Loads new scenes and stores some data of the scene.
//
// Version: 1.4
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
//
// Changes in 1.4 version:
//	 -	Scene loading using Photon
//
// Changes in 1.3 version:
//	 - 	Stores the states of the items in the scene.
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
// Stores the state of the item in the scenes (if they have been obtained 
// by the player or not).
// key -> Player.nickname + "/" + name_of_scene_ + "/" + position_of_item
// value -> true | false
private static var itemHash : Hashtable;

private static var hasBeenInitialized = false;

private static var items : GameObject[];

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
	// Initialization of itemHash
	if(itemHash == null) {
		LevelManager.itemHash = new Hashtable();
	}
	LevelManager.hasBeenInitialized = true;
	// Stores the states of the items in the current scene.
	LevelManager.ReloadItemHash();
	Debug.Log("LevelManager LoadScene " + name);
	// Destroy the player before loading a new scene
	if(Player.object != null) {
		PhotonNetwork.Destroy(Player.object);
	}
	PhotonNetwork.LoadLevel(name);
	LevelManager.currentScene = name;
}

public static function HasBeenInitialized() : boolean {
	return hasBeenInitialized;
}

public static function getCurrentScene() : String {
	var strRet : String = currentScene + "";
	return strRet;
}

/*
* Methods to manage the hash of items
*/
public static function ItemHashKeyFor(sceneName : String, item : GameObject) {
	return Player.nickname + "/" + sceneName + "/" + item.transform.position;
}

public static function ItemHashIsInitialized() : boolean {
	return itemHash != null;
}

private static function ReloadItemHash() {
	items = GameObject.FindGameObjectsWithTag("Item");
	if(LevelManager.items != null) {
		for(var item : GameObject in LevelManager.items) {
			var itemComponent : Item = item.GetComponent("Item");
			LevelManager.itemHash[ItemHashKeyFor(LevelManager.currentScene, item)] = 
				itemComponent._hasBeenObtained;
		}
	} else {
		Debug.Log("There are no items on this scene");
	}
}

public static function GetItemStateFor(item : GameObject, sceneName : String) : boolean {
	return LevelManager.itemHash[ItemHashKeyFor(sceneName, item)];
}

public static function GetItemStateInCurrentSceneFor(item : GameObject) : boolean {
	return LevelManager.GetItemStateFor(item, LevelManager.currentScene);
}

public static function HasItemStateFor(item : GameObject, sceneName : String) : boolean {
	return LevelManager.itemHash.Contains(ItemHashKeyFor(sceneName, item));
}

public static function HasItemStateInCurrentSceneFor(item : GameObject) : boolean {
	return LevelManager.HasItemStateFor(item, LevelManager.currentScene);
}