<?php
// Habilitar el reporte de errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Agregar encabezados para CORS (puede ser necesario)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    // Incluir el archivo de conexión
    require_once 'conexion.php';

    // Verificar si podemos recibir datos POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Este endpoint solo acepta solicitudes POST");
    }

    // Recibir y validar parámetros
    $input = file_get_contents('php://input');
    $postData = json_decode($input, true);
    
    // Si no se puede decodificar JSON, usar $_POST directamente
    if (json_last_error() !== JSON_ERROR_NONE) {
        $id_usuario = isset($_POST['id_usuario']) ? $_POST['id_usuario'] : "";
        $descripcion = isset($_POST['descripcion']) ? $_POST['descripcion'] : "";
        $total = isset($_POST['total']) ? $_POST['total'] : 0;
        $metodo_pago = isset($_POST['metodo_pago']) ? $_POST['metodo_pago'] : "";
        // Capturar campos específicos para pago en casa
        $direccion = isset($_POST['direccion']) ? $_POST['direccion'] : "";
        $telefono1 = isset($_POST['telefono1']) ? $_POST['telefono1'] : "";
        $telefono2 = isset($_POST['telefono2']) ? $_POST['telefono2'] : "";
        // Capturar campos específicos para pago con Nequi
        $telefono_nequi = isset($_POST['telefono_nequi']) ? $_POST['telefono_nequi'] : "";
        $codigo_pago = isset($_POST['codigo_pago']) ? $_POST['codigo_pago'] : "";
        $referencia = isset($_POST['referencia']) ? $_POST['referencia'] : "";
    } else {
        $id_usuario = isset($postData['id_usuario']) ? $postData['id_usuario'] : "";
        $descripcion = isset($postData['descripcion']) ? $postData['descripcion'] : "";
        $total = isset($postData['total']) ? $postData['total'] : 0;
        $metodo_pago = isset($postData['metodo_pago']) ? $postData['metodo_pago'] : "";
        // Capturar campos específicos para pago en casa
        $direccion = isset($postData['direccion']) ? $postData['direccion'] : "";
        $telefono1 = isset($postData['telefono1']) ? $postData['telefono1'] : "";
        $telefono2 = isset($postData['telefono2']) ? $postData['telefono2'] : "";
        // Capturar campos específicos para pago con Nequi
        $telefono_nequi = isset($postData['telefono_nequi']) ? $postData['telefono_nequi'] : "";
        $codigo_pago = isset($postData['codigo_pago']) ? $postData['codigo_pago'] : "";
        $referencia = isset($postData['referencia']) ? $postData['referencia'] : "";
    }

    // Para depurar, registrar los datos recibidos
    $debug = [
        'received_data' => $_POST,
        'raw_input' => $input,
        'parsed_json' => $postData,
        'final_values' => [
            'id_usuario' => $id_usuario,
            'descripcion' => $descripcion,
            'total' => $total,
            'metodo_pago' => $metodo_pago,
            'direccion' => $direccion,
            'telefono1' => $telefono1,
            'telefono2' => $telefono2,
            'telefono_nequi' => $telefono_nequi,
            'codigo_pago' => $codigo_pago,
            'referencia' => $referencia
        ]
    ];
    
    // Comprobar que las tablas existan y tengan los campos necesarios
    $tables_check = $conn->query("SHOW TABLES LIKE 'pedidos'");
    if ($tables_check->num_rows == 0) {
        // Crear tabla pedidos si no existe (incluyendo campos para dirección y teléfonos)
        $conn->query("CREATE TABLE IF NOT EXISTS pedidos (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT(11) NOT NULL,
            descripcion TEXT,
            total DECIMAL(10,2) NOT NULL,
            metodo_pago VARCHAR(50) NOT NULL,
            estado VARCHAR(20) NOT NULL,
            direccion TEXT,
            telefono1 VARCHAR(20),
            telefono2 VARCHAR(20),
            telefono_nequi VARCHAR(20),
            codigo_pago VARCHAR(20),
            referencia VARCHAR(100),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    } else {
        // Comprobar si los campos existen y añadirlos si no
        $result = $conn->query("SHOW COLUMNS FROM pedidos LIKE 'direccion'");
        if ($result->num_rows == 0) {
            $conn->query("ALTER TABLE pedidos ADD COLUMN direccion TEXT");
        }
        
        $result = $conn->query("SHOW COLUMNS FROM pedidos LIKE 'telefono1'");
        if ($result->num_rows == 0) {
            $conn->query("ALTER TABLE pedidos ADD COLUMN telefono1 VARCHAR(20)");
        }
        
        $result = $conn->query("SHOW COLUMNS FROM pedidos LIKE 'telefono2'");
        if ($result->num_rows == 0) {
            $conn->query("ALTER TABLE pedidos ADD COLUMN telefono2 VARCHAR(20)");
        }
        
        $result = $conn->query("SHOW COLUMNS FROM pedidos LIKE 'telefono_nequi'");
        if ($result->num_rows == 0) {
            $conn->query("ALTER TABLE pedidos ADD COLUMN telefono_nequi VARCHAR(20)");
        }
        
        $result = $conn->query("SHOW COLUMNS FROM pedidos LIKE 'codigo_pago'");
        if ($result->num_rows == 0) {
            $conn->query("ALTER TABLE pedidos ADD COLUMN codigo_pago VARCHAR(20)");
        }
        
        $result = $conn->query("SHOW COLUMNS FROM pedidos LIKE 'referencia'");
        if ($result->num_rows == 0) {
            $conn->query("ALTER TABLE pedidos ADD COLUMN referencia VARCHAR(100)");
        }
    }
    
    $tables_check = $conn->query("SHOW TABLES LIKE 'pedido_detalle'");
    if ($tables_check->num_rows == 0) {
        // Crear tabla pedido_detalle si no existe
        $conn->query("CREATE TABLE IF NOT EXISTS pedido_detalle (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            id_pedido INT(11) NOT NULL,
            id_producto INT(11) NOT NULL
        )");
    }

    // Validar parámetros
    if (empty($id_usuario) || empty($metodo_pago)) {
        throw new Exception("Faltan parámetros requeridos: id_usuario y metodo_pago son obligatorios");
    }

    // Iniciar transacción
    $conn->begin_transaction();

    // 1. Insertar registro de pago en la tabla pedidos (ahora con campos adicionales)
    $stmt = $conn->prepare("INSERT INTO pedidos (id_usuario, descripcion, total, metodo_pago, estado, direccion, telefono1, telefono2, telefono_nequi, codigo_pago, referencia) VALUES (?, ?, ?, ?, 'pendiente', ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isdsssssss", $id_usuario, $descripcion, $total, $metodo_pago, $direccion, $telefono1, $telefono2, $telefono_nequi, $codigo_pago, $referencia);
    $stmt->execute();
    $id_pedido = $conn->insert_id;
    
    // 2. Consultar productos en el carrito para el usuario
    $stmt = $conn->prepare("SELECT id_producto FROM carrito WHERE id_usuario = ?");
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $productos_detalle = [];
    
    // 3. Insertar los productos del carrito como detalles del pedido
    if ($result->num_rows > 0) {
        $stmt_detalle = $conn->prepare("INSERT INTO pedido_detalle (id_pedido, id_producto) VALUES (?, ?)");
        
        while ($row = $result->fetch_assoc()) {
            $id_producto = $row['id_producto'];
            $stmt_detalle->bind_param("ii", $id_pedido, $id_producto);
            $stmt_detalle->execute();
            $productos_detalle[] = $id_producto;
        }
    }
    
    // 4. Vaciar el carrito del usuario
    $stmt = $conn->prepare("DELETE FROM carrito WHERE id_usuario = ?");
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    
    // Confirmar transacción
    $conn->commit();
    
    // Respuesta exitosa
    $response = [
        "success" => true,
        "message" => "Pago registrado correctamente",
        "id_pedido" => $id_pedido,
        "debug" => $debug,
        "productos_detalle" => $productos_detalle
    ];
    
} catch (Exception $e) {
    // Revertir transacción si está activa
    if (isset($conn) && $conn->connect_errno === 0) {
        $conn->rollback();
    }
    
    // Respuesta de error
    $response = [
        "success" => false,
        "message" => "Error al procesar el pago: " . $e->getMessage(),
        "debug" => $debug ?? []
    ];
} finally {
    // Cerrar conexión si existe
    if (isset($conn) && $conn->connect_errno === 0) {
        $conn->close();
    }
    
    // Siempre devolver JSON válido
    echo json_encode($response);
}
?>