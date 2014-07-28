#pragma strict

var vrx = 10;

function Update () {
   transform.Rotate(vrx * Time.deltaTime,0,0);
   
}