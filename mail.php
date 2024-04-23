<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $name = $_POST['name'];
  $email = $_POST['email'];
  $message = $_POST['message'];
  
  // Send email
  $to = 'info@guiderbhaiya.com';
  $subject = 'Message from website';
  $body = "name: $name \n\n email: $email \n\n message:\n $message";
  
  if (mail($to, $subject, $body)) {
    echo 'Message sent successfully!';
  } else {
    echo 'Error: Unable to send message.';
  }
}
?>