<!-- gestion_profil.php -->
<!DOCTYPE html>
<html lang="fr">

<head>
    <link rel="stylesheet" href="../../styles/main.css" type="text/css" media="screen" />
    <!-- SWEETALERT -->
    <script src="../../libs/sweetalert/sweetalert2.all.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.18/dist/sweetalert2.min.css">
    <!-- JQUERY -->
    <script src="../../libs/jquery/jquery.js"></script>

    <!-- BOOTSTRAP -->
    <link rel="stylesheet" href="../../libs/bootstrap/css/bootstrap.min.css">
    <script src="../../libs/bootstrap/js/bootstrap.bundle.min.js"></script>



    <script src="../../js/gestion_profils.js"></script>



</head>

<body>

    <header class="prenav">
        <!-- Header - Copiez le contenu du header depuis administration.php -->
    </header>

    <div class="contmom">
        <!-- Contenu principal -->
        <div class="gestion-profil-cont">
            <h2>Gestion des Profils Utilisateurs</h2>
            <!-- Tableau pour afficher les utilisateurs et leurs rôles -->
            <table id="tableUtilisateurs" class="table">
                <thead>
                    <tr>
                        <th>Utilisateur</th>
                        <th>Rôle</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Les données des utilisateurs seront chargées ici -->
                </tbody>
            </table>
        </div>
    </div>


    <div class="modal" tabindex="-1" role="dialog" id="modalGestionRole">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Gérer le rôle</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <label for="nouveauRole">Nouveau rôle :</label>
                    <select class="form-control" id="nouveauRole">
                        <!-- Options pour les différents rôles -->
                        <option value="basic_user">Basic User</option>
                        <option value="admin">Admin</option>
                        <!-- Ajoutez d'autres options si nécessaire -->
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="btnSauvegarderRole">Sauvegarder</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fermer</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Mettez à jour la section modalDetailsUtilisateur dans le fichier gestion_profils.php -->
    <div class="modal" tabindex="-1" role="dialog" id="modalDetailsUtilisateur">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Détails de l'utilisateur</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="formModificationUtilisateur">
                        <label for="nomUtilisateur">Nom :</label>
                        <input type="text" class="form-control" id="nomUtilisateur" name="nouveauNom">
                        <label for="prenomUtilisateur">Prénom :</label>
                        <input type="text" class="form-control" id="prenomUtilisateur" name="nouveauPrenom">
                        <label for="roleUtilisateur">Rôle :</label>
                        <select class="form-control" id="roleUtilisateur" name="nouveauRole"></select>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="btnSauvegarderModification">Sauvegarder</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fermer</button>
                </div>
            </div>
        </div>
    </div>



</body>

</html>