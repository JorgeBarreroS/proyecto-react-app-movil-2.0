<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'conexion.php';

if (!isset($_GET['id'])) {
    echo json_encode(array("success" => false, "message" => "ID de usuario no proporcionado"));
    exit();
}

$id = $_GET['id'];

$sql = "SELECT id, nombre, apellido, correo, telefono FROM usuarios WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    echo json_encode(array("success" => true, "usuario" => $usuario));
} else {
    echo json_encode(array("success" => false, "message" => "Usuario no encontrado"));
}

$stmt->close();
$conn->close();
?>