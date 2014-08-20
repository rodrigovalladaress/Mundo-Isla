// This class smooths the movement of the players in Photon.
//
// Version: 1.4
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com>
//
// http://doc.exitgames.com/en/pun/current/tutorials/tutorial-marco-polo
using UnityEngine;

public class NetworkCharacter : Photon.MonoBehaviour
{
	private Vector3 correctPlayerPos;
	private Quaternion correctPlayerRot;
	private string networkPlayerScene;

	void Awake() {
		// instantiationData[0] stores the scene the player is been instantiated in
		if(!GlobalData.GetCurrentScene().Equals(((string)photonView.instantiationData[0]))) {
			// We set the player invisible when it is instantiated in a different scene of 
			// the local client
			gameObject.active = false;
		}
	}
	
	// Update is called once per frame
	void Update()
	{
		if (!photonView.isMine)
		{
			//if(networkPlayerScene.Equals(GlobalData.GetCurrentScene())) {
				transform.position = Vector3.Lerp(transform.position, this.correctPlayerPos, Time.deltaTime * 5);
				transform.rotation = Quaternion.Lerp(transform.rotation, this.correctPlayerRot, Time.deltaTime * 5);
			/*} else {
				GameObject.Destroy(this.gameObject);
			}*/
		}
	}
	
	void OnPhotonSerializeView(PhotonStream stream, PhotonMessageInfo info)
	{
		if (stream.isWriting)
		{
			// We own this player: send the others our data
			stream.SendNext(transform.position);
			stream.SendNext(transform.rotation);
			//stream.SendNext(GlobalData.GetCurrentScene());
		}
		else
		{
			string networkPlayerScene;
			// Network player, receive data
			this.correctPlayerPos = (Vector3)stream.ReceiveNext();
			this.correctPlayerRot = (Quaternion)stream.ReceiveNext();
			//this.networkPlayerScene = (string)stream.ReceiveNext();
		}
	}
}