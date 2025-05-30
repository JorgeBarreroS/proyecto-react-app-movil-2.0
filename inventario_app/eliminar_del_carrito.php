<?php
header("Content-Type: application/json; charset=UTF-8");
include 'conexion.php';

$id_usuario = $_POST['id_usuario'] ?? null;
$id_producto = $_POST['id_producto'] ?? null;

if (!$id_usuario || !$id_producto) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

$sql = "DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id_usuario, $id_producto);
$result = $stmt->execute();

if ($result) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "No se pudo eliminar"]);
}
?>
