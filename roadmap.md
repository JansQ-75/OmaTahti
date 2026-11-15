# OmaTahti roadmap

- [x] Phase 1 – Base structure, visual identity, role selection, navigation, role home pages, shared demo data + "Palauta demodata"
- [x] Phase 2 – Client onboarding + intake wizard (ankle ligament injury), local save, summary
- [x] Rule-based program selection after intake + self-guided start (phase 2 addition)
- [x] Intake correction window, home notice and direct progress-summary link — verified without camera, including automatic expiry and stored corrections
- [x] Baseline camera assessment — body-area rules, bilateral ankle tests, saved results and acknowledgements, program lock until complete, two-hour correction window from full completion; rules tested and questionnaire/postpone/locked navigation checked on desktop and mobile.
  - Real-person baseline camera measurements and sounds require physical-phone trials; unavailable in the sandbox.
  - [x] Balance baseline countdown starts on two feet; lift at the start cue, with continuous measurement through ground contacts. Automated camera-flow regression tests cover startup and result delivery; physical-phone check remains necessary.
  - [x] Add camera introduction before test instructions and remove long instructions from the live baseline camera; questionnaire entry, postponing, retained program lock and desktop/mobile layout verified. Camera regression tests pass; physical-phone trials remain necessary.
- [x] Phase 3 – Physio client list + client details (contacts, intake, program, progress/pain), switch program, add/remove exercises; client Harjoitukset page shows the current program (read-only)
- [x] Phase 4 – Client program + exercise instructions, start/interrupt/complete
- [x] Collapsible "Näytä suoritusohjeet" per exercise card (client + physio views)
- [x] Phase 5 – Pain after workout + calm advice, pain/mobility/balance/weekly charts (client + physio)
- [x] Phase 6 – Messaging + notifications (shared thread, nav badges, physio thread list)
- [x] Phase 7 – Camera tracking for ankle-flex + single-leg-balance, automatic start, fullscreen/mobile fallback and per-set estimates
  - Real-person tracking accuracy and sound on physical phones still require device trials.
- [x] Remove simulated mode and estimates throughout the app; stack camera preparation buttons with the camera choice larger — desktop/mobile layout and manual fallback verified.
- [x] Phase 8 – Knee-anchored butterfly in camera single-leg balance only; calm movement, brief takeoff on ground contact, no toggle or measurement changes. Pure rules and camera integration tested; desktop/mobile browser flow and saved workout checked with test-only camera input. Real-person anchoring still needs a physical-phone trial.
- [ ] Phase 9 – Summaries + rule-based AI feedback
- [ ] Phase 10 – End-to-end polish

## Janinan kommentit (toteutettu)

Asiakkaan etusivu `/asiakas`:
- [x] Streak-kortti: motivoivampi visualisointi, tuo selkeämmin esiin että kyse on putkesta
- [x] Viikon treenit -kortti: pylväsdiagrammi, jossa viikonpäivät ja harjoitusten määrä
- [x] Ohjelmakortti: "tämä on hyvä" – ennallaan

Fysioterapeutin etusivu `/fysioterapeutti`:
- [x] "Uusia viestejä" -kortti: klikkaus vie viestit-näkymään
- [x] "Käsittelemättömiä ilmoituksia" -kortti pois (fysioterapeutille ei tule ilmoituksia)
- [x] "Asiakasta vaatii huomiota" -kortti pois
- [x] "Käsittelemättömät ilmoitukset" -kortti pois
- [x] "Ohjelma odottaa hyväksyntää" -ilmoitusta ei synny: fysioterapeutti hyväksyy muutoksen tekohetkellä
- [x] Ilmoitukset: viestipallo/lukumäärä navigaatioon, suljettavat havainnot tervehdyksen alle, kotisivun alalaatikot pois, alkukartoitus Edistyminen-haitariin
