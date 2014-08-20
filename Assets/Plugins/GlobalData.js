#pragma strict
public static class GlobalData {
	private var currentScene : String;
	public function GetCurrentScene() : String {
		if(currentScene == null || currentScene.Equals("")) {
			currentScene = "Main";
		}
		return currentScene;
	}
	public function SetCurrentScene(scene : String) {
		currentScene = scene;
	}
}