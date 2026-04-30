# Archived Files

This directory contains deprecated or redundant files that have been archived as part of the codebase remediation process.

## Archival Policy

Files are moved here when:
1. They are superseded by a more comprehensive implementation
2. They contain duplicate functionality 
3. They are no longer referenced by active code

## Do NOT delete this directory
These files serve as a backup in case rollback is needed.

## Archive Log

| File | Date Archived | Reason | Replaced By |
|------|---------------|--------|-------------|
| firebase-init.js.bak | 2025-12-06 | Duplicate Firebase initialization | auth.js |
| firebaseAuth.js.bak | 2025-12-06 | Duplicate Firebase initialization with legacy v8 support | auth.js |
| firebase-config.js.bak | 2025-12-06 | Duplicate async Firebase initialization | auth.js + firebaseConfig.js |

---

*Created: 2025-12-06*
*Remediation Plan: Batch 1 - Firebase Consolidation Complete*
