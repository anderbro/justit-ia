-- Données de démarrage pour rendre l'application utilisable

USE astreintes_juridiques_new;

INSERT INTO role (id_role, nom_role, role) VALUES
    (1, 'admin', 'admin'),
    (2, 'basic_user', 'basic_user');

INSERT INTO statut_contrevenant (id_statut_contrevenant, nom_statut_contrevenant) VALUES
    (1, 'En cours'),
    (2, 'Condamné'),
    (3, 'Non condamné');

INSERT INTO parquet (parquet) VALUES
    ('Parquet de Montpellier'),
    ('Parquet de Béziers'),
    ('Parquet de Nîmes');

INSERT INTO comm_arr (commune, arrondissement) VALUES
    ('Montpellier', 'Montpellier'),
    ('Béziers', 'Béziers'),
    ('Sète', 'Montpellier'),
    ('Lunel', 'Montpellier'),
    ('Agde', 'Béziers'),
    ('Frontignan', 'Montpellier'),
    ('Lattes', 'Montpellier'),
    ('Mauguio', 'Montpellier');

INSERT INTO natinf (Num) VALUES
    ('322-1-1'),
    ('322-1-2'),
    ('322-1-3'),
    ('322-1-4'),
    ('322-1-5'),
    ('R417-10'),
    ('R421-1');

INSERT INTO agent (agent_nom, agent_prenom, agent_role, agent_service) VALUES
    ('Dupont', 'Marie', 'juriste', 'SAJ'),
    ('Martin', 'Jean', 'contrôleur', 'SATO');

-- Compte admin : exécuter après le démarrage
-- docker compose exec php php docker/seed-admin.php admin123

-- Dossier et PV d'exemple
INSERT INTO dossier (
    num_dossier,
    priorite,
    commune,
    parcelle_princ,
    date_du_soit_transmis,
    dossier_sensible,
    obs_dossier
) VALUES (
    'DOS-2024-001',
    'P2',
    'Montpellier',
    'AB-123',
    '2024-06-15',
    0,
    'Dossier de démonstration pour environnement Docker'
);

INSERT INTO signalement_pv (
    pv_date,
    pv_reference,
    pv_contrevenant,
    pv_type,
    pv_commune,
    id_dossier_1,
    id_dossier
) VALUES (
    '2024-05-20',
    'PV-2024-001',
    'Contrevenant démo',
    'Infraction urbanisme',
    '1',
    1,
    'DOS-2024-001'
);

INSERT INTO tribunal_correctionnel (id_dossier) VALUES ('DOS-2024-001');
INSERT INTO cours_appel (id_dossier) VALUES ('DOS-2024-001');
INSERT INTO cour_cassation (id_dossier) VALUES ('DOS-2024-001');

INSERT INTO contrevenant (contrevenant, civilite, nom, prenom, adresse) VALUES
    ('M. Jean Exemple', 'M.', 'Exemple', 'Jean', '12 rue de la République, 34000 Montpellier');

INSERT INTO appartiens_dossier (id_contrevenant, id_dossier) VALUES (1, 1);
INSERT INTO a_le_statut_con (id_contrevenant, id_dossier, id_statut_contrevenant) VALUES (1, 1, 1);
