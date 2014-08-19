#pragma strict
#pragma downcast
// It enables or disables the items on the map.
// Version: 2.0
// Changes in 2.0 version:
//	-	This script retrieves information from a database and
//		instantiates the items this way.
//	-	The hash of items is not used.
//	-	We can remove items from the database.
//	-	Database synchronization.
//
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 

import System.Xml;

// The ID of the items on the scene must be betweeon 100 and 199
public static final var MinItemID = 100;
public static final var MaxItemID = 199;

// If it's setted true, the changes in scene items will sync with database.
public var sceneItemsPersistence : boolean;

// If it's setted true, the changes in the inventory will sync with database.
public var inventoryPersistence : boolean;

// Acces to non-static members by static functions.
private static var instance : ItemManager;

// This method checks the validity of the id
public static function CheckID(id : int) : boolean {
	return (id >= MinItemID) && (id <= MaxItemID);
}

function Awake() {
	instance = this;
}

function Start () {
	StartCoroutine(RetrieveItemInformation());
	if(!sceneItemsPersistence) {
		Debug.LogError("Scene items changes won't sync. Please set sceneItemsPersistence true.");
	}
	if(!inventoryPersistence) {
		Debug.LogError("Inventory changes won't sync. Please set inventoryPersistence true.");
	}
}

// This retrieves the data of the items on the current scene and
// instantiates them.
private function RetrieveItemInformation() : IEnumerator {
	// TODO Hacer esto solo si es el primer usuario en la escena
	var url : String = Paths.GetSceneQuery() + "/get_items.php/?scene=" + 
						(LevelManager.GetCurrentScene() != null ? LevelManager.GetCurrentScene() : "Main");
	Debug.Log(url);
	var www : WWW = new WWW(url);
	while(!www.isDone) {
		yield;
	}
	Debug.Log(www.text);
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
	while(PhotonNetwork.room == null) {
		yield;
	}
	if(row.Count > 0) {
		for(var rowElement : XmlElement in row) {
			id = int.Parse(rowElement.GetElementsByTagName("id")[0].InnerText);
			x = float.Parse(rowElement.GetElementsByTagName("x")[0].InnerText);
			y = float.Parse(rowElement.GetElementsByTagName("y")[0].InnerText);
			z = float.Parse(rowElement.GetElementsByTagName("z")[0].InnerText);
			texture = rowElement.GetElementsByTagName("texture")[0].InnerText;
			Debug.Log("id = " + id + ", x = " + x + ", y = " + y + ", z = " + z + ", texture = " + texture);
			InstantiateItem(id, x, y, z, texture);
		}
	} else {
		Debug.Log("There are no items on scene " + LevelManager.GetCurrentScene());
	}
}

// Instantiation of an item in a scene
private function InstantiateItem(id : int, x : float, y : float, z : float, texture : String) {
	var item : GameObject;
	if(CheckID(id)) {
		item = PhotonNetwork.Instantiate("Prefabs/item", new Vector3(x, y, z), new Quaternion(90, 0, 0, 0), 0) as GameObject;
		item.name = texture;
		StartCoroutine((item.GetComponent("Item") as Item).SetTexture(texture));
		(item.GetComponent("PhotonView") as PhotonView).viewID = id;
	} else {
		Debug.LogError("Bad id = " + id);
	}
}

// This removes an item from a scene. 
public static function RemoveItemFromScene(item : Item, scene : String) {
	var id : int = item.GetPhotonViewID();
	if(CheckID(id)) {
		if(instance.sceneItemsPersistence) {
			var url : String = Paths.GetSceneQuery() + "/delete_item.php/?id=" + id + "&scene=" + scene;
			Debug.Log(url);
			var www : WWW = new WWW(url);
			while(!www.isDone) {
				yield;
			}
			if(www.text != "OK") {
				Debug.LogError("Error deleting item " + id + " from scene " + scene + " on the database (" + www.text + ") url = " + url);
			}
		}
		PhotonNetwork.Destroy(item.gameObject);
	} else {
		Debug.LogError("Bad id = " + id);
	}
}

// Syncs the amount of items ont the database
// Adds an amount of items to the original amount of items
public static function SyncAddItem(item : String, amount : int) {
	if(instance.inventoryPersistence) {
		var url : String = Paths.GetPlayerQuery() + "/add_item.php/?player=" + Player.nickname + "&item=" + item + "&amount=" + amount;
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		if(www.text != "OK") {
			Debug.LogError("Error syncing item " + item + " with the database (" + www.text + ") url = " + url);
		}
	}
	Inventory.AddItem(item, amount);
}