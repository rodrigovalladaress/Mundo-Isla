#pragma strict
// This class stores some paths of the local server.
// Version: 1.0
// Autor: Rodrigo Valladares Santana <rodriv_tf@hotmail.com> 

// Direccion desde la que se descargan y cargan XML desde el web player
// TODO Usar un servidor para descargar los archivos
private static var localHost : String = "http://localhost";
public static function GetLocalHost() : String {
	return localHost;
}
// Direccion donde se encuentra el script de PHP que realiza el log del
// webplayer y el log en si mismo
private static var serverLog : String = localHost + "/server_log";
public static function GetServerLog() : String {
	return serverLog;
}
// Direccion de los scripts para el proyecto de Daniel Goniometro
private static var kinect : String = Paths.localHost + "/daniel_goniometro";
public static function GetKinect() : String {
	return kinect;
}