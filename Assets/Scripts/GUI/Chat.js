#pragma strict
// Edited by Rodrigo Valladares Santana
// Version: 1.1
// Changes of 1.1 version:
//	-	Use of PhotonView instead of NetworkView
/*******************************************************
|	Chat object
|
|	This script provide functions to manage chat transmissions,
|	and draw its box, or just the output or the input box
|
|	Versión: 		1.0
|	
|	Autor:			Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
static class Chat extends MonoBehaviour{
	var Text:String = "";
	var inputBoxValue:String = "";
	
	function Send(){
		Server.Log("chat", Player.nickname + ": " + inputBoxValue);
		Server.GetPhotonView().RPC("SyncObject", PhotonTargets.All, Server.GetPhotonView().viewID.ToString(), "chat", Player.nickname + ": " 
			+ inputBoxValue);
		inputBoxValue = "";
		// We unfocus the text input field with a hack on lack of a GUI.UnfocusControl() by focusing on the disabled send button
		GUI.FocusControl("Disabled Send button");
	}
	
	function Send(string:String){
		Server.Log("chat", Player.nickname + ": " + string);
		Server.GetPhotonView().RPC("SyncObject", PhotonTargets.All, Server.GetPhotonView().viewID.ToString(), "chat", Player.nickname + ": " + string);
	}
}