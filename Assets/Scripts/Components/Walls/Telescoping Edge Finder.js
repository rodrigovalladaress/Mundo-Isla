/*
find more cool stuff on  www.CreatedByBrett.com


In a nutshell, this creates invisible walls around holes in the terrain.

Attach this script to an object.  Place one or more of the objects in a crater or other hole in the terrain, slighty below ground level.  During Awake() this script sends out multiple raycasts, horizontally, to find the edges of the hole.  It connects those points in an uneven "circle" and raises a wall straight upwards along the perimeter.

For irregularly shaped holes, place a few of the objects and/or increase the number of raycasts.

*/

//PUBLIC INSPECTOR VARIABLES

public var i_numberofraycasts : int = 16; //number of vertical "fenceposts" to place; these are evenly distributed throughout 360 degrees on a horizontal plane
public var i_wallheight : int = 30; //height of each fencepost (wall portion)
public var i_raycastlength : int = 50; //maximum length each raycast will extend


//PRIVATE VARIABLES

private var ms_mesh : Mesh;
private var aj_triangles = new Array(); //int array
private var aj_vertices = new Array(); //Vector3 array


//MONOBEHAVIOUR FUNCTIONS

function Awake() {
	var fl_rotation : float;
	var i_raycasts : int;
	var i_vertices_index : int;
	var mr_meshrenderer : MeshRenderer;
	var mr_meshrenderers;
	var r_ray : Ray;
	var rh_hit : RaycastHit;
	var v3_edgepoint : Vector3;
	var v3_rotation : Vector3;
	
	//hide this object and its children
	mr_meshrenderers = GetComponentsInChildren(MeshRenderer);
	for (mr_meshrenderer in mr_meshrenderers) {
		Destroy(mr_meshrenderer);
	}

	//normalize the scale of this object and set its rotation to nothin'
	transform.localScale = Vector3(1,1,1);
	transform.rotation.eulerAngles.x = 0;
	transform.rotation.eulerAngles.y = 0;
	transform.rotation.eulerAngles.z = 0;
	
	//create the mesh filter
	if (GetComponent("MeshFilter") == null) {
		gameObject.AddComponent("MeshFilter");
	}
	ms_mesh = GetComponent(MeshFilter).mesh;

	//find the edges of the hole; add a "fence post" at each point
	i_vertices_index = 0;
	v3_rotation = transform.TransformDirection (Vector3.forward);
	for (i_raycasts = 0; i_raycasts < i_numberofraycasts; i_raycasts++) {
		//rotate this game object and get the ray to cast
		fl_rotation = i_raycasts * (360/i_numberofraycasts);
		transform.rotation.eulerAngles.y = fl_rotation;
		r_ray = new Ray (transform.position, transform.TransformDirection(Vector3.forward)); 
		
		//get the wall edge point
		if (Physics.Raycast(r_ray, rh_hit, i_raycastlength)) {
			v3_edgepoint = rh_hit.point;
			v3_edgepoint = v3_edgepoint - transform.position; //they're IN this game object, so cancel out the position of it.  Otherwise, they'll wind up somewhere else.
		} else {
			v3_edgepoint = Vector3(Random.Range(0,0.2), Random.Range(0,0.2), Random.Range(0,0.2)); //dummy value
		}
		
		//add a "fence post" (at the wall edge point) to the array of vertices
		aj_vertices[i_vertices_index] = v3_edgepoint;
		i_vertices_index++;
		aj_vertices[i_vertices_index] = v3_edgepoint + (Vector3.up * i_wallheight);
		i_vertices_index++;
	}
	
	//create walls between each of the "fence posts"
	for (i_raycasts = 0; i_raycasts < (i_numberofraycasts-1); i_raycasts++) {
		doTriangles(i_raycasts, (i_raycasts*2) + 0, (i_raycasts*2) + 1, (i_raycasts*2) + 2, (i_raycasts*2) + 3);
	}
	
	//create one more wall between the last and the first "fence posts"
	i_raycasts = (i_numberofraycasts-1);
	doTriangles(i_raycasts, (i_raycasts*2) + 0, (i_raycasts*2) + 1, 0, 1);

}

function Start() {
	//assign the vertices & triangles for this mesh
	ms_mesh.Clear();
	ms_mesh.vertices = aj_vertices;
	ms_mesh.RecalculateBounds();
	ms_mesh.triangles = aj_triangles;
	
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

	//un-rotate this object, and move it to 0,0,0 so the mesh appears in the right place
	transform.rotation.eulerAngles.x = 0;
	transform.rotation.eulerAngles.y = 0;
	transform.rotation.eulerAngles.z = 0;

	//make sure these don't interfere with OnMouseOver
	gameObject.layer = LayerMask.NameToLayer("Ignore Raycast");

	//clear out global variables so they don't waste memory
	ms_mesh = null;
	aj_triangles = null;
	aj_vertices = null;
}


// PRIVATE FUNCTIONS

private function doTriangles(i_index_fp : int, i_1_fp : int, i_2_fp : int, i_3_fp : int, i_4_fp : int) {
	//create 4 triangles between each consecutive pair of "fence posts", to cover the space between them thoroughly.  Create each triangle in 2 ways (like 0,1,2 and 0,2,1) so it's impenetrable from both sides
	var i_index : int;
	i_index = i_index_fp * 24;

	//triangle 1, version 1
	aj_triangles[i_index + 0] = i_1_fp;
	aj_triangles[i_index + 1] = i_2_fp;
	aj_triangles[i_index + 2] = i_3_fp;
	
	//triangle 1, version 2
	aj_triangles[i_index + 3] = i_1_fp;
	aj_triangles[i_index + 4] = i_3_fp;
	aj_triangles[i_index + 5] = i_2_fp;
	
	//triangle 2, version 1
	aj_triangles[i_index + 6] = i_1_fp;
	aj_triangles[i_index + 7] = i_2_fp;
	aj_triangles[i_index + 8] = i_4_fp;
	
	//triangle 2, version 2
	aj_triangles[i_index + 9] = i_1_fp;
	aj_triangles[i_index + 10] = i_4_fp;
	aj_triangles[i_index + 11] = i_2_fp;
	
	//triangle 3, version 1
	aj_triangles[i_index + 12] = i_1_fp;
	aj_triangles[i_index + 13] = i_3_fp;
	aj_triangles[i_index + 14] = i_4_fp;
	
	//triangle 3, version 2
	aj_triangles[i_index + 15] = i_1_fp;
	aj_triangles[i_index + 16] = i_4_fp;
	aj_triangles[i_index + 17] = i_3_fp;
	
	//triangle 4, version 1
	aj_triangles[i_index + 18] = i_2_fp;
	aj_triangles[i_index + 19] = i_3_fp;
	aj_triangles[i_index + 20] = i_4_fp;

	//triangle 4, version 2
	aj_triangles[i_index + 21] = i_2_fp;
	aj_triangles[i_index + 22] = i_4_fp;
	aj_triangles[i_index + 23] = i_3_fp;
}
