/*******************************************************
|	Skin Script
|
|	This MonoBehaviour is responsible for controlling the CharacterGenerator,
|	animating the character, and the user interface. When the user requests a 
|	different character configuration the CharacterGenerator is asked to prepare
|	the required assets. When all assets are downloaded and loaded a new
|	character is created.
|
|	Versión: 1.0
|	
|	Autor: Manlio Joaquín García González <manliojoaquin@gmail.com>
|
|	Proyecto SAVEH
*******************************************************/
#pragma strict
class Skin extends MonoBehaviour{
	static var generator					: CharacterGenerator;
	static var character					: GameObject;
	static var usingLatestConfig			: boolean;
	static var newCharacterRequested		: boolean = true;
	static var firstCharacter				: boolean = true;
	static var nonLoopingAnimationToPlay	: String;
	static var fadeLength					: float = .6f;
	
	/*******************************************************
	|	Actions taken when this script start
	*******************************************************/
	function Start(){
		while ( Player.GetSkinString() == null ) yield;
		// Initializes the CharacterGenerator and load a saved config if any.
	    while (!CharacterGenerator.ReadyToUse) yield;
	    if (Player.GetSkinString() != "")
	        generator = CharacterGenerator.CreateWithConfig(Player.GetSkinString());
	    else{
	        generator = CharacterGenerator.CreateWithRandomConfig("Female");
	        while (!generator.ConfigReady) yield;
	        Server.StartCoroutine( Server.Retrieve.PlayerSkin( generator.GetConfig()) );
	    }
	}
	
	/*******************************************************
	|	Actions taken every frame
	*******************************************************/
	function Update(){
		
	    if (generator == null) return;
	    if (usingLatestConfig) return;
	    if (!generator.ConfigReady) return;
	
	    usingLatestConfig = true;
	
	    if (newCharacterRequested){
		    // Requests a new character when the required assets are loaded, starts
			// a non looping animation when changing certain pieces of clothing.
	        GameObject.Destroy(character);
	        character = generator.Generate();
	        character.transform.position = transform.position;
	        character.transform.rotation = transform.rotation;
	        character.transform.parent = transform;
	        character.renderer.castShadows = false;
	        character.renderer.receiveShadows = false;
	        character.animation.Play("idle1");
	        character.animation["idle1"].wrapMode = WrapMode.Loop;
	        newCharacterRequested = false;
	
	        // Start the walkin animation for the first character.
	        if (!firstCharacter) return;
	        firstCharacter = false;
	        if (character.animation["walkin"] == null) return;
	        
	        // Set the layer to 1 so this animation takes precedence
	        // while it's blended in.
	        character.animation["walkin"].layer = 1;
	        
	        // Use crossfade, because it will also fade the animation
	        // nicely out again, using the same fade length.
	        character.animation.CrossFade("walkin", fadeLength);
	        
	        // We want the walkin animation to have full weight instantly,
	        // so we overwrite the weight manually:
	        character.animation["walkin"].weight = 1;
	        
	        // As the walkin animation starts outside the camera frustrum,
	        // and moves the mesh outside its original bounding box,
	        // updateWhenOffscreen has to be set to true for the
	        // SkinnedMeshRenderer to update. This should be fixed
	        // in a future version of Unity.
	        character.GetComponent(SkinnedMeshRenderer).updateWhenOffscreen = true;
	    }
	    else{
	        character = generator.Generate(character);
	        
	        if (nonLoopingAnimationToPlay == null) return;
	        
	        character.animation[nonLoopingAnimationToPlay].layer = 1;
	        character.animation.CrossFade(nonLoopingAnimationToPlay, fadeLength);
	        nonLoopingAnimationToPlay = null;
	    }
	}
	
	/******************************
	|	Change Character
	******************************/
	static function ChangeCharacter(next:boolean){
	    generator.ChangeCharacter(next);
	    usingLatestConfig = false;
	    newCharacterRequested = true;
	}
	
	/******************************
	|	Change Element
	******************************/
	static function ChangeElement(catagory:String, next:boolean, anim:String){
	    generator.ChangeElement(catagory, next);
	    usingLatestConfig = false;
	    
	    if (!character.animation.IsPlaying(anim))
	        nonLoopingAnimationToPlay = anim;
	}
	
}