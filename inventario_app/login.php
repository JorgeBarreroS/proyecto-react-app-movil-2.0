<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'conexion.php';

$rawData = file_get_contents("php://input");
error_log("Datos recibidos: " . $rawData);

$data = json_decode($rawData);

if (!$data || !isset($data->correo) || !isset($data->password)) {
    echo json_encode(array("success" => false, "message" => "Datos inválidos o faltantes"));
    exit();
}

$correo = $data->correo;
$password = $data->password;


$sql = "SELECT * FROM usuarios WHERE correo='$correo'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    
    if (password_verify($password, $usuario['password'])) {
        echo json_encode(array(
            "success" => true, 
            "message" => "Login exitoso", 
            "nombre" => $usuario['nombre'],
            "rol" => $usuario['rol'],
            "id_usuario" => $usuario['id']
        ));
    } else {
        echo json_encode(array("success" => false, "message" => "Contraseña incorrecta"));
    }
} else {
    echo json_encode(array("success" => false, "message" => "Usuario no encontrado"));
}

$conn->close();
?>
