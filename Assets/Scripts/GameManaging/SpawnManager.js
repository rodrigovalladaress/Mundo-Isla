#pragma strict
// Spawns the player at the spawnPoint.
// Version: 1.1
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
// 
// 1.1: - 	If LevelManager hash a position for the current scene, it spawns the
// 			player at that position.
//
// 1.0: - 	Spawns the player at the selected spawnPoint
public var spawnPoint : GameObject;
function Start () {
	var rot : Quaternion;
	var pos : Vector3;
	if((LevelManager.HasBeenInitialized()) && (LevelManager.HasPlayerPositionForCurrentScene())) {
		spawnPoint = new GameObject();
		spawnPoint.transform.position = LevelManager.GetPlayerPositionForCurrentScene();
	}
	/*if((LevelManager.HasBeenInitialized()) && (LevelManager.HasPlayerRotationForCurrentScene())) {
		rot = LevelManager.GetPlayerRotationForCurrentScene();
	}*/
	if(spawnPoint == null) {
		//Debug.Log("Searching SpawnPoint");
		//spawnPoint = GameObject.Find("SpawnPoint");
	}
	if(rot == null) {
		rot = Quaternion.identity;
	}
	pos = spawnPoint.transform.position;
	Player.Spawn(Player.nickname, pos, rot, Player.skinString);
	Debug.Log("SpawnManager " + Player.nickname + " spawned at " + pos + " in " + LevelManager.getCurrentScene());
}