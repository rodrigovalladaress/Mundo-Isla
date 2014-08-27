#pragma strict
// Testing level loading from a Kinect scene
public var seconds:int;

private var waiting:boolean = false;

function Update () {
	Debug.Log("wait");
	if(GlobalData.inKinectScene && !waiting) {
		StartCoroutine(Wait());
	}
}

function Wait():IEnumerator{
	waiting = true;
	yield WaitForSeconds (seconds);
	LevelManager.LoadLevel("Main");
	waiting = false;
}