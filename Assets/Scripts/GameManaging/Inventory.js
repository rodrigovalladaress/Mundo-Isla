#pragma strict
#pragma downcast
// Edited by Rodrigo Valladares Santana
// <rodriv_tf@hotmail.com>
// Version: 1.1
//
// 1.1: DropItem sync.
/*******************************************************
|	Inventory Script
|
|	This script draws all the menu boxes and handles navigation
|	Versión: 1.0
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
import System.Collections.Generic;

static class Inventory extends MonoBehaviour{
	
	var items 		: Dictionary.<String, int> = new Dictionary.<String, int>();
	var textures 	: Dictionary.<String, Texture> = new Dictionary.<String, Texture>();
	
	function Has(item:String){
		if(items.ContainsKey(item)) return true;
		else return false;
	}
	
	function Has(item:String, amount:int):boolean{
		if(items.ContainsKey(item)){
			if (items[item] >= amount) return true;
		}
		else return false;
		return;
	}
	
	function AddItem (item:String, amount:int):IEnumerator{
		if ( !textures.ContainsKey( item ) )
			Server.StartCoroutine(Server.Retrieve.ItemTexture(item));
	
		if(Has(item) == true){
			var tempArray:Dictionary.<String, int> = items;
			tempArray[item] = tempArray[item] + amount;
			items = tempArray;
		}
		else {
			items.Add (item, amount);
		}
	}
	
	function AddItem (item:String){
		AddItem(item, 1);
	}
	
	function DropItem(item:String){
		AddItem(item, -1);
		Server.Log("game event","Player " + Player.GetNickname() + " dropped " + item);
		
		Server.StartCoroutine(ItemManager.AddItemToScene(item, LevelManager.GetCurrentScene(), Player.position() + Vector3.forward));
		
	}
	
	// This function loads the data of the inventory stored in the database and stores that
	// in the Inventory.
	function Retrieve():IEnumerator {
		var url : String = Paths.GetPlayerQuery() + "/get_items.php?player=" + WWW.EscapeURL(Player.GetNickname());
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		var xDoc : XmlDocument = new XmlDocument();
		xDoc.LoadXml(www.text);
		var result : XmlNodeList = xDoc.GetElementsByTagName("result");
		var resultElement = result[0] as XmlElement;
		var row : XmlNodeList = resultElement.ChildNodes;
		var item : String;
		var amount : int;
		while(PhotonNetwork.room == null) {
			yield;
		}
		if(row.Count > 0) {
			for(var rowElement : XmlElement in row) {
				item = rowElement.GetElementsByTagName("item")[0].InnerText;
				amount = int.Parse(rowElement.GetElementsByTagName("amount")[0].InnerText);
				Inventory.AddItem(item, amount);
			}
		} else {
			Debug.Log(Player.GetNickname() + " doesn't have any item in his or her inventory");
		}
	}
	
}