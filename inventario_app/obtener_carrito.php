<?php
header("Content-Type: application/json; charset=UTF-8");
include 'conexion.php';

$id_usuario = $_POST['id_usuario'] ?? null;

if (!$id_usuario) {
    echo json_encode(["success" => false, "message" => "Falta el ID del usuario"]);
    exit;
}

$sql = "SELECT p.id, p.nombre, p.precio, p.imagen
        FROM carrito c
        JOIN productos p ON c.id_producto = p.id
        WHERE c.id_usuario = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$productos = [];
while ($row = $result->fetch_assoc()) {
    $productos[] = $row;
}

echo json_encode(["success" => true, "productos" => $productos]);
?>
