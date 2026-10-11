<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/../config.php';
try {
    $where = ['p.is_active = 1']; $params = [];
    if (!empty($_GET['city'])) { $where[] = 'p.city = ?'; $params[] = $_GET['city']; }
    if (!empty($_GET['budget'])) { $where[] = 'p.price <= ?'; $params[] = (int)$_GET['budget']; }
    if (!empty($_GET['gender'])) { $where[] = 'p.gender = ?'; $params[] = $_GET['gender']; }
    $sql = 'SELECT p.id, p.name, p.city, p.area, p.price, p.gender, p.rating, p.review_count, p.description, p.image_url, p.images_json,
        GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR "||") AS amenity_names,
        ' . (empty($_SESSION['user']) ? '0' : 'MAX(CASE WHEN iu.user_id = ' . (int)$_SESSION['user']['id'] . ' THEN 1 ELSE 0 END)') . ' AS interested
        FROM properties p LEFT JOIN property_amenities pa ON pa.property_id = p.id LEFT JOIN amenities a ON a.id = pa.amenity_id
        LEFT JOIN interested_users iu ON iu.property_id = p.id WHERE ' . implode(' AND ', $where) . '
        GROUP BY p.id ORDER BY p.is_featured DESC, p.rating DESC, p.id ASC';
    $stmt = db()->prepare($sql); $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['amenities'] = $row['amenity_names'] ? explode('||', $row['amenity_names']) : [];
        $row['images'] = $row['images_json'] ? json_decode($row['images_json'], true) : [$row['image_url']];
        $row['interested'] = (bool)$row['interested'];
        unset($row['amenity_names'], $row['images_json']);
    }
    json_response(['properties' => $rows, 'count' => count($rows)]);
} catch (PDOException $e) {
    json_response(['error' => 'The database is not ready yet. Import database/schema.sql and check the credentials in config.php.'], 503);
}
