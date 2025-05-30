<?php
include 'conexion.php'; // Conexión a la base de datos

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id)) {
    $id = $data->id;

    // 1. Eliminar producto
    $consulta = "DELETE FROM productos WHERE id = '$id'";
    $resultado = mysqli_query($conn, $consulta);

    if ($resultado) {
        // 2. Reorganizar IDs si hay saltos
        mysqli_query($conn, "SET @num := 0");
        mysqli_query($conn, "UPDATE productos SET id = (@num := @num + 1) ORDER BY id");

        // 3. Reiniciar AUTO_INCREMENT al último ID + 1
        mysqli_query($conn, "ALTER TABLE productos AUTO_INCREMENT = 1");

        echo json_encode(["success" => true, "message" => "Producto eliminado y IDs corregidos"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al eliminar"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ID no recibido"]);
}

$conn->close();
?>
