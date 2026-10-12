🇬🇧 [English](README.md)

# Wähle deinen eigenen Sound, wenn Claude fertig ist

**nix done-sound – dein Alert-Sound: Lass dich benachrichtigen, wenn Claude fertig ist oder auf dich wartet.**

## Das Problem

Claude arbeitet, du machst nebenbei etwas anderes – und merkst nicht, wann es fertig ist oder auf deine Antwort wartet. Die Claude-App meldet sich zwar, aber nur, wenn sie im Hintergrund ist, und immer mit demselben Systemton.

## Die Lösung

Dein **eigener Alert-Sound** spielt, wenn Claude nach längerer Arbeit (ab 15 Sekunden) fertig ist – auf Wunsch auch ein zweiter, wenn Claude auf dich wartet. **Es wird kein Ton mitgeliefert:** Direkt nach der Installation fragt Claude dich im ersten Chat, welchen Sound du willst, und stellt ihn für dich ein.

## Installieren

1. Claude Code öffnen (Desktop-App oder Terminal).
2. Ins Eingabefeld schreiben und Enter drücken:
   ```
   /plugin marketplace add nikscz/nix-done-sound
   ```
3. Dann:
   ```
   /plugin install nix-done-sound@nix-done-sound
   ```
4. Claude Code einmal neu starten (oder `/reload-plugins` eingeben). Fertig.

Kein GitHub-Konto nötig.

## So geht’s

### Sound wählen – Mac

- **Systemton:** `/nix-done-sound liste` zeigt alle Töne deines Macs (z. B. Glass, Hero, Pop,
  Purr, Submarine). Dann z. B.:
  ```
  /nix-done-sound Glass
  ```
- **Eigene Datei** (mp3, wav, aiff, m4a): Datei im Finder auswählen, dann **Rechtsklick →
  Wahltaste (⌥) gedrückt halten → „… als Pfadname kopieren“**, und einfügen:
  ```
  /nix-done-sound /Users/deinname/Musik/fertig.mp3
  ```

### Sound wählen – Windows

- **Systemton:** `/nix-done-sound liste` zeigt die Töne aus `C:\Windows\Media`
  (z. B. chimes, notify, tada). Dann z. B.:
  ```
  /nix-done-sound tada
  ```
- **Eigene Datei** (mp3, wav): Datei im Explorer auswählen, **Rechtsklick → „Als Pfad kopieren“**
  (Windows 10: Umschalt + Rechtsklick), und einfügen:
  ```
  /nix-done-sound "C:\Users\deinname\Music\fertig.wav"
  ```

### Alle Befehle

| Befehl | Was passiert |
|---|---|
| `/nix-done-sound` | zeigt deinen aktuellen Ton und die Hilfe |
| `/nix-done-sound liste` | listet die Töne deines Systems |
| `/nix-done-sound Name` oder `Pfad` | setzt den Fertig-Ton (spielt einmal zur Probe) |
| `/nix-done-sound warten Tink` | optional: eigener Ton, wenn Claude auf dich wartet |
| `/nix-done-sound aus` / `an` | stumm schalten und wieder an |

Deine Wahl gilt für alle Chats. Englische Befehle gehen auch (`list`, `wait`, `off`, `on`).
Ob Claude Code unter Windows Töne abspielt, ist noch wenig getestet – sag gern Bescheid.

> [!WARNING]
> **Frühe Version – Updates kommen.** Diese Art Erweiterung ist bei Claude Code noch ganz neu.
> Nach einem Update von Anthropic kann etwas nicht mehr funktionieren, bis hier ein Fix kommt.
> Mit automatischen Updates (unten) bekommst du ihn von selbst.

## Updates

Einmal einschalten und vergessen: `/plugin` eingeben → **Marketplaces** → **nix-done-sound** →
automatische Updates an.

Oder von Hand, wann immer du willst:
```
/plugin marketplace update nix-done-sound
```

### Neu

**2.2 – Deutsch und Englisch.** Die festen Wörter des Tools folgen jetzt deiner Systemsprache:
Deutsch auf einem deutschen System, sonst Englisch. Andere Sprachen (z. B. Spanisch) bekommen die
englischen Wörter – alles, was Claude selbst schreibt (die Schritte, der Danke-Satz, die Antworten),
kommt aber ohnehin in deiner Sprache.

## Deinstallieren

```
/plugin uninstall nix-done-sound@nix-done-sound
```

## Mehr von nikscz

- [nix-checklist-sidebar](https://github.com/nikscz/nix-checklist-sidebar) – Claudes Plan als Checkliste
- [nix-progress-bar](https://github.com/nikscz/nix-progress-bar) – Fortschrittsleiste mit Zeitschätzung
- [nix-note](https://github.com/nikscz/nix-note) – Projekt-Notizen nebenbei mit /note

## Lizenz

[MIT](LICENSE) – nutzen, ändern, weitergeben erlaubt, ohne Gewähr.

Mit Claudius, für Claudius. Fehler gefunden oder eine Idee?
Gern ein [Issue](https://github.com/nikscz/nix-done-sound/issues) aufmachen.
