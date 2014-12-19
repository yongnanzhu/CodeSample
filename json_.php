<?php
   header("Content-type: application/json");
   $json = $_POST['json'];
   $fileName = $_POST['fileName'];
   $file = fopen($fileName,'w+');
   fwrite($file, $json);
   fclose($file);
?>


