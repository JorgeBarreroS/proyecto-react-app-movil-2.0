<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'conexion.php';

$rawData = file_get_contents("php://input");
$data = json_decode($rawData);

if (!$data || !isset($data->id) || !isset($data->nombre) || !isset($data->apellido) || !isset($data->telefono)) {
    echo json_encode(array("success" => false, "message" => "Datos inválidos o faltantes"));
    exit();
}

$id = $data->id;
$nombre = $data->nombre;
$apellido = $data->apellido;
$telefono = $data->telefono;

$sql = "UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssi", $nombre, $apellido, $telefono, $id);

if ($stmt->execute()) {
    echo json_encode(array("success" => true, "message" => "Perfil actualizado correctamente"));
} else {
    echo json_encode(array("success" => false, "message" => "Error al actualizar el perfil"));
}

$stmt->close();
$conn->close();
?>