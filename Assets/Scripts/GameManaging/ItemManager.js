#pragma strict
#pragma downcast
// It enables or disables the items on the map.
// Version: 2.0
// Changes in 2.0 version:
//	-	This script retrieves information from a database and
//		instantiates the items this way.
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 

import System.Xml;

public static final var OBTAINED = true;

private function RetrieveItemInformation() : IEnumerator {
	// TODO Hacer esto solo si es el primer usuario en la escena
	var url : String = Paths.GetQuery() + "/scene_items.php/?scene=" + 
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

private function InstantiateItem(id : int, x : float, y : float, z : float, texture : String) {
	var item : GameObject = PhotonNetwork.Instantiate("Prefabs/item", new Vector3(x, y, z), new Quaternion(90, 0, 0, 0), 0) as GameObject;
	item.name = texture;
	(item.GetComponent("Item") as Item).SetTexture(texture);
	(item.GetComponent("PhotonView") as PhotonView).viewID = id;
}

function Start () {
	/*var items : GameObject[] = GameObject.FindGameObjectsWithTag("Item");
	// Checks if the item has an entry in the itemHash of LevelManager
	if(LevelManager.ItemHashIsInitialized()) {
		for(var item : GameObject in items) {
			if(LevelManager.HasItemStateInCurrentSceneFor(item)) {
				var itemComponent : Item = item.GetComponent("Item");
				// If the item has been obtained, set its state to obtained
				if(LevelManager.GetItemStateInCurrentSceneFor(item) == OBTAINED) {
					itemComponent.setItemToObtained();
				}
			}
		}
	}*/
	StartCoroutine(RetrieveItemInformation());
}