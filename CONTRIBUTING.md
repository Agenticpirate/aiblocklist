# Contributing to AIBlockList

Thank you for your interest in contributing to **AIBlockList**! As an open-source public trust and safety initiative, we welcome contributions from developers, researchers, and community members.

---

## 🛠️ How You Can Contribute

1. **Reporting False Positives / Bugs**:
   - If an account was indexed in error, please use the web interface at `/appeals` or submit a structured appeal.
   - For software bugs, please open a GitHub Issue with reproduction steps and system information.

2. **Proposing Signal Criteria**:
   - Behavioral signals (`SIG-01` through `SIG-05`) define how automated activity is recognized.
   - If you have suggestions for new verifiable behavioral signals (e.g. coordinated sybil posting patterns), open an RFC issue for community review.

3. **Code Contributions**:
   - Enhancing the Next.js web application (`apps/web`).
   - Expanding the FastAPI backend API (`apps/api`).
   - Improving the browser extension (`apps/extension`).

---

## 📋 Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/<your-username>/aiblocklist.git
   cd aiblocklist
   ```

2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Verify Locally**:
   - Backend tests:
     ```bash
     cd apps/api && uv run pytest -q
     ```
   - Web build:
     ```bash
     cd apps/web && npm run build
     ```

4. **Commit & Push**:
   Use descriptive, conventional commit messages:
   ```bash
   git commit -m "feat: add support for threads verified badges"
   git push origin feature/my-new-feature
   ```

5. **Open a Pull Request**:
   Describe the motivation, implementation details, and verification steps.

---

## ⚖️ License Grant

By submitting a pull request to AIBlockList, you agree that your contributions will be licensed under the project's [Apache 2.0 License](LICENSE).
