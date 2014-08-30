#pragma strict
class NPC extends MonoBehaviour{
	var _minDistance:float = 7.0;
	
	function OnBecameVisible () {
		gameObject.GetComponent(Label).enabled = true;
	}
	
	function OnBecameInvisible () {
		gameObject.GetComponent(Label).enabled = false;
	}
	
	
	function OnMouseOver(){
		while (!Player.exists()) return;
		if ((Vector3.Distance(Player.position(), gameObject.transform.position) <= _minDistance)){
			// Al pulsar el boton derecho del raton sobre un NPC, abrir el editor de dialogos 
			// de ese  NPC. Aparece un arbol a la derecha que representa como cambia el 
			// dialogo segun las opciones que se elijan.
			if ( Input.GetMouseButtonDown(1) ){
				if ( Player.GetNickname().ToLower() == "admin" ){
					if( !GameObject.Find( "Root" ) ){
						var _root:GameObject = new GameObject();
						_root.name = "Root";
						_root.AddComponent(DialogEditor);
						Server.StartCoroutine(DialogEditor.Load(this.gameObject.name));
					}
				}
			}
			// Si se pulsa el boton izquierdo, se muestra el dialogo del NPC.
			else if ( Input.GetMouseButtonDown(0) ) {
				Dialog.Open(this.gameObject.name);
			}
		}
		
	}
	
}