

    // Function to load Montpellier dossiers
    function loadMontpellierDossiers() {
        // Make an AJAX request to fetch Montpellier dossiers from the server
        $.ajax({
            type: "POST",
            url: "load_montpellier_dossiers.php", // Replace with the actual server-side script URL
            success: function(response) {
                // Update the result container with the Montpellier dossiers
                $("#resultContainer").html(response);
            },
            error: function() {
                alert("Error loading Montpellier dossiers");
            }
        });
    }

    $(document).ready(function() {
        // Attach a click event handler to the Montpellier button
        $("#montpellierButton").click(function() {
            loadMontpellierDossiers();
        });
    });

