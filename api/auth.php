<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error' => 'Use POST.'], 405);
$data = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $data['action'] ?? 'login';
$email = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = $data['password'] ?? '';
if (!$email || strlen($password) < 6) json_response(['error' => 'Enter a valid email and a password with at least 6 characters.'], 422);
try {
    $pdo = db();
    if ($action === 'signup') {
        $name = trim($data['name'] ?? '');
        if ($name === '') json_response(['error' => 'Please enter your name.'], 422);
        $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
        try { $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]); }
        catch (PDOException $e) { if ($e->getCode() === '23000') json_response(['error' => 'That email already has an account. Try logging in.'], 409); throw $e; }
        $user = ['id' => (int)$pdo->lastInsertId(), 'name' => $name];
    } else {
        $stmt = $pdo->prepare('SELECT id, name, password_hash FROM users WHERE email = ?'); $stmt->execute([$email]); $row = $stmt->fetch();
        if (!$row || !password_verify($password, $row['password_hash'])) json_response(['error' => 'Email or password didn’t match.'], 401);
        $user = ['id' => (int)$row['id'], 'name' => $row['name']];
    }
    session_regenerate_id(true); $_SESSION['user'] = $user;
    json_response(['user' => ['id' => $user['id'], 'name' => $user['name']]]);
} catch (PDOException $e) { json_response(['error' => 'The database is not ready yet. Import database/schema.sql and check the credentials in config.php.'], 503); }
