<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conexion = new mysqli("localhost", "root", "", "inventario_app");

if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

$sql = "SELECT id, nombre, stock, precio, fecha, imagen, descripcion FROM productos";
$resultado = $conexion->query($sql);

$productos = array();

while ($row = $resultado->fetch_assoc()) {
    $productos[] = array(
        "id" => $row["id"],
        "nombre" => $row["nombre"],
        "stock" => $row["stock"],
        "precio" => $row["precio"],
        "fecha" => $row["fecha"],
        "imagen" => $row["imagen"],
        "descripcion" => $row["descripcion"]
    );
}

echo json_encode($productos);
$conexion->close();
?>
