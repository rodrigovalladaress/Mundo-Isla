#pragma strict
public var objectsToActivate:GameObject[];
private static var instance:KinectLevelManager;
function Awake () {
	instance = this;
}

public static function Initialize() {
	for(var gameObjectToActivate:GameObject in instance.objectsToActivate) {
		if(gameObjectToActivate != null) {
			gameObjectToActivate.active = true;
		} else {
			Debug.LogError(gameObjectToActivate.ToString() + " not found.");
		}
	}
}

public static function Revert() {
	for(var gameObjectToActivate:GameObject in instance.objectsToActivate) {
		if(gameObjectToActivate != null) {
			gameObjectToActivate.active = false;
		} else {
			Debug.LogError(gameObjectToActivate.ToString() + " not found.");
		}
	}
}