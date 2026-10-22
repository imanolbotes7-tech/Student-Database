<?php
if (!isset($conn)) {
    require_once __DIR__ . '/../core/connection.php';
}

$first_name = trim($_POST['first_name'] ?? '');
$last_name  = trim($_POST['last_name'] ?? '');
$dob        = trim($_POST['dob'] ?? '');
$email      = trim($_POST['email'] ?? '');
$class      = trim($_POST['class'] ?? '');
$gender     = trim($_POST['gender'] ?? '');
$imageUrl   = trim($_POST['image_url'] ?? '');


$first_name = mysqli_real_escape_string($conn, $first_name);
$last_name  = mysqli_real_escape_string($conn, $last_name);
$dob        = mysqli_real_escape_string($conn, $dob);
$email      = mysqli_real_escape_string($conn, $email);
$class      = mysqli_real_escape_string($conn, $class);
$gender      = mysqli_real_escape_string($conn, $gender);
$imageUrl   = mysqli_real_escape_string($conn, $imageUrl);


$query = "INSERT INTO students (first_name, last_name, dob, email, class, gender, image_url) 
          VALUES ('$first_name', '$last_name', '$dob', '$email', '$class', '$gender', '$imageUrl')";

if (mysqli_query($conn, $query)) {
    $response["status"] = "success";
    $response["message"] = "Student registered successfully";
    $response["student_id"] = mysqli_insert_id($conn);
} else {
    $response["status"] = "error";
    $response["message"] = mysqli_error($conn);
}

echo json_encode($response);
