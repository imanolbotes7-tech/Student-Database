<?php
header('Content-Type: application/json');

$response = array();

// Target directory for uploaded files
$targetDir = "../../uploads/";

// Create directory if it doesn't exist
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (isset($_FILES['image']['name'])) {
    $fileName = basename($_FILES['image']['name']);
    $targetFilePath = $targetDir . $fileName;
    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

    // Allow certain file formats
    $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
    if (in_array(strtolower($fileType), $allowTypes)) {
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
            // Save relative URL path to send back
            $imageUrl = "uploads/" . $fileName;

            $response['status'] = 'success';
            $response['message'] = 'Image uploaded successfully';
            $response['image_url'] = $imageUrl;
            echo json_encode($response);
        } else {
            http_response_code(500);
            $response['status'] = 'error';
            $response['message'] = 'Failed to move uploaded file';
            echo json_encode($response);
        }
    } else {
        http_response_code(400);
        $response['status'] = 'error';
        $response['message'] = 'Only JPG, JPEG, PNG, & GIF files are allowed';
        echo json_encode($response);
    }
} else {
    http_response_code(400);
    $response['status'] = 'error';
    $response['message'] = 'No image file uploaded';
    echo json_encode($response);
}
?>