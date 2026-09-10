"""Génère un soit-transmis d'exemple couvrant tous les onglets du dossier."""
import sys
from pathlib import Path

import fitz

OUTPUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent / "soit-transmis-DOS-2024-001.pdf"

PAGE1 = """
<div style="font-family: Helvetica, Arial, sans-serif; color:#161616; font-size:10px; line-height:1.35;">
  <p style="margin:0; font-size:8px; letter-spacing:0.8px; color:#000091; font-weight:bold;">PREFET DE L'HERAULT</p>
  <p style="margin:2px 0 0; font-size:11px; font-weight:bold; color:#000091;">Direction départementale des territoires et de la mer</p>
  <p style="margin:0; font-size:9px;">Service des affaires juridiques — 34000 Montpellier</p>
  <p style="margin:10px 0 8px; text-align:center; font-size:14px; font-weight:bold; color:#000091;">SOIT-TRANSMIS</p>
  <p><b>Numéro de dossier :</b> DOS-2024-001</p>
  <p><b>Date du soit-transmis :</b> 15/06/2024</p>
  <p><b>Date du courrier :</b> 15/06/2024</p>
  <p><b>Commune :</b> Montpellier</p>
  <p><b>Parcelle principale :</b> AB-123</p>
  <p><b>Parcelles secondaires :</b> AC-45</p>
  <p><b>Objet :</b> Infraction au code de l'urbanisme — cabanisation. Dossier sensible.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== CONTREVENANT ===</p>
  <p><b>Type :</b> Personne physique</p>
  <p><b>Civilité :</b> M.</p>
  <p><b>Nom :</b> Martin</p>
  <p><b>Prénom :</b> Luc</p>
  <p><b>Date de naissance :</b> 12/03/1978</p>
  <p><b>Lieu de naissance :</b> Montpellier</p>
  <p><b>Adresse :</b> 8 impasse des Oliviers, 34000 Montpellier</p>
  <p><b>Statut :</b> En cours</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== PERSONNE MORALE ===</p>
  <p><b>Type :</b> Personne morale</p>
  <p><b>Raison sociale :</b> SCI LES GARRIGUES</p>
  <p><b>Représentant légal :</b> Luc Martin</p>
  <p><b>Adresse siège :</b> 8 impasse des Oliviers, 34000 Montpellier</p>
  <p><b>SIRET :</b> 12345678900012</p>
  <p><b>Statut :</b> En cours</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== INFRACTION ===</p>
  <p><b>Date PV :</b> 20/05/2024</p>
  <p><b>Référence :</b> 2024-INF-002</p>
  <p><b>Type :</b> Infraction urbanisme</p>
  <p><b>NATINF :</b> 322-1-1, R417-10</p>
  <p><b>Contrevenant :</b> Luc Martin</p>
  <p><b>Correspondant :</b> Marie Dupont</p>
  <p><b>Parcelle principale :</b> AB-123</p>
  <p><b>Commune :</b> Montpellier</p>
  <p><b>Cabanisation :</b> Oui</p>
  <p><b>Détruit :</b> Non</p>
  <p><b>Observations :</b> Construction édifiée sans autorisation d'urbanisme.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== PARQUET ===</p>
  <p><b>Numéro :</b> ST-2024-002</p>
  <p><b>Date :</b> 15/06/2024</p>
  <p><b>Parquet :</b> Parquet de Montpellier</p>
  <p><b>Demande :</b> Poursuites pour cabanisation</p>
  <p><b>Date première audition :</b> 10/09/2024</p>
  <p><b>Date limite enquête :</b> 15/12/2024</p>
  <p><b>Priorité :</b> P2</p>
  <p><b>Traité :</b> Non</p>
  <p><b>Observations :</b> Transmission au parquet de Montpellier.</p>
</div>
"""

PAGE2 = """
<div style="font-family: Helvetica, Arial, sans-serif; color:#161616; font-size:10px; line-height:1.35;">
  <p style="margin:0 0 8px; font-weight:bold; color:#000091;">=== AVIS ===</p>
  <p><b>Date :</b> 02/07/2024</p>
  <p><b>Conclusion :</b> Avis favorable aux poursuites</p>
  <p><b>Observations :</b> Les éléments du PV sont suffisants.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== AUDIENCE ===</p>
  <p><b>Date :</b> 18/11/2024</p>
  <p><b>Juridiction :</b> TJ Montpellier</p>
  <p><b>Type de procédure :</b> Correctionnel</p>
  <p><b>Objet :</b> Cabanisation sur parcelle AB-123</p>
  <p><b>Suites :</b> Délibéré au 16/12/2024</p>
  <p><b>Observations :</b> Audience correctionnelle.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== DECISION ===</p>
  <p><b>Date :</b> 16/12/2024</p>
  <p><b>Juridiction :</b> TJ Montpellier</p>
  <p><b>Type :</b> Jugement</p>
  <p><b>Culpabilité :</b> coupable</p>
  <p><b>Peine :</b> Oui</p>
  <p><b>Amende :</b> 1500</p>
  <p><b>Remise en état :</b> Oui</p>
  <p><b>Astreinte :</b> 50</p>
  <p><b>Délai :</b> 3 mois</p>
  <p><b>Observations :</b> Condamnation avec remise en état sous astreinte.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== RECOURS ===</p>
  <p><b>Date :</b> 08/01/2025</p>
  <p><b>Type :</b> Appel</p>
  <p><b>Auteur :</b> Luc Martin</p>
  <p><b>Observations :</b> Appel formé par le contrevenant.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== COURRIER ===</p>
  <p><b>Date :</b> 20/12/2024</p>
  <p><b>Émetteur :</b> Marie Dupont</p>
  <p><b>Objet :</b> Notification du jugement</p>
  <p><b>Observations :</b> Courrier d'information au contrevenant.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== RAPPORT ===</p>
  <p><b>Date :</b> 15/01/2025</p>
  <p><b>Émetteur :</b> Jean Martin</p>
  <p><b>Objet :</b> Rapport de constat après jugement</p>
  <p><b>Observations :</b> Occupation toujours constatée.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== REQUETE ===</p>
  <p><b>Date :</b> 01/02/2025</p>
  <p><b>Émetteur :</b> Marie Dupont</p>
  <p><b>Objet :</b> Requête en exécution provisoire</p>
  <p><b>Observations :</b> Demande d'exécution de la remise en état.</p>
</div>
"""

PAGE3 = """
<div style="font-family: Helvetica, Arial, sans-serif; color:#161616; font-size:10px; line-height:1.35;">
  <p style="margin:0 0 8px; font-weight:bold; color:#000091;">=== RECOUVREMENT ===</p>
  <p><b>Date :</b> 01/03/2025</p>
  <p><b>Agent :</b> Marie Dupont</p>
  <p><b>Objet :</b> Recouvrement d'astreinte</p>
  <p><b>Montant journalier :</b> 50</p>
  <p><b>Montant total :</b> 1500</p>
  <p><b>Debut :</b> 16/12/2024</p>
  <p><b>Fin :</b> 15/01/2025</p>
  <p><b>Observations :</b> Liquidation de l'astreinte.</p>

  <p style="margin:12px 0 6px; font-weight:bold; color:#000091;">=== PROCEDURE LIEE ===</p>
  <p><b>Date :</b> 22/06/2024</p>
  <p><b>Reference :</b> PC-2024-014</p>
  <p><b>Type :</b> Recours gracieux</p>
  <p><b>Auteur 1 :</b> SCI LES GARRIGUES</p>
  <p><b>Auteur 2 :</b> Maire de Montpellier</p>
  <p><b>Observations :</b> Procedure administrative connexe.</p>
</div>
"""


def add_page(document, html):
    page = document.new_page(width=595, height=842)
    page.insert_htmlbox(fitz.Rect(48, 40, 547, 802), html)


def main():
    document = fitz.open()
    add_page(document, PAGE1)
    add_page(document, PAGE2)
    add_page(document, PAGE3)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document.save(OUTPUT)
    document.close()
    print(OUTPUT)


if __name__ == "__main__":
    main()
