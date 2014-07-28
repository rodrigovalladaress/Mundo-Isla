using UnityEngine;
using System.Collections;

public class NewBehaviourScript : MonoBehaviour {

	
	// Update is called once per frame
	void Update () {
		var vRotacionx = 10;
		transform.Rotate(vRotacionx * Time.deltaTime,0,0); //Time.Time = tiempo real maquina y Time.DeltaTime tiempo por frame
	}
}
