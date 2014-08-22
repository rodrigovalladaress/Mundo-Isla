// Edited by Rodrigo Valladares Santana
// <rodriv_tf@hotmail.com>
// Version: 1.3
//
// 1.3:	-	The texture can be setted by another script.
//		-	When the player obtains the item, it is removed
//			from the database.
//		-	The state of the item (if it's been obtained or not)
//			is now stored in the database.
//		-	When the player obtains an item, we also add the item
//			onto the database.
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

	public static final var Invisible = false;
	public static final var Visible = true;
	
	public 			var _minDistance		:	float 	=	3.5;
	static	private	var _player				:	GameObject;
	public			var _labelOffset		:	int 	=	40;
	public 			var _audioClip			:	AudioClip;
	public			var _texture			:	String;
	
	private var photonView : PhotonView;
	
	function Start () {
		var _done:boolean = false;
		photonView = GetComponent("PhotonView") as PhotonView;
		// We get the name of the texture passed by instantiationData
		if((photonView.instantiationData != null) && (photonView.instantiationData.Length > 0)) {
			this.gameObject.name = photonView.instantiationData[0] as String;
		} else {
			Debug.LogError("Item needs its name in photonView.instantiateionData[0] when is instantiated"
							+ " through PhotonNetwork.Instantiate");
		}
		Server.StartCoroutine(SetTexture(this.gameObject.name));
		//ItemManager.ReservePhotonViewID(GetPhotonViewID());
	}
	
	public function GetPhotonViewID() : int {
		return photonView.viewID;
	}
	
	// Set the texture of the item. By default is the item's name.
	public function SetTexture(texture : String) : IEnumerator {
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
	    setVisibility(Visible);
	}
	
	function OnBecameInvisible () {
	    setVisibility(Invisible);
	}
	
	function setVisibility(visibility : boolean) {
		if(visibility == Visible) {
			SetTexture(_texture);
		} else if(visibility == Invisible) {
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
			this.gameObject.transform.rotation.eulerAngles = new Vector3(-Camera.main.transform.rotation.eulerAngles.x + 90,
																Camera.main.transform.rotation.eulerAngles.y - 180, 0);
			
			if (Player.exist()){
				if (_player == null) _player = Player.object;
				// If the object hasn't been obtained and the player is at a certain distance, it shows the name of the object
				if ((Vector3.Distance(_player.transform.position, gameObject.transform.position) <= _minDistance)) {
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
	
	private function RemoveItemFromScene() {
		ItemManager.RemoveItemFromScene(this, LevelManager.GetCurrentScene());
	}
	
	/*********************************
	*		Collision Interaction
	*********************************/
	function OnTriggerEnter(collider : Collider) {
		//Debug.Log("Collision detected with: "+ collider.transform.gameObject.name);
		// We check if the distance between objects is under our minimum.
		// Wa also check wether the item has been obtained or not.
		if (collider.transform.GetComponent(CharacterController)) {
			// And add one instance of the object to the inventory
			if ( collider.gameObject != Player.object ) return;
			//Inventory.AddItem(this.gameObject.name);
			Player.object.audio.PlayOneShot(_audioClip);
			//Network.Destroy(gameObject);
			RemoveItemFromScene();
			Server.StartCoroutine(ItemManager.SyncAddItem(_texture, 1));
			Server.Log("GAME EVENT", collider.transform.gameObject.name + " got " + this.gameObject.name + " from the floor.");
		}
		else if(collider.transform.GetComponent("Terrain")){
			Destroy(this.gameObject.rigidbody);
		}
	}
	
	
}