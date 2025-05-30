<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root"; 
$password = ""; 
$dbname = "inventario_app";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(array("success" => false, "message" => "Conexión fallida: " . $conn->connect_error)));
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['nombre'], $data['stock'], $data['precio'], $data['fecha'], $data['imagen'], $data['descripcion'])) {
    $nombre = $conn->real_escape_string($data['nombre']);
    $stock = $conn->real_escape_string($data['stock']);
    $precio = $conn->real_escape_string($data['precio']);
    $fecha = $conn->real_escape_string($data['fecha']);
    $imagen = $conn->real_escape_string($data['imagen']);
    $descripcion = $conn->real_escape_string($data['descripcion']);

    if (isset($data['id']) && !empty($data['id'])) {
        $id = $conn->real_escape_string($data['id']);

        if (!is_numeric($id) || $id <= 0) {
            echo json_encode(array("success" => false, "message" => "ID inválido."));
            exit();
        }

        $sql = "UPDATE productos SET nombre='$nombre', stock='$stock', precio='$precio', fecha='$fecha', imagen='$imagen', descripcion='$descripcion' WHERE id='$id'";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(array("success" => true, "message" => "Producto actualizado correctamente."));
        } else {
            echo json_encode(array("success" => false, "message" => "Error al actualizar: " . $conn->error));
        }
    } else {
        $sql = "INSERT INTO productos (nombre, stock, precio, fecha, imagen, descripcion) VALUES ('$nombre', '$stock', '$precio', '$fecha', '$imagen', '$descripcion')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(array("success" => true, "message" => "Producto agregado correctamente."));
        } else {
            echo json_encode(array("success" => false, "message" => "Error al agregar: " . $conn->error));
        }
    }
} else {
    echo json_encode(array("success" => false, "message" => "Datos incompletos."));
}

$conn->close();
?>
