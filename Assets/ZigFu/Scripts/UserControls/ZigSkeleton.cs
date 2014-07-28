// Loads new scenes and stores the position where the player will spawn
// in each scene.
// Version: 2.0
// Edited by: Rodrigo Valladares Santana <rodriv_tf@hotmail.com>
// 	- Cargar now loads an xml file from localhost if the project is executed
//	  in webplayer.
//	- Guardar now saves an xml file using a PHP script.
//	- The syntax of the result of the exercise has been changed in order to
//	  work with PHP (and XML standars).
using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Xml;
using System.Timers;

public class ZigSkeleton : MonoBehaviour
{
    public Transform Head;
    public Transform Neck;
    public Transform Torso;
    public Transform Waist;

    public Transform LeftCollar;
    public Transform LeftShoulder;
    public Transform LeftElbow;
    public Transform LeftWrist;
    public Transform LeftHand;
    public Transform LeftFingertip;

    public Transform RightCollar;
    public Transform RightShoulder;
    public Transform RightElbow;
    public Transform RightWrist;
    public Transform RightHand;
    public Transform RightFingertip;

    public Transform LeftHip;
    public Transform LeftKnee;
    public Transform LeftAnkle;
    public Transform LeftFoot;

    public Transform RightHip;
    public Transform RightKnee;
    public Transform RightAnkle;
    public Transform RightFoot;
	
    public bool mirror = false;
    public bool UpdateJointPositions = false;
    public bool UpdateRootPosition = false;
    public bool UpdateOrientation = true;
    public bool RotateToPsiPose = false;
    public float RotationDamping = 30.0f;
    public float Damping = 30.0f;
    public Vector3 Scale = new Vector3(0.001f, 0.001f, 0.001f);
	
	public bool Angle = false;
	public bool plano = true;
	public bool barra = true;	
	public int arti, arti1, inicio, eje = 0;
	
	public bool Interfaz = false;
	public GUIText texto;
	public GUIText textoMin;
	public GUIText texto1; // minimo
	public GUIText textoMax;
	public GUIText texto2; //maximo
	public GUIText textoRep;
	public GUIText texto3; //repeticiones
	public GUIText textoDificultad; // indica la dificultad del ejercicio;
	public GUIText texto4;
	public Texture2D bajo, medio, alto;
	public GameObject Plano, Barra;
	
	public float dificultad = 50; // indica el porcentaje de recorrido que se debe realizar para que se cuente como repeticion
	Timer timer;

	// Direccion desde la que se descargan y cargan XML desde el web player
	// TODO Usar un servidor para descargar los archivos
	public static string localHostPath = "http://localhost/daniel_goniometro";


	Resultados medicion = new Resultados();
	
	public float minimo, maximo; // maximo y minimo angulo del ejercicio

	
	
	//Clase que define un vector en un espacio tridimensional y como trabajar con él
	public class vector{
		
		private float X;
		private float Y;
		private float Z;
		public string name;

		
		public vector(){
			X = 0;
			Y = 0;
			Z = 0;
			name = "";
		}
		
		
		public vector(vector vec){
			X = vec.GetX();
			Y = vec.GetY();
			Z = vec.GetZ();
			name = vec.GetName();
		}
		
		public void SetX(float x){
			X = x;
		}
		
		public void SetY(float y){
			Y = y;
		}
		
		public void SetZ(float z){
			Z = z;
		}
		
		public void SetName(string n){
			name = n;
		}
		
		public float GetX(){
			return X;
		}
		
		public float GetY(){
			return Y;
		}
		
		public float GetZ(){
			return Z;
		}	
		
		public string GetName(){
			return name;
		}	
		
	}
	
	vector plane = new vector(); // plano de medicion->definido en el fichero de definiciones
	vector initBone = new vector(); //posicion inicial del brazo, con respecto a esta posicion se medira
	
	
    public Vector3 PositionBias = Vector3.zero;

    private Transform[] transforms;
    private Quaternion[] initialRotations;
    private Vector3 rootPosition;

	
	public class Pose{
		
		private int art; 
		private int art1;
		public vector bone; // posicion correcta del hueso
		public float grado; // restriccion en grados
		
		public Pose(){
			art = 0;
			art1 = 0;
			vector bone = new vector();
			grado = 0;
			
		}		
		
		public void Setart(int x){
			art = x;
		}
		
		public void Setart1(int y){
			art1 = y;
		}
		
		public void Setbone(vector v){
			bone = v;
		}
		
		public void Setgrado(float x){
			grado = x;
		}
		
		public int Getart(){
			return art;
		}
		
		public int Getart1(){
			return art1;
		}
		
		public vector Getbone(){
			return bone;
		}
		
		public float Getgrado(){
			return grado;
		}
		

	}
	
	List<Pose> poseList = new List<Pose>();  //Lista de articulaciones a tener en cuenta durante el ejercicio 
	

	public class Resultados{
		
		private float tick;//tiempo transcurrido
		private float limit;//intervalor para guardar datos
		private double maxLocal; //maximo local
		private double minLocal; //minimo local
		private double maxGlobal;
		private double minGlobal;
		private double repeticiones; //numero de repeticiones
		
		public Resultados(){
			tick = 0;
			limit = 0.1f;
			maxLocal = 0;
			maxGlobal = 0;
			minLocal = 180;
			minGlobal = 180;
			repeticiones = 0;
		}
		
		public void SetTick(float x){
			tick = x;
		}
		
		public void SetLimit(float x){
			limit = x;
		}
		
		public void SetMaxLocal(double x){
			maxLocal = x;
		}
		
		public void SetMaxGlobal(double x){
			maxGlobal = x;
		}
		
		public void SetMinLocal(double x){
			minLocal = x;
		}
		
		public void SetMinGlobal(double x){
			minGlobal = x;
		}
		
		public void SetRepeticiones(double x){
			repeticiones = x;
		}
		
		public float GetTick(){
			return tick;
		}
		
		public float GetLimit(){
			return limit;
		}

		public double GetMaxLocal(){
			return maxLocal;
		}
		
		public double GetMaxGlobal(){
			return maxGlobal;
		}
		
		public double GetMinLocal(){
			return minLocal;
		}
		
		public double GetMinGlobal(){
			return minGlobal;
		}
		
		public double GetRepeticiones(){
			return repeticiones;
		}

		// Dado un nombre de Hueso, lo cambia para ser usado en un XML
		private string nombreHuesoXML(string name) {
			string nombreHueso;
			int startRemove = name.IndexOf(" ");
			nombreHueso = name.Remove(startRemove);
			return nombreHueso;
		}   
		
		//Escribe en un fichero los datos obtenidos tras la realizacion del ejercicio
		public IEnumerator Guardar(string name, double minimo, double maximo, double angulo, vector Plano){
			XmlTextWriter writerXml;
			bool found = false;
			// Nombre del hueso para ser usado en el XML
			string nameXML = nombreHuesoXML(name);

			// Se guarda el XML mediante un script de PHP.
			string stringUrl = localHostPath + "/guardarResultado.php/?hueso=" + nameXML + "&fecha=" 
				+ WWW.EscapeURL(System.DateTime.Now.ToLongDateString() + " " 
				                + System.DateTime.Now.ToShortTimeString())
				+ "&minimo=" + minimo + "&maximo=" + maximo + "&angulo=" + angulo + "&plano=" + Plano.GetX() 
				+ "," + Plano.GetY() + "," + Plano.GetZ();
			WWW www = new WWW(stringUrl);
			Debug.Log(www.url);
			yield return www;

			// check for errors
			if (www.error == null) {
				Debug.Log("WWW Ok!: " + www.data);
			} else {
				Debug.Log("WWW Error: "+ www.error);
			}
		}
	}
	

	    
	
	//carga los datos de un fichero de definiciones de ejercicios
	public IEnumerator Cargar()
	{
		XmlDocument xDoc = new XmlDocument();
		if(Application.isWebPlayer) {
			string url = localHostPath + "/ejer.xml";
			WWW www = new WWW(url);
			while(!www.isDone) {
				yield return new WaitForSeconds(1);
			}
			string xmlString = www.text;
			xDoc.LoadXml(xmlString);
		} else {
			xDoc.Load("./ejer.xml");
		}

		
	   XmlNodeList exer = xDoc.GetElementsByTagName("EXERCISE");	  
	   arti = Convert.ToInt16(exer[0].Attributes["art"].InnerText);
       arti1 = Convert.ToInt16(exer[0].Attributes["art1"].InnerText);
		
	   XmlNodeList vector = xDoc.GetElementsByTagName("EJE");
	   XmlNodeList pos0 = xDoc.GetElementsByTagName("INI");
	   XmlNodeList angles = xDoc.GetElementsByTagName("ANGLE");
 	   XmlNodeList frames = ((XmlElement)exer[0]).GetElementsByTagName("POSITION");	  
		
		
	   //plano sobre el que se va a realizar la medicion
       plane.SetX(Convert.ToInt16(vector[0].Attributes["X"].InnerText));
	   plane.SetY(Convert.ToInt16(vector[0].Attributes["Y"].InnerText));
	   plane.SetZ(Convert.ToInt16(vector[0].Attributes["Z"].InnerText));
	  
				

	   //posicion de inicio del ejercicio
	   initBone.SetX(Convert.ToInt16(pos0[0].Attributes["x"].InnerText));
	   initBone.SetY(Convert.ToInt16(pos0[0].Attributes["y"].InnerText));
	   initBone.SetZ(Convert.ToInt16(pos0[0].Attributes["z"].InnerText));
		
	   //Angulos maximo y minimo de ejercicio
	   maximo = Convert.ToInt16(angles[0].Attributes["MAX"].InnerText);
	   minimo = Convert.ToInt16(angles[0].Attributes["MIN"].InnerText);
		
	   
	   XmlNodeList ID;
	   XmlNodeList ID1;		
	   XmlNodeList FX;
	   XmlNodeList FY;
	   XmlNodeList FZ;
	   XmlNodeList G;
	 			
	   foreach (XmlElement frame in frames)
	   {

          int i = 0;
   	      Pose pose = new Pose();	
			ID = frame.GetElementsByTagName("ID");
			ID1 = frame.GetElementsByTagName("ID1");
			FX = frame.GetElementsByTagName("X");
			FY = frame.GetElementsByTagName("Y");
			FZ = frame.GetElementsByTagName("Z");
			G = frame.GetElementsByTagName("GRADO");
			
			//define el hueso que vamos a tener en cuenta
			pose.Setart(Convert.ToInt16(ID[i].InnerText));
			pose.Setart1(Convert.ToInt16(ID1[i].InnerText));
			
			
			//define la posicion correcta para el ejercicio
			vector aux = new vector();
			aux.SetX(Convert.ToInt16(FX[i].InnerText));
			aux.SetY(Convert.ToInt16(FY[i].InnerText));
			aux.SetZ(Convert.ToInt16(FZ[i].InnerText));
			pose.Setbone(aux);

			//define las restricciones en angulos con respecto a la posicion correcta
			pose.Setgrado(Convert.ToInt16(G[i].InnerText));
							
			//Lista de restricciones del ejercicio
			poseList.Add (pose);
			i++; 
	   }
		
    }
	
	
	//Traductor entre los joints del fichero de definicion y el skeleton de kinect
	public Transform art(int op){
		switch (op)
        {
		case 1:	return Head;
		case 2: return Neck;
		case 3: return Torso;
		case 4: return Waist;
		case 5: return LeftCollar;
		case 6: return LeftShoulder;
		case 7: return LeftElbow;
        case 8: return LeftWrist;
        case 9: return LeftHand;
        case 10: return LeftFingertip;
        case 11: return RightCollar;
        case 12: return RightShoulder;
        case 13: return RightElbow;
        case 14: return RightWrist;
        case 15: return RightHand;
        case 16: return RightFingertip;
        case 17: return LeftHip;
        case 18: return LeftKnee;
        case 19: return LeftAnkle;
        case 20: return LeftFoot;
        case 21: return RightHip;
        case 22: return RightKnee;
        case 23: return RightAnkle;
        case 24: return RightFoot;
		default: return RightKnee;
		}
	}

	
	//Efecto espejo
    ZigJointId mirrorJoint(ZigJointId joint)
    {
        switch (joint)
        {
            case ZigJointId.LeftCollar:
                return ZigJointId.RightCollar;
            case ZigJointId.LeftShoulder:
                return ZigJointId.RightShoulder;
            case ZigJointId.LeftElbow:
                return ZigJointId.RightElbow;
            case ZigJointId.LeftWrist:
                return ZigJointId.RightWrist;
            case ZigJointId.LeftHand:
                return ZigJointId.RightHand;
            case ZigJointId.LeftFingertip:
                return ZigJointId.RightFingertip;
            case ZigJointId.LeftHip:
                return ZigJointId.RightHip;
            case ZigJointId.LeftKnee:
                return ZigJointId.RightKnee;
            case ZigJointId.LeftAnkle:
                return ZigJointId.RightAnkle;
            case ZigJointId.LeftFoot:
                return ZigJointId.RightFoot;

            case ZigJointId.RightCollar:
                return ZigJointId.LeftCollar;
            case ZigJointId.RightShoulder:
                return ZigJointId.LeftShoulder;
            case ZigJointId.RightElbow:
                return ZigJointId.LeftElbow;
            case ZigJointId.RightWrist:
                return ZigJointId.LeftWrist;
            case ZigJointId.RightHand:
                return ZigJointId.LeftHand;
            case ZigJointId.RightFingertip:
                return ZigJointId.LeftFingertip;
            case ZigJointId.RightHip:
                return ZigJointId.LeftHip;
            case ZigJointId.RightKnee:
                return ZigJointId.LeftKnee;
            case ZigJointId.RightAnkle:
                return ZigJointId.LeftAnkle;
            case ZigJointId.RightFoot:
                return ZigJointId.LeftFoot;


            default:
                return joint;
        }
    }

    
    public void Awake()
    {
        int jointCount = Enum.GetNames(typeof(ZigJointId)).Length;

        transforms = new Transform[jointCount];
        initialRotations = new Quaternion[jointCount];

        transforms[(int)ZigJointId.Head] = Head;
        transforms[(int)ZigJointId.Neck] = Neck;
        transforms[(int)ZigJointId.Torso] = Torso;
        transforms[(int)ZigJointId.Waist] = Waist;
        transforms[(int)ZigJointId.LeftCollar] = LeftCollar;
        transforms[(int)ZigJointId.LeftShoulder] = LeftShoulder;
        transforms[(int)ZigJointId.LeftElbow] = LeftElbow;
        transforms[(int)ZigJointId.LeftWrist] = LeftWrist;
        transforms[(int)ZigJointId.LeftHand] = LeftHand;
        transforms[(int)ZigJointId.LeftFingertip] = LeftFingertip;
        transforms[(int)ZigJointId.RightCollar] = RightCollar;
        transforms[(int)ZigJointId.RightShoulder] = RightShoulder;
        transforms[(int)ZigJointId.RightElbow] = RightElbow;
        transforms[(int)ZigJointId.RightWrist] = RightWrist;
        transforms[(int)ZigJointId.RightHand] = RightHand;
        transforms[(int)ZigJointId.RightFingertip] = RightFingertip;
        transforms[(int)ZigJointId.LeftHip] = LeftHip;
        transforms[(int)ZigJointId.LeftKnee] = LeftKnee;
        transforms[(int)ZigJointId.LeftAnkle] = LeftAnkle;
        transforms[(int)ZigJointId.LeftFoot] = LeftFoot;
        transforms[(int)ZigJointId.RightHip] = RightHip;
        transforms[(int)ZigJointId.RightKnee] = RightKnee;
        transforms[(int)ZigJointId.RightAnkle] = RightAnkle;
        transforms[(int)ZigJointId.RightFoot] = RightFoot;



        // save all initial rotations
        // NOTE: Assumes skeleton model is in "T" pose since all rotations are relative to that pose
        foreach (ZigJointId j in Enum.GetValues(typeof(ZigJointId)))
        {
            if (transforms[(int)j])
            {
                // we will store the relative rotation of each joint from the gameobject rotation
                // we need this since we will be setting the joint's rotation (not localRotation) but we 
                // still want the rotations to be relative to our game object
                initialRotations[(int)j] = Quaternion.Inverse(transform.rotation) * transforms[(int)j].rotation;
            }
        }
    }

    void Start()
    {
		Plano = GameObject.CreatePrimitive(PrimitiveType.Plane);
		Plano.name = "plano";
		Plano.transform.localScale = new Vector3(0.09f,0,0.09f);
		Plano.renderer.material.shader = Shader.Find("Transparent/Diffuse");
		Plano.renderer.material.color = new Color(0,1,0,0.4f);
		Plano.renderer.enabled = plano; //visibilidad
		
		Barra = GameObject.Find("barra");
		Barra.renderer.enabled = barra;
		
		
			
		// start out in calibration pose
        if (RotateToPsiPose)
        {
            RotateToCalibrationPose();
        }
    }

    void UpdateRoot(Vector3 skelRoot)
    {
        // +Z is backwards in OpenNI coordinates, so reverse it
        rootPosition = Vector3.Scale(new Vector3(skelRoot.x, skelRoot.y, skelRoot.z), doMirror(Scale)) + PositionBias;
        if (UpdateRootPosition)
        {
            transform.localPosition = (transform.rotation * rootPosition);
        }
    }

    void UpdateRotation(ZigJointId joint, Quaternion orientation)
    {
        joint = mirror ? mirrorJoint(joint) : joint;
        // make sure something is hooked up to this joint
        if (!transforms[(int)joint])
        {
            return;
        }

        if (UpdateOrientation)
        {
            Quaternion newRotation = transform.rotation * orientation * initialRotations[(int)joint];
            if (mirror)
            {
                newRotation.y = -newRotation.y;
                newRotation.z = -newRotation.z;
            }
            transforms[(int)joint].rotation = Quaternion.Slerp(transforms[(int)joint].rotation, newRotation, Time.deltaTime * RotationDamping);
        }
    }
    Vector3 doMirror(Vector3 vec)
    {
        return new Vector3(mirror ? -vec.x : vec.x, vec.y, vec.z);
    }
    void UpdatePosition(ZigJointId joint, Vector3 position)
    {
        joint = mirror ? mirrorJoint(joint) : joint;
        // make sure something is hooked up to this joint
        if (!transforms[(int)joint])
        {
            return;
        }

        if (UpdateJointPositions)
        {
            Vector3 dest = Vector3.Scale(position, doMirror(Scale)) - rootPosition;
            transforms[(int)joint].localPosition = Vector3.Lerp(transforms[(int)joint].localPosition, dest, Time.deltaTime * Damping);
        }
    }

    public void RotateToCalibrationPose()
    {
        foreach (ZigJointId j in Enum.GetValues(typeof(ZigJointId)))
        {
            if (null != transforms[(int)j])
            {
                transforms[(int)j].rotation = transform.rotation * initialRotations[(int)j];
            }
        }

        // calibration pose is skeleton base pose ("T") with both elbows bent in 90 degrees
        if (null != RightElbow)
        {
            RightElbow.rotation = transform.rotation * Quaternion.Euler(0, -90, 90) * initialRotations[(int)ZigJointId.RightElbow];
        }
        if (null != LeftElbow)
        {
            LeftElbow.rotation = transform.rotation * Quaternion.Euler(0, 90, -90) * initialRotations[(int)ZigJointId.LeftElbow];
        }
    }

    public void SetRootPositionBias()
    {
        this.PositionBias = -rootPosition;
    }

    public void SetRootPositionBias(Vector3 bias)
    {
        this.PositionBias = bias;
    }

	
    float distance(float right, float left)
    {
       if ((right < 0 && left < 0) || (right > 0 && left > 0))
          return (right - left);
       else
          return (right + left);
    }
	
	
	public double angulo( vector bone, vector initBone){
		
		double scalarProduct = bone.GetX() * initBone.GetX() + bone.GetY() * initBone.GetY() + bone.GetZ() * initBone.GetZ();
		double ModuleBone = System.Math.Sqrt(bone.GetX() * bone.GetX() + bone.GetY() * bone.GetY() + bone.GetZ() * bone.GetZ());
		double ModuleInitBone = System.Math.Sqrt(initBone.GetX() * initBone.GetX() + initBone.GetY() * initBone.GetY() + initBone.GetZ() * initBone.GetZ());
		double cos = scalarProduct / (ModuleBone * ModuleInitBone);
		double ang = System.Math.Acos(cos) * 180 / System.Math.PI; //se pasa de radianes a grados
		
		return ang;	
	}
	
	
	//Calculo del producto vectorial de dos vectores dados
	public vector prod_vec(vector a, vector b){
		
		vector resultado = new vector();
		
		resultado.SetX(a.GetY() * b.GetZ() - a.GetZ() * b.GetY());
		resultado.SetY(a.GetZ() * b.GetX() - a.GetX() * b.GetZ());
		resultado.SetZ(a.GetX() * b.GetY() - a.GetY() * b.GetX());
		
		return resultado;
	}
	
	//calcula el angulo que forman las proyecciones de dos vectores en un plano dado.
	public double angulo_proyeccion( vector bone, vector plane, vector initBone){
		
		vector productVect = new vector();
		vector proyectBone = new vector();
		vector proyectBone1 = new vector();
		vector productVect1 = new vector();
		
		productVect = prod_vec(bone, plane);
		proyectBone = prod_vec(plane, productVect); //proyeccion sobre el plano del vector a medir
					
		productVect = prod_vec(initBone, plane);
		proyectBone1 = prod_vec(plane, productVect);// proyeccion sobre el plano del vector de inicio
		
		
		double scalarProduct = proyectBone.GetX() * proyectBone1.GetX() + proyectBone.GetY() * proyectBone1.GetY() + proyectBone.GetZ() * proyectBone1.GetZ();		
		double ModuleProyect = System.Math.Sqrt(proyectBone.GetX() * proyectBone.GetX() + proyectBone.GetY() * proyectBone.GetY() + proyectBone.GetZ() * proyectBone.GetZ());
		double ModuleProyect1 = System.Math.Sqrt(proyectBone1.GetX() * proyectBone1.GetX() + proyectBone1.GetY() * proyectBone1.GetY() + proyectBone1.GetZ() * proyectBone1.GetZ());
		double cos = scalarProduct / (ModuleProyect * ModuleProyect1);
		
		double angulo = System.Math.Acos(cos) * 180 / System.Math.PI; //se pasa de radianes a grados
		
		productVect1 =prod_vec(plane, proyectBone);
		double scalarProduct1 = proyectBone1.GetX() * productVect1.GetX() + proyectBone1.GetY() * productVect1.GetY() + proyectBone1.GetZ() * productVect1.GetZ();		

		if(scalarProduct1 < 0)
			angulo = -angulo;
		
		
		return angulo;	
		
		
	}
	
	public void restricciones(){
		//restricciones definidas para cada ejercicio
		foreach(Pose pose in poseList){
			
			Transform aux = art(pose.Getart());
			Transform aux1 = art(pose.Getart1());
			
			vector bone1 = new vector();
			bone1.SetX(distance(aux1.position.x, aux.position.x));
			bone1.SetY(distance(aux1.position.y, aux.position.y));
			bone1.SetZ(distance(aux1.position.z, aux.position.z));
			bone1.SetName(aux.ToString());
			
			//texto.text = bone1.GetX().ToString()+" "+bone1.GetY().ToString()+" "+bone1.GetZ().ToString();
			if(angulo(bone1, pose.Getbone()) < pose.Getgrado()){
				aux.renderer.material.color = Color.green;
			}else{
				aux.renderer.material.color = Color.red;
			}
		}
	}
	
    public void medir()
    {       
		Transform aux = art(arti);
		Transform aux1 = art(arti1);

		vector joint = new vector();
		joint.SetX(aux.position.x);
		joint.SetY(aux.position.y);
		joint.SetZ(aux.position.z);
		joint.SetName(aux.ToString());
				
		vector joint1 = new vector();
		joint1.SetX(aux1.position.x);
		joint1.SetY(aux1.position.y);
		joint1.SetZ(aux1.position.z);
		joint1.SetName(aux1.ToString());
				
		//Representa el hueso de la articulacion a medir
		vector bone = new vector();
		bone.SetX(distance(joint1.GetX(), joint.GetX()));
		bone.SetY(distance(joint1.GetY(), joint.GetY()));
		bone.SetZ(distance(joint1.GetZ(), joint.GetZ()));
		bone.SetName(joint.GetName());
		
		//dibuja el plano sobre el que se va a medir
		if(plano){
			Plano.transform.position = new Vector3(joint.GetX(),joint.GetY(),joint.GetZ());
			//Plano.transform.rotation = Quaternion.AngleAxis(90, new Vector3(plane.GetX(),plane.GetY(),plane.GetZ()));
			if(plane.GetZ() != 0)
				Plano.transform.eulerAngles = new Vector3(270,0,0);
			else if (plane.GetY () != 0)
				Plano.transform.eulerAngles = new Vector3(0,0,0);
			else if (plane.GetX () != 0)
				Plano.transform.eulerAngles = new Vector3(270,270,0);
		}
		
		//calcula las restricciones
		restricciones();

		double ang = angulo_proyeccion(bone, plane, initBone);
		texto.text = (Math.Truncate(ang)).ToString();
		//texto.text = bone.GetX().ToString()+" "+bone.GetY().ToString()+" "+bone.GetZ().ToString();
		if(Interfaz == true){
			textoMin.text = "Minimo: ";
			texto1.text = Math.Truncate(medicion.GetMinGlobal()).ToString();
			textoMax.text = "Maximo: ";	
			texto2.text = Math.Truncate(medicion.GetMaxGlobal()).ToString();
			textoRep.text = "Repeticiones: ";
			texto3.text = Math.Truncate(medicion.GetRepeticiones()).ToString();
			textoDificultad.text = "Dificultad(%): ";
			texto4.text = dificultad.ToString();
		}
		
		if(barra){	
			Barra.guiTexture.pixelInset = new Rect(-64,-29,(((float)ang * 400)/ maximo-minimo), 18);
			if ((((float)ang * 400)/ maximo-minimo) < (60 * 400 /100))
				Barra.guiTexture.texture = bajo;
			else if (((((float)ang * 400)/ maximo-minimo) > (60 * 400/100)) && (((float)ang * 400)/ maximo-minimo < (80 * 400 /100))) 
				Barra.guiTexture.texture = medio;
			else
				Barra.guiTexture.texture = alto;
		}
		
		//tick es el tiempo de juego transcurrido y cada vez que pase el limite escribe resutaldos y se resetea
		medicion.SetTick(medicion.GetTick() + Time.deltaTime);
		if (medicion.GetTick() >= medicion.GetLimit()){
			
			//globales
			if(ang < medicion.GetMinGlobal())
				medicion.SetMinGlobal(ang);
			else if (ang > medicion.GetMaxGlobal())
				medicion.SetMaxGlobal(ang);
			
			//calcula la dificultad del ejercicio
			float nivel = ((maximo - minimo)-(dificultad * (maximo - minimo) / 100));
			//locales->deteccion de repeticion
			if(ang > medicion.GetMaxLocal())
				medicion.SetMaxLocal(ang);
			else if(((medicion.GetMaxLocal() - ang) > 5) && (ang < medicion.GetMaxLocal()) && ((maximo - medicion.GetMaxLocal()) < nivel) && (medicion.GetMaxLocal() != 0)){
				medicion.SetRepeticiones(medicion.GetRepeticiones() + 1);
				medicion.SetMaxLocal(0);
				StartCoroutine(medicion.Guardar(bone.GetName(), medicion.GetMinGlobal(), 
				                                medicion.GetMaxGlobal(), ang, plane));
			}
			medicion.SetTick(0);
		}

    }
	

	
	
	
	//actualiza el usuario que está siendo seguido.
    void Zig_UpdateUser(ZigTrackedUser user)
    {
        UpdateRoot(user.Position);
        if (user.SkeletonTracked)
        {
            foreach (ZigInputJoint joint in user.Skeleton)
            {
                if (joint.GoodPosition) UpdatePosition(joint.Id, joint.Position);
                if (joint.GoodRotation) UpdateRotation(joint.Id, joint.Rotation);
            }
			if(Angle)
			{		
				
				StartCoroutine("Cargar"); //lee el fichero de definiciones
				medir();
			
			}
        }
    }

}
