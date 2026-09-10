import io
import json
import os
import re
import unicodedata
from datetime import datetime
from typing import Any

import httpx
import pytesseract
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import fitz

app = FastAPI(title="Justit IA — lecture de documents")

OLLAMA_URL = os.getenv("OLLAMA_URL", "").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/webp",
}

EMPTY_FIELDS = {
    "numero_dossier": "",
    "commune": "",
    "priorite": "",
    "date_du_soit_transmis": "",
    "parcelle_principale": "",
    "parcelles_secondaires": "",
    "date_courrier": "",
    "cabanisation": "Non",
    "dossier_sensible": "Non",
    "detruit": "Non",
    "observations": "",
    "contrevenant_nom": "",
    "contrevenant_prenom": "",
    "contrevenant_adresse": "",
}


def parse_communes(raw: str) -> list[str]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(item).strip() for item in data if str(item).strip()]
    except json.JSONDecodeError:
        pass
    return [part.strip() for part in raw.split(",") if part.strip()]


def ocr_image(image: Image.Image) -> str:
    return pytesseract.image_to_string(image, lang="fra+eng") or ""


def extract_text(filename: str, content: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf") or content[:4] == b"%PDF":
        document = fitz.open(stream=content, filetype="pdf")
        chunks = []
        for page in document:
            page_text = page.get_text("text") or ""
            if page_text.strip():
                chunks.append(page_text)
            else:
                pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                image = Image.open(io.BytesIO(pixmap.tobytes("png")))
                chunks.append(ocr_image(image))
        document.close()
        return "\n".join(chunks)

    image = Image.open(io.BytesIO(content))
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    return ocr_image(image)


def normalize_date(value: str) -> str:
    value = value.strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d.%m.%Y"):
        try:
            return datetime.strptime(value, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return ""


def find_commune(text: str, communes: list[str]) -> str:
    lowered = text.lower()
    ranked = sorted(communes, key=len, reverse=True)
    for commune in ranked:
        if commune.lower() in lowered:
            return commune
    return ""


def extract_with_rules(text: str, communes: list[str]) -> dict[str, Any]:
    fields = dict(EMPTY_FIELDS)
    compact = re.sub(r"[ \t]+", " ", text)

    dossier_match = re.search(
        r"\b(DOS[-\s]?\d{4}[-\s]?\d{2,6}|\d{2,4}[/-]\d{2,6})\b",
        compact,
        re.IGNORECASE,
    )
    if dossier_match:
        fields["numero_dossier"] = re.sub(r"\s+", "", dossier_match.group(1).upper())

    fields["commune"] = find_commune(compact, communes)
    if not fields["commune"]:
        commune_label = re.search(
            r"commune\s*:\s*([A-Za-zÉÈÊÀÂÎÏÔÙÛÇéèêàâîïôùûç' -]{2,40})",
            compact,
            re.IGNORECASE,
        )
        if commune_label:
            candidate = commune_label.group(1).strip()
            fields["commune"] = find_commune(candidate, communes) or candidate

    date_matches = re.findall(r"\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}|\d{4}-\d{2}-\d{2})\b", compact)
    if date_matches:
        first = normalize_date(date_matches[0])
        fields["date_du_soit_transmis"] = first
        fields["date_courrier"] = first
        if "soit" in compact.lower() or "transmis" in compact.lower():
            fields["date_du_soit_transmis"] = first

    parcelle_matches = re.findall(r"\b([A-Z]{1,3}-\d{1,4})\b", compact.upper())
    ignored = {fields["numero_dossier"].upper(), "DOS"}
    parcelles = []
    for item in parcelle_matches:
        token = item.replace(" ", "-") if " " in item else item.replace(" ", "")
        if token in ignored or token.startswith("DOS") or re.fullmatch(r"20\d{2}", token) or re.fullmatch(r"P[123]", token):
            continue
        if re.match(r"^(INF|ST|PC|PV|NAT)", token, re.IGNORECASE) or re.fullmatch(r"R\d{2,4}", token):
            continue
        if token not in parcelles:
            parcelles.append(token)
    if parcelles:
        fields["parcelle_principale"] = parcelles[0]
        if len(parcelles) > 1:
            fields["parcelles_secondaires"] = ", ".join(parcelles[1:4])

    if re.search(r"\bcabanisation\b", compact, re.IGNORECASE):
        fields["cabanisation"] = "Oui"
    if re.search(r"sensible|prioritaire", compact, re.IGNORECASE):
        fields["dossier_sensible"] = "Oui"
    detruit_label = re.search(r"\bd[ée]truit\s*:\s*(oui|non)\b", compact, re.IGNORECASE)
    if detruit_label:
        fields["detruit"] = "Oui" if detruit_label.group(1).lower() == "oui" else "Non"
    elif re.search(r"\bd[ée]molition\b", compact, re.IGNORECASE):
        fields["detruit"] = "Oui"

    priorite_match = re.search(r"\bP\s*([123])\b", compact, re.IGNORECASE)
    if priorite_match:
        fields["priorite"] = "P" + priorite_match.group(1)

    nom_match = re.search(
        r"(?:nom(?:\sdu\scontrevenant)?|contrevenant)\s*[:\-]\s*([A-Za-zÉÈÊÀÂÎÏÔÙÛÇéèêàâîïôùûç' -]{2,60})",
        compact,
        re.IGNORECASE,
    )
    if nom_match:
        fields["contrevenant_nom"] = nom_match.group(1).strip()

    prenom_match = re.search(
        r"(?:pr[ée]nom)\s*[:\-]\s*([A-ZÉÈÊÀÂÎÏÔÙÛÇ][A-Za-zÉÈÊÀÂÎÏÔÙÛÇéèêàâîïôùûç' -]{1,40})",
        compact,
        re.IGNORECASE,
    )
    if prenom_match:
        fields["contrevenant_prenom"] = prenom_match.group(1).strip()

    fields["observations"] = " ".join(compact.split())[:1200]
    return fields


ENTITY_KEYS = (
    "contrevenants",
    "infractions",
    "parquets",
    "avis",
    "audiences",
    "decisions",
    "recours",
    "courriers",
    "rapports",
    "requetes",
    "recouvrements",
    "procedures_liees",
)

SECTION_ALIASES = {
    "contrevenant": "contrevenants",
    "contrevenants": "contrevenants",
    "personne physique": "contrevenants",
    "personne morale": "contrevenants",
    "infraction": "infractions",
    "infractions": "infractions",
    "proces verbal": "infractions",
    "pv": "infractions",
    "parquet": "parquets",
    "soit transmis": "parquets",
    "avis": "avis",
    "avis du parquet": "avis",
    "audience": "audiences",
    "audiences": "audiences",
    "decision": "decisions",
    "decisions": "decisions",
    "recours": "recours",
    "recours et pourvoi": "recours",
    "pourvoi": "recours",
    "courrier": "courriers",
    "courriers": "courriers",
    "rapport": "rapports",
    "rapports": "rapports",
    "requete": "requetes",
    "requetes": "requetes",
    "assignation": "requetes",
    "recouvrement": "recouvrements",
    "recouvrements": "recouvrements",
    "procedure liee": "procedures_liees",
    "procedures liees": "procedures_liees",
    "procedure connexe": "procedures_liees",
}

SECTION_HEADER = re.compile(
    r"(?:^|\n)\s*=+\s*("
    r"CONTREVENANT(?:S)?(?:\s+\d+)?|PERSONNE\s+PHYSIQUE|PERSONNE\s+MORALE|"
    r"INFRACTION(?:S)?|PROC[EÈ]S[-\s]?VERBAL|\bPV\b|"
    r"PARQUET|SOIT[-\s]?TRANSMIS|"
    r"AVIS(?:\s+DU\s+PARQUET)?|"
    r"AUDIENCE(?:S)?|D[EÉ]CISION(?:S)?|"
    r"RECOURS(?:\s+ET\s+POURVOI)?|POURVOI|"
    r"COURRIER(?:S)?|RAPPORT(?:S)?|"
    r"REQU[EÊ]TE(?:S)?(?:\s*/\s*ASSIGNATION(?:S)?)?|ASSIGNATION(?:S)?|"
    r"RECOUVREMENT(?:S)?|"
    r"PROC[EÉ]DURE(?:S)?\s+LI[EÉ]E(?:S)?|PROC[EÉ]DURE(?:S)?\s+CONNEXE(?:S)?"
    r")\s*=+\s*(?:\n|$)",
    re.IGNORECASE,
)


def empty_entities() -> dict[str, list]:
    return {key: [] for key in ENTITY_KEYS}


def fold_label(value: str) -> str:
    value = unicodedata.normalize("NFD", value or "")
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    value = re.sub(r"[^a-zA-Z0-9]+", " ", value.lower()).strip()
    return value


def labeled_values(text: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for match in re.finditer(
        r"^[\t ]*([A-Za-zÉÈÊÀÂÎÏÔÙÛÇéèêàâîïôùûç0-9'’ /_.-]{2,60})\s*:\s*(.+?)\s*$",
        text,
        re.MULTILINE,
    ):
        key = fold_label(match.group(1))
        values[key] = match.group(2).strip()
    return values


def pick(labels: dict[str, str], *keys: str) -> str:
    for key in keys:
        value = labels.get(fold_label(key), "")
        if value:
            return value
    return ""


def yes_no(value: str) -> str:
    if not value:
        return ""
    lowered = fold_label(value)
    if lowered in {"oui", "yes", "true", "1", "x"}:
        return "Oui"
    if lowered in {"non", "no", "false", "0"}:
        return "Non"
    return value


def split_sections(text: str) -> list[tuple[str, str]]:
    matches = list(SECTION_HEADER.finditer(text))
    if not matches:
        return [("dossier", text)]
    sections = []
    preamble = text[: matches[0].start()].strip()
    if preamble:
        sections.append(("dossier", preamble))
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        alias = fold_label(match.group(1))
        key = SECTION_ALIASES.get(alias, alias)
        if alias.startswith("personne morale"):
            key = "contrevenants_morale"
        elif alias.startswith("personne physique") or alias.startswith("contrevenant"):
            key = "contrevenants"
        sections.append((key, text[match.end() : end].strip()))
    return sections


def extract_natinfs(text: str) -> list[str]:
    found = re.findall(r"\b((?:R\d{3}-\d+)|(?:\d{3}-\d+(?:-\d+)?))\b", text, re.IGNORECASE)
    unique = []
    for item in found:
        token = item.upper()
        if token not in unique:
            unique.append(token)
    return unique[:8]


def person_from_labels(labels: dict[str, str], moral: bool = False) -> dict[str, str] | None:
    nom = pick(labels, "nom", "nom du contrevenant", "raison sociale", "societe", "contrevenant")
    prenom = pick(labels, "prenom", "prénom")
    if not nom:
        return None
    type_value = fold_label(pick(labels, "type", "forme"))
    is_moral = (
        moral
        or "morale" in type_value
        or bool(pick(labels, "siret", "siren", "siret siren", "raison sociale"))
    )
    if is_moral:
        return {
            "type": "morale",
            "nom": nom,
            "representant_legal": pick(labels, "representant legal", "representant"),
            "adresse_siege": pick(labels, "adresse siege", "siege", "adresse"),
            "siret": pick(labels, "siret", "siren", "siret siren"),
            "statut": pick(labels, "statut") or "En cours",
        }
    return {
        "type": "physique",
        "civilite": pick(labels, "civilite") or "M.",
        "nom": nom,
        "prenom": prenom,
        "date_naissance": normalize_date(pick(labels, "date de naissance", "naissance")) or pick(labels, "date de naissance"),
        "lieu_naissance": pick(labels, "lieu de naissance"),
        "adresse": pick(labels, "adresse"),
        "statut": pick(labels, "statut") or "En cours",
    }


def infraction_from_labels(labels: dict[str, str], fields: dict[str, Any], text: str) -> dict[str, Any] | None:
    reference = pick(labels, "reference", "reference pv", "pv", "n pv")
    date_pv = normalize_date(pick(labels, "date pv", "date de l infraction", "date")) or fields.get("date_du_soit_transmis", "")
    natinfs = extract_natinfs(pick(labels, "natinf", "natinfs", "qualification") + " " + text)
    if not reference and not natinfs and not pick(labels, "type", "objet"):
        return None
    return {
        "pv_date": date_pv,
        "pv_reference": reference,
        "pv_correspondant": pick(labels, "correspondant", "agent", "redacteur"),
        "pv_contrevenant": pick(labels, "contrevenant", "personne visee"),
        "pv_type": pick(labels, "type", "type infraction") or "Infraction urbanisme",
        "pv_parcelle_prin": pick(labels, "parcelle principale", "parcelle") or fields.get("parcelle_principale", ""),
        "pv_parcelles_autres": pick(labels, "parcelles secondaires", "autres parcelles") or fields.get("parcelles_secondaires", ""),
        "pv_commune": pick(labels, "commune") or fields.get("commune", ""),
        "pv_arrondissement": pick(labels, "arrondissement"),
        "pv_zonage": pick(labels, "zonage", "zone"),
        "pv_cabanisation": yes_no(pick(labels, "cabanisation")) or fields.get("cabanisation", "Non"),
        "pv_detruit": yes_no(pick(labels, "detruit")) or fields.get("detruit", "Non"),
        "pv_enjeux": pick(labels, "enjeux"),
        "pv_obs": pick(labels, "observations", "observation"),
        "pv_infra_obs": pick(labels, "observations infraction", "faits"),
        "natinfs": natinfs,
    }


def parquet_from_labels(labels: dict[str, str], fields: dict[str, Any]) -> dict[str, Any] | None:
    numero = pick(labels, "numero", "n", "numero soit transmis", "n soit transmis")
    date_value = normalize_date(pick(labels, "date", "date du soit transmis", "date transmis")) or fields.get("date_du_soit_transmis", "")
    if not numero and not date_value and not pick(labels, "parquet", "auteur"):
        return None
    return {
        "numero": numero or fields.get("numero_dossier", ""),
        "date": date_value,
        "parquet": pick(labels, "parquet", "auteur", "auteur transmis") or "Parquet de Montpellier",
        "demande": pick(labels, "demande", "demande parquet", "objet"),
        "date_premiere_audition": normalize_date(pick(labels, "date premiere audition", "premiere audition")),
        "date_limite_enquete": normalize_date(pick(labels, "date limite enquete", "limite enquete")),
        "priorite": pick(labels, "priorite") or fields.get("priorite", ""),
        "traite": 1 if fold_label(pick(labels, "traite")) in {"oui", "1", "x"} else 0,
        "observation": pick(labels, "observations", "observation"),
    }


def simple_dated(labels: dict[str, str], extra: dict[str, str] | None = None) -> dict[str, str]:
    payload = {
        "date": normalize_date(pick(labels, "date")) or pick(labels, "date"),
        "objet": pick(labels, "objet"),
        "observation": pick(labels, "observations", "observation"),
        "emetteur": pick(labels, "emetteur", "redacteur", "auteur", "agent"),
    }
    if extra:
        payload.update(extra)
    return payload


def extract_entities_with_rules(text: str, fields: dict[str, Any]) -> dict[str, list]:
    entities = empty_entities()
    for key, body in split_sections(text):
        labels = labeled_values(body)
        if key in {"contrevenants", "contrevenants_morale"}:
            person = person_from_labels(labels, moral=key.endswith("morale"))
            if person:
                entities["contrevenants"].append(person)
        elif key == "infractions":
            item = infraction_from_labels(labels, fields, body)
            if item:
                entities["infractions"].append(item)
        elif key == "parquets":
            item = parquet_from_labels(labels, fields)
            if item:
                entities["parquets"].append(item)
        elif key == "avis":
            if pick(labels, "conclusion") or pick(labels, "date"):
                entities["avis"].append(
                    {
                        "conclusion": pick(labels, "conclusion", "avis"),
                        "observation": pick(labels, "observations", "observation"),
                        "date": normalize_date(pick(labels, "date")) or pick(labels, "date"),
                    }
                )
        elif key == "audiences":
            if pick(labels, "date") or pick(labels, "juridiction"):
                entities["audiences"].append(
                    {
                        "date": normalize_date(pick(labels, "date", "date audience")),
                        "juridiction": pick(labels, "juridiction") or "TJ Montpellier",
                        "type_procedure": pick(labels, "type de procedure", "type") or "Correctionnel",
                        "objet": pick(labels, "objet", "objet de l audience"),
                        "suite": pick(labels, "suites", "suite"),
                        "observation": pick(labels, "observations", "observation"),
                        "date_renvoi": normalize_date(pick(labels, "date de renvoi", "renvoi")),
                    }
                )
        elif key == "decisions":
            if pick(labels, "date") or pick(labels, "type") or pick(labels, "juridiction"):
                entities["decisions"].append(
                    {
                        "date": normalize_date(pick(labels, "date", "date decision")),
                        "juridiction": pick(labels, "juridiction") or "TJ Montpellier",
                        "type": pick(labels, "type") or "Jugement",
                        "culpabilite": pick(labels, "culpabilite") or "coupable",
                        "peine": "true" if fold_label(pick(labels, "peine")) in {"oui", "1", "true"} else "false",
                        "amende": pick(labels, "amende", "montant amende"),
                        "peine_prison": pick(labels, "prison", "peine emprisonnement"),
                        "remise_etat": "true" if "remise" in fold_label(pick(labels, "remise en etat") + " " + body) else "false",
                        "qualification": pick(labels, "qualification"),
                        "mode_signification": pick(labels, "mode de signification", "signification"),
                        "date_signification": normalize_date(pick(labels, "date signification")),
                        "date_notification": normalize_date(pick(labels, "date notification")),
                        "observation": pick(labels, "observations", "observation"),
                        "delai": pick(labels, "delai"),
                        "montant_astreinte": pick(labels, "astreinte", "montant astreinte"),
                    }
                )
        elif key == "recours":
            if pick(labels, "date") or pick(labels, "type"):
                entities["recours"].append(
                    {
                        "date": normalize_date(pick(labels, "date")),
                        "type": pick(labels, "type") or "Appel",
                        "observation": pick(labels, "observations", "observation"),
                        "auteur": pick(labels, "auteur"),
                    }
                )
        elif key == "courriers":
            item = simple_dated(labels)
            if item["date"] or item["objet"]:
                entities["courriers"].append(item)
        elif key == "rapports":
            item = simple_dated(labels)
            if item["date"] or item["objet"]:
                entities["rapports"].append(item)
        elif key == "requetes":
            item = simple_dated(labels)
            if item["date"] or item["objet"]:
                entities["requetes"].append(item)
        elif key == "recouvrements":
            if pick(labels, "date") or pick(labels, "montant"):
                entities["recouvrements"].append(
                    {
                        "date": normalize_date(pick(labels, "date")),
                        "objet": pick(labels, "objet") or "Recouvrement d'astreinte",
                        "emetteur": pick(labels, "emetteur", "agent", "redacteur"),
                        "montant_journalier": pick(labels, "montant journalier", "journalier"),
                        "montant_total": pick(labels, "montant total", "montant"),
                        "date_debut": normalize_date(pick(labels, "periode debut", "date debut", "debut")),
                        "date_fin": normalize_date(pick(labels, "periode fin", "date fin", "fin")),
                        "observation": pick(labels, "observations", "observation"),
                    }
                )
        elif key == "procedures_liees":
            if pick(labels, "reference", "ref") or pick(labels, "date"):
                entities["procedures_liees"].append(
                    {
                        "date": normalize_date(pick(labels, "date")),
                        "ref": pick(labels, "reference", "ref"),
                        "auteur1": pick(labels, "auteur 1", "auteur"),
                        "type": pick(labels, "type") or "Procédure liée",
                        "auteur2": pick(labels, "auteur 2", "destinataire"),
                        "obs": pick(labels, "observations", "observation"),
                    }
                )

    if not entities["contrevenants"] and (fields.get("contrevenant_nom") or fields.get("contrevenant_prenom")):
        entities["contrevenants"].append(
            {
                "type": "physique",
                "civilite": "M.",
                "nom": fields.get("contrevenant_nom") or "",
                "prenom": fields.get("contrevenant_prenom") or "",
                "adresse": fields.get("contrevenant_adresse") or "",
                "statut": "En cours",
            }
        )

    if not entities["infractions"] and (
        fields.get("parcelle_principale") or fields.get("cabanisation") == "Oui" or "infraction" in text.lower()
    ):
        entities["infractions"].append(
            infraction_from_labels(labeled_values(text), fields, text)
            or {
                "pv_date": fields.get("date_du_soit_transmis", ""),
                "pv_reference": "",
                "pv_type": "Infraction urbanisme",
                "pv_parcelle_prin": fields.get("parcelle_principale", ""),
                "pv_parcelles_autres": fields.get("parcelles_secondaires", ""),
                "pv_commune": fields.get("commune", ""),
                "pv_cabanisation": fields.get("cabanisation", "Non"),
                "pv_detruit": fields.get("detruit", "Non"),
                "pv_contrevenant": " ".join(
                    part for part in [fields.get("contrevenant_prenom"), fields.get("contrevenant_nom")] if part
                ),
                "natinfs": extract_natinfs(text),
            }
        )

    if not entities["parquets"] and (
        fields.get("date_du_soit_transmis") or "soit" in text.lower() or "transmis" in text.lower()
    ):
        entities["parquets"].append(
            parquet_from_labels(labeled_values(text), fields)
            or {
                "numero": fields.get("numero_dossier", ""),
                "date": fields.get("date_du_soit_transmis", ""),
                "parquet": "Parquet de Montpellier",
                "demande": "Transmission du dossier",
                "priorite": fields.get("priorite", ""),
                "traite": 0,
                "observation": "",
            }
        )

    return entities


def extraction_schema() -> str:
    return json.dumps(
        {
            "numero_dossier": "string",
            "commune": "string from provided list if possible",
            "priorite": "P1, P2, P3 or empty",
            "date_du_soit_transmis": "YYYY-MM-DD or empty",
            "parcelle_principale": "string",
            "parcelles_secondaires": "string",
            "date_courrier": "YYYY-MM-DD or empty",
            "cabanisation": "Oui or Non",
            "dossier_sensible": "Oui or Non",
            "detruit": "Oui or Non",
            "observations": "short summary of the facts",
            "contrevenant_nom": "string",
            "contrevenant_prenom": "string",
            "contrevenant_adresse": "string",
            "entities": {
                "contrevenants": [
                    {
                        "type": "physique or morale",
                        "civilite": "string",
                        "nom": "string",
                        "prenom": "string",
                        "adresse": "string",
                        "representant_legal": "string",
                        "siret": "string",
                    }
                ],
                "infractions": [{"pv_date": "YYYY-MM-DD", "pv_reference": "string", "natinfs": ["string"]}],
                "parquets": [{"numero": "string", "date": "YYYY-MM-DD", "parquet": "string", "demande": "string"}],
                "avis": [{"date": "YYYY-MM-DD", "conclusion": "string", "observation": "string"}],
                "audiences": [{"date": "YYYY-MM-DD", "juridiction": "string", "type_procedure": "string", "objet": "string"}],
                "decisions": [{"date": "YYYY-MM-DD", "juridiction": "string", "type": "string", "amende": "string"}],
                "recours": [{"date": "YYYY-MM-DD", "type": "string", "observation": "string"}],
                "courriers": [{"date": "YYYY-MM-DD", "objet": "string", "emetteur": "string"}],
                "rapports": [{"date": "YYYY-MM-DD", "objet": "string", "emetteur": "string"}],
                "requetes": [{"date": "YYYY-MM-DD", "objet": "string", "emetteur": "string"}],
                "recouvrements": [{"date": "YYYY-MM-DD", "objet": "string", "montant_total": "string"}],
                "procedures_liees": [{"date": "YYYY-MM-DD", "ref": "string", "type": "string"}],
            },
        },
        ensure_ascii=False,
        indent=2,
    )


def parse_model_json(raw: str) -> dict[str, Any] | None:
    if not raw:
        return None
    cleaned = raw.strip()
    fenced = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if fenced:
        cleaned = fenced.group(0)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict):
        return None
    merged = dict(EMPTY_FIELDS)
    for key in EMPTY_FIELDS:
        value = data.get(key)
        if value is None:
            continue
        if key in ("cabanisation", "dossier_sensible", "detruit"):
            merged[key] = "Oui" if str(value).strip().lower() in {"oui", "yes", "true", "1", "x"} else "Non"
        else:
            merged[key] = str(value).strip()
    if merged["priorite"] and merged["priorite"].upper() in {"P1", "P2", "P3"}:
        merged["priorite"] = merged["priorite"].upper()
    for date_key in ("date_du_soit_transmis", "date_courrier"):
        if merged[date_key]:
            merged[date_key] = normalize_date(merged[date_key]) or merged[date_key]
    entities = data.get("entities")
    if isinstance(entities, dict):
        merged["entities"] = entities
    return merged


async def extract_with_llm(text: str, communes: list[str]) -> dict[str, Any] | None:
    prompt = (
        "Tu es un assistant des affaires juridiques de la DDTM 34. "
        "Extrais les informations d'un document scanné pour préremplir un dossier "
        "et créer les contrevenants, infractions, parquet, audiences, décisions, "
        "recours, courriers, rapports, requêtes, recouvrements et procédures liées. "
        "Réponds uniquement en JSON, sans commentaire.\n"
        f"Communes possibles : {', '.join(communes) if communes else 'Hérault'}\n"
        f"Schéma :\n{extraction_schema()}\n\n"
        f"Texte OCR :\n{text[:8000]}"
    )

    if OLLAMA_URL:
        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(
                    f"{OLLAMA_URL}/api/generate",
                    json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
                )
                response.raise_for_status()
                return parse_model_json(response.json().get("response", ""))
        except Exception:
            return None

    if OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(
                    f"{OPENAI_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                    json={
                        "model": OPENAI_MODEL,
                        "temperature": 0,
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {"role": "system", "content": "Tu extrais des champs juridiques en JSON strict."},
                            {"role": "user", "content": prompt},
                        ],
                    },
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return parse_model_json(content)
        except Exception:
            return None

    return None


@app.get("/health")
async def health() -> dict[str, Any]:
    engine = "ocr+rules"
    if OLLAMA_URL:
        engine = "ocr+ollama"
    elif OPENAI_API_KEY:
        engine = "ocr+openai"
    return {"ok": True, "engine": engine}


@app.post("/analyze")
async def analyze(
    document: UploadFile = File(...),
    communes: str = Form(""),
) -> JSONResponse:
    if document.content_type and document.content_type not in ALLOWED_TYPES and not (document.filename or "").lower().endswith((".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".webp")):
        raise HTTPException(status_code=400, detail="Format non pris en charge. Utilisez un PDF ou une image.")

    content = await document.read()
    if not content:
        raise HTTPException(status_code=400, detail="Fichier vide.")
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (20 Mo max).")

    try:
        text = extract_text(document.filename or "", content).strip()
    except Exception as error:
        raise HTTPException(status_code=422, detail=f"Lecture du document impossible : {error}") from error

    if not text:
        raise HTTPException(status_code=422, detail="Aucun texte n'a pu être lu sur ce document.")

    commune_list = parse_communes(communes)
    fields = extract_with_rules(text, commune_list)
    entities = extract_entities_with_rules(text, fields)
    engine = "ocr+rules"
    llm_fields = await extract_with_llm(text, commune_list)
    if llm_fields:
        engine = "ocr+ollama" if OLLAMA_URL else "ocr+openai"
        llm_entities = llm_fields.pop("entities", None)
        for key, value in llm_fields.items():
            if value:
                fields[key] = value
        if isinstance(llm_entities, dict):
            for key in ENTITY_KEYS:
                incoming = llm_entities.get(key)
                if isinstance(incoming, list) and incoming:
                    entities[key] = incoming

    filled = sum(1 for key, value in fields.items() if key != "observations" and value and value not in {"Non", ""})
    created_guess = sum(len(items) for items in entities.values())
    return JSONResponse(
        {
            "success": True,
            "engine": engine,
            "fields": fields,
            "entities": entities,
            "preview": text[:2500],
            "filled_count": filled,
            "entity_count": created_guess,
        }
    )
