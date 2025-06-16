<?php
// Простой PHP роутер для SPA
header('Content-Type: text/html; charset=utf-8');

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// API роутинг (заглушки)
if (strpos($request_uri, '/api/') === 0) {
    header('Content-Type: application/json');
    
    // Основные API endpoints
    switch ($request_uri) {
        case '/api/doctor':
            echo json_encode([
                'name' => 'Врач',
                'specialization' => 'Остеопат',
                'experience' => '10+ лет'
            ]);
            break;
            
        case '/api/services':
            echo json_encode([
                ['id' => 1, 'title' => 'Консультация', 'price' => 'По запросу'],
                ['id' => 2, 'title' => 'Лечение', 'price' => 'По запросу']
            ]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'API endpoint not found']);
    }
    exit;
}

// Для всех остальных запросов отдаем index.html
readfile(__DIR__ . '/index.html');
?>