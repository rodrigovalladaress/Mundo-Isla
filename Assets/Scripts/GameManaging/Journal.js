// Edited by Rodrigo Valladares Santana
// <rodriv_tf@hotmail.com>
// Version: 1.1
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
	public final var Active : String = "active";
	public final var Completed : String = "completed";
	public final var Failed : String = "failed";
	
	// Max number of characters that the name of a mission can have
	public final var MaxCharsMission = 45;
	

	var missions : Dictionary.<String, int> = new Dictionary.<String, int>();
	
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
	
	function DelMission (mission:String){
		// if we have the key in our dictionary, we remove it
		if(Journal.Has(mission)){
			Journal.missions.Remove(mission);
			Server.Log("Game event", "The mission, \"" + mission + "\" has been removed.");
		}
		// else, we send a warning, as there probably is an error
		else Debug.LogWarning("There is no mission " + mission + " in the journal.");
		
	}
	
	function SetMission (mission:String, status:String) {
		var numberStatus : int;
		if(mission.Length <= MaxCharsMission) {
			// if status is a keyword, we set the mission accordingly
			switch (status){
				case Active:
					Journal.missions[mission] = numberStatus = ActiveCode;
					Server.Log("Game event", "The mission, \"" + mission + "\" status is now \"" + status + "\"");
					break;
				case Completed:
					Journal.missions[mission] = numberStatus = CompletedCode;
					Server.Log("Game event", "The mission, \"" + mission + "\" status is now \"" + status + "\"");
					break;
				case Failed:
					Journal.missions[mission] = numberStatus = FailedCode;
					Server.Log("Game event", "The mission, \"" + mission + "\" status is now \"" + status + "\"");
					break;
				// if status is a number (it must be given as a string), we set the status to that int
				default:
					try {
						Journal.missions[mission] = numberStatus = int.Parse(status);
						Server.Log("Game event", "The mission, \"" + mission + "\" value is now \"" + status + "\"");
					}
					// if it's not a keyword not a int, we get an error
					catch(FormatException) Debug.LogError("Unknow status " + status + " declared for mission " + mission + ".");
					break;
			}
			Server.StartCoroutine(SetMissionSync(mission, numberStatus));
		} else {
			Debug.LogError(mission + " has more than " + MaxCharsMission + " characters! Please change the name of the mission " 
							+ "to fit this restriction.");
		}
		// TODO Sincronizar con base de datos
	}
	
	// Synchronization of the mission
	function SetMissionSync(mission:String, status:int) : IEnumerator {
		var url : String = Paths.GetPlayerQuery() + "/set_mission.php/?player=" + Player.nickname + "&mission=" + Server.EscapePath(mission)
							+ "&status=" + status;
		var www : WWW = new WWW(url);
		while(!www.isDone) {
			yield;
		}
		if(!www.text.Equals("OK")) {
			Debug.LogError("Error syncing mission (" + www.text + ") url = " + url);
		}
	}
	
	function UpdateMission (mission:String){
	
		Debug.Log("Update " + mission + " -----------");
	
		// if we have that mission...
		if (Journal.Has(mission)){
			var missionStatus:int = Journal.missions[mission];
			// and it's active, we go to the next step of that mission
			if (missionStatus > 0) {
				Journal.missions[mission] = missionStatus + 1;
				Server.Log("Game event", "The mission, \"" + mission + "\" stage is now \"" + missionStatus + "\"");
			}
		}
		
	}
	
}