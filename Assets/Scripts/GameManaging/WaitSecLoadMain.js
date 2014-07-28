#pragma strict
// Testing level loading from a Kinect scene
public var seconds:int;

function Start () {
	yield WaitForSeconds (seconds);
	LevelManager.Load("Main");
}