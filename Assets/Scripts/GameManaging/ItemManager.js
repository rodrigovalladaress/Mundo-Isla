#pragma strict
#pragma downcast
// It enables or disables the items on the map.
// Version: 2.0
// Changes in 2.0 version:
//	-	This script retrieves information from a database and
//		instantiates the items this way.
//	-	The hash of items is not used.
//	-	We can remove items from the database.
//
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 

import System.Xml;

// The ID of the items on the scene must be betweeon 100 and 199
public static final var MinItemID = 100;
public static final var MaxItemID = 199;

// If it setted as true, when a player obtains an item, the state 
// of the item is updated in the database. Setted as true only
// for debugging.
public var persistence : boolean = true;

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
	for(var rowElement : XmlElement in row) {
		id = int.Parse(rowElement.GetElementsByTagName("id")[0].InnerText);
		x = float.Parse(rowElement.GetElementsByTagName("x")[0].InnerText);
		y = float.Parse(rowElement.GetElementsByTagName("y")[0].InnerText);
		z = float.Parse(rowElement.GetElementsByTagName("z")[0].InnerText);
		texture = rowElement.GetElementsByTagName("texture")[0].InnerText;
		Debug.Log("id = " + id + ", x = " + x + ", y = " + y + ", z = " + z + ", texture = " + texture);
		InstantiateItem(id, x, y, z, texture);
	}
}

// Instantiation of an item in a scene
private function InstantiateItem(id : int, x : float, y : float, z : float, texture : String) {
	var item : GameObject;
	if(CheckID(id)) {
		item = PhotonNetwork.Instantiate("Prefabs/item", new Vector3(x, y, z), new Quaternion(90, 0, 0, 0), 0) as GameObject;
		item.name = texture;
		(item.GetComponent("Item") as Item).SetTexture(texture);
		(item.GetComponent("PhotonView") as PhotonView).viewID = id;
	} else {
		Debug.LogError("Bad id = " + id);
	}
}

// This removes an item from a scene. 
public static function RemoveItemFromScene(item : Item, scene : String) {
	var id : int = item.GetPhotonViewID();
	if(CheckID(id)) {
		if(instance.persistence) {
			var url : String = Paths.GetSceneQuery() + "/delete_item.php/?id=" + id + "&scene=" + scene;
			Debug.Log(url);
			var www : WWW = new WWW(url);
			while(!www.isDone) {
				yield;
			}
			Debug.Log(www.text);
		}
		PhotonNetwork.Destroy(item.gameObject);
	} else {
		Debug.LogError("Bad id = " + id);
	}
}

public static function PutItemInInventory(item : Item) {
	
}