# Workflow Snapshot & Replay – Quick Capabilities & Self‑Test Guide (v0.2.8)

> Türkçe açıklamalar İngilizce bölümün hemen altında yer alır. (Turkish section follows English.)

---
## 1. What This Extension Does (At a Glance)
- Continuous workflow recording (files created/modified/deleted, editor opens, commands, text diffs, scaffold bursts)
- Reproducible replay engine (deterministic application of aggregated text changes)
- Beautiful Markdown report generation + reverse parsing (report → replay)
- Risk & Quality Analysis Panel (complexity, TODO quality, duplicate structure, volatility integration)
- Anonymous, GDPR/KVKK‑compliant opt‑in telemetry (OFF by default) – daily aggregate only
- AI Assistant (local heuristic engine) summarizing risk and workflow characteristics
- Timesheet & PDF export (embedded fonts for cross-platform reliability)
- Template management & Pro feature gating scaffolding

## 2. Core Analyzer Modules (Current Set)
| Module | Purpose | Key Metrics / Output |
|--------|---------|----------------------|
| Complexity Analyzer | Estimates structural & function complexity | Avg complexity, hotspots |
| TODO Analyzer | Qualitative review of TODO/FIXME markers | Density, quality hints |
| Duplicate Structure Analyzer | Fingerprints similar code blocks | Duplicate clusters, risk weight |
| Git Volatility (optional) | Recent change frequency integration | Volatility weight contribution |
| Risk Engine v2 | Multi-factor scoring & weighting | Overall risk, per-file breakdown, remediation suggestions |
| Scaffold Detection (pure) | Burst create operations detection | Synthetic `project_scaffold` event |
| Markdown Reverse Parser | Converts reports back to sessions | Replay & diff inspection |

## 3. Privacy & Telemetry
- Disabled by default (`workflowSnapshot.telemetryRepo` empty => no push)
- Opt-in only; end-user must configure a GitHub repo + token
- Only whitelisted event COUNTS (e.g. `workflow_start`) and anonymized session tally
- No file names, code, paths, or personal identifiers leave the machine
- Anonymous ID persisted with salted random seed

## 4. Test Coverage Snapshot (Logic Layer)
From latest run on 2025-10-06:
- Statements: 92.45%
- Lines: 93.92%
- Branches: 81.10%
- Functions: 84.67%
Focus areas to reach 95%+: `src/pure/analyzeWorkflow.ts`, `src/pure/scaffold.ts`, tail branches of `TelemetryService`.

## 5. Five‑Minute Self-Test (No GitHub Token Needed)
### Prerequisites
- Node.js 16+ (already implied by VS Code environment)
- Run inside extension root folder

### A. Quick Logic Test Run
```powershell
npm run test:logic
```
Expected: All logic tests pass (34 passing).

### B. Full Suite (Includes VS Code Extension Host)
```powershell
npm test
```
Expected: 34 logic + 17 extension tests pass. A coverage summary prints.

### C. Manual Functional Smoke
1. Press CTRL+SHIFT+P → "Start Recording".
2. Create a new file `demo.txt`, type a few lines.
3. Create another file quickly (to simulate small scaffold burst), e.g. `a1.js`, `a2.js`...
4. Press CTRL+SHIFT+P → "Stop Recording".
5. Press CTRL+SHIFT+P → "Generate Report".
6. Open generated Markdown in `.workflows/reports/` and inspect timeline.
7. Press CTRL+SHIFT+P → "Replay Workflow" and select the latest session/markdown.
8. Observe files re-created & text modifications applied.
9. Open "Advanced Reports" or "Open Risk Panel" to view risk metrics.
10. (Optional) Enable telemetry: Set settings `workflowSnapshot.telemetryRepo` to `owner/repo` and run "Set Telemetry GitHub Token".

### D. Reverse Parse Demonstration
1. Copy a generated report elsewhere.
2. Use replay command and choose the markdown file via "Generate Report from File" or import path prompt.
3. Confirm identical sequence of file operations reproduces.

### E. Timesheet PDF Export (Optional)
1. Press CTRL+SHIFT+P → "🕒 Time Tracking".
2. Start & stop a short session.
3. Export timesheet → PDF; ensure fonts embedded (no Helvetica missing error).

## 6. Troubleshooting Quick Table
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Replay skips text changes | File not openable / path filtered | Ensure file exists or not ignored (no `node_modules`) |
| Missing risk panel data | Volatility disabled / no analyzable files | Check setting `enableGitVolatility`, open workspace root |
| Telemetry never uploads | Not enabled | Configure repo + token, ensure branch exists/permissions |
| PDF font error | Cached partial build | Re-run `npm run compile` to ensure bundled fonts |
| No `project_scaffold` event | Threshold not met | Create ≥120 files quickly (stress test scenario) |

## 7. Minimal API Surface (Selected Commands)
| Command ID | Palette Title | Category |
|------------|---------------|----------|
| `workflowSnapshot.startRecording` | Start Recording | Workflow Snapshot |
| `workflowSnapshot.stopRecording` | Stop Recording | Workflow Snapshot |
| `workflowSnapshot.generateReport` | Generate Report | Workflow Snapshot |
| `workflowSnapshot.replayWorkflow` | Replay Workflow | Workflow Snapshot |
| `workflowSnapshot.telemetryForcePush` | Force Telemetry Push | Workflow Snapshot |
| `workflowSnapshot.repairWorkflowFile` | Repair Workflow JSON | Workflow Snapshot |
| `workflowSnapshot.openRiskPanel` | Open Risk Panel | Workflow Snapshot |

## 8. Roadmap (Excerpt)
- Secret scanning & policy analyzers
- Telemetry opt‑in UI polish & dashboard
- Historical risk trend visualization
- Deeper remediation cost/impact modeling

---
# 1. Eklentinin Yaptıkları (Özet – Türkçe)
- Sürekli workflow kaydı (dosya oluşturma/değiştirme/silme, editör açma, komutlar, metin diff'leri, scaffold patlaması)
- Tekrarlanabilir replay motoru (metin değişikliklerini deterministik uygulama)
- Markdown raporu üretme + tersine parse (rapor → replay)
- Risk & Kalite Analiz Paneli (karmaşıklık, TODO kalitesi, duplicate, volatilite)
- Anonim, KVKK/GDPR uyumlu telemetri (varsayılan KAPALI, sadece sayısal özet)
- Yerel AI yardımı (risk ve workflow özeti)
- Zaman çizelgesi & PDF çıktı (font gömülü)
- Template yönetimi ve Pro ayrımı altyapısı

## 2. Analiz Modülleri
(İngilizce tabloda listelenmiştir, aynı içerik geçerlidir.)

## 3. Gizlilik
- Varsayılan OFF, kullanıcı açıkça etkinleştirmedikçe veri gönderilmez
- Sadece beyaz listeye alınmış sayaçlar gönderilir (dosya isimleri / içerik yok)

## 4. Test Kapsamı
- En son ölçüm: Statements %92.45, Lines %93.92
- Hedef >%95: `analyzeWorkflow.ts` ve `scaffold.ts` ek senaryolar

## 5. 5 Dakikalık Hızlı Test
```powershell
npm test
```
- Tüm testler geçerse kurulum sağlıklı. Ardından Komut Paleti adımları (Start/Stop Recording, Generate Report, Replay) ile manuel doğrulama yapın.

## 6. Sorun Giderme
Bkz. İngilizce tablo – aynı durumlar geçerlidir.

## 7. Önemli Komutlar
`Start Recording`, `Stop Recording`, `Generate Report`, `Replay Workflow`, `Open Risk Panel`, `Repair Workflow JSON`.

## 8. Yol Haritası
- Secret tarama, trend grafik, gelişmiş remediation puanlama.

---
## Contribution & Feedback
Issues / feature requests: https://github.com/ArslantasM/workflow-snapshot-replay/issues

Enjoy productive, auditable, and privacy‑respecting development sessions!
