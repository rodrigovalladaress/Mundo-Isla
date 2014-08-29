#pragma strict
// When a Kinect level is loaded, LevelManager calls Initialize(). When we
// get out a Kinect level, Revert() is called.
//
// Version: 1.0
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
public var objectsToActivate:GameObject[];
private static var instance:KinectLevelManager;
function Awake () {
	instance = this;
}

// Activation of GameObjects in objectsToActivate
public static function Initialize() {
	for(var gameObjectToActivate:GameObject in instance.objectsToActivate) {
		if(gameObjectToActivate != null) {
			gameObjectToActivate.active = true;
		} else {
			Debug.LogError(gameObjectToActivate.ToString() + " not found.");
		}
	}
}

// Desactivation of GameObjects in objectsToActivate
public static function Revert() {
	for(var gameObjectToActivate:GameObject in instance.objectsToActivate) {
		if(gameObjectToActivate != null) {
			gameObjectToActivate.active = false;
		} else {
			Debug.LogError(gameObjectToActivate.ToString() + " not found.");
		}
	}
}