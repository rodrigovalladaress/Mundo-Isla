#pragma strict
#pragma downcast
//////////////////////////////////////////////////////////////////
// Edited by Rodrigo Valladares Santana <rodriv_tf@hotmail.com> //
//                                                              //
// Version 2.2                                                  //
//                                                              //
// Changes in 2.2 version:                                      //
// 	-	Login													//
//	-	Creating and joining rooms through Photon				//
//	-	Photon messages
//                                                              //
// Changes in 2.1 version:                                      //
// 	-	File retrieving using local server						//
//                                                              //
// Changes in 2.0 version:                                      //
// 	- 	Connection to Photon in Start()                         //
//	-	OnGUI shows the connection state to Photon (debug)      //
//	- 	Connection to a random room                             //
//	-	Server Log is printed to a server file					//
//                                                              //
//////////////////////////////////////////////////////////////////
/*******************************************************
|	Server Script
|
|	This script provide functions to manage networking
|
|	Versión: 		1.0
|	
|	Autor: Manlio Joaquín García González 
|			<manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
class Server extends Photon.MonoBehaviour {
	static var session:String;
	static var saveDelay:float = 30.0;
	static var SecondsForTimeout:float = 5.0;
	static private var _gameType = "IslaSAVEH.Alpha";
	
	// Instance used to access non static members from static methods
	private static var instance : Server;
	
	// instance initialization
	function Awake() {
		instance = this;
	}
	
	// If setted true, the GUI shows some information of the connection to Photon
	public var showDebugInformationOnGUI:boolean;
	
	// If it's setted true, the changes in the skin of the player will be synced 
	// with the database.
	public var playerSkinPersistence:boolean;
	public static function IsPlayerSkinPersistence() : boolean {
		return instance.playerSkinPersistence;
	}
	
	// If it's setted true, the changes in the journal will be synced with the 
	// database.
	public var missionPersistence:boolean;
	public static function IsMissionPersistence():boolean {
		return instance.missionPersistence;
	}
	
	public var showLogin:boolean;
	public static function IsShowLogin():boolean {
		return instance.showLogin;
	}
	
	private static function ConnectToPhoton() {
		PhotonNetwork.ConnectUsingSettings("0.1");
	}
	
	
	/*******************************************************
	|	Room management
	*******************************************************/
	public static function CreateRoom(gameName:String, maxPlayers:int, isVisible:boolean, 
										gameDescription:String) {
		var hash:ExitGames.Client.Photon.Hashtable = new ExitGames.Client.Photon.Hashtable();
		hash.Add("gameDescription", gameDescription);
		PhotonNetwork.CreateRoom(gameName, isVisible, true, maxPlayers, hash, null);
	}
	
	public static function CreateOrJoinRandomRoom() {
		if(PhotonNetwork.GetRoomList().Length > 0) {
			PhotonNetwork.JoinRandomRoom();
		} else {
			PhotonNetwork.CreateRoom(null);
		}
	}
	
	public static function JoinRoom(roomName:String) {
		PhotonNetwork.JoinRoom(roomName);
	}
	
	/*******************************************************
	|	Actions taken when this script start
	*******************************************************/
	// Connection to Photon and ServerOptions retrieving
	function Start() {
		
		if(!IsPlayerSkinPersistence()) {
			Debug.LogWarning("Player skin changes won't sync. Please set playerSkinPersistence true in Server.");
		}
		if(!IsMissionPersistence()) {
			Debug.LogWarning("Mission progresss won't sync. Please set missionPersistence true in Server.");
		}
		LevelManager.mainCamera = Camera.main.gameObject;
		ConnectToPhoton();
		if(Application.isEditor) {
			Player.SetNickname("Admin");
			if(!IsShowLogin()) {
				MainGUI.Menu.current = "Menu";
				MainGUI.Content.current = "";
				Server.StartCoroutine(Journal.RetrieveMissions());
				Server.StartCoroutine(ItemManager.RetrieveItemInformation());
				Server.StartCoroutine(Inventory.Retrieve());
				StartCoroutine(Player.RetrieveSkinString());
				// Wait until the skin of the player is downloaded
				while(Player.GetSkinString() == null) {
					yield;
				}
				// Wait for connection to Photon if we weren't connected yet.
				while(!PhotonNetwork.connectedAndReady) {
					yield;
				}
				MainGUI.Menu.SkinEditor.savedSkin = Player.GetSkinString();
				// Show player skin next to the GUI menu
		   		GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
				
			}
		} else {
			Player.SetNickname("");
		}
				
		StartCoroutine( Retrieve.TXT( "ServerOptions", Paths.GetConfigurationFromRoot() + "/" + "options" ) );
		
		while (!Player.isPlaying()) yield;
	}
	
	
	
	/******************************
	|	Multiplayer Login
	******************************/
	static function Login():IEnumerator{	
    	// Create a download object
    	var url:String = Paths.GetPlayerQuery() + "/login.php/?player=" + Player.GetNickname() 
    						+ "&password=" + Player.password;
    	var www:WWW = new WWW(url);
	    // Wait until the download is done
	    while (!www.isDone) {
	    	yield;
		}
		
	    if(www.error) {
	        print( "Error downloading: " + www.error );
	        return;
	    }
	    else{
	        // get the anwser, and act on it
	        if(www.text.Equals("true")) {
	        	MainGUI.Content.Login.wrong = false;
	        	Server.Log("server", "User logged in.");
	        	Server.StartCoroutine(Journal.RetrieveMissions());
				Server.StartCoroutine(ItemManager.RetrieveItemInformation());
				Server.StartCoroutine(Inventory.Retrieve());
				StartCoroutine(Player.RetrieveSkinString());
				// Wait until the skin of the player is downloaded
				while(Player.GetSkinString() == null) {
					yield;
				}
				// Wait for connection to Photon if we weren't connected yet.
				while(!PhotonNetwork.connectedAndReady) {
					yield;
				}
				MainGUI.Menu.SkinEditor.savedSkin = Player.GetSkinString();
				// Show player skin next to the GUI menu
		   		GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
				MainGUI.Menu.current = "Menu";
				MainGUI.Content.current = "";
			}
	        else if(www.text.Equals("false")) {
	        	MainGUI.Content.Login.wrong = true;
	        } else if(www.text.Equals("connected")) {
	        	MainGUI.Content.Login.wrong = true;
	        	Debug.LogError(Player.GetNickname() + " is already connected.");
	        } else {
	        	Debug.LogError("Error in player login = " + www.text);
	        }
	    }
	    www.Dispose();
	    // Clean the password field
	    Player.password = "";
	}
	
	/*******************************************************
	|	Close all connections
	*******************************************************/
	static function Disconnect(){
	    MainGUI.Menu.current = "";
	    MainGUI.Content.current = "Login";
	    PhotonNetwork.LeaveRoom();
	    LevelManager.LoadLevel("Main");
	}
	
	/*******************************************************
	|	
	|	Server utilities
	|	
	*******************************************************/
	/******************************
	|	Escaping paths for URLs
	******************************/
	// This is used to escape urls like "Thiago, el Pirata"
	public static function EscapePath(path : String) : String {
		var slashPosition = path.LastIndexOf("/") + 1;
		var firstPart : String;
		var lastPart : String;
		if(slashPosition >= 0) {
			firstPart = path.Substring(0, slashPosition);
			// Error -> WWW.EscapeURL doesn't escape well the space
			lastPart = path.Substring(slashPosition).Replace(" ", "%20");
			return firstPart + lastPart;
		} else {
			return path.Replace(" ", "%20");
		}
	}
	/******************************
	|	Sync objects across network
	******************************/
	@RPC
	function SyncObject(_networkviewid:String, _class:String, _string:String){
	
		var _items:GameObject[] = GameObject.FindGameObjectsWithTag("Item");
		var _players:GameObject[] = GameObject.FindGameObjectsWithTag("Player");
		var _target:GameObject;
		
		switch (_class){
		
		/*******************************************************
		|	add the item, to everyone
		*******************************************************/
		case "item":
			Inventory.AddItem( _string.Split("|"[0])[0], int.Parse(_string.Split("|"[0])[1]) );
			break;
			
		/*******************************************************
		|	set the mission, to everyone
		*******************************************************/
		case "mission":
			if (_string.Split("|"[0]).Length > 1){
				if (_string.Split("|"[0])[1] != "delete" )
					Journal.SetMissionAndSync( _string.Split("|"[0])[0], _string.Split("|"[0])[1] );
				else
					Journal.DelMission( _string.Split("|"[0])[0] );
			}
			else{
				Journal.UpdateMission( _string );
			}
			break;
			
		/*******************************************************
		|	sets the item name, locally and remotelly
		*******************************************************/
		case "drop":
			for (_item in _items)
				if (_item.GetComponent(PhotonView).viewID.ToString() == _networkviewid)
					_target = _item;
			_target.name = _string;
			_target.GetComponent(Item).enabled = true;
			break;
			
		/*******************************************************
		|	sets the player name, locally and remotelly
		*******************************************************/
		case "playerName":
			for (_player in _players)
				if (_player.GetComponent(PhotonView).viewID.ToString() == _networkviewid)
					_target = _player;
			if(_target != null) {
				_target.name = _string;
			}
			break;
			
		/*******************************************************
		|	sets the player skin, locally and remotelly
		*******************************************************/
		case "playerSkin":
			for (_player in _players)
				if (_player.GetComponent(PhotonView).viewID.ToString() == _networkviewid)
					_target = _player;
			// Initializes the CharacterGenerator and load a saved config if any.
			var generator:CharacterGenerator;
			var go:boolean = false;
		
			// Destroys the character viewer from the main camera
			if (GameObject.Find("Constructor")) GameObject.Destroy(GameObject.Find("Constructor"));
		    
			// Waits until it is ready
			while ( go == false ){
				yield;
				if (CharacterGenerator.ReadyToUse){
					if (_string != "")
				        generator = CharacterGenerator.CreateWithConfig(_string);
				    else
				        generator = CharacterGenerator.CreateWithRandomConfig("Female");
				    if (generator.ConfigReady){
				    	go = true;
				    }
				}
			}
			// Creates a Game Object named "Skin", sets is as the script's owner child,
			// moves it to the owner's location
		    var localSkin:GameObject = generator.Generate();
		    localSkin.AddComponent("SkinAnimator");
//			localSkin.AddComponent(NetworkView);
			localSkin.name = "Skin";
			if(_target != null) {
				localSkin.transform.parent = _target.transform;
				localSkin.transform.rotation = _target.transform.rotation;
			}
			localSkin.transform.localPosition = Vector3(0, -0.57, 0);
			localSkin.transform.localScale = Vector3.one;
		    localSkin.animation.Play("idle1");
		    localSkin.animation["idle1"].wrapMode = WrapMode.Loop;
		    GameObject.Destroy(_target.transform.FindChild("Particle System").gameObject);
			break;
			
		/*******************************************************
		|	Update the chat
		*******************************************************/
		case "chat":
			if (Chat.Text == "") Chat.Text = _string;
			else Chat.Text = Chat.Text + "\n" + _string;
			MainGUI.ChatInterface.SP.y = MainGUI.ChatInterface.SP.y + 15;
			break;
		}
		
	}
	/******************************
	|	Holder elements
	******************************/
	public static function GetPhotonView() : PhotonView {
		return GameObject.Find("GameManager").GetComponent("PhotonView") as PhotonView;
	}
	
	static function _gameObject():GameObject {
		return GameObject.Find("GameManager");
	}
	
	static function _transform():Transform {
		return GameObject.Find("GameManager").transform;
	}
	
	/******************************
	|	Start Coroutines
	******************************/
	static function StartCoroutine(_function:IEnumerator){
		GameObject.Find("GameManager").GetComponent(MonoBehaviour).StartCoroutine(_function);
	}
	
	/******************************
	|	Retrieve Elements
	******************************/
	static class Retrieve{
		/******************************
		|	Date retrieving
		******************************/
		function CurrentTime():String{
			return System.DateTime.Now.ToString("yyyy-MM-dd")+ " " + System.DateTime.Now.ToString("hh:mm:ss");
		}
		function CurrentTime(option:String):String{
			if (option == "all") {
				return System.DateTime.Now.ToString("yyyy-MM-dd")+ " " + System.DateTime.Now.ToString("hh:mm:ss");
			}
			else if(option == "time") {
				return System.DateTime.Now.ToString("hh:mm:ss");
			}
			else if(option == "date") {
				return System.DateTime.Now.ToString("yyyy-MM-dd");
			}
			else { 
				Debug.LogError("Unknow option \"" + option + "\"");
			}
			return;
		}
		/******************************
		|	XML retrieving
		******************************/		
		function XML(scriptTarget:String, path:String):IEnumerator{
			var file:String = Paths.GetLocalHost() + "/" + EscapePath(path) + ".xml";
			var XML:XMLParser = new XMLParser();
		    
			// Downloads the XML file and waits until it has finished download
			var www:WWW = new WWW(file);
			while (!www.isDone) yield;
			
			// we create a new empty string
			var newString:String = "";
			// we get an array of all the lines
			var lines:String[] = www.text.Split("\n"[0]);
			www.Dispose();
			// then we clean each one, and add it to the new string
			for (var line:String in lines) newString = newString + line.Trim("\t"[0]);
			// and define the parsed result as our output
			var output:XMLNode = XML.Parse(newString);
			
			switch (scriptTarget){
				case "Dialog":
					Dialog.input = Dialog.node = output;
					Dialog.AutoTakeNode();
					MainGUI.DialogInterface.show = true;
					break;
				case "DialogEditor":
					DialogEditor.input = output;
					break;
			}
		}
		/******************************
		|	TXT retrieving
		******************************/
		function TXT(scriptTarget:String, path:String):IEnumerator {
		
			var file:String = Paths.GetLocalHost() + "/" + EscapePath(path) + ".txt";
			
			// Downloads the TXT file and waits until it has finished download
			var www:WWW = new WWW(file);
			while (!www.isDone) yield;
			
			Debug.Log(file);
			
			// we create a new empty string
			var newString:String = "";
			// we get an array of all the lines
			var output:String = www.text;
			www.Dispose();
			
			switch (scriptTarget){
			
				case "ServerOptions":
					var Lines:String[] = output.Split(";"[0]);
					for (var i:int = 0; i > Lines.Length; i++)
						Lines[i] = Lines[i].Trim();
					
					for (var Line:String in Lines){
						
						switch( Line.Split("|"[0])[0].Trim() ){
						
							case "NatFacilitatorIp":
								Network.natFacilitatorIP = Line.Split("|"[0])[1].Trim().Split(":"[0])[0];
								Network.natFacilitatorPort = int.Parse(Line.Split("|"[0])[1].Trim().Split(":"[0])[1]);
								break;
								
							case "MasterServerIp":
								MasterServer.ipAddress = Line.Split("|"[0])[1].Trim().Split(":"[0])[0];
								MasterServer.port = int.Parse(Line.Split("|"[0])[1].Trim().Split(":"[0])[1]);
								break;
								
							case "Language":
								Server.StartCoroutine( MainGUI.SetLanguage( Line.Split("|"[0])[1].Trim() ) );
								break;
								
							/*case "ScriptsFolder":
								Server._scriptsFolder = Line.Split("|"[0])[1].Trim() + "/";
								break;*/
								
							case "DialogsFolder":
								Dialog.folder = Line.Split("|"[0])[1].Trim() + "/";
								break;
								
							case "MissionDescFolder":
								MainGUI.missionDescFolder = Line.Split("|"[0])[1].Trim() + "/";
								break;
								
							case "Session":
								Server.session = Line.Split("|"[0])[1].Trim();
								break;
								
							case "SaveDelay":
								Server.saveDelay = float.Parse( Line.Split("|"[0])[1].Trim() );
								break;
						}
						
					}
					if (!session) session = "";
					break;
					
				case "JournalInterface":
					MainGUI.JournalInterface.description = output;
					break;
					
				case "SetLanguage":
					MainGUI._languageFile = output.Split(";"[0]);
					break;
			}
		}
		/******************************
		|	Texture retrieving
		******************************/
		function ItemTexture(textureName:String):IEnumerator{
			var file:String = Paths.GetTextures() + "/" + EscapePath(textureName) + ".png";;		    
			var www:WWW = new WWW(file);
			var image:Texture2D = new Texture2D(64, 64);
			
			while (!www.isDone) yield;
			
			if (!www.error){
				www.LoadImageIntoTexture(image);
				Inventory.textures[textureName] = image;
			} else {
				Debug.LogError("Error downlading " + textureName + " texture.");
			}
			www.Dispose();	
		}
		
	}
	
	/******************************
	|	Messages
	******************************/
	function OnJoinedLobby()
	{
    	Server.Log("server", Player.GetNickname() + " joined lobby");
	}
	
	function OnPhotonPlayerConnected(newPlayer:PhotonPlayer) {
		Server.Log("server", Player.GetNickname() + " connected.");
	}
	
	function OnJoinedRoom() {
		Server.Log("server", Player.GetNickname() + " joined room.");
		var canInstantiate:boolean = false;
		if(!MainGUI.Menu.show && GameObject.Find(Player.GetNickname()) == null) {
			Player.Spawn(Player.GetNickname(), Player.GetSpawnPoint(), Player.GetSkinString());
		} else {
			Debug.LogError(Player.GetNickname() + " couldn't be instantiated.");
			Server.Log("error", Player.GetNickname() + " couldn't be instantiated.");
		}
	}
	
	function OnLeftLobby() {
		Server.Log("server", Player.GetNickname() + " left lobby");
	}
	
	function OnDisconnectedFromPhoton() {
		Server.Log("server", Player.GetNickname() + " has disconnected.");
	}
	
	/******************************
	|	Error messages
	******************************/
	function OnPhotonRandomJoinFailed()
	{
    	Debug.LogError("Can't join random room! Maybe all rooms are full or there are no rooms available.");
	}
	
	function OnPhotonCreateRoomFailed() {
		Server.Log("error", Player.GetNickname() + " couldn't create room. The room already exists?");
	}
	
	function OnPhotonJoinRoomFailed() {
		Server.Log("error", Player.GetNickname() + " couldn't join a room. Does the room exists? Is it full?");
	}
	
	function OnConnectionFail(cause:DisconnectCause) {
		Server.Log("error", Player.GetNickname() + " has lost connection to Photon (" + cause.ToString + ")");
	}
	
	function OnFailedToConnectToPhoton(cause:DisconnectCause) {
		Server.Log("error", Player.GetNickname() + " couldn't connect to Photon (" + cause.ToString + ")");
	}
	
	/******************************
	|	Server log management
	******************************/
	static function WaitForWWW(www : WWW): IEnumerator {
		yield www;
		www.Dispose();
	}
	
	static function Log(_type:String, _message:String) {
		var header : String = Header(_type);
	    var stringURL : String = Paths.GetServerLog() + "/writeLog.php/?header=" + WWW.EscapeURL(header)
	      	+ "&log=" + WWW.EscapeURL(_message);
	    var www : WWW = new WWW(stringURL);
		Server.StartCoroutine(WaitForWWW(www));
		if(Application.isEditor) {
			if(_type.ToLower().Equals("error")) {
				Debug.LogError(header + _message);
			} else if(_type.ToLower().Equals("warning")) {
				Debug.LogWarning(header + _message);
			} else {
				Debug.Log(header + _message);
			}
		}
	}
	
	static var Header = function(_string:String):String{
		return "[" + Server.Retrieve.CurrentTime("time") + "]" + "[" + _string.ToUpper() + "] " as String;
	};
	
	/******************************
	|	GUI (debugging)
	******************************/
	function OnGUI() {
		if(showDebugInformationOnGUI) {
			GUILayout.Label(PhotonNetwork.connectionStateDetailed.ToString());
			if(PhotonNetwork.room != null) {
				GUILayout.Label("Room name = " + PhotonNetwork.room.name);
				GUILayout.Label("Number of players = " + PhotonNetwork.room.playerCount);
				if(PhotonNetwork.room.customProperties != null) {
					GUILayout.Label("Description: " + PhotonNetwork.room.customProperties["gameDescription"]);
				}
			}
		}
	}

}