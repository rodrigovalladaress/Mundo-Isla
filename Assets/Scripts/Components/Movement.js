#pragma strict
/*******************************************************
|	Movement Script
|
|	This script manage all the behaviors expected from an
|	standard character controller, such as speed and gravity.
|	The movement is relative to the main camera.
|
|	Versión: 2.0
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/

var speed : float = NORMAL_SPEED;
var jumpSpeed : float = 8.0;
var gravity : float = 20.0;

var turnSpeed : float = 2.0;
var mouseTurnSpeed : float = 0.8;

private static final var NORMAL_SPEED : float = 6.0;
private static final var HIGH_SPEED : float = 3.5 * NORMAL_SPEED;

private var isNormalSpeed : boolean = true;

private var cc:CharacterController;
private var moveDirection: Vector3 = Vector3.zero;
private var skin:Transform;

private var rotationAmount:float;

function Start(){
	cc = GetComponent(CharacterController);
	
	while (!this.gameObject.transform.FindChild("Skin")) yield;
	
	skin = this.gameObject.transform.FindChild("Skin").transform;
	
	
}

function Update () {
	
	// If the right mouse button is held, rotation is locked to the mouse
	if (Input.GetMouseButton (1)) rotationAmount = Input.GetAxis ("Mouse X") * mouseTurnSpeed * Time.deltaTime;
	else rotationAmount = Input.GetAxis ("Horizontal") * turnSpeed * Time.deltaTime;
	
	// Apply gravity
	if (moveDirection.y > -gravity && !cc.isGrounded) moveDirection.y -= gravity * Time.deltaTime;
	
	// Rotate the controller
	cc.transform.RotateAround (cc.transform.up, rotationAmount);
	
	// Stop if we are focused on a window that do not allow movement, but sitll apply gravity
	if (MainGUI.Menu.show || MainGUI.DialogInterface.show || MainGUI.JournalInterface.show) {
		cc.Move(moveDirection * Time.deltaTime);
		return;
	}
	
	if (Player.GetNickname() == "Admin") {
		if(Input.GetKeyDown ("v")) {
			if(isNormalSpeed) {
				speed = HIGH_SPEED;
			} else {
				speed = NORMAL_SPEED;
			}
			isNormalSpeed = !isNormalSpeed;
		}
	}
	
	// If we are grounded, allow jump
	if (cc.isGrounded && Input.GetButton ("Jump")) moveDirection.y = jumpSpeed;
	
	// Move the controller
	if (Input.GetMouseButton (1)) cc.Move(Camera.mainCamera.transform.right * (Input.GetAxis("Horizontal") * speed * Time.deltaTime));
	cc.Move	(
				Camera.mainCamera.transform.forward * (Input.GetAxis("Vertical") * speed * Time.deltaTime)
				+
				Vector3(0,moveDirection.y * Time.deltaTime,0)
			);
	
	
}