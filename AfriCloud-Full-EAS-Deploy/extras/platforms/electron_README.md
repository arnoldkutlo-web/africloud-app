Electron desktop sync client (scaffold)

This folder explains how to scaffold an Electron app that will sync a local folder with AfriCloud using the backend multipart endpoints.

Key ideas:
- Use chokidar to watch a local folder for changes.
- Use AWS S3 multipart + backend initiate/presign/complete endpoints to upload large files.
- Maintain SQLite for local state and a background sync process.

I can scaffold the Electron project files (main, renderer, sync worker) on request.
