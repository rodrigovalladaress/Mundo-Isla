#pragma strict
#pragma downcast
//////////////////////////////////////////////////////////////////
// Edited by Rodrigo Valladares Santana <rodriv_tf@hotmail.com> //
//                                                              //
// Version 2.1                                                  //
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
	static var hostData:HostData[];
	static var SecondsForTimeout:float = 5.0;
	static private var _gameType = "IslaSAVEH.Alpha";
	static private var _scriptsFolder:String = Application.dataPath + "/";
	// Instance used to access non static members from static methods, and starting coroutines
	private static var instance : Server;
	
	// If it's setted true, the changes in the skin of the player will be synced with the database.
	public var playerSkinPersistence : boolean;
	public static function IsPlayerSkinPersistence() : boolean {
		return instance.playerSkinPersistence;
	}
	
	// If it's setted true, the changes in the journal will be synced with the database.
	public var missionPersistence:boolean;
	public static function IsMissionPersistence():boolean {
		return instance.missionPersistence;
	}
	
	private static function ConnectToPhoton() {
		PhotonNetwork.ConnectUsingSettings("0.1");
	}
	
	//OnJoinedLobby or OnConnectedToMaster
	public static function CreateRoom(gameName:String, maxPlayers:int, isVisible:boolean, gameDescription:String) {
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
	
	function Awake() {
		instance = this;
	}
	
	/*******************************************************
	|	Actions taken when this script start
	*******************************************************/
	function Start() {
		
		if(!IsPlayerSkinPersistence()) {
			Debug.LogWarning("Player skin changes won't sync. Please set playerSkinPersistence true in Server.");
		}
		if(!IsMissionPersistence()) {
			Debug.LogWarning("Mission progresss won't sync. Please set missionPersistence true in Server.");
		}
		
		if(Application.isEditor) {
			Player.nickname = "Admin";
		} else {
			Player.nickname = "Admin_web";
		}
		ConnectToPhoton();
		StartCoroutine(Journal.RetrieveMissions());
		StartCoroutine(ItemManager.RetrieveItemInformation());
		StartCoroutine(Inventory.Retrieve());
		
		if(/*Application.isEditor*/true) {
			
			StartCoroutine(Player.RetrieveSkinString());
			// Wait until the skin of the player is downloaded
			while(Player.GetSkinString() == null) {
				yield;
			}
			MainGUI.Menu.SkinEditor.savedSkin = Player.GetSkinString();
			//Player.GetSkinString() = MainGUI.Menu.SkinEditor.savedSkin = "female|eyes|female_eyes_blue|face|female_face-1|hair|"
			//+ "female_hair-2_dark|pants|female_pants-2_black|shoes|female_shoes-1_blue|top|female_top-2_orange";
		    GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
			MainGUI.Menu.current = "Menu";
			MainGUI.Content.current = "";
		}
		
		StartCoroutine( Retrieve.TXT( "ServerOptions", Paths.GetConfigurationFromRoot() + "/" + "options" ) );
		//StartCoroutine(Retrieve.PlayerInventory());
		
		while (!Player.isPlaying()) yield;
		//Server.StartCoroutine( TrackInventory("item", Inventory.items) );
		//Server.StartCoroutine( TrackInventory("mission", Journal.missions) );
	}
	
	// State of the connection to Photon (debug)
	function OnGUI() {
		GUILayout.Label(PhotonNetwork.connectionStateDetailed.ToString());
		if(PhotonNetwork.room != null) {
			GUILayout.Label("Room name = " + PhotonNetwork.room.name);
			GUILayout.Label("Number of players = " + PhotonNetwork.room.playerCount);
			if(PhotonNetwork.room.customProperties != null) {
				GUILayout.Label("Description: " + PhotonNetwork.room.customProperties["gameDescription"]);
			}
		}
	}
	
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
		
	// Join a random room
	function OnJoinedLobby()
	{
    	//PhotonNetwork.JoinRandomRoom();
	}
	
	function OnPhotonRandomJoinFailed()
	{
    	Debug.Log("Can't join random room!");
    	//PhotonNetwork.CreateRoom(null);
	}
	
	function OnJoinedRoom() {
		Server.Log("server", Player.nickname + " connected.");
		if(!MainGUI.Menu.show && GameObject.Find(Player.nickname) == null) {
			Player.Spawn(Player.nickname, Player.GetSpawnPoint(), Player.GetSkinString());
		}
	}
	
	/******************************
	|	Multiplayer Login
	******************************/
	static function Login():IEnumerator{
		// Create a form object for sending data to the server
	    var form = new WWWForm();
	     // The name of the player
	    form.AddField( "user", Player.nickname.ToLower() );
	     // The password
	    form.AddField( "password", Player.password );
	
    	// Create a download object
        var download = new WWW( _scriptsFolder + "login.pl", form );
	
	    // Wait until the download is done
	    while (!download.isDone) yield;
		
	    if(download.error) {
	        print( "Error downloading: " + download.error );
	        return;
	    }
	    else{
	        // get the anwser, and act on it
	        if(download.text == "true"){
	        	MainGUI.Content.Login.wrong = false;
	        	Server.Log("server", "User logged in.");
	        	Server.StartCoroutine( Retrieve.PlayerSkin() );
	        	Server.StartCoroutine( Retrieve.PlayerInventory("item") );
	        	Server.StartCoroutine( Retrieve.PlayerInventory("mission") );
				MainGUI.Menu.current = "Menu";
				MainGUI.Content.current = "";
				download.Dispose();
			}
	        else {
	        	MainGUI.Content.Login.wrong = true;
	        	download.Dispose();
	        }
	    }
	    // Clean the password field
	    Player.password = "";
	}
	
	/*******************************************************
	|	Start and register a server
	*******************************************************/
	static function Host(maxPlayers:int, port:int, gameName:String, gameDescription:String){
			//Server.Log("server", "Starting Public Server... [MaxPlayers = " + maxPlayers + " Port = " + port + "]");
			//Network.InitializeServer(maxPlayers, port, !Network.HavePublicAddress());
			//MasterServer.RegisterHost(_gameType, gameName, gameDescription);
			ConnectToPhoton();
	}
	static function Host(maxPlayers:int, port:int){
			//Server.Log("server", "Starting Private Server... [MaxPlayers = " + maxPlayers + " Port = " + port + "]");
			//Network.InitializeServer(maxPlayers, port, !Network.HavePublicAddress());
			ConnectToPhoton();
	}
	static function Host(){
			//Server.Log("server", "Starting Offline Server...");
			//Network.InitializeServer(0, 0, false);
			ConnectToPhoton();
	}
	
	/*******************************************************
	|	Connect to a server directly
	*******************************************************/
	static function Connect(serverIP:String, port:String){
			Network.Connect(serverIP, port);
	}
	
	/*******************************************************
	|	Close all connections
	*******************************************************/
	static function Disconnect(){
		Network.Disconnect(200);
	    MasterServer.UnregisterHost();
	    MainGUI.Menu.current = "";
	    MainGUI.Content.current = "Login";
	    Application.LoadLevel("Main");
	}
	
	/*******************************************************
	|	Refresh the host list
	*******************************************************/
	static function RefreshHostList():IEnumerator{
		
		Server.Log("server", "Refreshing hosts...");
		var _time:float = Time.time;
		MasterServer.RequestHostList(_gameType);
		while ( MasterServer.PollHostList().Length <= 0 && (Time.time - _time) < SecondsForTimeout ) {
			yield;
		}
		Server.Log("server", "Servers found: " + MasterServer.PollHostList().Length);
		hostData = MasterServer.PollHostList();
		MasterServer.ClearHostList();
	}
	
	/*******************************************************
	|	Actions taken wen we start a server
	*******************************************************/
	/*function OnServerInitialized(){
		Server.Log("server", "Server initialized!");
		Player.Spawn(Player.nickname, Player.SpawnPoint(), Player.GetSkinString());
	}*/
	
	/*******************************************************
	|	Actions taken wen we connect to a server
	*******************************************************/
	/*function OnConnectedToServer(){
		Server.Log("server", Player.nickname + " connected.");
		Player.Spawn(Player.nickname, Player.SpawnPoint(), Player.GetSkinString());
	}*/
	
	/*******************************************************
	|	Actions taken wen a player connect
	*******************************************************/
	function OnPlayerConnected(player: NetworkPlayer) {
	    Server.Log("server", player + " connected.");
	}
	
	/*******************************************************
	|	Actions taken wen a player disconnect
	*******************************************************/
	function OnPlayerDisconnected(player: NetworkPlayer) {
	    Server.Log("server", player + " disconnected.");
	    Network.RemoveRPCs(player);
	    Network.DestroyPlayerObjects(player);
	}
	
	/*******************************************************
	|	Actions taken wen we are disconnected
	*******************************************************/
	function OnDisconnectedFromServer(info : NetworkDisconnection) {
	    if (Network.isServer) {
	        Server.Log("server", "Local server connection disconnected");
	    }
	    else {
	        if (info == NetworkDisconnection.LostConnection)
	            Server.Log("server", "Lost connection to the server");
	        else
	            Server.Log("server", "Successfully diconnected from the server");
	    }
	} 
	
	/*******************************************************
	|	Various server  messages
	*******************************************************/
	function OnMasterServerEvent(mse:MasterServerEvent){
		switch (mse){
		
		case MasterServerEvent.RegistrationSucceeded:
			Server.Log("server", "Server registrated!");
			break;
			
		case MasterServerEvent.RegistrationFailedNoServer:
			Server.Log("server", "Server registration failed: No server initialized.");
			break;
			
		case MasterServerEvent.RegistrationFailedGameType:
			Server.Log("server", "Server registration failed: Invalid game type.");
			break;
			
		case MasterServerEvent.RegistrationFailedGameName:
			Server.Log("server", "Server registration failed: Invalid game name.");
			break;
		}
	}
	/*******************************************************
	|	
	|	Server utilities
	|	
	*******************************************************/
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
	|	Save to database, delayed
	******************************/
	
	/*static function TrackInventory( type:String, list:Dictionary.<String, int> ):IEnumerator {
		Server.Retrieve.PlayerInventory( type, list );
		yield WaitForSeconds(saveDelay);
		Server.StartCoroutine( TrackInventory(type, list) );
	}*/
	
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
		function TXT(scriptTarget:String, path:String):IEnumerator{
		
			var file:String = Paths.GetLocalHost() + "/" + path + ".txt";
			
			// Downloads the TXT file and waits until it has finished download
			var www:WWW = new WWW(file);
			while (!www.isDone) yield;
			
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
						
					case "ScriptsFolder":
						Server._scriptsFolder = Line.Split("|"[0])[1].Trim() + "/";
						break;
						
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
		function ItemTexture(textureName:String){
			var file:String = Paths.GetTextures() + "/" + EscapePath(textureName) + ".png";;		    
			var www:WWW = new WWW(file);
			var image:Texture2D = new Texture2D(64, 64);
			
			while (!www.isDone) yield;
			
			if (!www.error){
				www.LoadImageIntoTexture(image);
				Inventory.textures[textureName] = image;
			}
			www.Dispose();	
		}
		/******************************
		|	Player Skin Retrieving
		******************************/
		function PlayerSkin(){
		
			if(true) {//Application.isEditor){
				// Override
				Server.Log("server", "Editor mode, overriding skin.");
				Player.SetSkinString("");
				GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
			}
			else if (Application.isWebPlayer) {
				// Create a form object for sending data to the server
			    var form = new WWWForm();
			     // The name of the player
			    form.AddField( "user", Player.nickname.ToLower() );
			
		    	// Create a download object
		        var download = new WWW( _scriptsFolder + "getSkin.pl", form );
			
			    // Wait until the download is done
			    while (!download.isDone) yield;
				
			    if(download.error) {
			        print( "Error downloading: " + download.error );
			        Player.SetSkinString("");
			        MainGUI.Menu.SkinEditor.savedSkin = "";
					GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
			        download.Dispose();
			        return;
			    }
			    else{
			        // get the anwser, and act on it
			        Player.SetSkinString(download.text);
			        MainGUI.Menu.SkinEditor.savedSkin = download.text;
					GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
			        download.Dispose();
			    }
			}
		}
		
		function PlayerSkin(_skin:String){
		
			if(/*Application.isEditor*/true){
				// Override
				Server.Log("server", "Editor mode, overriding skin.");
				Player.SetSkinString(_skin);
				GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
			}
			else if (Application.isWebPlayer) {
				// Create a form object for sending data to the server
			    var form = new WWWForm();
			     // The name of the player
			    form.AddField( "user", Player.nickname.ToLower() );
			    form.AddField( "skin", _skin );
			
		    	// Create a download object
		        var download = new WWW( _scriptsFolder + "getSkin.pl", form );
			
			    // Wait until the download is done
			    while (!download.isDone) yield;
				
			    if(download.error) {
			        print( "Error downloading: " + download.error );
			        Player.SetSkinString("");
					GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
			        download.Dispose();
			        return;
			    }
			    else{
			        // get the anwser, and act on it
			        Player.SetSkinString(download.text);
					GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
			        download.Dispose();
			    }
			    
			}
		}
		/******************************
		|	Player Inventory Retrieving
		******************************/
		
		
		function PlayerInventory( type:String ){
		
			if(/*Application.isEditor*/true){
				// Override
				Server.Log("server", "Editor mode, overriding inventory.");
			}
			else if (Application.isWebPlayer) {
				// Create a form object for sending data to the server
			    var form = new WWWForm();
			     // The name of the player
			    form.AddField( "user", Player.nickname.ToLower() );
			    form.AddField( "type", type );
			
		    	// Create a download object
		        var download = new WWW( _scriptsFolder + "getItem.pl", form );
			
			    // Wait until the download is done
			    while (!download.isDone) yield;
				
			    if(download.error) {
			        print( "Error downloading: " + download.error );
			        download.Dispose();
			        return;
			    }
			    else{
			        // get the anwser, and act on it
			        for (var line:String in download.text.Trim().Split("\n"[0])){
			        	switch (type){
			        	case "item":
				        	Inventory.AddItem( line.Split("|"[0])[0], int.Parse(line.Split("|"[0])[1]) );
				        	break;
			        	case "mission":
			        	
			        		Debug.Log("Server set miiiiiiiiiiiiiiisssssssssssssssssssssssion");
			        	
				        	Journal.SetMissionAndSync( line.Split("|"[0])[0], line.Split("|"[0])[1] );
				        	break;
			        	}
			        }
			        download.Dispose();
			    }
			    
			}
			
		}
		
		// Se manda al servidor la cantidad de items que tiene el jugador
		/*function PlayerInventory( type:String, name:String, amount:String ){
		
			if (Application.isWebPlayer) {
				// Create a form object for sending data to the server
			    var form = new WWWForm();
			     // The name of the player
			    form.AddField( "user", Player.nickname.ToLower() );
			    form.AddField( "type", type );
			    form.AddField( "name", name );
			    
			    if (type == "item"){
				    if (int.Parse(amount) > 0)
				    	form.AddField( "value", amount );
				    else
				    	form.AddField( "value", "delete" );
				}
				else{
					form.AddField( "value", amount );
				}
		    	// Create a download object
		        var download = new WWW( _scriptsFolder + "getItem.pl", form );
			
			    // Wait until the download is done
			    while (!download.isDone) yield;
				
			    if(download.error) Debug.Log( "Error downloading: " + download.error );
			    download.Dispose();
			}
			
		}*/
		
		// Por cada tipo de elemento en el inventario del jugador, se llama al PlayerInventory de arriba
		/*function PlayerInventory( type:String, list:Dictionary.<String, int> ){
		
			if (Application.isWebPlayer) {
				for (var instance in list){
					Server.StartCoroutine( Server.Retrieve.PlayerInventory( type, instance.Key.ToString(), instance.Value.ToString() ) );
				}
			}
			if (type == "item"){
			
				var tempList:Dictionary.<String, int> = list;
				for (item in tempList){
					if ( item.Value <= 0 ){
						list.Remove(item.Key);
					}
				}
				
			}
			
		}*/
		
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
			Debug.Log(header + _message);
		}
	}
	
	static var Header = function(_string:String):String{
		return "[" + Server.Retrieve.CurrentTime("time") + "]" + "[" + _string.ToUpper() + "] " as String;
	};

}