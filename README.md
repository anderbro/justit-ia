# ddtm34_aj — Astreintes juridiques

Application PHP de gestion des affaires juridiques (DDTM 34).

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS / Linux)

## Démarrage rapide (application + base de données)

Depuis la racine du projet :

```bash
docker compose up -d --build
docker compose exec php php docker/seed-admin.php admin123
```

- **Application** : http://localhost:8080/pages/connexion/connexion.php  
- **MySQL** : `localhost:3306` — base `astreintes_juridiques_new`, utilisateur `root`, mot de passe `root`

### Compte administrateur

| Champ | Valeur |
|-------|--------|
| E-mail | `admin@ddtm34.fr` |
| Mot de passe | `admin123` (ou celui passé à `seed-admin.php`) |

Vous pouvez aussi créer un compte via la page **Inscription** (rôle `basic_user`).

## Lecture IA d’un document

Sur **Création d’un dossier**, un scan (PDF ou image) peut préremplir le formulaire.

```bash
docker compose up -d --build
```

Le service `ai` lit le document avec **Tesseract (OCR français)** dans Docker, puis propose les champs. Vérifiez toujours avant de créer le dossier.

Pour une extraction plus précise, deux options :

1. **API OpenAI-compatible** — créez un fichier `.env` à la racine :

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

2. **IA 100 % locale (Ollama)** :

```bash
docker compose --profile llm up -d
docker compose exec ollama ollama pull llama3.2
```

Puis dans `.env` :

```
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
```

Ensuite `docker compose up -d` (le service `ai` relit ces variables).

## Base de données seule (PHP local type XAMPP)

Si vous exécutez PHP en local et souhaitez uniquement MySQL dans Docker :

```bash
docker compose up -d mysql
docker compose run --rm php php docker/seed-admin.php admin123
```

Le fichier `bd.php` se connecte par défaut à `127.0.0.1:3306` avec `root` / `root`.

Variables d'environnement optionnelles : `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

## Schéma de la base

Le schéma MySQL a été **reconstruit depuis le code PHP** (aucun dump SQL n'était présent dans le dépôt). Il couvre l'ensemble des tables utilisées par l'application :

`dossier`, `signalement_pv`, `contrevenant`, `user`, `role`, `agent`, `audience`, `decisions`, `parquet`, `soit_transmis`, etc.

Des données de référence (rôles, statuts, communes, NATINF, dossier démo) sont chargées au premier démarrage via `docker/mysql/init/`.

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Arrêter
docker compose down

# Réinitialiser complètement la base (supprime les volumes)
docker compose down -v
docker compose up -d --build
docker compose exec php php docker/seed-admin.php admin123
```

## Limites connues

- Les tables `tribunal_correctionnel`, `cours_appel` et `cour_cassation` ne contiennent que la clé `id_dossier` (numéro de dossier) : le code actuel n'expose pas d'autres colonnes.
- Le référentiel `natinf` et `comm_arr` est un échantillon minimal ; un import complet depuis la base de production peut être nécessaire pour un usage métier complet.
