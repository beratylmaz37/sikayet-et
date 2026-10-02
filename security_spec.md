# Security Specification for Şikayetimiz Var

## 1. Data Invariants
- `complaints`: Complaints must contain a valid title (5-150 chars), category, status, and description.
- Status values can only be one of `İnceleniyor`, `Çözüm Aşamasında`, `Çözüldü`, `Reddedildi`.
- Upvotes cannot be negative.
- Comments must be array of objects with valid text.

## 2. Access Control Model
- Public Read: Any student or visitor can read the list of complaints and their public comments.
- Create: Anyone can create a complaint with initial status `İnceleniyor` or default valid status.
- Update: Anyone can upvote or add comments, while administrators can update status and adminNote.
- Delete: Deletions are allowed for the complaint creator or administrator.
