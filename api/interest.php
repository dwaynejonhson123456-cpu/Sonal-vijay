<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error' => 'Use POST.'], 405);
$user = require_user();
$data = json_decode(file_get_contents('php://input'), true) ?? [];
$propertyId = filter_var($data['property_id'] ?? null, FILTER_VALIDATE_INT);
if (!$propertyId) json_response(['error' => 'Choose a valid stay.'], 422);
try {
    $pdo = db();
    $check = $pdo->prepare('SELECT id FROM properties WHERE id = ? AND is_active = 1'); $check->execute([$propertyId]);
    if (!$check->fetch()) json_response(['error' => 'That stay could not be found.'], 404);
    $exists = $pdo->prepare('SELECT 1 FROM interested_users WHERE user_id = ? AND property_id = ?'); $exists->execute([$user['id'], $propertyId]);
    if ($exists->fetchColumn()) {
        $stmt = $pdo->prepare('DELETE FROM interested_users WHERE user_id = ? AND property_id = ?'); $stmt->execute([$user['id'], $propertyId]); $interested = false;
    } else {
        $stmt = $pdo->prepare('INSERT INTO interested_users (user_id, property_id) VALUES (?, ?)'); $stmt->execute([$user['id'], $propertyId]); $interested = true;
    }
    json_response(['interested' => $interested]);
} catch (PDOException $e) { json_response(['error' => 'Could not update your shortlist. Please try again.'], 503); }
