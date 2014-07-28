#pragma strict

public var showJustOnce:boolean = true;
public var secondsToShow:float = 5.0;
public var tutorialText:String[];
private var PlayerIsInside:boolean = false; // This is uset to do an "onEnter(do once)" trigger, instead of a "onEnter(constant)".
private var ShowingInfo:boolean = false; // This is uset to do an "onEnter(do once)" trigger, instead of a "onEnter(constant)".

function OnTriggerEnter (c : Collider) {
	if (c.gameObject == Player.object){
		if (!PlayerIsInside && !ShowingInfo){
			PlayerIsInside = true;
			ShowingInfo = true;
			while ( MainGUI.Tutorial.text != "") yield;
			for (var line:String in tutorialText){
				MainGUI.Tutorial.text = line;
				
				if (Chat.Text != "")
					Chat.Text = Chat.Text + "\n" + MainGUI.Text("Tutorial") + ": " + line;
				else
					Chat.Text = Chat.Text + MainGUI.Text("Tutorial") + ": " + line;
				
				MainGUI.ChatInterface.SP.y = MainGUI.ChatInterface.SP.y + 15;
				
				yield WaitForSeconds(secondsToShow);
			}
			MainGUI.Tutorial.text = "";
			ShowingInfo = false;
		}
	}
}

function OnTriggerExit (c : Collider) {
    if (c.gameObject == Player.object){
		PlayerIsInside = false;
		if (showJustOnce){
			while (ShowingInfo) yield;
			Destroy(gameObject);
		}
	}
}