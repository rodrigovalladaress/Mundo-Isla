#pragma strict
class DialogEditor extends MonoBehaviour{

	static var _node:GameObject;
	static var fileName:String = "Default";
	static var input:XMLNode;
	static var tags:String[] = ["function", "mission", "status", "item", "amount", "name", "type", "message"];
	
	private static var _XML:String;
	private static var _saving:boolean = false;
	
	function Start(){
		gameObject.name = "Root";
	}
	
	function Update (){
		if (_saving == true) return;
		_XML = "";
		for (var child in transform){
			var childType:Transform = child as Transform;
			_XML = _XML + childType.GetComponent(Node).Data(0) + "\n";
		}
		_XML = _XML.Trim();
	}
	
	static function AddChildren(){
		var newNode = new GameObject();
			newNode.name = "Node";
			newNode.transform.parent = GameObject.Find("Root").transform;
			newNode.AddComponent(Node);
	}
	
	static function Load(_fileName:String):IEnumerator{
		
		if ( Server.session ) _fileName = _fileName + "." + Server.session;
		
		fileName = _fileName;
		
		Server.StartCoroutine(Server.Retrieve.XML( "DialogEditor", Dialog.folder + _fileName ));
		
		while (!input) yield;
		
		for (var _node in input["n"]){
			var _nodeType:XMLNode = _node as XMLNode;
			LoadNode(_nodeType, GameObject.Find("Root"));
		}
	}
	
	static function LoadNode (_input:XMLNode, _holder:GameObject){
		var _node:XMLNode = _input;
		
		var _lines:String[];
		var i:int;
		
		var newNode:GameObject = new GameObject();
		newNode.transform.parent = _holder.transform;
		
		newNode.AddComponent(Node);
		if (_node["_text"] as String)	newNode.GetComponent(Node)._text		= _node["_text"] as String;
		if (_node["@goTo"] as String)	newNode.GetComponent(Node)._loadingGoTo	= _node["@goTo"] as String;
		
		if (_node["if"]){
			var _nodeIf:XMLNodeList = _node["if"] as XMLNodeList;
			newNode.GetComponent(Node)._if = LoadScript( _nodeIf[0] as XMLNode, "if", -1 ).Trim();
			_lines = newNode.GetComponent(Node)._if.Split("\n"[0]);
			var _clearIf:String = "";
			for (i = 1; i < _lines.Length -1; i++){
				_clearIf = _clearIf + _lines[i] + "\n";
			}
			newNode.GetComponent(Node)._if = _clearIf.Trim();
		}
		if (_node["then"]){
			var _nodeThen:XMLNodeList = _node["then"] as XMLNodeList;
			newNode.GetComponent(Node)._then = LoadScript( _nodeThen[0] as XMLNode, "then", -1 ).Trim();
			_lines = newNode.GetComponent(Node)._then.Split("\n"[0]);
			var _clearThen:String = "";
			for (i = 1; i < _lines.Length -1; i++){
				_clearThen = _clearThen + _lines[i] + "\n";
			}
			newNode.GetComponent(Node)._then = _clearThen.Trim();
		}
		
		if ( _node["n"] != null ){
			var _nodeList:XMLNodeList = _node["n"] as XMLNodeList;
			if ( _nodeList.length > 0 )
				for (var _n in _nodeList){
					var _nType:XMLNode = _n as XMLNode;
					LoadNode( _nType, newNode );
				}
		}
	}
	
	static function Save (_data:String){
	
		_saving = true;
		
		if (Application.isWebPlayer) {
			// Create a form object for sending data to the server
		    var form = new WWWForm();
		     // The name of the player
		    form.AddField( "file", Dialog.folder + fileName );
		     // The password
		    form.AddField( "data", _XML );
		
	    	// Create a download object
	        var download = new WWW( Application.dataPath + "/saveDialog.pl", form );
		
		    // Wait until the download is done
		    while (!download.isDone) yield;
			
		    if(download.error) {
		        print( "Error downloading: " + download.error );
		        return;
		    }
		    else{
		        // get the anwser, and act on it
		        if(download.text == "done"){
		        	Server.Log("server", "Dialog " + fileName + " modified.");
					download.Dispose();
				}
		        else {
		        	Server.Log("server", "Error changing " + fileName + ".");
		        	download.Dispose();
		        }
		    }
		}
		else if(Application.isEditor){
			// Override
			Server.Log("server", "Editor mode, overriding...");
			Debug.LogWarning("Write to file commented out to build for WebPlayer! Switch the target and uncomment if you wish to write to file from editor.");
//			System.IO.File.WriteAllText(Application.dataPath + "/../" + Dialog.folder + fileName + ".xml", _data);
		}
		
		_saving = false;
		
		Destroy(GameObject.Find("Root"));
	}
	
	static function LoadScript(_node:XMLNode, _type:String, indent:int):String{
		var _output:String = "";
		var _childData:String = "";
		var _indent:String = "";
		for (var i:int = 0; i < indent; i++) _indent = _indent + "    ";
		
		for (var tag:String in DialogEditor.tags)
			if (_node["@" + tag])
				_output = _output + " " + tag + "="	+ "\"" + _node["@" + tag] + "\"";
		
		var _comment:String;
		if (_node["_text"]){
			var _nodeText:String = _node["_text"] as String;
			_comment = _nodeText.Trim();
		}
		else _comment = "";
		
		for ( var _nodeType:String in Dialog.nodeTypes )
			if (_node[_nodeType])
				for (var _child in _node[_nodeType]){
					var _childType:XMLNode = _child as XMLNode;
					_childData = _childData + LoadScript(_childType, _nodeType, indent + 1) + "\n" + _indent;
				}
		
		if (_childData != "") _childData = "\n" + _childData;
		
		_output = _indent + "<" + _type + _output + ">" + _comment + _childData + "</" + _type + ">";
		
		return _output;
	}
	
	/*******************************************
	|	
	|	
	|	
	|	GUI Definitions
	|	
	|	
	|	
	*******************************************/
	
	
	function OnGUI() {
	
		GUI.skin = Resources.Load("Skin") as GUISkin;
		GUI.depth = 0;
		if (!QNGUI._scripting) QNGUI.MainMenu();
		else QNGUI.ScriptingMenu();
		
	}
	static class QNGUI{
		
		var _linking:GameObject;
		var _swapping:boolean = false;
		var _moving:boolean = false;
		var _scripting:boolean = false;
		
		private var SP:Vector2 = Vector2.zero;
		private var SP2:Vector2 = Vector2.zero;
		
		function MainMenu(){
			GUILayout.BeginArea(MainGUI.Area._Content);
			SP = GUILayout.BeginScrollView(SP);
			
				if (_XML != null){
					
					
					GUILayout.BeginHorizontal();
					if( GUILayout.Button( "+", GUILayout.ExpandWidth(false) ) ) AddChildren();
					
					fileName = GUILayout.TextField(fileName);
					
					if (_moving)
						if (GUILayout.Button("←",GUILayout.ExpandWidth(false))){
							Node.Move( _node, GameObject.Find("Root") );
							_moving = false;
						}
					
					if ( GUILayout.Button( "Load", GUILayout.ExpandWidth(false) ) ){
						Server.StartCoroutine(DialogEditor.Load(fileName));
						input = null;
					}
					if ( GUILayout.Button( "Save", GUILayout.ExpandWidth(false) ) ){
						Server.StartCoroutine(DialogEditor.Save(_XML));
						input = null;
					}
					if ( GUILayout.Button( "Cancel", GUILayout.ExpandWidth(false) ) ){
						Destroy(GameObject.Find("Root"));
						input = null;
					}
					GUILayout.EndHorizontal();
					
					for (var child in GameObject.Find("Root").transform){
						var childType:Transform = child as Transform;
						childType.GetComponent(Node).NodeLine(0);
					}
					
	//				GUILayout.TextArea(_XML, GUILayout.ExpandWidth(true), GUILayout.ExpandHeight(true));
					
				}
			
			GUILayout.EndScrollView();	
			GUILayout.EndArea();
			
			GUILayout.BeginArea(MainGUI.Area._Menu);
			SP2 = GUILayout.BeginScrollView(SP2);
			
				if (_XML != null && _node != null){
					GUILayout.Label(_node.GetComponent(Node)._id);
					
					MoveButtons();
					
					GUILayout.Label("TEXT");
					_node.GetComponent(Node)._text = GUILayout.TextArea(_node.GetComponent(Node)._text, GUILayout.ExpandHeight(true));
					
					if ( GUILayout.Button("Scripts") ) _scripting = true;
					
				}
			
			GUILayout.EndScrollView();	
			GUILayout.EndArea();
		}
		
		function ScriptingMenu(){
			GUILayout.BeginArea(MainGUI.Area._Screen);
				GUILayout.Label("IF");
				_node.GetComponent(Node)._if = GUILayout.TextArea(_node.GetComponent(Node)._if, GUILayout.ExpandHeight(true));
				GUILayout.Label("THEN");
				_node.GetComponent(Node)._then = GUILayout.TextArea(_node.GetComponent(Node)._then, GUILayout.ExpandHeight(true));
				if ( GUILayout.Button("Close") ) _scripting = false;
			GUILayout.EndArea();
		}
		
		function MoveButtons(){
		
			GUILayout.BeginHorizontal();
			MoveUpButton();
			MoveButton();
			MoveDownButton();
			GUILayout.EndHorizontal();
			
			SwapButton();
			LinkButton();
		}
		
		function MoveUpButton(){
			if (int.Parse(_node.name) > 0)
				if ( GUILayout.Button( "↑", GUILayout.ExpandWidth(false) ) )
					Node.Swap(_node, _node.transform.parent.transform.FindChild( (int.Parse(_node.name) - 1).ToString() ).gameObject);
		}
		
		function MoveDownButton(){
			if (int.Parse(_node.name) < _node.transform.parent.transform.childCount -1 )
				if ( GUILayout.Button( "↓", GUILayout.ExpandWidth(false) ) )
					Node.Swap(_node, _node.transform.parent.transform.FindChild( (int.Parse(_node.name) + 1).ToString() ).gameObject);
		}
		
		function MoveButton(){
			if (_moving){
				if ( GUILayout.Button("Don't move") ){
					_moving = false;
				}
			}
			else{
				if ( GUILayout.Button( "Move to:" ) ){
					_linking = null;
					_swapping = false;
					_moving = true;
				}
			}
		}
		
		function SwapButton(){
			if (_swapping){
				if ( GUILayout.Button("Don't swap") ){
					_swapping = false;
				}
			}
			else{
				if ( GUILayout.Button( "Swap with:" ) ){
					_linking = null;
					_moving = false;
					_swapping = true;
				}
			}
		}
		
		function LinkButton(){
			if (_node.GetComponent(Node)._goTo != null){
				GUILayout.Label( "Linked to: " + _node.GetComponent(Node)._goTo.GetComponent(Node)._id );
				if ( GUILayout.Button("Unlink") )
					_node.GetComponent(Node)._goTo = null;
			}
			if (_linking == null){
				if ( GUILayout.Button("Link to:") ){
					_linking = _node;
					_moving = false;
					_swapping = false;
				}
			}
			else{
				if ( GUILayout.Button("Don't link") ){
					_linking = null;
				}
			}
		}
	}
}