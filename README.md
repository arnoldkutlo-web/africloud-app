AfriCloud - OneDrive-like full-stack scaffold

Structure:
- backend/ : Node.js + Express + Sequelize (Postgres) + S3 integration
- frontend/: React + Vite + simple UI
- infra/: docker-compose for local dev (postgres + backend)

Quickstart (local dev):
1. Copy backend/.env.example to backend/.env and fill values (especially AWS keys and S3 bucket)
2. From root run: docker-compose up --build
   - This starts Postgres and backend (backend connects to S3, so ensure credentials or mock)
3. Setup frontend:
   cd frontend
   npm install
   npm run dev
4. Open frontend at http://localhost:5173 and API at http://localhost:4000

Notes:
- This is a scaffold. You should run migrations (src/models/init.js) to create tables.
- For production consider managed DB, proper secrets, HTTPS, rate limiting, tests, background jobs for versioning, worker for large uploads, etc.


ADDED FEATURES:
- Resumable S3 multipart endpoints and frontend ResumableUpload component.
- Version history endpoints and Versions UI component.
- Share endpoint supports expiring links and public access via token.
- Scaffolding notes for Electron desktop sync client and React Native mobile app.


NEXT ADDED:
- Hardened resumable upload component (concurrency, retries, resume after reload).
- Electron sync client scaffold (use chokidar). Start by opening extras/electron and run `npm install` then `npm start`.
- React Native Expo scaffold in extras/reactnative with basic pick-and-upload screen.
- GitHub Actions workflows in .github/workflows for backend and frontend.

To test Electron sync locally: set API_URL env and run electron app in extras/electron.



ADDITIONAL IMPLEMENTATIONS ADDED:
- Electron sync worker now uses S3 multipart via backend (concurrency, retries, resume state file).
- React Native UploadScreen improved and services added; includes auth helpers for signup/login.
- Test scaffolding with Jest, supertest, and React Testing Library in /tests.
- Kubernetes manifests and Helm chart scaffold in /k8s and /helm.
- AWS ECS task definition and Azure App Service guide added.

Run notes:
- Electron: extras/electron, run `npm install`, then `node main.js` or `npm start`. Pass API_URL and API_TOKEN via prompt or env.
- RN: extras/reactnative, run `npm install`, `expo start`. Replace placeholder etag handling in uploads for production.
- Tests: cd tests && npm install && npm test



FINAL: RN full implementation and CI added.
- extras/reactnative_full contains a bare RN app using react-native-blob-util to upload file parts via presigned PUTs.
- .github/workflows/rn-eas-build.yml triggers EAS builds (requires EAS_TOKEN secret).
- .github/workflows/deploy-k8s.yml builds docker images and deploys to Kubernetes (requires DOCKERHUB and KUBECONFIG secrets).

Be sure to add secrets in your repo settings before running workflows.


EAS & Play Store
- eas.json added to extras/reactnative_full/eas.json.
- Add EAS_TOKEN and GOOGLE_PLAY_SERVICE_ACCOUNT as repository secrets to run RN build and submission workflows.

Signing
- android-gradle.properties.template and signing-instructions.txt added to extras/reactnative_full. Do NOT commit real keystore/credentials.

Managed cloud options
- digitalocean-app-spec.yaml (DigitalOcean App Platform) and render.yaml (Render) added. Replace placeholders with your repo/image names and secrets.

CI Note
- GitHub Actions workflows included will need secrets: EAS_TOKEN, GOOGLE_PLAY_SERVICE_ACCOUNT, DOCKERHUB_TOKEN, KUBECONFIG, etc. I cannot perform builds in this environment because native toolchains and secrets are required.
