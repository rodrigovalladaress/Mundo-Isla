#pragma strict
#pragma downcast
// It enables or disables the items on the map.
// Version: 2.1
//
// Changes in 2.1 version:
//	-	Storage of an array of available PhotonView ids.
//	-	Synchronization of drop item.
//	-	Reserve and free PhotonView IDs by RPC.
//
// Changes in 2.0 version:
//	-	This script retrieves information from a database and
//		instantiates the items this way.
//	-	The hash of items is not used.
//	-	We can remove items from the database.
//	-	Database synchronization.
//
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 

import System.Xml;

public class ItemManager extends Photon.MonoBehaviour {

	// The ID of the items on the scene must be betweeon 100 and 199
	public static final var MinItemID = 100;
	public static final var MaxItemID = 199;
	public static final var RangeItemID = MaxItemID - MinItemID;
	
	public static final var NoID:int = -1;

	// If it's setted true, the changes in scene items will be sync ed with database.
	public var sceneItemsPersistence : boolean;

	// If it's setted true, the changes in the inventory will be synced with database.
	public var inventoryPersistence : boolean;

	// Acces to non-static members by static functions.
	private static var instance : ItemManager;
	
	// Hash of parents of items
	//private static var itemParentHash:Hashtable;
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// Initialization                                                                       //
	//////////////////////////////////////////////////////////////////////////////////////////

	function Awake() {
		instance = this;
	}

	function Start () {
		if(!sceneItemsPersistence) {
			Debug.LogWarning("Scene items changes won't sync. Please set sceneItemsPersistence true in ItemManager.");
		}
		if(!inventoryPersistence) {
			Debug.LogWarning("Inventory changes won't sync. Please set inventoryPersistence true in ItemManager.");
		}
	}
	
	// This retrieves the data of the items on the current scene and
	// instantiates them.
	public static function RetrieveItemInformation() : IEnumerator {
		var url : String = Paths.GetSceneQuery() + "/get_items.php/?scene=" + 
							WWW.EscapeURL(LevelManager.GetCurrentScene());
		// Wait for the connection to a room
		while(PhotonNetwork.room == null) {
			yield;
		}
		// If we are the only player on the scene, initialization is necesary
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		var xDoc : XmlDocument = new XmlDocument();
		xDoc.LoadXml(www.text);
		var result : XmlNodeList = xDoc.GetElementsByTagName("result");
		var resultElement = result[0] as XmlElement;
		var row : XmlNodeList = resultElement.ChildNodes;
		var id : int;
		var x : float;
		var y : float;
		var z : float;
		var texture : String;
		var scene:String;
		
		if(row.Count > 0) {
			if(PhotonNetwork.room.playerCount == 1) {
				// Create a GameObject whose childs are the items instantiated on this scene
				
				for(var rowElement : XmlElement in row) {
					var item:GameObject;
					id = int.Parse(rowElement.GetElementsByTagName("id")[0].InnerText);
					x = float.Parse(rowElement.GetElementsByTagName("x")[0].InnerText);
					y = float.Parse(rowElement.GetElementsByTagName("y")[0].InnerText);
					z = float.Parse(rowElement.GetElementsByTagName("z")[0].InnerText);
					texture = rowElement.GetElementsByTagName("texture")[0].InnerText;
					scene = rowElement.GetElementsByTagName("scene")[0].InnerText;
					/*var itemParent:GameObject = GameObject.Find(scene + "Items");
					if(itemParent == null) {
						itemParent = PhotonNetwork.Instantiate("Prefabs/ItemContainer" + scene, new Vector3(0, 0, 0),
									 Quaternion.identity, 0) as GameObject;
						itemParent.AddComponent("PhotonView");
						itemParent.name = scene + "Items";
					}*/
					// Set the parent of the items in this scene
					item = InstantiateItem(id, x, y, z, texture, scene);
					//item.transform.parent = itemParent.transform;
				}
			}
		} else {
			Debug.Log("There are no items on scene " + LevelManager.GetCurrentScene());
		}
	}

	//////////////////////////////////////////////////////////////////////////////////////////
	// Photon View ID Management                                                            //
	//////////////////////////////////////////////////////////////////////////////////////////

	// It stores if a PhotonView id is available for an item or not
	//private static var reservedPhotonViewIDs : boolean[]; = new boolean[MaxItemID - MinItemID];
	/*private static var reservedPhotonViewIDs:ReservedPhotonViewIDHash = new ReservedPhotonViewIDHash();

	// This method checks the validity of the id (is in range)
	public static function IsIDInRange(id : int) : boolean {
		return (id >= MinItemID) && (id <= MaxItemID);
	}

	// This method checks if an ID is available (it is not being used by another item)
	public static function IsIDAvailable(id : int) : boolean {
		return IsIDInRange(id) && (!reservedPhotonViewIDs.Get(id));
	}

	// This method checks if an ID is available (it is being used by another item)
	public static function IsIDReserved(id : int) : boolean {
		return IsIDInRange(id) && (reservedPhotonViewIDs.Get(id));
	}

	// It returns the first PhotonView id that is avaible to use
	private static function GetFirstAvailablePhotonViewID() : int {
		var id : int = MinItemID;
		while((id < MaxItemID) && reservedPhotonViewIDs.Get(id)) {
			id++;
		}
		return id;
	}

	@RPC
	public function ReservePhotonViewID(id : int) {
		reservedPhotonViewIDs.Set(id, true);
	}
	
	@RPC
	public function FreePhotonViewID(id : int) {
		reservedPhotonViewIDs.Set(id, false);
	}*/

	

	//////////////////////////////////////////////////////////////////////////////////////////
	// Item Management                                                                      //
	//////////////////////////////////////////////////////////////////////////////////////////

	// Instantiation of an item in a scene
	private static function InstantiateItem(id:int, x:float, y:float, z:float, texture:String, scene:String) : GameObject {
		var item : GameObject = null;
		//if(IsIDAvailable(id)) {
			// We store the name of the texture in instantiationData. In Item.Start(), this
			// information is used to set the texture of the item.
			var instantiationData : Object[] = new Object[2];
			instantiationData[0] = texture;
			instantiationData[1] = scene;
			item = PhotonNetwork.Instantiate("Prefabs/item", new Vector3(x, y, z), 
					new Quaternion(90, 0, 0, 0), 0, instantiationData) as GameObject;
			if(id != NoID) {
				(item.GetComponent("PhotonView") as PhotonView).viewID = id;
			}
			// We reserve the id for all players
			//instance.photonView.RPC("ReservePhotonViewID", PhotonTargets.AllBuffered, id);
			//ReservePhotonViewID(id);// -> This is done in Item.Start()
		/*} else {
			Debug.LogError("Bad id = " + id);
		}*/
		return item;
	}

	// This adds an item to the scene and syncs it.
	public static function AddItemToScene(item : String, scene : String, position : Vector3) : IEnumerator {
		var id : int;//= GetFirstAvailablePhotonViewID();
		var texture : String = item;
		var x : float = position.x;
		var y : float = position.y;
		var z : float = position.z;
		var object : GameObject = InstantiateItem(NoID, x, y, z, texture, scene);
		id = (object.GetComponent("PhotonView") as PhotonView).viewID;
		
		Server.GetPhotonView().RPC("SyncObject", PhotonTargets.AllBuffered, 
									object.GetComponent(PhotonView).viewID.ToString(), "drop", item);
		
		if(object != null) {
			if(instance.sceneItemsPersistence) {
				var url : String = Paths.GetSceneQuery() + "/add_item.php/?id=" + id + "&scene=" + WWW.EscapeURL(scene)
									+ "&texture=" + WWW.EscapeURL(texture) + "&x=" + x + "&y=" + y + "&z=" + z;
				var www : WWW = new WWW(url);
				while(!www.isDone) {
					yield;
				}
				if(!www.text.Equals("OK")) {
					Debug.LogError("Error syncing adding item to scene (" + www.text + ") url = " + url);
				}
			}
		} else {
			Debug.LogError("Error adding item to scene");
		}
	}

	// This removes an item from a scene. 
	public static function RemoveItemFromScene(item : Item, scene : String) : IEnumerator {
		var id : int = item.GetPhotonViewID();
		// We check if the id is being used by the item
		//if(IsIDReserved(id)) {
			if(instance.sceneItemsPersistence) {
				var url : String = Paths.GetSceneQuery() + "/delete_item.php/?id=" + id + "&scene=" + WWW.EscapeURL(scene);
				var www : WWW = new WWW(url);
				while(!www.isDone) {
					yield;
				}
				if(!www.text.Equals("OK")) {
					Debug.LogError("Error deleting item " + id + " from scene " + scene + " on the database (" 
									+ www.text + ") url = " + url);
				}
			}
			PhotonNetwork.Destroy(item.gameObject);
			//instance.photonView.RPC("FreePhotonViewID", PhotonTargets.AllBuffered, id);
		/*} else {
			Debug.LogError("Bad id = " + id + " Check synchronization! And don't add items manually to the scene! "
							+ " Add them using the database.");
		}*/
	}

	// Syncs the amount of items
	// Adds an amount of items to the original amount of items
	public static function SyncAddItem(item : String, amount : int) : IEnumerator {
		if(instance.inventoryPersistence) {
			var url : String = Paths.GetPlayerQuery() + "/add_item.php/?player=" + WWW.EscapeURL(Player.nickname) 
								+ "&item=" + WWW.EscapeURL(item) + "&amount=" + amount;
			var www : WWW = new WWW(url);
			while(!www.isDone) {
				yield;
			}
			if(!www.text.Equals("OK")) {
				Debug.LogError("Error syncing item " + item + " with the database (" + www.text 
								+ ") url = " + url);
			}
		}
		Inventory.AddItem(item, amount);
	}
}