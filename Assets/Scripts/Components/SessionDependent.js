#pragma strict

public var session:String[];

function Start () {
	while ( !Server.session ) yield;
	
	var keep:boolean = false;
	for (var _session:String in session)
		if ( Server.session == _session )
			keep = true;
	
	if (keep) Destroy(this);
	else Destroy(this.gameObject);
}