// Edited by Rodrigo Valladares Santana
// <rodriv_tf@hotmail.com>
// Version: 2.0
// Changes in version 1.2:
//	-	Mission retrieving.
//	-	Mission deletig syncing.
// Changes in version 1.1:
//	-	SetMission is no longer a coroutine
//	-	Status constants
//	-	MaxCharsMission (database limitation)
//	-	Database syncing
/*******************************************************
|	Journal Script
|
|	This script hold the dictionary with missions, and handle
|	all the functions telated to them, such as add, remove or
|	update the contents.
|
|	Versión: 1.0
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
#pragma strict
static class Journal extends MonoBehaviour{

	// Constants used in status of missions
	public final var ActiveCode : int = 1;
	public final var CompletedCode : int = 0;
	public final var FailedCode : int = -1;
	public final var ErrorCode:int = -99999;
	public final var Active : String = "active";
	public final var Completed : String = "completed";
	public final var Failed : String = "failed";
	
	// Max number of characters that the name of a mission can have
	public final var MaxCharsMission = 45;
	

	var missions : Dictionary.<String, int> = new Dictionary.<String, int>();
	
	/*******************************************************
	|	Mission management
	*******************************************************/
	
	function Has(mission:String){
		// if we simply ask if the players have a mission, we just look for the key
		// if it exist, then we somehow have that mission.
		if(Journal.missions.ContainsKey(mission)) return true;
		else return false;
	}
	function Has(mission:String, status:String){
		//we asume the anwser is no
		var output:boolean = false;
		// then we check if the key exist
		if (Journal.missions.ContainsKey(mission)){
			//if so, we try to match it with our defined statuses, and change the output if we find an equal
			switch (status){
				case Active:
			    	if (Journal.missions[mission]  >=  ActiveCode) output = true;
			    	break;
				case Completed:
					if (Journal.missions[mission] ==  CompletedCode) output = true;
					break;
				case Failed:
					if (Journal.missions[mission] == FailedCode) output = true;
					break;
				default:
					try if (Journal.missions[mission] >= int.Parse(status)) output = true;
					// if we can't, and the status is not any of our predefined ones nor a number, we probably have an error
					catch(FormatException) Debug.LogError("Unknown status " + status + " for mission " + mission + ".");
					break;
			}
		}
		// then, we return the output
		return output;
	}
	
	function DelMission (mission:String) {
		// if we have the key in our dictionary, we remove it
		if(Journal.Has(mission)) {
			Journal.missions.Remove(mission);
			if(Server.IsMissionPersistence()) {
				Server.StartCoroutine(DelMissionSync(mission));
			}
			Server.Log("Game event", "The mission, \"" + mission + "\" has been removed.");
		}
		// else, we send a warning, as there probably is an error
		else {
			Debug.LogError("There is no mission " + mission + " in the journal.");
		}
	}
	
	function GetStatusAsInt(status:String):int {
		var numberStatus:int;
		switch (status){
			case Active:
				numberStatus = ActiveCode;
				break;
			case Completed:
				numberStatus = CompletedCode;
				break;
			case Failed:
				numberStatus = FailedCode;
				break;
			// if status is a number (it must be given as a string), we set the status to that int
			default:
				try {
					numberStatus = int.Parse(status);
				}
				// if it's not a keyword not a int, we get an error
				catch(FormatException) {
					numberStatus = ErrorCode;
					Debug.LogError("Unknow status " + status + ".");
				}
				break;
		}
		return numberStatus;
	}
	
	function SetMissionAndSync(mission:String, status:String):boolean {
		var numberStatus:int = GetStatusAsInt(status);
		if(numberStatus != ErrorCode) {
			if(SetMission(mission, status)) {
				if(Server.IsMissionPersistence()) {
					Server.StartCoroutine(MissionSync(mission, numberStatus));
					return true;
				} else {
					Debug.LogWarning("Mission progresss won't sync. Please set missionPersistence true in Server.");
					return false;
				}
			} else {
				return false;
			}
		} else {
			Debug.LogError("Unknow status " + status + " declared for mission " + mission + ".");
			return false;
		}
	}
	
	function SetMission (mission:String, numberStatus:int):boolean {
		if(mission.Length <= MaxCharsMission) {
			Journal.missions[mission] = numberStatus;
			return true;
		} else {
			Debug.LogError(mission + " has more than " + MaxCharsMission + " characters! Please change the name of the mission " 
							+ "to fit this restriction.");
			return false;
		}
	}
	
	function SetMission (mission:String, status:String):boolean {
		var numberStatus:int = GetStatusAsInt(status);
		if(numberStatus != ErrorCode) {
			return SetMission(mission, numberStatus);
		} else {
			Debug.LogError("Unknow status " + status + " declared for mission " + mission + ".");
			return false;
		}
	}
	
	function UpdateMission (mission:String){
		// if we have that mission...
		if (Journal.Has(mission)){
			var missionStatus:int = Journal.missions[mission];
			// and it's active, we go to the next step of that mission
			if (missionStatus > 0) {
				Journal.missions[mission] = missionStatus + 1;
				if(Server.IsMissionPersistence()) {
					Server.StartCoroutine(MissionSync(mission, missionStatus));
				}
				Server.Log("Game event", "The mission, \"" + mission + "\" stage is now \"" + missionStatus + "\"");
			} else {
				Debug.LogWarning("Mission '" + mission + "' of " +   Player.nickname + " status is failed. It can't be updated");
			}
		} else {
			Debug.LogError(Player.nickname + " doesn't have mission '" + mission + "' to update.");
		}
		
	}
	
	/*******************************************************
	|	Database syncing
	*******************************************************/
	
	function DelMissionSync(mission:String) {
		var url : String = Paths.GetPlayerQuery() + "/delete_mission.php/?player=" + Server.EscapePath(WWW.EscapeURL(Player.nickname)) 
							+ "&mission=" + WWW.EscapeURL(mission);
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		if(!www.text.Equals("OK")) {
			Debug.LogError("Error syncing mission (" + www.text + ") url = " + url);
		}
	}
	
	// Synchronization of the mission
	function MissionSync(mission:String, status:int) : IEnumerator {
		var url : String = Paths.GetPlayerQuery() + "/set_mission.php/?player=" + Server.EscapePath(WWW.EscapeURL(Player.nickname)) 
							+ "&mission=" + WWW.EscapeURL(mission) + "&status=" + status;
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		if(!www.text.Equals("OK")) {
			Debug.LogError("Error syncing mission (" + www.text + ") url = " + url);
		}
	}
	
	function RetrieveMissions() : IEnumerator {
		var url:String = Paths.GetPlayerQuery() + "/get_missions.php/?player=" + Server.EscapePath(WWW.EscapeURL(Player.nickname));
		// If we are the only player on the scene, initialization is necesary
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		var xDoc : XmlDocument = new XmlDocument();
		xDoc.LoadXml(www.text);
		var result : XmlNodeList = xDoc.GetElementsByTagName("result");
		var resultElement = result[0] as XmlElement;
		var row : XmlNodeList = resultElement.ChildNodes;
		var mission:String;
		var status:int;
		if(row.Count > 0) {
			for(var rowElement : XmlElement in row) {
				mission = (rowElement.GetElementsByTagName("mission")[0].InnerText);
				status = int.Parse(rowElement.GetElementsByTagName("status")[0].InnerText);
				SetMission(mission, status);
			}
		} else {
			Debug.Log(Player.nickname + " has no missions.");
		}
	}
	
}