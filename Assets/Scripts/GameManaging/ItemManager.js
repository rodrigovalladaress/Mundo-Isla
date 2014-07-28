#pragma strict
#pragma downcast
// It enables or disables the items on the map.
// Version: 1.0
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 

public static final var OBTAINED = true;

function Start () {
	var items : GameObject[] = GameObject.FindGameObjectsWithTag("Item");
	// Checks if the item has an entry in the itemHash of LevelManager
	if(LevelManager.ItemHashIsInitialized()) {
		for(var item : GameObject in items) {
			if(LevelManager.HasItemStateInCurrentSceneFor(item)) {
				var itemComponent : Item = item.GetComponent("Item");
				// If the item has been obtained, set its state to obtained
				if(LevelManager.GetItemStateInCurrentSceneFor(item) == OBTAINED) {
					itemComponent.setItemToObtained();
				}
			}
		}
	}
}