#pragma strict
// Spawns the player at the spawnPoint.
// Version: 1.0
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 
//
// 1.0: - 	Spawns the player at the selected spawnPoint
public var spawnPoint : GameObject;
function Start () {
	var rot : Quaternion;
	var pos : Vector3;
	spawnPoint = GameObject.Find("SpawnPoint");
	rot = Quaternion.identity;
	pos = spawnPoint.transform.position;
	//Player.Spawn(Player.nickname, pos, rot, Player.GetSkinString());
	Server.Log("debug", "SpawnManager " + Player.nickname + " spawned at " + pos + " in " + LevelManager.GetCurrentScene());
}