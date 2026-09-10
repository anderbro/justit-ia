<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User List</title>

<link rel="stylesheet" href="../../styles/gestion_profils">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">

    <style>
        /* Custom border color for the table */
        table {
            border-color: #030f8e;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="mt-4 mb-4">User List</h2>

        <?php
        // Include your database connection function
        include '../../bd.php';

        // Get a database connection
        $db = getBD();

        // Query to fetch all users from the 'user' table
        $query = "SELECT * FROM user";
        $stmt = $db->query($query);

        // Display users in a Bootstrap-styled table
        echo "<table class='table table-bordered table-hover'>
                <thead class='thead-dark'>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>";

        // Loop through the result set and display each user
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>
                    <td>{$row['id_user']}</td>
                    <td>{$row['prenom']}</td>
                    <td>{$row['nom']}</td>
                    <td>{$row['mail']}</td>
                </tr>";
        }

        echo "</tbody></table>";

        // Close the database connection
        $db = null;
        ?>
    </div>

    <!-- Bootstrap JS and Popper.js -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.1/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
