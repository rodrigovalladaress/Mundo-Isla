// Edited by Rodrigo Valladares Santana
// <rodriv_tf@hotmail.com>
// Version: 1.3
//
// 1.3:	-	The texture can be setted by another script.
//
// 1.2: -	The item stores if it has been obtained by the player 
//			or not.
//		- 	When the item has been obtained, the texture 
// 			of the item is set to null.
//
// 1.1: Added a boolean that shows if the item has been 
// obtained or not.
/*******************************************************
|	Item Script
|
|	This script loads a texture from the web named as the container,
|	and then maintain it looking at the player.
|
|	Versión: 1.0
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
#pragma strict
class Item extends MonoBehaviour{

	public static final var INVISIBLE = false;
	public static final var VISIBLE = true;

	public 			var _minDistance		:	float 	=	3.5;
	static	private	var _player				:	GameObject;
	public			var _labelOffset		:	int 	=	40;
	public 			var _audioClip			:	AudioClip;
	// It's true if the item has been obtained by the player
	public			var _hasBeenObtained 	: 	boolean;
	public			var _texture			:	String;
	
	function Start () {
		var _done:boolean = false;
		SetTexture(this.gameObject.name);
	}
	
	public function SetTexture(texture : String) {
		_texture = texture;
		if ( Inventory.textures.ContainsKey(_texture) == true ){
			this.gameObject.renderer.material.mainTexture = Inventory.textures[_texture];
		}
		else{
			Server.StartCoroutine(Server.Retrieve.ItemTexture(_texture));
			while (Inventory.textures.ContainsKey(_texture) == false) yield;
			this.gameObject.renderer.material.mainTexture = Inventory.textures[_texture];
		}
	}
	
	function OnBecameVisible () {
		// If the item has been obtained, it doesn't show the item.
		if(!_hasBeenObtained) {
	    	//renderer.enabled = true;
	    	setVisibility(VISIBLE);
	    }
	}
	
	function OnBecameInvisible () {
	    //renderer.enabled = false;
	    setVisibility(INVISIBLE);
	}
	
	function setVisibility(visibility : boolean) {
		if(visibility == VISIBLE) {
			SetTexture(this.gameObject.name);
		} else if(visibility == INVISIBLE) {
			this.gameObject.renderer.material.mainTexture = null;
		}
	}
	
	/*********************************
	*		Item management
	*********************************/
	
	function OnGUI() {
		GUI.skin = Resources.Load("Skin") as GUISkin;
		GUI.depth = 1;
		if(Camera.main != null) {
			// We reorient the object to be always looking at the camera (actually, at the opposite direction, it's just the way billboards work)
			this.gameObject.transform.rotation.eulerAngles = new Vector3(-Camera.main.transform.rotation.eulerAngles.x + 90, Camera.main.transform.rotation.eulerAngles.y - 180, 0);
			
			if (Player.exist()){
				if (_player == null) _player = Player.object;
				// If the object hasn't been obtained and the player is at a certain distance, it shows the name of the object
				if (!(_hasBeenObtained) && (Vector3.Distance(_player.transform.position, gameObject.transform.position) <= _minDistance)) {
					var screenPosition:Vector3 = Camera.main.WorldToScreenPoint(transform.position);
					var _rect:Rect = new Rect	(	screenPosition.x - gameObject.name.ToString().Length * 4,
													Screen.height - screenPosition.y - _labelOffset,
													gameObject.name.ToString().Length * 9,
													25
												);
					GUILayout.BeginArea(_rect);
					GUI.color.a = 0.5;
					GUILayout.Box(gameObject.name.Split("."[0])[0]);
					GUI.color.a = 1;
					GUILayout.EndArea();
				}
			}
		}
	}
	
	public function setItemToObtained() {
		_hasBeenObtained = true;
		// TODO Set invisible to all players
		renderer.enabled = false;
	}
	
	/*********************************
	*		Collision Interaction
	*********************************/
	function OnTriggerEnter(collider : Collider) {
		//Debug.Log("Collision detected with: "+ collider.transform.gameObject.name);
		// We check if the distance between objects is under our minimum.
		// Wa also check wether the item has been obtained or not.
		if (!(_hasBeenObtained) && (collider.transform.GetComponent(CharacterController))) {
			// And add one instance of the object to the inventory
			if ( collider.gameObject != Player.object ) return;
			Inventory.AddItem(this.gameObject.name);
			Player.object.audio.PlayOneShot(_audioClip);
			//Network.Destroy(gameObject);
			setItemToObtained();
			Server.Log("GAME EVENT", collider.transform.gameObject.name + " got " + this.gameObject.name + " from the floor.");
		}
		else if(collider.transform.GetComponent("Terrain")){
			Destroy(this.gameObject.rigidbody);
		}
	}
	
	
}