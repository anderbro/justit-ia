-- Schéma reconstruit depuis le code PHP de l'application ddtm34_aj
-- Base : astreintes_juridiques_new

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE astreintes_juridiques_new;

-- ---------------------------------------------------------------------------
-- Référentiels
-- ---------------------------------------------------------------------------

CREATE TABLE role (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    nom_role VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    mail VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE a_le_role (
    id_user INT NOT NULL,
    id_role INT NOT NULL,
    PRIMARY KEY (id_user, id_role),
    CONSTRAINT fk_a_le_role_user FOREIGN KEY (id_user) REFERENCES user (id_user) ON DELETE CASCADE,
    CONSTRAINT fk_a_le_role_role FOREIGN KEY (id_role) REFERENCES role (id_role) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE statut_contrevenant (
    id_statut_contrevenant INT AUTO_INCREMENT PRIMARY KEY,
    nom_statut_contrevenant VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE parquet (
    id_parquet INT AUTO_INCREMENT PRIMARY KEY,
    parquet VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comm_arr (
    id_comm INT AUTO_INCREMENT PRIMARY KEY,
    commune VARCHAR(100) NOT NULL,
    arrondissement VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE natinf (
    id_natinf INT AUTO_INCREMENT PRIMARY KEY,
    Num VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE agent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_nom VARCHAR(100) NOT NULL,
    agent_prenom VARCHAR(100) NOT NULL,
    agent_role VARCHAR(50) DEFAULT NULL,
    agent_service VARCHAR(50) DEFAULT NULL,
    agent_archive TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Dossiers et contentieux
-- ---------------------------------------------------------------------------

CREATE TABLE dossier (
    id_dossier INT AUTO_INCREMENT PRIMARY KEY,
    num_dossier VARCHAR(100) NOT NULL UNIQUE,
    priorite VARCHAR(50) DEFAULT NULL,
    n_soit_transmis VARCHAR(255) DEFAULT NULL,
    libelle_arret_astreinte VARCHAR(255) DEFAULT NULL,
    date_ait DATE DEFAULT NULL,
    nom_arretes_astreintes VARCHAR(255) DEFAULT NULL,
    libelle_jugement_astreinte VARCHAR(255) DEFAULT NULL,
    detruit VARCHAR(10) DEFAULT NULL,
    description_des_faits TEXT DEFAULT NULL,
    cabanisation VARCHAR(10) DEFAULT NULL,
    date_du_soit_transmis DATE DEFAULT NULL,
    constat_des_lieux VARCHAR(255) DEFAULT NULL,
    obs_execution TEXT DEFAULT NULL,
    mesure_restitution VARCHAR(255) DEFAULT NULL,
    astreinte_journaliere VARCHAR(50) DEFAULT NULL,
    date_limite_execution DATE DEFAULT NULL,
    date_courrier_info DATE DEFAULT NULL,
    obs_courrier_info TEXT DEFAULT NULL,
    modalite_execution VARCHAR(255) DEFAULT NULL,
    auteur_exe VARCHAR(255) DEFAULT NULL,
    date_constat_exe DATE DEFAULT NULL,
    date_pv_recouv DATE DEFAULT NULL,
    montant_total_recouv DECIMAL(12,2) DEFAULT NULL,
    nb_recouv INT DEFAULT NULL,
    nb_annul INT DEFAULT NULL,
    contest_cont_astr VARCHAR(255) DEFAULT NULL,
    obs_decision_cont_astr TEXT DEFAULT NULL,
    obs_ddfip TEXT DEFAULT NULL,
    annee_cloture VARCHAR(10) DEFAULT NULL,
    mesure_execution VARCHAR(255) DEFAULT NULL,
    contact_verbalisation VARCHAR(255) DEFAULT NULL,
    objet_rml VARCHAR(255) DEFAULT NULL,
    objet_batidur VARCHAR(255) DEFAULT NULL,
    objet_batileger VARCHAR(255) DEFAULT NULL,
    objet_autre VARCHAR(255) DEFAULT NULL,
    emblem VARCHAR(255) DEFAULT NULL,
    dossier_cible VARCHAR(255) DEFAULT NULL,
    proc_engagee VARCHAR(255) DEFAULT NULL,
    ordo_expulsion VARCHAR(255) DEFAULT NULL,
    av_execution VARCHAR(255) DEFAULT NULL,
    date_execution_ou_classement_parquet DATE DEFAULT NULL,
    parcelle_princ VARCHAR(255) DEFAULT NULL,
    complement_parcelle VARCHAR(255) DEFAULT NULL,
    parcelles_avoisinantes VARCHAR(255) DEFAULT NULL,
    commune VARCHAR(100) DEFAULT NULL,
    autres_parcelles VARCHAR(255) DEFAULT NULL,
    dossier_sensible TINYINT(1) DEFAULT 0,
    obs_dossier TEXT DEFAULT NULL,
    prescription TINYINT(1) DEFAULT 0,
    date_prescription DATE DEFAULT NULL,
    archivage TINYINT(1) DEFAULT 0,
    date_archivage DATE DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE signalement_pv (
    id_pv INT AUTO_INCREMENT PRIMARY KEY,
    pv_date DATE DEFAULT NULL,
    pv_reference VARCHAR(100) DEFAULT NULL,
    pv_correspondant VARCHAR(255) DEFAULT NULL,
    pv_contrevenant VARCHAR(255) DEFAULT NULL,
    pv_detruit VARCHAR(50) DEFAULT NULL,
    pv_enjeux VARCHAR(255) DEFAULT NULL,
    pv_obs TEXT DEFAULT NULL,
    pv_type VARCHAR(100) DEFAULT NULL,
    pv_parcelle_prin VARCHAR(100) DEFAULT NULL,
    pv_parcelles_autres VARCHAR(255) DEFAULT NULL,
    pv_zone VARCHAR(100) DEFAULT NULL,
    pv_zonage VARCHAR(100) DEFAULT NULL,
    pv_cabanisation VARCHAR(50) DEFAULT NULL,
    pv_infra_obs TEXT DEFAULT NULL,
    pv_commune VARCHAR(100) DEFAULT NULL,
    pv_arrondissement VARCHAR(100) DEFAULT NULL,
    pv_infraction VARCHAR(255) DEFAULT NULL,
    id_dossier_1 INT DEFAULT NULL,
    id_dossier VARCHAR(100) DEFAULT NULL,
    CONSTRAINT fk_signalement_pv_dossier FOREIGN KEY (id_dossier_1) REFERENCES dossier (id_dossier) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contrevenant (
    id_contrevenant INT AUTO_INCREMENT PRIMARY KEY,
    contrevenant VARCHAR(255) DEFAULT NULL,
    civilite VARCHAR(20) DEFAULT NULL,
    nom VARCHAR(100) DEFAULT NULL,
    prenom VARCHAR(100) DEFAULT NULL,
    date_naissance DATE DEFAULT NULL,
    lieu_naissance VARCHAR(255) DEFAULT NULL,
    adresse VARCHAR(500) DEFAULT NULL,
    representant_legal VARCHAR(255) DEFAULT NULL,
    adresse_siege VARCHAR(500) DEFAULT NULL,
    SIRET_SIREN VARCHAR(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appartiens_dossier (
    id_contrevenant INT NOT NULL,
    id_dossier INT NOT NULL,
    PRIMARY KEY (id_contrevenant, id_dossier),
    CONSTRAINT fk_appartiens_dossier_contrevenant FOREIGN KEY (id_contrevenant) REFERENCES contrevenant (id_contrevenant) ON DELETE CASCADE,
    CONSTRAINT fk_appartiens_dossier_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE a_le_statut_con (
    id_contrevenant INT NOT NULL,
    id_dossier INT NOT NULL,
    id_statut_contrevenant INT NOT NULL,
    PRIMARY KEY (id_contrevenant, id_dossier),
    CONSTRAINT fk_a_le_statut_con_contrevenant FOREIGN KEY (id_contrevenant) REFERENCES contrevenant (id_contrevenant) ON DELETE CASCADE,
    CONSTRAINT fk_a_le_statut_con_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE,
    CONSTRAINT fk_a_le_statut_con_statut FOREIGN KEY (id_statut_contrevenant) REFERENCES statut_contrevenant (id_statut_contrevenant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appartiens_natinf_infra (
    id_pv INT NOT NULL,
    id_natinf INT NOT NULL,
    PRIMARY KEY (id_pv, id_natinf),
    CONSTRAINT fk_appartiens_natinf_infra_pv FOREIGN KEY (id_pv) REFERENCES signalement_pv (id_pv) ON DELETE CASCADE,
    CONSTRAINT fk_appartiens_natinf_infra_natinf FOREIGN KEY (id_natinf) REFERENCES natinf (id_natinf) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tribunal_correctionnel (
    id_dossier VARCHAR(100) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cours_appel (
    id_dossier VARCHAR(100) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cour_cassation (
    id_dossier VARCHAR(100) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE proc_connexes (
    id_conn INT AUTO_INCREMENT PRIMARY KEY,
    conn_date DATE DEFAULT NULL,
    conn_ref VARCHAR(100) DEFAULT NULL,
    conn_auteur_1 VARCHAR(255) DEFAULT NULL,
    conn_type VARCHAR(100) DEFAULT NULL,
    conn_auteur_2 VARCHAR(255) DEFAULT NULL,
    conn_obs TEXT DEFAULT NULL,
    id_dossier INT NOT NULL,
    CONSTRAINT fk_proc_connexes_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audience (
    id_audience INT AUTO_INCREMENT PRIMARY KEY,
    audience_date DATE DEFAULT NULL,
    audience_juridiction VARCHAR(100) DEFAULT NULL,
    audience_type_proc VARCHAR(100) DEFAULT NULL,
    audience_objet VARCHAR(255) DEFAULT NULL,
    audience_observation TEXT DEFAULT NULL,
    audience_suite VARCHAR(255) DEFAULT NULL,
    audience_date_renvoi DATE DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appartiens_aud (
    id_dossier INT NOT NULL,
    id_audience INT NOT NULL,
    PRIMARY KEY (id_dossier, id_audience),
    CONSTRAINT fk_appartiens_aud_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE,
    CONSTRAINT fk_appartiens_aud_audience FOREIGN KEY (id_audience) REFERENCES audience (id_audience) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE decisions (
    id_decision INT AUTO_INCREMENT PRIMARY KEY,
    decision_juridiction VARCHAR(100) DEFAULT NULL,
    decision_type VARCHAR(100) DEFAULT NULL,
    decision_procedure TINYINT(1) DEFAULT NULL,
    decision_culpabilite VARCHAR(100) DEFAULT NULL,
    decision_peine TINYINT(1) DEFAULT NULL,
    decision_amende DECIMAL(12,2) DEFAULT NULL,
    decision_peine_prison VARCHAR(100) DEFAULT NULL,
    decision_remise_etat TINYINT(1) DEFAULT NULL,
    decision_qualification VARCHAR(100) DEFAULT NULL,
    decision_mode_signification VARCHAR(100) DEFAULT NULL,
    decision_date_signification DATE DEFAULT NULL,
    decision_date_notification DATE DEFAULT NULL,
    decision_date_decision DATE DEFAULT NULL,
    decision_decision_receptionnee TINYINT(1) DEFAULT NULL,
    decision_observation TEXT DEFAULT NULL,
    decision_delai VARCHAR(100) DEFAULT NULL,
    decision_montant_astreinte DECIMAL(12,2) DEFAULT NULL,
    decision_publication TINYINT(1) DEFAULT NULL,
    decision_condamnation_solidaire TINYINT(1) DEFAULT NULL,
    decision_sursis_amende DECIMAL(12,2) DEFAULT NULL,
    decision_sursis_prison VARCHAR(100) DEFAULT NULL,
    id_audience INT DEFAULT NULL,
    CONSTRAINT fk_decisions_audience FOREIGN KEY (id_audience) REFERENCES audience (id_audience) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lien_contre_deci (
    id_contrevenant INT NOT NULL,
    id_decision INT NOT NULL,
    PRIMARY KEY (id_contrevenant, id_decision),
    CONSTRAINT fk_lien_contre_deci_contrevenant FOREIGN KEY (id_contrevenant) REFERENCES contrevenant (id_contrevenant) ON DELETE CASCADE,
    CONSTRAINT fk_lien_contre_deci_decision FOREIGN KEY (id_decision) REFERENCES decisions (id_decision) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE soit_transmis (
    id_soit_transmis INT AUTO_INCREMENT PRIMARY KEY,
    soit_trans_numero VARCHAR(100) DEFAULT NULL,
    soit_trans_damande_parquet VARCHAR(255) DEFAULT NULL,
    soit_trans_date_premiere_audition DATE DEFAULT NULL,
    soit_trans_date_limite_enquete DATE DEFAULT NULL,
    soit_trans_priorite VARCHAR(10) DEFAULT NULL,
    soit_trans_traite TINYINT(1) DEFAULT 0,
    soit_trans_observation TEXT DEFAULT NULL,
    soit_trans_date DATE DEFAULT NULL,
    id_parquet INT DEFAULT NULL,
    id_dossier INT DEFAULT NULL,
    id_avis INT DEFAULT NULL,
    CONSTRAINT fk_soit_transmis_parquet FOREIGN KEY (id_parquet) REFERENCES parquet (id_parquet) ON DELETE SET NULL,
    CONSTRAINT fk_soit_transmis_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE avis (
    id_avis INT AUTO_INCREMENT PRIMARY KEY,
    avis_conclusion VARCHAR(255) DEFAULT NULL,
    avis_observations TEXT DEFAULT NULL,
    avis_date DATE DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fais_objet (
    id_soit_transmis INT NOT NULL,
    id_avis INT NOT NULL,
    PRIMARY KEY (id_soit_transmis, id_avis),
    CONSTRAINT fk_fais_objet_soit_transmis FOREIGN KEY (id_soit_transmis) REFERENCES soit_transmis (id_soit_transmis) ON DELETE CASCADE,
    CONSTRAINT fk_fais_objet_avis FOREIGN KEY (id_avis) REFERENCES avis (id_avis) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recours (
    id_recours INT AUTO_INCREMENT PRIMARY KEY,
    recours_date DATE DEFAULT NULL,
    recours_type VARCHAR(100) DEFAULT NULL,
    recours_observation TEXT DEFAULT NULL,
    id_contrevenant INT DEFAULT NULL,
    id_parquet INT DEFAULT NULL,
    CONSTRAINT fk_recours_contrevenant FOREIGN KEY (id_contrevenant) REFERENCES contrevenant (id_contrevenant) ON DELETE SET NULL,
    CONSTRAINT fk_recours_parquet FOREIGN KEY (id_parquet) REFERENCES parquet (id_parquet) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lien_recours_deci (
    id_recours INT NOT NULL,
    id_decision INT NOT NULL,
    PRIMARY KEY (id_recours, id_decision),
    CONSTRAINT fk_lien_recours_deci_recours FOREIGN KEY (id_recours) REFERENCES recours (id_recours) ON DELETE CASCADE,
    CONSTRAINT fk_lien_recours_deci_decision FOREIGN KEY (id_decision) REFERENCES decisions (id_decision) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courrier (
    id_courrier INT AUTO_INCREMENT PRIMARY KEY,
    courrier_date DATE DEFAULT NULL,
    courrier_objet VARCHAR(255) DEFAULT NULL,
    courrier_observation TEXT DEFAULT NULL,
    id INT DEFAULT NULL,
    id_contrevenant INT DEFAULT NULL,
    id_dossier INT DEFAULT NULL,
    CONSTRAINT fk_courrier_agent FOREIGN KEY (id) REFERENCES agent (id) ON DELETE SET NULL,
    CONSTRAINT fk_courrier_contrevenant FOREIGN KEY (id_contrevenant) REFERENCES contrevenant (id_contrevenant) ON DELETE SET NULL,
    CONSTRAINT fk_courrier_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recouvrement (
    id_recouvrement INT AUTO_INCREMENT PRIMARY KEY,
    recouvrement_date DATE DEFAULT NULL,
    recouvrement_objet VARCHAR(255) DEFAULT NULL,
    recouvrement_date_periode_debut DATE DEFAULT NULL,
    recouvrement_date_periode_fin DATE DEFAULT NULL,
    recouvrement_montant_journalier DECIMAL(12,2) DEFAULT NULL,
    recouvrement_montant_total DECIMAL(12,2) DEFAULT NULL,
    recouvrement_annulation VARCHAR(255) DEFAULT NULL,
    recouvrement_observation TEXT DEFAULT NULL,
    id INT DEFAULT NULL,
    id_contrevenant INT DEFAULT NULL,
    id_dossier INT DEFAULT NULL,
    CONSTRAINT fk_recouvrement_agent FOREIGN KEY (id) REFERENCES agent (id) ON DELETE SET NULL,
    CONSTRAINT fk_recouvrement_contrevenant FOREIGN KEY (id_contrevenant) REFERENCES contrevenant (id_contrevenant) ON DELETE SET NULL,
    CONSTRAINT fk_recouvrement_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rapport (
    id_rapport INT AUTO_INCREMENT PRIMARY KEY,
    rapport_date DATE DEFAULT NULL,
    rapport_emetteur VARCHAR(255) DEFAULT NULL,
    rapport_objet VARCHAR(255) DEFAULT NULL,
    rapport_observation TEXT DEFAULT NULL,
    id_dossier INT DEFAULT NULL,
    CONSTRAINT fk_rapport_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE requete (
    id_requete INT AUTO_INCREMENT PRIMARY KEY,
    requete_date DATE DEFAULT NULL,
    requete_objet VARCHAR(255) DEFAULT NULL,
    requete_emetteur VARCHAR(255) DEFAULT NULL,
    requete_observation TEXT DEFAULT NULL,
    id_dossier INT DEFAULT NULL,
    CONSTRAINT fk_requete_dossier FOREIGN KEY (id_dossier) REFERENCES dossier (id_dossier) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
