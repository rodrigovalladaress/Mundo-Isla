#pragma strict
#pragma downcast
public class ReservedPhotonViewIDHash {
	
	private var hash = new Hashtable();
	
	private function Contains(key : int) : boolean {
		return hash.Contains(key);
	}
	
	public function Get(id : int) : boolean {
		var key : int = id;
		return Contains(key) ? hash[key] : false;
	}
	
	public function Set(id : int, val : boolean) {
		//if(ItemManager.IsIDInRange(id)) {
			var key : int = id;
			if(Contains(key)) {
				hash.Remove(key);
			}
			hash.Add(key, val);
		/*} else {
			Debug.LogError("bad id = " + id);
		}*/
	}
}