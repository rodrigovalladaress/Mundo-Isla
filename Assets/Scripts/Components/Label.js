/*******************************************************
|	Label
|
|	Display name, with an optional distance limit.
|
|	Versión: 0.1
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
#pragma strict
class Label extends MonoBehaviour
{
	private var _player			:	GameObject;
	public var _minDistance		:	float	= 10;
	public var _labelOffset		:	int		= 120;
	
	
	function OnBecameVisible () {
	    enabled = true;
	}
	
	function OnBecameInvisible () {
	    enabled = false;
	}
	
	function OnGUI(){
		GUI.skin = Resources.Load("Skin") as GUISkin;
		GUI.depth = 1;
		if (Player.exist()){
			if (_player == null) _player = Player.object;
			if(_player != null) {
				if ((Vector3.Distance(_player.transform.position, gameObject.transform.position) <= _minDistance)) {
					var screenPosition:Vector3 = Camera.main.WorldToScreenPoint(transform.position);
					var _rect:Rect = new Rect	(	screenPosition.x - gameObject.name.ToString().Length * 4,
													Screen.height - screenPosition.y,
													gameObject.name.ToString().Length * 9,
													25
												);
					GUILayout.BeginArea(_rect);
					GUI.color.a = 0.5;
					GUILayout.Box(gameObject.name);
					GUI.color.a = 1;
					GUILayout.EndArea();
				}
			}
		}
	}
}