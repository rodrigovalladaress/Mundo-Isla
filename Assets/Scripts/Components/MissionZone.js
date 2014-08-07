#pragma strict
class MissionZone extends MonoBehaviour{
	public var mission:String;
	public var status:String;
	
	function OnTriggerEnter (c : Collider) {
		if (c.gameObject == Player.object){
			Server.StartCoroutine( Journal.SetMission(mission, status) );
			Debug.Log("set " + mission + " as " + status);
			Destroy(this.gameObject);
		}
	}
}