<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'conexion.php'; // Archivo donde tienes tu conexión a MySQL

$query = isset($_GET['query']) ? $_GET['query'] : '';

if ($query !== '') {
    $sql = "SELECT id, nombre, stock FROM productos WHERE nombre LIKE ?";
    $stmt = $conn->prepare($sql);
    $search = "%$query%";
    $stmt->bind_param("s", $search);
} else {
    $sql = "SELECT id, nombre, stock FROM productos";
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

$productos = array();
while ($row = $result->fetch_assoc()) {
    $productos[] = $row;
}

echo json_encode($productos);

$stmt->close();
$conn->close();
?>
