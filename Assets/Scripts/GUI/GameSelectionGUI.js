///////////////////////////////////////////////////////////////////////////////////////////////////
// Script that shows a title and some buttons. When each button is pressed, a new scene is 		 //
// loaded.                                                   									 //
// Version: 1.0																					 //
// Author: Rodrigo Valladares Santana											   				 //
///////////////////////////////////////////////////////////////////////////////////////////////////
#pragma strict

class GameSelectionGUI extends MonoBehaviour {

	static var lastScreenSize:Vector2 = new Vector2(0,0);
	
	function Start () {
	
	
		//MainGUI.SetLanguage(Language.esLanguageFile);
		
		/*while(!CharacterGenerator.ReadyToUse) {
			yield;
		}*/
		
		// Hace aparecer el personaje en la GUI
		/*Player.skinString =
		"female|eyes|female_eyes_blue|face|female_face-1|hair|female_hair-2_dark|pants|" + 
		"female_pants-2_black|shoes|female_shoes-1_blue|top|female_top-2_orange";*/
		//Player.skinString = "";
	}
	
	function OnGUI () {
		var currentScreenSize:Vector2 = new Vector2(Screen.width, Screen.height);
		GUI.skin = Resources.Load("Skin") as GUISkin;
		if(lastScreenSize != currentScreenSize) {
			GameSelectionGUI.Area.Reload();
			lastScreenSize = currentScreenSize;
		}
		GameSelectionGUI.MainMenu.Box();
	}
	
	// Class which makes the interface
	static class MainMenu {
		
		// Area where the interface is drawn
		var rect : Rect = Area._GameSelection;
	
		// Creates the window where the controls are located
		function Box () {
			// TODO if(!Player.isPlaying()){}
			GUILayout.Window ( 0, rect, Window, Language.Text("Game selection") );
		}
		
		// Function which put the controls inside the window
		function Window() {
			GUILayout.FlexibleSpace();
			GUILayout.FlexibleSpace();
			if (GUILayout.Button(Language.Text("Mundo Isla"))) {
				//Player.skinString = MainGUI.Menu.SkinEditor.savedSkin = prevSkinString;
				
				print ("Mundo Isla");
				Application.LoadLevel("Main");
				
				
			}
			GUILayout.FlexibleSpace();
			if (GUILayout.Button (Language.Text("Game 2"))) {
				print ("Juego 2");
			}
			GUILayout.FlexibleSpace();
			if (GUILayout.Button (Language.Text("Game 3"))) {
				print ("Juego 3");
			}
			GUILayout.FlexibleSpace();
			GUILayout.FlexibleSpace();
			GUILayout.FlexibleSpace();
			GUILayout.FlexibleSpace();
			GUILayout.FlexibleSpace();
		}
	}
	
	// Class which its methods involves the translaction of words to the
	// selected language when SetLanguage() is invoked
	static class Language {
		
		/*static*/ final var esLanguageFile = "ES.txt";
		/*static*/ private var _textDictionary:Dictionary.<String,String> = 
			new Dictionary.<String, String>();
	
		function SetLanguage( _language : String ) {
			var _lgFile : String[];
		    var sr = new System.IO.StreamReader(Application.dataPath + "/" + _language);
		    
		    var result = sr.ReadToEnd();
		    sr.Close();
		    _lgFile = result.Split(";"[0]);
		    
		    for (var line:String in _lgFile) {
		    	if (line != "")
				if (line.Split("|"[0]).Length == 2) {
					_textDictionary[ line.Split("|"[0] )[0].Trim() ] 
						= line.Split("|"[0] )[1].Trim();
				}
		    }
		    
		}
		
		// Text searches if there's a word on the dictionary and returns it
		function Text(_key:String):String {
			return (_textDictionary.ContainsKey(_key)) ? 
						_textDictionary[_key] : _key;
		}
	}
	
	// Defines the areas of the screen where the interface is drawn
	static class Area {
		var _Screen:Rect;
		var _GameSelection:Rect;
		
		function Reload() {
			lastScreenSize = new Vector2(Screen.width, Screen.height);
			
			// Area where the GUI is drawn
			_Screen = Rect				(	Screen.width * 0.01,
											Screen.height * 0.01,
											Screen.width - Screen.width * 0.01 * 2,
											Screen.height - Screen.height * 0.01 * 2
										);
										
			// Area where the game selection menu is drawn 
			_GameSelection = Rect		(	_Screen.x,
											_Screen.y,
											_Screen.width * 0.33,
											_Screen.height
										);
		}
	
	}
}