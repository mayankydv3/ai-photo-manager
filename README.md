# SmartPhoto AI - AI-Powered Photo Management Platform

SmartPhoto AI is a modern, enterprise-grade AI photo management and deduplication platform. It connects with local storage directories and Google Photos cloud REST APIs to automatically categorize media, detect exact and near-duplicate images, group people using facial recognition, and offer natural language semantic search across collections scaling to **100,000+ images**.

---

## Key Features & Requirements Matrix

| Requirement | Implementation Feature | Status |
| :--- | :--- | :---: |
| **1. Connectors** | Recursive Local Directory Watcher & Google Photos REST API OAuth2 Integration | Completed |
| **2. Scalability** | Async worker batching & SQLite WAL mode engineered for **100,000+ images** | Completed |
| **3. Deduplication** | Cryptographic MD5 (exact) + 64-bit Perceptual Hash (pHash) & CLIP Vector Cosine Similarity | Completed |
| **4. AI Categorization** | Multi-modal zero-shot classification & OCR text extraction for `documents`, `prescriptions`, `receipts`, `people`, `travel`, `pets` | Completed |
| **5. Facial Recognition** | OpenCV face detection + 128-d vector embedding + DBSCAN face clustering into individuals | Completed |
| **6. Natural Language Search** | Multimodal semantic search (e.g. *"doctor prescriptions from last month"*, *"beach sunset with pets"*) | Completed |
| **7. Container & Testing** | Docker & Docker Compose setup + Automated Pytest test suite | Completed |

---

## Quick Start with Docker (Recommended)

To spin up both Backend (FastAPI) and Frontend (React + Nginx) with a single command:

```bash
# 1. Clone or navigate to the project root
cd ai-photo-manager

# 2. Build and launch containers
docker-compose up --build
```

- **Web Frontend Application**: [http://localhost](http://localhost) (or `http://localhost:3000` in dev mode)
- **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Local Development Setup

### Backend (Python FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (React + Vite)

```bash
cd frontend

# Install Node modules
npm install

# Start Vite dev server
npm run dev
```

---

## Running Automated Tests

Run the backend Pytest automated test suite covering duplicate engines, categorizer rules, face clustering, search, and REST APIs:

```bash
cd backend
pytest -v
```

---

## API Usage & Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/v1/stats/` | `GET` | Retrieve overall metrics (photos count, storage savings, categories, face count) |
| `GET /api/v1/photos/` | `GET` | Paginated photo list with category, source, and duplicate filters |
| `POST /api/v1/photos/upload` | `POST` | Upload photo file and trigger AI indexing |
| `POST /api/v1/photos/bulk-delete-duplicates` | `POST` | Delete all exact duplicate photos to free storage space |
| `POST /api/v1/search/` | `POST` | Execute natural language semantic search query |
| `GET /api/v1/duplicates/groups` | `GET` | List grouped exact & near-duplicate clusters |
| `POST /api/v1/duplicates/resolve/{id}` | `POST` | Resolve duplicate group by keeping target photo |
| `GET /api/v1/categories/` | `GET` | Category overview breakdown (`documents`, `prescriptions`, `receipts`, etc.) |
| `GET /api/v1/faces/people` | `GET` | List recognized individuals grouped by face clustering |
| `POST /api/v1/connectors/scan-local` | `POST` | Trigger background local directory scan |
| `POST /api/v1/connectors/google/sync` | `POST` | Trigger Google Photos REST API cloud sync |
| `POST /api/v1/connectors/seed-dataset` | `POST` | Generate sample dataset & simulate **100,000 photos** |

---

## Scalability Benchmarking (100,000+ Photos)

To test the system under 100,000 photo workload:
1. Open the UI dashboard at `http://localhost`
2. Click **"Scale 100k Photos"** in the top navigation bar or invoke `POST /api/v1/connectors/seed-dataset?scale_100k=true`
3. The backend WAL database will bulk ingest 100,000 indexed virtual photos and benchmark vector search and deduplication performance in milliseconds.

---

## Deliverables Included
- `backend/` - FastAPI backend application & AI core
- `frontend/` - React Vite Tailwind web user interface
- `docker-compose.yml` & `Dockerfile`s - Docker containerization
- `tests/` - Pytest automated test suite
- `ARCHITECTURE.md` - Technical architecture & design decisions
- `postman_collection.json` - Postman REST collection export
