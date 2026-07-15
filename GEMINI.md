# CampusCare AI Development Rules

You are assisting in developing CampusCare.

## Stack

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

Backend

- Java 21
- Spring Boot 3
- PostgreSQL
- Spring Security
- JWT
- BCrypt

---

## Coding Principles

Never redesign the architecture.

Modify existing code instead of rewriting.

Never remove modules.

Never replace enterprise logic with mock logic.

Keep the project modular.

Use DTOs.

Never expose entities.

Always use constructor injection.

Follow Spring Boot best practices.

Compile after backend changes.

Explain every modified file.

---

## Authentication

Login using loginId.

Never authenticate using email.

JWT based.

BCrypt passwords.

Role Based Access Control.

First login forces password change.

---

## Modules

1. Authentication
2. Complaint Management
3. Teaching Review
4. AI Analytics

Do not modify unrelated modules.

---

## Output Format

Before coding:

Explain your implementation plan.

After coding:

List modified files.

Explain each change.

Mention possible side effects.

Never make hidden modifications.