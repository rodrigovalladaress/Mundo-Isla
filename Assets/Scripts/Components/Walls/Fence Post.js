/*
find more cool stuff on  www.CreatedByBrett.com

Object scale is important.
   x = small
   y = BIG
   z = small
(The object is shaped like a pole, standing up.)

It can be rotated any direction.

In the Inspector, drag in the next fence post that this post should connect to.

*/

//PUBLIC INSPECTOR VARIABLES

public var go_next_fence_post : GameObject;


//PRIVATE VARIABLES

private var v3_distance : Vector3;
private var v3_nextend1 : Vector3;
private var v3_nextend2 : Vector3;
private var v3_nexthalflength : Vector3;
private var v3_thisend1 : Vector3;
private var v3_thisend2 : Vector3;
private var v3_thishalflength : Vector3;


//MONOBEHAVIOUR FUNCTIONS

function Awake() {
	//hide this fence post
	Destroy(GetComponent(MeshRenderer));

	//is there another fence post?
	if (go_next_fence_post != null) {

		//get Vector3's that are half the length of the fence pole heights, with the same rotations
		v3_thishalflength = transform.TransformDirection(Vector3.up * transform.localScale.y / 2);
		v3_nexthalflength = go_next_fence_post.transform.TransformDirection(Vector3.up * go_next_fence_post.transform.localScale.y / 2);

		//get the Vector3 that's the distance & direction between these two fence posts
		v3_distance = go_next_fence_post.transform.position - transform.position;
	}
}

function Start() {
	//connect it to another fence post?
	if (go_next_fence_post != null) {
		//normalize the scale of this object and set its rotation to nothin'
		transform.localScale = Vector3(1,1,1);
		transform.rotation.eulerAngles = Vector3(0,0,0);
		
		//create the mesh filter
		if (GetComponent("MeshFilter") == null) {
			gameObject.AddComponent("MeshFilter");
		}
		var ms_mesh : Mesh = GetComponent(MeshFilter).mesh;
		
		//create the 4 vertices
		ms_mesh.Clear();
		ms_mesh.vertices = [v3_thishalflength, -v3_thishalflength, v3_distance + v3_nexthalflength, v3_distance - v3_nexthalflength];
	
		//create 4 triangles between the 2 fence posts, to cover the space between them thoroughly.  Create each triangle in 2 ways (like 0,1,2 and 0,2,1) so they're impenetrable from both sides
		ms_mesh.triangles = [0,1,2, 0,2,1, 0,1,3, 1,3,1, 0,2,3, 0,3,2, 1,2,3, 1,3,2]; 
		
		//remove all colliders
		Destroy(GetComponent(BoxCollider));
		Destroy(GetComponent(SphereCollider));
		Destroy(GetComponent(CapsuleCollider));
		Destroy(GetComponent(MeshCollider));
		Destroy(GetComponent(WheelCollider));
		Destroy(GetComponent(RaycastCollider));

		//create a mesh collider in this shape
		gameObject.AddComponent("MeshCollider");
		GetComponent("MeshCollider").mesh = ms_mesh;

		//make sure these doen't interfere with OnMouseOver
		gameObject.layer = LayerMask.NameToLayer("Ignore Raycast");
		
	}
}

