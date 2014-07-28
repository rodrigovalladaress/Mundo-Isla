#pragma strict
// Edited by Rodrigo Valladares Santana
// Version: 1.1
// 1.1: Added two XML nodes to load a new scene and to
// load the main scene.
/*******************************************************
|	XML Dialog Script
|
|	This script manage dialogs written in XML format, check
|	if the nodes should appear or not, and execute any given script.
|
|	Versión: 1.0
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
static class Dialog extends MonoBehaviour{
	var folder:String = "Dialogs/";
	var fileName:String = "Default";
	var nodeTypes:String[] = ["if", "journal", "inventory", "script", "log", "not", "load", 
	"loadLevel", "loadScene", "loadMain", "loadMainScene", "loadMainLevel"];
	
	var text:String;
	var id:String = "";
	
	var directLink:boolean = false;
	
	var node:XMLNode;
	var input:XMLNode;
	
	function Open(_fileName:String){
		fileName = _fileName;
		if ( Server.session ) _fileName = _fileName + "." + Server.session;
		Server.StartCoroutine(Server.Retrieve.XML( "Dialog", folder + _fileName ));
		Server.Log("Dialog", "Dialog started: " + _fileName);
	}
	
	function Close(){
		MainGUI.DialogInterface.show = false;
		Server.Log("Dialog", "Dialog closed: " + fileName);
		fileName = "Default";
		input = null;
		node = null;
		text = null;
		id = null;
	}
	
	function GetNodeData(n:int){
		// define the node unique id refering to it's relative position in the XML
		if (node == input) id = n.ToString();
		else id = id + "." + n.ToString();
		
		var nodeList:XMLNodeList = node["n"] as XMLNodeList;
		node	= nodeList[n] as XMLNode;
		
		var nodeText:String = node["_text"] as String;
		text	= nodeText.Trim();
		
		if (directLink == false){
			Server.Log("Dialog", text);
			//We will execute the concecuences of a node only if we are not following a shortcut, and if it
			//is the case, we will manage it at the shortcut function
			var nodeThen:XMLNodeList = node["then"] as XMLNodeList;
			if (nodeThen) Server.StartCoroutine( Then(nodeThen[0] as XMLNode) );
			// We check if the node is odd or even.
			// if the node IS even, we sould automatically pick the first one that pass its conditions,
			// as we are choosing the NPC anwser. We have to format our XML acordingly.
			if (id.Split("."[0]).Length % 2 == 0) AutoTakeNode();
		}
		
	}
	
	function GoToNode(id:String){
		// we warn that we are going to do a direct link
		directLink = true;
		// we get the node ID in the form of "n.n.n.n... etc" and split it by the "." character
		var nodes:String[] = id.Split("."[0]);
		// then we reset the node we are in to the default, as we are going to search from the beginning
		node = input;
		// now we go trough each node until we arrive to the correct one, parsing the string to an int
		for (var number in nodes) GetNodeData(int.Parse(number));
		// we execute the concecuenceScript if there is one
		var nodeThen:XMLNodeList = node["then"] as XMLNodeList;
		if (nodeThen) Server.StartCoroutine( Dialog.Then(nodeThen[0] as XMLNode) );
		// send it to the server log...
		Server.Log("Dialog", text);
		// and we turn of direct linking
		directLink = false;
		
		// We check if the node is odd or even.
		// if the node IS even, we sould automatically pick the first one that pass its conditions,
		// as we are choosing the NPC anwser. We have to format our XML acordingly.
		if (id.Split("."[0]).Length % 2 == 0) AutoTakeNode();
	}
	
	function AutoTakeNode(){
		var nodeList:XMLNodeList = node["n"] as XMLNodeList;
		if(nodeList != null){
			for (var i:int = 0; i < nodeList.length; i ++ ){
				var j = nodeList[i] as XMLNode;
				// but only if there are no requeriments
				var jIf:XMLNodeList = j["if"] as XMLNodeList;
				if (!jIf) {
					if (j["@goTo"] as String) GoToNode(j["@goTo"] as String);
					else GetNodeData(i);
					break;
				}
				// or if the requeriments are met
				else if (Check(jIf[0] as XMLNode, "if") == true) {
					if (j["@goTo"] as String) GoToNode(j["@goTo"] as String);
					else GetNodeData(i);
					break;
				}
			}
		}
		else {
			// Debug.LogWarning("No valid anwser found for the node " + id);
			// if no anwser is found, we should close the conversation.
			Close();
		}
	}
	
	function Check(_node:XMLNode, _type:String):boolean{
	
		switch (_type){
		
			case "journal":
				if (_node["@status"] != null){
					if (Journal.Has( _node["@mission"] as String, _node["@status"] as String )) return true;
					else return false;
				}
				else if (Journal.Has( _node["@mission"] as String )){
					return true;
				}
				else return false;
				break;
			
			case "inventory":
				if (_node["@amount"] != null){
					if (Inventory.Has( _node["@item"] as String, int.Parse(_node["@amount"] as String) )) return true;
					else return false;
				}
				else if (Inventory.Has( _node["@item"] as String )) return true;
				else return false;
				break;
			
			case "if":
				var _ifOutput:boolean = true;
				
				for ( var _nodeType:String in nodeTypes )
					if (_node[_nodeType])
						for (var _if in _node[_nodeType]){
							var _ifType:XMLNode = _if as XMLNode;
							if ( !Check(_ifType, _nodeType) )
								_ifOutput = false;
						}
				
				if (_ifOutput) return true;
				else return false;
				break;
			
			case "not":
				var _notOutput:boolean = true;
				
				for ( var _nodeType:String in nodeTypes )
					if (_node[_nodeType])
						for (var _not in _node[_nodeType]){
							var _notType:XMLNode = _not as XMLNode;
							if ( !Check(_notType, _nodeType) )
								_notOutput = false;
						}
				
				if (_notOutput) return false;
				else return true;
				break;
			
			default:
				Debug.LogError("Invalid node type or out of context.");
				break;
		}
		
		return;
		
	}
	
	function Do(_node:XMLNode, _type:String):boolean{
		switch (_type){
		case "journal":
			switch(_node["@function"] as String){
			case "SetMission":
					Journal.SetMission( _node["@mission"] as String, _node["@status"] as String );
					break;
			case "SetMissionToEveryone":
					Server._networkView().RPC("SyncObject", RPCMode.AllBuffered, Server._networkView().viewID.ToString(), "mission", _node["@mission"] + "|" + _node["@status"] );
					break;
			case "UpdateMission":
					Journal.UpdateMission( _node["@mission"] as String );
					break;
			case "UpdateMissionToEveryone":
					Server._networkView().RPC("SyncObject", RPCMode.AllBuffered, Server._networkView().viewID.ToString(), "mission", _node["@mission"] );
					break;
			case "DelMission":
					Journal.DelMission( _node["@mission"] as String );
					break;
			case "DelMissionToEveryone":
					Server._networkView().RPC("SyncObject", RPCMode.AllBuffered, Server._networkView().viewID.ToString(), "mission", _node["@mission"], "delete" );
					break;
			}
			break;
		
		case "inventory":
			switch(_node["@function"] as String){
			
			case "AddItem":
				if (_node["@amount"]) Inventory.AddItem(_node["@item"] as String, int.Parse(_node["@amount"] as String));
				else Inventory.AddItem(_node["@item"] as String);
				break;
				
			case "AddItemToEveryone":
				if (_node["@amount"]) Server._networkView().RPC("SyncObject", RPCMode.AllBuffered, Server._networkView().viewID.ToString(), "item", _node["@item"] + "|" + _node["@amount"] );
				else Server._networkView().RPC("SyncObject", RPCMode.AllBuffered, Server._networkView().viewID.ToString(), "item", _node["@item"] + "|" + "1" );
				break;
				
			}
			break;
			
		case "log":
			if (_node["@type"])
				Server.Log( _node["@type"] as String, _node["@message"] as String );
			else
				Server.Log( "game event", _node["@message"] as String );
			break;
		
		case "script":
			var _component:String = _node["@name"] as String;
			var consecuenceScript:Component = GameObject.Find("GameManager").AddComponent(_component) as Component;
			break;
		
		case "if":
			if ( Check(_node, _type ) )
				for ( var _nodeType:String in nodeTypes )
					if (_node[_nodeType])
						for (var _child in _node[_nodeType]){
							var _childNode:XMLNode = _child as XMLNode;
							Do(_childNode, _nodeType);
						}
			break;
		
		// Loads the main scene
		case "loadMain": case "loadMainScene": case "loadMainLevel":
			LevelManager.LoadScene("Main");
			break;
		
		// Loads a new level
		case "load": case "loadScene": case "loadLevel":
			var _level:String = _node["@name"] as String;
			/*if(_level != "Main") {
				LevelManager.LoadScene(_level);
			} else {
				LevelManager.LoadMainScene();
			}*/
			LevelManager.LoadScene(_level);
			break;
			
		default:
			Debug.LogError("Invalid node type or out of context.");
			break;
		}
		
		return;
	}
	
	function Then(_node:XMLNode):IEnumerator{
		for ( var _nodeType:String in nodeTypes )
			if (_node[_nodeType])
				for (var _child in _node[_nodeType]){
					var _childType:XMLNode = _child as XMLNode;
					Do(_childType, _nodeType);
				}
	}
	
}