<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'conexion.php';

$id_usuario = $_POST['id_usuario'] ?? null;
$id_producto = $_POST['id_producto'] ?? null;

if (!$id_usuario || !$id_producto) {
    echo json_encode(["success" => false, "message" => "Faltan datos"]);
    exit;
}

$sql = "INSERT INTO carrito (id_usuario, id_producto) VALUES (?, ?)";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("ii", $id_usuario, $id_producto);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al insertar: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Error en la preparación: " . $conn->error]);
}

$conn->close();
?>
