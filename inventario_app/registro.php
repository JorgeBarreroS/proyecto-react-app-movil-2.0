<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

include("conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

if (
    isset($data['nombre']) && 
    isset($data['apellido']) && 
    isset($data['correo']) && 
    isset($data['telefono']) && 
    isset($data['password'])
) {
    $nombre = $data['nombre'];
    $apellido = $data['apellido'];
    $correo = $data['correo'];
    $telefono = $data['telefono'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT); // Encriptar contraseña

    $sql = "INSERT INTO usuarios (nombre, apellido, correo, telefono, password) VALUES ('$nombre', '$apellido', '$correo', '$telefono', '$password')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(array("success" => true, "message" => "Usuario registrado exitosamente"));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }
} else {
    echo json_encode(array("success" => false, "message" => "Faltan datos"));
}

$conn->close();
?>
