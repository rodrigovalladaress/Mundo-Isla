#pragma strict
#pragma downcast
public class ReservedPhotonViewIDHash {
	
	private var hash = new Hashtable();
	
	private function Contains(key : String) : boolean {
		return hash.Contains(key);
	}
	
	public function Get(id : int) : boolean {
		return Get(LevelManager.GetCurrentScene(), id);
	}
	
	public function Get(scene : String, id : int) : boolean {
		var key : String = Key(scene, id);
		return Contains(key) ? hash[key] : false;
	}
	
	public function Set(scene : String, id : int, val : boolean) {
		if(ItemManager.IsIDInRange(id)) {
			var key : String = Key(scene, id);
			if(Contains(key)) {
				hash.Remove(key);
			}
			hash.Add(key, val);
		} else {
			Debug.LogError("bad id = " + id);
		}
	}
	
	private function Key(scene : String, id : int) : String {
		return scene + id;
	}
}