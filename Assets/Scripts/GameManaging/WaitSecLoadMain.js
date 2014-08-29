#pragma strict
// Testing level loading from a Kinect scene
public var seconds:int;

private var waiting:boolean = false;

function Update () {
	if(GlobalData.inKinectScene && !waiting) {
		StartCoroutine(Wait());
	}
}

function Wait():IEnumerator{
	waiting = true;
	yield WaitForSeconds (seconds);
	Debug.Log("Cargar main");
	LevelManager.LoadLevel("Main");
	waiting = false;
}