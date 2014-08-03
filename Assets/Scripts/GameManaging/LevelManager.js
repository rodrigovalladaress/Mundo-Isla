#pragma strict
#pragma downcast
// Loads new scenes and stores the position where the player will spawn
// in each scene.
// Version: 1.3
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
//
// 1.3: - 	Stores the states of the items in the scene.
// 
// 1.2: - 	Stores the position of the player in a Hash.
//			Hash[sceneName] = position of the player in that scene.
//		- 	Whenever a new scene is loaded, LevelManager stores the
//			position of the player in that scene. Whenever that scene
//			is loaded again, LevelManager spawns the player in that
//			position.
//
// 1.1: - 	Stores the position of the player in the main scene.
//
// 1.0: - 	Loads scenes.
// 
// Stores the name of the current scene
private static var currentScene : String;
// Stores the position of the player in the scenes.
// key -> Player.nickname + "/" + name_of_scene
// value -> position
private static var positionsHash : Hashtable;
// Stores the rotation of the player in the scenes.
// key -> Player.nickname + "/" + name_of_scene
// value -> rotation
private static var rotationHash : Hashtable;
// Stores the rotation of the cameara attached to the player in the scenes.
// key -> Player.nickname + "/" + name_of_scene
// value -> rotation
private static var cameraRotationHash : Hashtable;
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
	// Initialization of positionsHash
	if(positionsHash == null) {
		LevelManager.positionsHash = new Hashtable();
	}
	// Initialization of rotationHash
	/*if(rotationHash == null) {
		LevelManager.rotationHash = new Hashtable();
	}*/
	/*if(cameraRotationHash == null) {
		LevelManager.cameraRotationHash = new Hashtable();
	}*/
	// Initialization of itemHash
	if(itemHash == null) {
		LevelManager.itemHash = new Hashtable();
	}
	LevelManager.hasBeenInitialized = true;
	// Stores the states of the items in the current scene.
	LevelManager.ReloadItemHash();
	// The first scene should set SpawnManager.active to false, but when this scene is 
	// loaded again, SpawnManager.active must be setted to true in order to work.
	//GameObject.Find("GameManager").GetComponent("SpawnManager").active = true;
	// Stores the position of the Player in the current scene.
	if(Player.object != null)
		LevelManager.positionsHash[PositionHashKeyForCurrentScene()] = Player.object.transform.position;
	//LevelManager.rotationHash[RotationHashKeyForCurrentScene()] = Player.object.transform.rotation;
	//LevelManager.cameraRotationHash[CameraRotationHashKeyForCurrentScene()] = Camera.main;//ThirdPersonCamera.camera;
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
* Methods to manage the hash of positions
*/
public static function PositionHashKeyFor(sceneName : String) : String {
	return Player.nickname + "/" + sceneName;
}

public static function PositionHashKeyForCurrentScene() : String {
	return PositionHashKeyFor(currentScene);
}

// Gets the position of the player in the given scene
public static function GetPlayerPositionFor(sceneName : String) : Vector3 {
	return LevelManager.positionsHash[PositionHashKeyFor(sceneName)];
}

public static function GetPlayerPositionForCurrentScene() : Vector3 {
	return LevelManager.GetPlayerPositionFor(LevelManager.currentScene);
}

// Returns true if ther's a player position for the given scene
public static function HasPlayerPositionFor(sceneName : String) : boolean {
	return LevelManager.positionsHash.Contains(LevelManager.PositionHashKeyFor(sceneName));
}

public static function HasPlayerPositionForCurrentScene() : boolean {
	return LevelManager.HasPlayerPositionFor(LevelManager.currentScene);
}

/*
* Methods to manage the hash of rotations
*/
/*public static function RotationHashKeyFor(sceneName : String) : String {
	return Player.nickname + "/" + sceneName;
}

public static function RotationHashKeyForCurrentScene() : String {
	return RotationHashKeyFor(LevelManager.currentScene);
}

// Gets the rotation of the player in the given scene
public static function GetPlayerRotationFor(sceneName : String) : Quaternion {
	return LevelManager.rotationHash[RotationHashKeyFor(sceneName)];
}

public static function GetPlayerRotationForCurrentScene() : Quaternion {
	return LevelManager.GetPlayerRotationFor(LevelManager.currentScene);
}

// Returns true if there's a player rotation for the given scene
public static function HasPlayerRotationFor(sceneName : String) : boolean {
	return LevelManager.rotationHash.Contains(LevelManager.RotationHashKeyFor(sceneName));
}

public static function HasPlayerRotationForCurrentScene() : boolean {
	return LevelManager.HasPlayerRotationFor(LevelManager.currentScene);
}*/

/*
* Methods to manage the hash of rotations of camera
*/
/*public static function CameraRotationHashKeyFor(sceneName : String) : String {
	return Player.nickname + "/" + sceneName;
}

public static function CameraRotationHashKeyForCurrentScene() : String {
	return CameraRotationHashKeyFor(LevelManager.currentScene);
}

// Gets the rotation of the player in the given scene
public static function GetCameraRotationFor(sceneName : String) : Camera {
	return LevelManager.cameraRotationHash[CameraRotationHashKeyFor(sceneName)];
}

public static function GetCameraRotationForCurrentScene() : Camera {
	return LevelManager.GetCameraRotationFor(LevelManager.currentScene);
}

// Returns true if there's a player rotation for the given scene
public static function HasCameraRotationFor(sceneName : String) : boolean {
	return LevelManager.cameraRotationHash.Contains(LevelManager.CameraRotationHashKeyFor(sceneName));
}

public static function HasCameraRotationForCurrentScene() : boolean {
	return LevelManager.HasPlayerRotationFor(LevelManager.currentScene);
}*/

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