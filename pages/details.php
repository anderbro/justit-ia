<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);
include("check_auth.php");
include(__DIR__ . '/../bd.php');

$bdd = getBD();
$communesStmt = $bdd->query("SELECT commune FROM comm_arr ORDER BY commune ASC");
$communes = $communesStmt ? $communesStmt->fetchAll(PDO::FETCH_COLUMN) : array();

$assetsBase = '../';
$pageTitle = 'Détail du dossier';
$extraStylesheets = ['styles/details.css'];
$extraScriptsHead = [
    'js/swal-forms.js',
    'js/contrevenant.js',
    'js/general_execution.js',
    'js/details.js',
    'js/procedures_connexes.js',
    'js/parquet.js',
    'js/audience.js',
    'js/decision.js',
    'js/deconnexion_2.js',
    'js/navigtion_details.js',
    'js/infraction.js',
    'js/recours.js',
    'js/requete.js',
    'js/recouvrement.js',
    'js/execution.js',
    'js/courrier.js',
    'js/rapport.js',
];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <?php include __DIR__ . '/../includes/head.php'; ?>
    <script>
        const isLoggedIn = <?php echo json_encode($isLoggedIn); ?>;
    </script>
</head>
<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>

    <main class="contmom">
        <div class="menucont">
            <div class="dossier-number-container">
                <label for="numDossierHeader">Numéro de dossier</label>
                <input type="text" id="numDossierHeader" class="form-control" disabled>
            </div>
            <?php include ('menu_dossier.php'); ?>
        </div>

        <div class="rightpart">
            <div id="divResumeDossier" class="content is-visible">
                <div class="resume-header">
                    <h2>Résumé du dossier</h2>
                    <button type="button" id="btnAjouterDocument" class="btn-app btn-app--outline">Ajouter un document</button>
                </div>
                <p id="resumeDocStatus" class="ai-status" hidden></p>
                <script type="application/json" id="communesJson"><?php echo json_encode(array_values($communes), JSON_UNESCAPED_UNICODE); ?></script>
                <div class="resume-form" id="resumecont">
                    <div id="resumeIdentite" class="resume-identite"></div>
                </div>
                <input type="file" id="resumeDocument" accept=".pdf,image/png,image/jpeg,image/tiff,image/webp" hidden>
                <div class="table-wrap">
                    <table id="tableResume" class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Intitulé évènement</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <div id="divPersonnes" class="content">
                <h2>Contrevenants</h2>
                <div class="table-wrap">
                    <table id="tableContrevenants" class="table">
                        <thead>
                            <tr>
                                <th>Identité</th>
                                <th>Statut</th>
                                <th>Représentant légal</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="table-toolbar">
                    <button type="button" id="btnAjouterContrevenantPhys">Ajouter une personne physique
                        <img src="../img/person_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                        <img src="../img/person_add_blue.svg" alt="" class="addlogohover">
                    </button>
                    <button type="button" id="btnAjouterContrevenantMor">Ajouter une personne morale
                        <img src="../img/add_business_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                        <img src="../img/add_business_blue.svg" alt="" class="addlogohover">
                    </button>
                    <button type="button" id="btnChercherContrevenant">Chercher un contrevenant
                        <img src="../img/search_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="searchlogo">
                        <img src="../img/search_hover.svg" alt="" class="searchlogohover">
                    </button>
                </div>
            </div>

            <div id="divInfractions" class="content">
                <h2>Infractions</h2>
                <div class="table-wrap">
                    <table id="tableInfractions" class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Référence</th>
                                <th>Entité</th>
                                <th>Natinf</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="table-toolbar">
                    <button type="button" id="btnAjouterInfraction">Créer une infraction
                        <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                        <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                    </button>
                </div>
            </div>

            <div id="divParquet" class="content">
                <h2>Parquet</h2>
                <div class="table-wrap">
                    <table id="tableParquet" class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Auteur</th>
                                <th>Type</th>
                                <th>N°</th>
                                <th>Objet</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="table-toolbar">
                    <button type="button" id="btnAjouterParquet">Créer une entrée au parquet
                        <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                        <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                    </button>
                </div>
            </div>

            <div id="divAudience" class="content">
                <h2>Audience</h2>
                <div class="table-wrap">
                    <table id="tableAudience" class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Juridiction</th>
                                <th>Type de procédure</th>
                                <th>Objet de l'audience</th>
                                <th>Suites de l'audience</th>
                                <th>Observations</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="tableAudienceBody"></tbody>
                    </table>
                </div>
                <div class="table-toolbar">
                    <button type="button" id="btnAjouterAudience">Créer une entrée à l'audience
                        <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                        <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                    </button>
                </div>
            </div>

            <div id="divDecisions" class="content">
                <h2>Décisions</h2>
                <div class="table-wrap">
                    <table id="tableDecisions" class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Juridiction</th>
                                <th>Type</th>
                                <th>Contrevenant</th>
                                <th>Décision</th>
                                <th>Peine</th>
                                <th>Exécution provisoire</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="tableDecisionsBody"></tbody>
                    </table>
                </div>
                <div class="table-toolbar">
                    <button type="button" id="btnAjouterDecisions">Créer une décision
                        <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                        <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                    </button>
                </div>

                <h2>Recours et pourvoi</h2>
                <div class="table-wrap">
                    <table id="tableRecours" class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Auteur</th>
                                <th>Type</th>
                                <th>Observations</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="tableBodyRecours"></tbody>
                    </table>
                </div>
                <div class="table-toolbar">
                    <button type="button" id="btnAjouterRecours">Créer un recours
                        <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                        <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                    </button>
                </div>
            </div>

            <div id="divExecution" class="content">
                <h2>Exécution</h2>
                <div id="divExecution_2">
                    <ul id="menu_execution" class="nav nav-tabs" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="tab1" data-toggle="tab" href="#section1" role="tab"
                                aria-controls="section1" aria-selected="true">Général</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="tab2" data-toggle="tab" href="#section2" role="tab"
                                aria-controls="section2" aria-selected="false">Courriers / Contestations</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="tab3" data-toggle="tab" href="#section3" role="tab"
                                aria-controls="section3" aria-selected="false">Rapports</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="tab4" data-toggle="tab" href="#section4" role="tab"
                                aria-controls="section4" aria-selected="false">Requêtes / Assignations</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="tab5" data-toggle="tab" href="#section5" role="tab"
                                aria-controls="section5" aria-selected="false">Recouvrement</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="tab6" data-toggle="tab" href="#section6" role="tab"
                                aria-controls="section6" aria-selected="false">Exécution d'office</a>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <div id="section1" class="tab-pane fade show active" role="tabpanel" aria-labelledby="tab1">
                            <h3>Général</h3>
                            <p>Les formulaires de cette section sont en cours de développement.</p>
                            <div id="decisionContainer"></div>
                            <div class="table-toolbar">
                                <button type="button" id="submitButton" class="btn-app">Soumettre</button>
                            </div>
                        </div>
                        <div id="section2" class="tab-pane fade" role="tabpanel" aria-labelledby="tab2">
                            <h3>Courriers et contestations</h3>
                            <div class="table-wrap">
                                <table id="table-courriers" class="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Rédacteur émetteur</th>
                                            <th>Objet</th>
                                            <th>Observation</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div class="table-toolbar">
                                <button type="button" id="btnNouveauCourrier">Nouveau courrier
                                    <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                                    <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                                </button>
                            </div>
                        </div>
                        <div id="section3" class="tab-pane fade" role="tabpanel" aria-labelledby="tab3">
                            <h3>Rapports</h3>
                            <div class="table-wrap">
                                <table id="table-rapports" class="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Rédacteur émetteur</th>
                                            <th>Objet</th>
                                            <th>Observation</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div class="table-toolbar">
                                <button type="button" id="btnNouveauRapport">Nouveau rapport
                                    <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                                    <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                                </button>
                            </div>
                        </div>
                        <div id="section4" class="tab-pane fade" role="tabpanel" aria-labelledby="tab4">
                            <h3>Requêtes / Assignations</h3>
                            <div class="table-wrap">
                                <table id="table-requetes" class="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Rédacteur émetteur</th>
                                            <th>Objet</th>
                                            <th>Observation</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div class="table-toolbar">
                                <button type="button" id="btnNouveauRequete">Nouvelle requête
                                    <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                                    <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                                </button>
                            </div>
                        </div>
                        <div id="section5" class="tab-pane fade" role="tabpanel" aria-labelledby="tab5">
                            <h3>Recouvrement</h3>
                            <div class="table-wrap">
                                <table id="table-recouvrements" class="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Rédacteur émetteur</th>
                                            <th>Objet</th>
                                            <th>Personne visée</th>
                                            <th>Période</th>
                                            <th>Montant</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div class="table-toolbar">
                                <button type="button" id="btnNouveauRecouvrement">Nouveau recouvrement
                                    <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                                    <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                                </button>
                            </div>
                        </div>
                        <div id="section6" class="tab-pane fade" role="tabpanel" aria-labelledby="tab6">
                            <div id="execution_office"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="divPocon" class="content">
                <h2>Procédures liées</h2>
                <div class="table-wrap">
                    <table id="table-procedures" class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Référence</th>
                                <th>Auteur 1</th>
                                <th>Type</th>
                                <th>Auteur 2</th>
                                <th>Observations</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="table-toolbar">
                    <button type="button" id="btnNouvelleProcedure">Nouvelle procédure
                        <img src="../img/note_add_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="addlogo">
                        <img src="../img/note_add_blue.svg" alt="" class="addlogohover">
                    </button>
                </div>

                <div id="myModal" class="modale">
                    <div class="modale-content popup-form popup-form--modern">
                        <button type="button" class="close popup-modal-close" aria-label="Fermer">&times;</button>
                        <form id="formProcedure" action="script/proc_con/script_add_proc_connexe.php" method="post">
                            <h2 class="popup-title">Nouvelle procédure liée</h2>
                            <input type="hidden" id="id_dossier" name="id_dossier">

                            <div class="popup-field">
                                <label for="date">Date</label>
                                <input type="date" id="date" name="date" required>
                            </div>
                            <div class="popup-field">
                                <label for="ref">Référence</label>
                                <input type="text" id="ref" name="ref">
                            </div>
                            <div class="popup-field">
                                <label for="auteur1">Auteur 1</label>
                                <input type="text" id="auteur1" name="auteur1">
                            </div>
                            <div class="popup-field">
                                <label for="type">Type</label>
                                <input type="text" id="type" name="type">
                            </div>
                            <div class="popup-field">
                                <label for="auteur2">Auteur 2</label>
                                <input type="text" id="auteur2" name="auteur2">
                            </div>
                            <div class="popup-field popup-field--wide">
                                <label for="obs">Observations</label>
                                <textarea id="obs" name="obs" rows="3"></textarea>
                            </div>
                            <div class="popup-actions">
                                <button type="button" class="popup-btn popup-btn--ghost close">Fermer</button>
                                <button type="submit" class="popup-btn create_proc">Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="modalModifier" class="modale">
                    <div class="modale-content popup-form popup-form--modern">
                        <button type="button" class="close closemodif popup-modal-close" id="closebtn" aria-label="Fermer">&times;</button>
                        <form id="formModifierProcedure" action="script/proc_con/script_modifier_proc_connexe.php" method="post">
                            <h2 class="popup-title">Modifier la procédure liée</h2>
                            <input type="hidden" id="inputId" name="id_procedure">

                            <div class="popup-field">
                                <label for="inputDate">Date</label>
                                <input type="date" id="inputDate" name="date" required>
                            </div>
                            <div class="popup-field">
                                <label for="inputRef">Référence</label>
                                <input type="text" id="inputRef" name="ref" required>
                            </div>
                            <div class="popup-field">
                                <label for="inputAuteur1">Auteur 1</label>
                                <input type="text" id="inputAuteur1" name="auteur1">
                            </div>
                            <div class="popup-field">
                                <label for="inputType">Type</label>
                                <input type="text" id="inputType" name="type">
                            </div>
                            <div class="popup-field">
                                <label for="inputAuteur2">Auteur 2</label>
                                <input type="text" id="inputAuteur2" name="auteur2">
                            </div>
                            <div class="popup-field popup-field--wide">
                                <label for="inputObs">Observations</label>
                                <textarea id="inputObs" name="observation" rows="3"></textarea>
                            </div>
                            <div class="popup-actions">
                                <button type="button" class="popup-btn popup-btn--ghost closemodif">Fermer</button>
                                <button type="submit" class="popup-btn">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>