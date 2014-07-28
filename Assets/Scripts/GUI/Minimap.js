#pragma strict
/*******************************************************
|	Minimap
|
|	This script provide functions to create and reposition
|	a minimap prefab found in "Resources/Prefabs/" and named
|	"minimap", and a minimapCamera prefab at the same place
|	named "minimapCamera"
|
|	Methods:		New(player:GameObject)
|					Relocate(player:GameObject)
|
|	Versión: 		1.0
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/

static function New(player:GameObject){
	var camera = player.transform.FindChild("Main Camera");
	// We create a minimap object at point zero
	var minimap:GameObject = GameObject.Instantiate(Resources.Load("Prefabs/minimap"), Vector3.zero, Quaternion.identity) as GameObject;
	// We nest it in the camera
	minimap.transform.parent = camera.transform;
	// Then we define its name
	minimap.name = "minimap";
	
	// We create a minimapCamera object at point zero
	var minimapCamera:GameObject = GameObject.Instantiate(Resources.Load("Prefabs/minimapCamera"), Vector3.zero, Quaternion.identity) as GameObject;
	// We nest it in the player
	minimapCamera.transform.parent = player.transform;
	// Then we define its name
	minimapCamera.name = "minimapCamera";
	// And finally we adjust all the positions
	Relocate(player);
}

static function Relocate(player:GameObject){
	
	var camera = player.transform.FindChild("Main Camera").camera;
	var minimapCamera = player.transform.FindChild("minimapCamera");
	
	var cameraX = Screen.width - Screen.width * 0.125;
	var cameraY = Screen.height - Screen.height * 0.15;
	var cameraZ = camera.nearClipPlane + camera.nearClipPlane / 3;
	
	var minimap = camera.transform.FindChild("minimap");
	
	// We set the position of the minimap relative to the camera
	minimap.transform.position = camera.ScreenToWorldPoint (new Vector3 (cameraX,cameraY,cameraZ));
	// We reorient the object to be always looking at the camera (actually, at the opposite direction, it's just the way billboards work)
	minimap.transform.eulerAngles = camera.transform.eulerAngles + new Vector3(270,0,0);
	// We reorient the object to be looking down
	minimapCamera.transform.rotation = Quaternion.AngleAxis(-90, Vector3.left);
	// We set the position of the minimap camera relative to the player
	minimapCamera.transform.localPosition.x = 0;
	minimapCamera.transform.localPosition.y = 250;
	minimapCamera.transform.localPosition.z = 0;
}