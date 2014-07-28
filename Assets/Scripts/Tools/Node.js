#pragma strict
//import System.Collections.Generic;

public var _id		:String = "";
public var _if		:String = "";
public var _then	:String = "";
public var _goTo	:GameObject;
public var _text	:String = "";

public var _loadingGoTo:String;

private var showChildren:boolean = true;
private var _linkFound:boolean = false;
private var _showLink:boolean = true;

function Start(){
	if (name == "Node") name = (gameObject.transform.parent.transform.childCount - 1).ToString();
}

function Update () {
	
	// If the previous object is a node, we use it's Id to make ours
	if (transform.parent.GetComponent(Node))
		_id = transform.parent.GetComponent(Node)._id + "." + name;
	// Else we make our own, brand new root node
	else
		_id = name;
	
	// If we found a link to follow, we try to load it.
	FindLinks();
	// Clean the link if there target no longer exist
	if (!_goTo) _goTo = null;
	// But if it DOES exist, destroys all further nodes, as they make no sense.
	else  for (var child in transform) Destroy(child as GameObject);
	
	
}

function FixedUpdate(){
	// automatically moves upwards the nodes if someone is missing. This MUST be in FixedUpdate
	AutoSort();
}

// Serialize the data in our custom format, recursively
public function Data(indent:int):String{

	if ( gameObject.GetComponent(Node).enabled == false ) return "";
	
	var tabulation:String = "";
	for (var i:int = 0; i < indent; i++) tabulation = tabulation + "    ";
	
	//prepare the headers with the basic info
	var header:String = tabulation + "<n";
//	if (gameObject.GetComponent(Node)._id != "") header = header + " id=\"" + gameObject.GetComponent(Node)._id + "\""; // Uncomment this to add id th the data
	if (gameObject.GetComponent(Node)._goTo != null) header = header + " goTo=\"" + _goTo.GetComponent(Node)._id + "\"";
	header = header + ">";
	
	
	//serialize the scripting part of the data
	var script:String = "";
	
	if (gameObject.GetComponent(Node)._if != ""){
	
		script = script + "<if>";
		
		for (var _line in gameObject.GetComponent(Node)._if.Split("\n"[0]))
			script = script + "\n" + tabulation + "    " + _line;
			
		script = script + "\n</if>";
		}
	
	if (gameObject.GetComponent(Node)._then != ""){
	
		if (gameObject.GetComponent(Node)._if != "")
			script = script + "\n";
			
		script = script + "<then>";
		
		for (var _line in gameObject.GetComponent(Node)._then.Split("\n"[0]))
			script = script + "\n" + tabulation + "    " + _line;
			
		script = script + "\n</then>";
		}
	
	// attach the text to our header, trimmed, and the script if there is one
	var output:String = header + gameObject.GetComponent(Node)._text.Trim();
	if (script != "") output = output + script;
	
	// add the child node's data, if there is any, and close the node
	if (gameObject.transform.childCount > 0){
		output = output + "\n";
		for (var child in transform) {
			var childType:Transform = child as Transform;
			output = output + childType.GetComponent(Node).Data(indent + 1) + "\n";
		}
		return output + tabulation + "</n>";
	}
	else if (script != "")
		return output + "\n" + tabulation + "</n>";
	else
		return output + "</n>";
}

// Appends a node to this one
function AddChildren ():GameObject{
	var newNode = new GameObject();
		newNode.name = "Node";
		newNode.transform.parent = gameObject.transform;
		newNode.AddComponent(Node);
	return newNode;
}

// automatically moves upwards the nodes if someone is missing. This MUST be in FixedUpdate
function AutoSort(){
//	if ( name == "0" ) return;
	var childrens:int = gameObject.transform.parent.transform.childCount;
	var target:int;
	for (var i:int = 0; i < childrens; i++){
		if ( !gameObject.transform.parent.transform.FindChild( i.ToString() ) 
		&&
			 gameObject.transform.parent.transform.FindChild( (i - 1).ToString() )
			) target = i;
	}
	
	if ( !gameObject.transform.parent.transform.FindChild( target.ToString() ) )
	name = target.ToString();
	
}

static function Move(_target:GameObject, _destiny:GameObject){
	
	var newNode = new GameObject();
	newNode.name = _destiny.transform.childCount.ToString();
	newNode.transform.parent = _destiny.transform;
	newNode.AddComponent(Node);
	
	Swap(_target, newNode);
	Destroy(_target);
}

static function SwapLinks(_node:GameObject, _target:GameObject, _destiny:GameObject){
	
	if (_node.GetComponent(Node)._goTo == _target)
		_node.GetComponent(Node)._goTo = _destiny;
	else if (_node.GetComponent(Node)._goTo == _destiny)
		_node.GetComponent(Node)._goTo = _target;
	
	if (_node.transform.childCount > 0)
		for ( var _child in _node.transform ){
			var _childType:Transform = _child as Transform;
			SwapLinks(_childType.gameObject, _target, _destiny);
		}
}

static function Swap(_target:GameObject, _destiny:GameObject){
//	var holder:GameObject = new GameObject();
	var parents: Dictionary.<GameObject, GameObject> = new Dictionary.<GameObject, GameObject>();
	
	var _root:GameObject = GameObject.Find("Root");
	
	var _if		:String		= _target.GetComponent(Node)._if;
	var _then	:String		= _target.GetComponent(Node)._then;
	var _text	:String		= _target.GetComponent(Node)._text;
	var _goTo	:GameObject	= _target.GetComponent(Node)._goTo;
	
		for ( var _rootChild in _root.transform ){
			var _rootChildType:Transform = _rootChild as Transform;
			SwapLinks(_rootChildType.gameObject, _target, _destiny);
		}
		for ( var _destinyChild in _destiny.transform ){
			var _destinyChildType:Transform = _destinyChild as Transform;
			parents.Add(_destinyChildType.gameObject, _target);
		}
		for ( var _targetChild in _target.transform ){
			var _targetChildType:Transform = _targetChild as Transform;
			parents.Add(_targetChildType.gameObject, _destiny);
		}
		for (var _element in parents){
			_element.Key.transform.parent = _element.Value.transform;
		}
	
	_target.GetComponent(Node)._if		= _destiny.GetComponent(Node)._if;
	_target.GetComponent(Node)._then	= _destiny.GetComponent(Node)._then;
	_target.GetComponent(Node)._text	= _destiny.GetComponent(Node)._text;
	_target.GetComponent(Node)._goTo	= _destiny.GetComponent(Node)._goTo;
	
	_destiny.GetComponent(Node)._if		= _if;
	_destiny.GetComponent(Node)._then	= _then;
	_destiny.GetComponent(Node)._text	= _text;
	_destiny.GetComponent(Node)._goTo	= _goTo;
	
	_root.GetComponent(DialogEditor)._node = _destiny;
}

function FindLinks(){
	if (_loadingGoTo != null){
		var _nodeNames:Array = _loadingGoTo.Split("."[0]);
		var _target:GameObject = GameObject.Find("Root");
		
		for (var _node in _nodeNames){
			var _nodeType:String = _node as String;
			if (_target.transform.FindChild(_nodeType))
				if (_target.transform.FindChild(_nodeType).gameObject)
					_target = _target.transform.FindChild(_nodeType).gameObject;
		}
		
		if ( _target.GetComponent(Node) )
			if ( _target.GetComponent(Node)._id.Split("."[0]).Length == _loadingGoTo.Split("."[0]).Length ){
				_goTo = _target;
				_loadingGoTo = null;
			}
	}
}

static function Root():DialogEditor{
	return GameObject.Find("Root").GetComponent(DialogEditor);
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

// Write the GUI line to interact with the node, recursively
public function NodeLine(indent:int){

	if (gameObject.active){
		if ( _goTo != null ){
			if ( _id.Split("."[0]).Length %2 != 0 ){
				GUILayout.BeginHorizontal();
				Indent(indent);
				SpawnButtons();
				
				GUI.enabled = false;
				GUI.color.a = 2;
				GUI.contentColor = Color.magenta;
				GUILayout.TextField( _goTo.GetComponent(Node)._text.Trim() );
				GUI.contentColor = Color.white;
				GUI.color.a = 1;
				GUI.enabled = true;
				
				SelectButton();
				GUILayout.EndHorizontal();
			}
			else {
				GUILayout.BeginHorizontal();
				
				Indent(indent);
				SpawnButtons();
				toogleChildrensButton();
				
				TextField();
				
				SwapButton ();
				MoveButton ();
				LinkButton ();
				SelectButton();
				
				GUILayout.EndHorizontal();
				
				if (!_showLink) return;
				GUILayout.BeginHorizontal();
				Indent(indent + 1);
				GUI.enabled = false;
				GUI.color.a = 2;
				GUI.contentColor = Color.magenta;
				GUILayout.TextField( _goTo.GetComponent(Node)._text.Trim() );
				GUI.contentColor = Color.white;
				GUI.color.a = 1;
				GUI.enabled = true;
				
				var _label:String;
				if (_goTo.GetComponent(Node)._if != "" && _goTo.GetComponent(Node)._then != "") _label = "♫";
				else if (_goTo.GetComponent(Node)._if != "" || _goTo.GetComponent(Node)._then != "") _label = "♪";
				else _label = "○";
				
				if ( GUILayout.Button(_label, GUILayout.ExpandWidth(false)) ){
					if(Root()._node == _goTo)
						DialogEditor.QNGUI._scripting = true;
					else
						Root()._node = _goTo;
				}
				GUILayout.EndHorizontal();
				
			}
		}
		else {
			GUILayout.BeginHorizontal();
			
			Indent(indent);
			SpawnButtons();
			toogleChildrensButton();
			
			TextField();
			
			SwapButton ();
			MoveButton ();
			LinkButton ();
			SelectButton();
			
			GUILayout.EndHorizontal();
			
			if (gameObject.transform.childCount > 0){
				for (var child in transform){
					var childType:Transform = child as Transform;
					childType.GetComponent(Node).NodeLine(indent + 1);
				}
			}
		
		}
		
	}
	
}

function TextField(){
	if ( Root()._node == gameObject )
		GUI.contentColor = Color.green;
	else if ( _id.Split("."[0]).Length %2 == 0 )
		GUI.contentColor = Color.cyan;
	else
		GUI.contentColor = Color.yellow;
	
	if ( GUI.GetNameOfFocusedControl () == _id + ".focused" || GUI.GetNameOfFocusedControl () == _id + ".unfocused" ){
		GUI.SetNextControlName (_id + ".focused");
		gameObject.GetComponent(Node)._text = GUILayout.TextArea( gameObject.GetComponent(Node)._text, GUILayout.MinWidth(150) );
	}
	else{
		GUI.SetNextControlName (_id + ".unfocused");
		GUILayout.TextField( gameObject.GetComponent(Node)._text.Trim(), GUILayout.MinWidth(150) );
	}
	GUI.contentColor = Color.white;
}

function Indent(amount:int){
	for (var i:int = 0; i < amount; i++) GUILayout.Space(Screen.width * 0.05);
}

function SpawnButtons(){
	if ( GUILayout.Button("-", GUILayout.ExpandWidth(false)) ) Destroy(this.gameObject);
	if (_goTo != null) GUI.enabled = false;
	if ( GUILayout.Button("+", GUILayout.ExpandWidth(false)) ) AddChildren();
	GUI.enabled = true;
}

// Button to link and de-link a node from other
function LinkButton (){
	if (DialogEditor.QNGUI._linking != null){
		
		var _node:Node = Root()._node.GetComponent(Node);
		
		if (Root()._node == gameObject)
			return;
		if ( gameObject.GetComponent(Node)._id.Length > _node._id.Length )
			if ( gameObject.GetComponent(Node)._id.Substring(0, _node._id.Length) == _node._id )
				return;
		
		if ( GUILayout.Button( "←", GUILayout.ExpandWidth(false) ) ){
			DialogEditor.QNGUI._linking.GetComponent(Node)._goTo = this.gameObject;
			DialogEditor.QNGUI._linking = null;
		}
	}
}

// Button to Swap a node with other
function SwapButton (){

	if (Root().QNGUI._swapping){
		
		if (Root()._node == gameObject) return;
		
		if (GUILayout.Button("←",GUILayout.ExpandWidth(false))){
			Swap(Root()._node, gameObject);
			Root().QNGUI._swapping = false;
		}
	}
}

// Button to Move a node in other
function MoveButton (){
	if (Root().QNGUI._moving){
		
		var _node:Node = Root()._node.GetComponent(Node);
		
		if (Root()._node == gameObject)
			return;
		if ( gameObject.GetComponent(Node)._id.Length > _node._id.Length )
			if ( gameObject.GetComponent(Node)._id.Substring(0, _node._id.Length) == _node._id )
				return;
		
		
		if (GUILayout.Button("←",GUILayout.ExpandWidth(false))){
			Move( Root()._node, gameObject );
			Root().QNGUI._moving = false;
		}
	}
}

// Button to select a node
function SelectButton (){
	var _label:String;
	 
	if (_if != "" && _then != "") _label = "♫";
	else if (_if != "" || _then != "") _label = "♪";
	else _label = "○";
	
	if ( GUILayout.Button(_label, GUILayout.ExpandWidth(false)) ){
		if (Root()._node == this.gameObject)
			DialogEditor.QNGUI._scripting = true;
		else
			Root()._node = this.gameObject;
	}
}

// Buttons to hide childrens
function toogleChildrensButton(){
	if (transform.childCount > 0){
		if (showChildren == true){
			if ( GUILayout.Button("▼", GUILayout.ExpandWidth(false)) ){
				ToogleChildrens();
				showChildren = false;
			}
		}
		else{
			if ( GUILayout.Button("►", GUILayout.ExpandWidth(false)) ){
				ToogleChildrens();
				showChildren = true;
			}
		}
	}
	else if (gameObject.GetComponent(Node)._goTo != null){
		if (_showLink){
			if (GUILayout.Button( "▼", GUILayout.ExpandWidth(false) ) ) _showLink = false;
		}
		else{
			if (GUILayout.Button( "►", GUILayout.ExpandWidth(false) ) ) _showLink = true;
		}
	}
}
function ToogleChildrens(){
	for (var child in transform ){
		var childType:Transform = child as Transform;
		if (childType.gameObject.active) childType.gameObject.active = false;
		else childType.gameObject.active = true;
	}
}