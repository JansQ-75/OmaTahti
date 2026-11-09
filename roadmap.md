# OmaTahti roadmap

- [x] Phase 1 – Base structure, visual identity, role selection, navigation, role home pages, shared demo data + "Palauta demodata"
- [x] Phase 2 – Client onboarding + intake wizard (ankle ligament injury), local save, summary
- [ ] Baseline camera assessment + rule-based program selection (originally planned in phase 2; left out on user's request – waits for user decision on which phase)
- [ ] Phase 3 – Physio client view, intake review, program edit/approve
- [ ] Phase 4 – Client program + exercise instructions, start/interrupt/complete
- [ ] Phase 5 – Tracking, pain before/after, charts, streak
- [ ] Phase 6 – Messaging + notifications
- [ ] Phase 7 – Camera tracking (1–2 exercises), simulated mode
- [ ] Phase 8 – Orange juice game
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
