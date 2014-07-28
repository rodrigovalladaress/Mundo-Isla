#pragma strict
private var lastPlace	:	Vector3;
private var currentPlace:	Vector3;
private var fadeLength	:	float = .6f;
private var values		:	Transform;
 
class SkinAnimator extends MonoBehaviour{
	function Start() 
	{
		lastPlace = transform.position;
		animation["walk"].wrapMode = WrapMode.Loop;
		animation["walk"].wrapMode = WrapMode.Loop;
		
		//while (!transform.parent.gameObject) yield;
		
		//values = transform.parent.gameObject.transform.Find("Values").transform;
	}
	
	function OnBecameVisible () {
	    enabled = true;
	}
	
	function OnBecameInvisible () {
	    enabled = false;
	}
		
	function Update(){
	
		// We get the local position
		currentPlace = transform.position;
		
		// Now we see if the movement is big enough to animate
		if ((currentPlace.x != lastPlace.x) || (currentPlace.z != lastPlace.z)) {
			// If it is, we make the skin walk
			animation.CrossFade("idle1", fadeLength);
			animation.Play("walk");
		}
		else{
			// If it isn't, we make the skin stop
			animation.CrossFade("walk", fadeLength);
			animation.Play("idle1");
		}
		
		/*
		if (networkView.isMine){
			var X:float = Input.GetAxis("Horizontal");
			var Z:float = Input.GetAxis("Vertical");
			var skinY:float;
			
			if (X != 0 || Z != 0){
				if (X && Z){
					if ((X > 0) && (Z > 0)) skinY = 45;
					else if ((X > 0) && (Z < 0)) skinY = 135;
					else if ((X < 0) && (Z < 0)) skinY = -135;
					else if ((X < 0) && (Z > 0)) skinY = -45;
				}
				else if (X){
					if (X > 0) skinY = 90;
					else if (X < 0) skinY = -90;
				}
				else if (Z){
					if (Z > 0) skinY = 0;
					else if (Z < 0) skinY = 180;
				}
				values.localRotation.eulerAngles = new Vector3(0, skinY, 0);
			}
		}
		*/
		//if (this.gameObject.transform.FindChild("Skin")) this.gameObject.transform.LookAt(Vector3(lastPlace.x, transform.position.y, lastPlace.z));
		//Debug.Log(Vector3(lastPlace.x, transform.position.y, lastPlace.z));
		// We update the values if necesary
		if (currentPlace != lastPlace) lastPlace = currentPlace;
	}
}