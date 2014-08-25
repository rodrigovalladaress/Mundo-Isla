// Edited by Rodrigo Valladares Santana
// Version: 1.1
// Changes of 1.1 version:
//	-	Room finding and creation by Photon.
///*******************************************************
//|	Menu GUI Script
//|
//|	This script draws all the inputs of the GUI.
//|	Versión: 1.0
//|	
//|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
//|
//|	Proyecto SAVEH
//*******************************************************/
#pragma strict
class MainGUI extends MonoBehaviour {
	
	// Audio clip that's played when a player gets an item from the floor
	public var _dropItemAudioClip:AudioClip;
	
	static var lastScreenSize:Vector2 = new Vector2(0,0);
	static private var _textDictionary:Dictionary.<String,String> = new Dictionary.<String, String>();
	
	static var _languageFile:String[];
	static var missionDescFolder:String = "Texts/MissionDesc/";
	function Start() {
		
//		SetDefaults();
		// We define the area to draw the menus
		
		Area.Reload();

		// Spawning the player in Main when we are entering from other level
		if(!Menu.show && GameObject.Find(Player.GetNickname()) == null) {
			Player.Spawn(Player.GetNickname(), Player.GetSpawnPoint(LevelManager.GetCurrentScene()), Player.GetSkinString());
		}
	}
	
	function OnGUI() {
	
		GUI.skin = Resources.Load("Skin") as GUISkin;
		GUI.depth = 0;
		
		// check the screen size...
		// var screenSize:Vector2 = new Vector2(Camera.current.GetScreenWidth(), Camera.current.GetScreenHeight());
		var screenSize:Vector2 = new Vector2(Screen.width, Screen.height);
		// and reconfigure the areas if it changed.
		if(this.lastScreenSize != screenSize) Area.Reload();
		
		Tutorial.Box(Area._Tutorial);
		
		if(GameObject.Find("Root")) {
			return;
		}
		if (Menu.show){
			Menu.Box();
			Content.Box();
		}
		else if (DialogInterface.show){
			DialogInterface.Box(Area._CenterDown, Area._CenterUp);
		}
		else if (JournalInterface.show){
			JournalInterface.Box(Area._Menu, Area._Content);
		}
		else{
			
			InventoryInterface.Box(Area._List);
			
			MainToolbar.Box(Area._MainToolbar);
			
			ChatInterface.Box(Area._Chat);
		}
	}
	
	static function Text(_key:String):String{
		if ( _textDictionary.ContainsKey(_key) ) return _textDictionary[_key] as String;
		else return _key as String;
	}
	
	static function SetLanguage( _file : String ){
		Server.StartCoroutine( Server.Retrieve.TXT( "SetLanguage", Paths.GetLanguageFromRoot() + "/" + _file ) );
		
		while ( !_languageFile ) yield;
		
		for (var line:String in _languageFile)
			if (line != "")
				if (line.Split("|"[0]).Length == 2)
					_textDictionary[ line.Split("|"[0] )[0].Trim() ] = line.Split("|"[0] )[1].Trim();
		
		_languageFile = null;
	}
	
	static class Menu{
		var windowID : int = 0;
		var show : boolean = true;
		var current : String = "";
		var rect : Rect = Area._Menu;
		
		function Box(){
			if (current != "" && show == true)
			GUILayout.Window ( windowID, rect, Window, Text(current) );
		}
		
		function Toogle(){
			if(show == true) {
				current = "Menu";
				Content.current = "";
				show = false;
			}
			else show = true;
		}
		
		function Window(windowID : int){
			rect = Area._Menu;
			switch (current){
			
				case "Menu":
					if (Network.isClient || Network.isServer) rect = Area._Center;
					else rect = Area._Menu;
					Main.Box();
					break;
					
				case "Multiplayer":
					Multiplayer.Box();
					break;
					
				case "SkinEditor":
					SkinEditor.Box();
					break;
					
				default:
					
					break;
					
					
			}
		}
		
		static class Main{
			
			function Box(){
				// Menu elements always shown
				
				// Menu elements shown only when we are not in play
				if(/*!Player.isPlaying()*/true){
					
					GUILayout.FlexibleSpace();
					GUILayout.FlexibleSpace();
					MenuSwitch(Text("Customization"), "SkinEditor");
					GUILayout.FlexibleSpace();
					// TODO if (Player.GetNickname() == "Admin"){
					
					GUILayout.FlexibleSpace();
					if (GUILayout.Button( Text("Play") )){
						//Server.Host();
						// TODO Crear o unirse a la sala que el jugador tiene en 
						// la base de datos
						Server.CreateOrJoinRandomRoom();
						Toogle();
					}
					GUILayout.FlexibleSpace();
						
						//MenuSwitch(Text("Multiplayer"), "Multiplayer");
					// }
					GUILayout.FlexibleSpace();
					GUILayout.FlexibleSpace();
					GUILayout.FlexibleSpace();
					GUILayout.FlexibleSpace();
					GUILayout.FlexibleSpace();
				}
				
				// Menu elements shown only when we are in play
				else{
					
					FullScreen();
					
					// If we are in play, we may add a button to disconnect
					// and a button to close the menu at the bottom
					GUILayout.FlexibleSpace();
					if(GUILayout.Button( Text("Disconnect") ))	Server.Disconnect();
					if(GUILayout.Button( Text("Close") )) Toogle();
				}
			}
		
			function FullScreen(){
				if(GUILayout.Button( Text("Toogle Fullscreen") )){
					if (Screen.fullScreen == true){
						Screen.fullScreen = false;
						Screen.SetResolution(760,600,false);
						Minimap.Relocate( Player.object );
					}
					else{
						Screen.fullScreen = true;
						Screen.SetResolution ( Screen.currentResolution.width, Screen.currentResolution.height, true );
						Minimap.Relocate( Player.object );
					}
				}
			}
			
		}
		
		static class Multiplayer{
		
			function Box(){
				GUILayout.FlexibleSpace();
				GUILayout.FlexibleSpace();
				ContentSwitch( Text("Host room"), "Host" );
				GUILayout.FlexibleSpace();
				ContentSwitch( Text("Find rooms"), "Servers");
				GUILayout.FlexibleSpace();
				//ContentSwitch( Text("Direct Connect"), "Direct Connect" );
				GUILayout.FlexibleSpace();
				GUILayout.FlexibleSpace();
				GUILayout.FlexibleSpace();
				GUILayout.FlexibleSpace();
				GUILayout.FlexibleSpace();
				MenuSwitch( Text("Back"), "Menu" );
			}
			
		}
		
		static class SkinEditor{
			
			var savedSkin:String = "";
			
			function Box(){
				//if (Skin.generator == null) return;
			    
				// Show download progress or indicate assets are being loaded.
			    GUI.enabled = true;
			    GUILayout.FlexibleSpace();
			    
			    if (!Skin.usingLatestConfig){
			        var progress : float = Skin.generator.CurrentConfigProgress;
			        var status : String = Text("Loading");
			        if (progress != 1) status = Text("Downloading") + " " + (progress * 100).ToString().Split("."[0])[0] + "%";
			        GUILayout.Label(status);
			    }
			    
			    GUI.enabled = Skin.usingLatestConfig && !Skin.character.animation.IsPlaying("walkin");
			    
			    GUILayout.FlexibleSpace();
				
			    // Buttons for changing the active character.
			    GUILayout.BeginHorizontal();
				    GUILayout.Label( Text("Character") );
				    if (GUILayout.Button("◄", GUILayout.Width(20))) Skin.ChangeCharacter(false);
					if (GUILayout.Button("►", GUILayout.Width(20))) Skin.ChangeCharacter(true);
			    GUILayout.EndHorizontal();
			
			    // Buttons for changing character elements.
			    SkinCategory("face", Text("Head"), null);
			    SkinCategory("eyes", Text("Eyes"), null);
			    SkinCategory("hair", Text("Hair"), null);
			    SkinCategory("top", Text("Body"), "item_shirt");
			    SkinCategory("pants", Text("Legs"), "item_pants");
			    SkinCategory("shoes", Text("Feet"), "item_boots");
			    
			    GUILayout.FlexibleSpace();
				GUILayout.FlexibleSpace();
				
			    // Button for save configurations.
			    GUI.enabled = ( savedSkin != Skin.generator.GetConfig() );
			    if (GUILayout.Button( Text("Save") )){
			    	//Server.StartCoroutine( Server.Retrieve.PlayerSkin(Skin.generator.GetConfig()) );
			    	Player.SetSkinString(Skin.generator.GetConfig());
					GameObject.Find("Constructor").GetComponent(Skin).enabled = true;
			    	Menu.current = "Menu";
			    }
			    
			    GUI.enabled = true;
			    if ( GUILayout.Button( Text("Cancel") ) ){
			    	Skin.generator = CharacterGenerator.CreateWithConfig(Player.GetSkinString());
			    	Skin.usingLatestConfig = false;
	    			Skin.newCharacterRequested = true;
			    	Menu.current = "Menu";
			    }
			    
			}
			
			function SkinCategory(category:String, displayName:String, anim:String){
			    GUILayout.BeginHorizontal();
				    GUILayout.Label(displayName);
				    if (GUILayout.Button("◄", GUILayout.Width(20))) Skin.ChangeElement(category, false, anim);
					if (GUILayout.Button("►", GUILayout.Width(20))) Skin.ChangeElement(category, true, anim);
			    GUILayout.EndHorizontal();
			}
			
		}
		
		function MenuSwitch(_label:String, _menu:String){
			if (GUILayout.Button(_label)){
				Menu.current = _menu;
				Content.current = "";
			}
		}
		function MenuSwitch(_label:String, _menu:String, _function:IEnumerator){
			if (GUILayout.Button(_label)){
				Menu.current = _menu;
				Content.current = "";
				Server.StartCoroutine(_function);
			}
		}
		function MenuSwitch(_label:String, _menu:String, _content:String){
			if (GUILayout.Button(_label)){
				Menu.current = _menu;
				Content.current = _content;
			}
		}
		function MenuSwitch(_label:String, _menu:String, _content:String, _function:IEnumerator){
			if (GUILayout.Button(_label)){
				Menu.current = _menu;
				Content.current = _content;
				Server.StartCoroutine(_function);
			}
		}
		
		function ContentSwitch(label:String, content:String){
			if (GUILayout.Button(label))
				Content.current = content;
		}
		function ContentSwitch(label:String, content:String, _function:IEnumerator){
			if (GUILayout.Button(label)){
				Content.current = content;
				Server.StartCoroutine(_function);
			}
		}
		
	}
	
	static class Content{
		var windowID : int = 1;
		var current:String = "Login";
		var rect:Rect = Area._Content;
		
		function Box(){
			if (current != "" && Menu.show == true)
				GUILayout.Window ( windowID, rect, Window, Text(current) );
		}
		
		function Window(windowID : int){
			rect = Area._Content;
			switch (current){
				
				case "Servers":
					Servers.Box();
					break;
					
				case "Host":
					Host.Box();
					break;
					
				case "Login":
					rect = Area._Center;
					Login.Box();
					break;
					
			}
		}
		
		static class Servers{
		
			var SP : Vector2 = Vector2.zero;
		
			function Box(){
				var rooms:RoomInfo[] = PhotonNetwork.GetRoomList();
				// Refresh button
				GUILayout.BeginHorizontal();
				GUILayout.FlexibleSpace();
					if(GUILayout.Button(Text("Refresh room list"), GUILayout.ExpandWidth(false))){
						rooms = PhotonNetwork.GetRoomList();
					}
				GUILayout.FlexibleSpace();
				GUILayout.EndHorizontal();
				
				// Start scroll view
				SP = GUILayout.BeginScrollView (SP);				
				
				for(var room:RoomInfo in rooms) {
					if(room.visible) {
						if(GUILayout.Button(room.name + " (" + room.playerCount + "/" + room.maxPlayers + ")")) {
							Server.JoinRoom(room.name);
							Menu.Toogle();
						}
					}
				}
				
				// End scroll view
				GUILayout.EndScrollView();
			}
			
		}
		
		static class Host{
		
			private var maxPlayers:int = 5;
			
			var SP:Vector2 = Vector2.zero;
			var serverTypeSelected:int = 0;
			var serverTypes : String[] = ["Public", "Private"];
			
			var gameName:String = "";
			var gameDescription:String = "";
			
			function Box(){
				
				// Max Players input scroll
					GUILayout.BeginHorizontal();
						GUILayout.Label (Text("Max. Players") + ": ", GUILayout.ExpandWidth(false));
						maxPlayers = GUILayout.HorizontalSlider (maxPlayers, 1, 31);
						GUILayout.Label ((maxPlayers + 1).ToString(), GUILayout.Width(20));
					GUILayout.EndHorizontal();
				
				// Type switcher
					GUILayout.BeginHorizontal();
						GUILayout.Label (Text("Server type") + ": ", GUILayout.ExpandWidth(false));
						serverTypeSelected = GUILayout.Toolbar(serverTypeSelected, serverTypes);
					GUILayout.EndHorizontal();
				
				GUILayout.FlexibleSpace();
				
				// If server type is Public
				if (serverTypeSelected == 0){
					// Name input field
						GUILayout.BeginHorizontal();
							GUI.SetNextControlName("New server name box");
							GUILayout.Label(Text("Room Name") + ": ", GUILayout.ExpandWidth(false));
							gameName = GUILayout.TextField (gameName);
						GUILayout.EndHorizontal();
					
					// Description input field
						GUILayout.Label (Text("Game description") + ": ");
						
						SP = GUILayout.BeginScrollView(SP);
							gameDescription = GUILayout.TextArea(gameDescription);
						GUILayout.EndScrollView();
					
					// Move next controls to the bottom
					GUILayout.FlexibleSpace();
					
				// Start button
					if (gameName == ""){
						GUI.enabled = false;
						GUI.color.a = 2;
						GUILayout.Button( Text("Name field required") );
						GUI.color.a = 1;
						GUI.enabled = true;
						}
					else{
						if(GUILayout.Button( Text("Start") )){
							//Server.Host(maxPlayers, port, gameName, gameDescription);
							Server.CreateRoom(gameName, maxPlayers, true, gameDescription);
							Menu.Toogle();
						}
						// Execute the startServer function if return is pressed and the box has focus
						if (Event.current.type == EventType.KeyDown && Event.current.character == '\n' 
							&& GUI.GetNameOfFocusedControl() == "New server name box"){
							Server.CreateRoom(gameName, maxPlayers, true, gameDescription);
							Menu.Toogle();
						}
					}
				}
				// If server type is Private
				else if (serverTypeSelected == 1){
					// Move next controls to the bottom
					GUILayout.FlexibleSpace();
					
					// Start button
					if(GUILayout.Button( Text("Start") )){
						Server.CreateRoom("", maxPlayers, false, null);
						Menu.Toogle();
					}
				}
				
			}
			
		}
		
		static class Login{
			
			var wrong:boolean = false;
			
			function Box(){
				if (wrong){
					GUILayout.FlexibleSpace();
					GUI.backgroundColor = Color.red;
					GUILayout.Box( Text("Incorrect User or Password") );
					GUI.backgroundColor = Color.white;
				}
				GUILayout.FlexibleSpace();
				// Name input field
				GUILayout.Label(Text("Player Name") + ": ");
				Player.SetNickname(GUILayout.TextField(Player.GetNickname()));
				
				GUILayout.FlexibleSpace();
				
				// Password input field
				GUILayout.Label(Text("Password") + ": ");
				Player.password = GUILayout.PasswordField(Player.password, "*"[0]);
				
				GUILayout.FlexibleSpace();
				
				// Login button
				GUILayout.BeginHorizontal();
					GUILayout.FlexibleSpace();
					if(GUILayout.Button(Text("Login"), GUILayout.ExpandWidth(false))) Server.StartCoroutine( Server.Login() );
					GUILayout.FlexibleSpace();
				GUILayout.EndHorizontal();
				
				GUILayout.FlexibleSpace();
				GUILayout.FlexibleSpace();
			}
			
		}
	}
	
	static class ChatInterface{
		
		var SP:Vector2 = Vector2.zero;
		
		/******************************
		|	Chat Box
		******************************/
		function Box(rect : Rect){
			GUILayout.BeginArea (rect);
				ViewBox(rect);
				InputBox(rect);
			GUILayout.EndArea ();
		}
		
		function ViewBox(rect : Rect){
		
			GUILayout.FlexibleSpace ();
			
			SP = GUILayout.BeginScrollView(SP);
			
				GUI.enabled = false;
				GUI.color.a = 2;
				GUILayout.TextArea(Chat.Text);
				GUI.color.a = 1;
				GUI.enabled = true;
				
			GUILayout.EndScrollView();
			
		}
		
		function InputBox(rect : Rect){
			GUILayout.BeginHorizontal();
					
				GUI.SetNextControlName("Chat input box");
				Chat.inputBoxValue = GUILayout.TextField(Chat.inputBoxValue, GUILayout.Width(rect.width - rect.width * 0.25 - rect.x));
				
				if (Chat.inputBoxValue != ""){
					// Execute the send function if this button is pressed
					if(GUILayout.Button(Text("Send"), GUILayout.Width(rect.width * 0.25 - rect.x))) {
						Chat.Send();
					}
					
					// Execute the send function if return is pressed and the box has focus
					if (Event.current.type == EventType.KeyDown && Event.current.character == '\n' 
						&& GUI.GetNameOfFocusedControl() == "Chat input box") {
						Chat.Send();
					}
				}
				else{
					GUI.enabled = false;
					GUI.color.a = 2;
					GUI.SetNextControlName("Disabled Send button");
					GUILayout.Button(Text("Send"), GUILayout.Width(rect.width * 0.25 - rect.x));
					GUI.color.a = 1;
					GUI.enabled = true;
				}
			GUILayout.EndHorizontal();
		}
		
		
	}
	
	static class JournalInterface{
	
		var show : boolean = false;
		
		var WindowAID : int = 0;
		var WindowBID : int = 1;
		private var SPA:Vector2 = Vector2.zero;
		private var SPB:Vector2 = Vector2.zero;
		
		var currentMission:String = "";
		var description:String = "";
		
		function Box(rectA:Rect, rectB:Rect){
			if (show == true){
				GUILayout.Window ( WindowAID, rectA, WindowA, Text("Journal") );
				GUILayout.Window (WindowBID, rectB, WindowB, currentMission);
			}
		}
		
		function Toogle(){
			if(show) show = false;
			else show = true;
		}
		
		/******************************
		|	Journal List Window
		******************************/
		function WindowA (windowID : int) {
			SPA = GUILayout.BeginScrollView(SPA);
				
				MissionList(Text("Active Missions") + ":", 1);
				
				MissionList(Text("Completed Missions") + ":", 0);
				
				MissionList(Text("Failed Missions") + ":", -1);
				
			GUILayout.EndScrollView();
			
			GUILayout.FlexibleSpace ();
			if (GUILayout.Button( Text("Close") )) Toogle();
		}
		
		/******************************
		|	Journal Mission Lookup Window
		******************************/
		function WindowB (windowID : int) {
		
			SPB = GUILayout.BeginScrollView(SPB);
			
			GUI.enabled = false;
			GUI.color.a = 2;
			
			GUILayout.TextArea(description, GUILayout.ExpandHeight(true));
			
			GUI.color.a = 1;
			GUI.enabled = true;
				
			GUILayout.EndScrollView();
		}
		
		/*******************************************************
		|	
		|	Element definitions
		|	
		*******************************************************/
		
		function MissionList(label:String, status:int){
			if (Journal.missions.Count > 0){
				GUILayout.Label(label);
				
				if (status == 1){
					for (var mission in Journal.missions){
						if (mission.Value >= status) missionButton(mission.Key);
					}
				}
				
				else{
					for (var mission in Journal.missions){
						if (mission.Value == status) missionButton(mission.Key);
					}
				}
				
			}
		}
		
		function missionButton (mission:String){
			if(GUILayout.Button(mission, GUILayout.ExpandHeight(true))){
				currentMission = mission;
				Server.StartCoroutine(Server.Retrieve.TXT("JournalInterface", "Texts/MissionDesc/" + mission));
			}
		}
		
		
		
	}
	
	static class InventoryInterface{
			
		var show:boolean = false;
		private var SP:Vector2 = Vector2.zero;
		
		function Toogle(){
			if(show == true) show = false;
			else show = true;
		}
		
		/******************************
		|	Inventory Box
		******************************/
		function Box(rect:Rect){
			if (show == true) GUI.Window ( 0, rect, Window, Text("Inventory") );
		}
		
		/******************************
		|	Inventory Window
		******************************/
		function Window(windowID : int) {
			
			GUILayout.FlexibleSpace ();
			SP = GUILayout.BeginScrollView(SP);
				
				try {
					for (var item in Inventory.items){
						if (item.Value > 0){
							GUILayout.BeginHorizontal();
							
								ItemButton(item.Key);
								
								GUILayout.Label(item.Key.Split("."[0])[0], GUILayout.ExpandHeight(true), GUILayout.ExpandWidth(true));
								
								GUILayout.Label(item.Value.ToString(), GUILayout.ExpandHeight(true), GUILayout.Width(40));
								
							GUILayout.EndHorizontal();
						}
					}
				}
				catch (InvalidOperationException){
					Debug.Log("Expected error dropping item. Don't panic.");
				}
				
			GUILayout.EndScrollView();
			
			if (GUILayout.Button( Text("Close") )) Toogle();
		}
		
		/******************************
		|	Item Button
		******************************/
		function ItemButton(item:String){
			if ( Inventory.textures.ContainsKey( item ) ){
				if ( GUILayout.Button( Inventory.textures[item] , GUILayout.ExpandWidth(false)) ){
					Inventory.DropItem(item);
					Player.object.audio.PlayOneShot(Server._gameObject().GetComponent(MainGUI)._dropItemAudioClip);
				}
			}
			else{
				if ( GUILayout.Button( Resources.Load("Textures/Item") , GUILayout.ExpandWidth(false), GUILayout.Width(38), GUILayout.Height(38)) ){
					Inventory.DropItem(item);
					Player.object.audio.PlayOneShot(Server._gameObject().GetComponent(MainGUI)._dropItemAudioClip);
				}
				Server.StartCoroutine(Server.Retrieve.ItemTexture(item));
			}
		}
		
	}
	
	static class DialogInterface{
	
		var show:boolean = false;
		
		var WindowAID : int = 0;
		var WindowBID : int = 1;
		
		private var SPA:Vector2 = Vector2.zero;
		private var SPB:Vector2 = Vector2.zero;
		
		/******************************
		|	Dialog Box
		******************************/
		function Box(rectA:Rect, rectB:Rect){
			if (show == true) {
				GUI.Window ( WindowAID, rectA, WindowA, Text("Anwsers") );
				GUI.Window (WindowBID, rectB, WindowB, Dialog.fileName);
			}
		}
		
		function WindowB (windowID : int) {
			SPB = GUILayout.BeginScrollView(SPB);
				GUI.enabled = false;
				GUI.color.a = 2;
				if (Dialog.text) GUILayout.TextArea(Dialog.text.Trim(), GUILayout.ExpandHeight(true));
				GUI.color.a = 1;
				GUI.enabled = true;
			GUILayout.EndScrollView();
		}
		
		function WindowA (windowID : int) {
			SPA = GUILayout.BeginScrollView(SPA);
				Anwsers();
				GUILayout.FlexibleSpace();
			GUILayout.EndScrollView();
		}
		
		function Anwsers(){
			try{
				// if there are more nodes inside this node...
				if(Dialog.node["n"] != null){
					// we get ready to check if we can show one...
					var hasValidOptions:boolean = false;
					// and for each node, we add a button to go there
					var nodeList:XMLNodeList = Dialog.node["n"] as XMLNodeList;
					for (var i:int = 0; i < nodeList.length; i ++ ){
						var n = nodeList[i] as XMLNode;
						// but only if there are no requeriments
						var nIf:XMLNodeList = n["if"] as XMLNodeList;
						if (!nIf){
						
							hasValidOptions = true;
							
							var optText:String = n["_text"] as String;
							if(GUILayout.Button(optText.Trim(), GUILayout.ExpandHeight(true))){
								if (n["@goTo"]) Dialog.GoToNode(n["@goTo"] as String);
								else Dialog.GetNodeData(i);
							}
							
						}
						// or if the requeriments are met
						else if (Dialog.Check(nIf[0] as XMLNode, "if") == true){
							
							hasValidOptions = true;
							
							if(GUILayout.Button(n["_text"] as String, GUILayout.ExpandHeight(true))){
								if (n["@goTo"] as String) Dialog.GoToNode(n["@goTo"] as String);
								else Dialog.GetNodeData(i);
							}
							
						}
					}
					//and then if we have no valid options we fall back to the
					//default buttons, so we can close the conversation if the XML is badly formatted
					if (!hasValidOptions){
							if(GUILayout.Button(Text("Close"), GUILayout.ExpandHeight(true))){
								Dialog.Close();
							}
					}
					
				}
				// if there are no more nodes inside...
				else{
					// we fall back to the default buttons, so we can close the conversation if the XML is badly formatted
					if(GUILayout.Button(Text("Close"), GUILayout.ExpandHeight(true))){
						Dialog.Close();
					}
				}
			}
			catch(NullReferenceException){
				//Debug.Log("No extra nodes where found. Falling back to default...");
			}
		}
		
	}
	
	static class Tutorial{
		
		var show:boolean = true;
		var text:String = "";
		
		function Toogle(){
			if(show == true) show = false;
			else show = true;
		}
		
		function Box(rect:Rect){
			if(show == false) return;
			GUI.skin.box.wordWrap = true;
			if (text != "") GUI.Box(rect, text);
			GUI.skin.box.wordWrap = false;
		}
		
	}
	
	static class MainToolbar{
		
		var show:boolean = true;
		
		function Toogle(){
			if(show == true) show = false;
			else show = true;
		}
		
		/******************************
		|	Tool Bar Box
		******************************/
		function Box(rect:Rect){
			if (show == true){
				GUILayout.BeginArea(rect);
					GUILayout.BeginHorizontal();
						if (GUILayout.Button(Text("Journal"), GUILayout.ExpandHeight(true))) JournalInterface.Toogle();
						if (GUILayout.Button(Text("Inventory"), GUILayout.ExpandHeight(true))) InventoryInterface.Toogle();
						if (GUILayout.Button(Text("Menu"), GUILayout.ExpandHeight(true))) Menu.Toogle();
					GUILayout.EndHorizontal();
				GUILayout.EndArea();
			}
		}
		
	}
	
	static class Area {
		var _Screen:Rect;
		var _Menu:Rect;
		var _Content:Rect;
		var _MainToolbar:Rect;
		var _InGameMenu:Rect;
		var _InGameContent:Rect;
		var _List:Rect;
		var _Chat:Rect;
		var _Tutorial:Rect;
		var _Center:Rect;
		var _CenterUp:Rect;
		var _CenterDown:Rect;
		
		function Reload(){
			
			// Store the last know screen size, so we can detect changes on it
			lastScreenSize = new Vector2(Screen.width, Screen.height);
			
			// Defines the area inside the screen where we will draw, with margins
			_Screen = Rect				(	Screen.width * 0.01,
											Screen.height * 0.01,
											Screen.width - Screen.width * 0.01 * 2,
											Screen.height - Screen.height * 0.01 * 2
										);
			
			// A list menu at the left, a quarter of the screen width, and full height
			_Menu = Rect				(	_Screen.x,
											_Screen.y,
											_Screen.width * 0.33,
											_Screen.height
										);
			
			// A content box at the right, three quarters of the screen width, and full height
			_Content = Rect				(	_Menu.width + _Screen.x * 2,
											_Screen.y,
											_Screen.width - _Menu.width - _Screen.x,
											_Screen.height
										);
			
			// A toolbar at bottom right, 40 percent of the screen
			_MainToolbar = Rect			(	_Screen.xMax - _Screen.width * 0.40,
											_Screen.yMax - _Screen.height * 0.07,
											_Screen.width * 0.40 - _Screen.x,
											_Screen.height * 0.07 - _Screen.y
										);
			
			// A list menu at the left, a quarter of the screen width, and full height minus the toolbar height
			_InGameMenu = Rect			(	_Menu.x,
											_Menu.y,
											_Menu.width,
											_Menu.height - _MainToolbar.height - _Screen.y * 2
										);
			
			// A content box at the right, three quarters of the screen width, and full height minus the toolbar height
			_InGameContent = Rect		(	_Content.x,
											_Content.y,
											_Content.width,
											_Content.height - _MainToolbar.height - _Screen.y * 2
										);
			
			// A small box wich can pop up on top of the toolbar
			_List = Rect				(	_Screen.xMax - _MainToolbar.width - _Screen.x,
											_Screen.yMax - _Screen.height * 0.33 - _MainToolbar.height - _Screen.y * 2,
											_MainToolbar.width,
											_Screen.height * 0.33
										);
			
			// The chat area, wich will take the width left from the toolbar
			_Chat = Rect				(	_Screen.x,
											_Screen.yMax - _Screen.height * 0.3 - _Screen.y,
											_Screen.width - _MainToolbar.width - _Screen.x * 2,
											_Screen.height * 0.3
										);
			
			// A box at the top center of the screen
			_Tutorial = Rect			(	_Screen.xMax * 0.25,
											_Screen.y,
											_Screen.xMax - _Screen.xMax * 0.5,
											_Screen.height * 0.125
										);
			
			// A box at the center of the screen
			_Center = Rect				(	_Screen.xMax * 0.25,
											_Screen.y + _Screen.yMax * 0.125,
											_Screen.xMax - _Screen.xMax * 0.5,
											_Screen.height * 0.75
										);
			
			// The box that contains the NPC dialog strings
			_CenterUp = Rect			(	_Center.x,
											_Center.y,
											_Center.width,
											_Center.height * 0.40
										);
			
			// The box containing the player's possible anwsers to the NPC
			_CenterDown = Rect			(	_Center.x,
											_Center.y + _CenterUp.height,
											_Center.width,
											_Center.height * 0.60
										);
		}
		
	}
	
	
	
}