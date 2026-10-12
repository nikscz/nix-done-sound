# Wähle deinen eigenen Sound, wenn Claude fertig ist

**nix done-sound – dein Ton, wenn Claude fertig ist oder auf dich wartet.**

> [!WARNING]
> **Frühe Version – Updates kommen.** Diese Art Erweiterung ist bei Claude Code noch ganz neu.
> Nach einem Update von Anthropic kann etwas nicht mehr funktionieren, bis hier ein Fix kommt.
> Mit Updates eingeschaltet (siehe unten) bekommst du ihn automatisch.

## Das Problem

Claude arbeitet, du machst nebenbei etwas anderes – und merkst nicht, wann es fertig ist
oder auf deine Antwort wartet. Die Claude-App meldet sich zwar, aber nur, wenn sie im
Hintergrund ist, und immer mit demselben Systemton.

## Die Lösung

Du wählst **deinen eigenen Sound**. Er spielt, wenn Claude nach längerer Arbeit
(ab 15 Sekunden) fertig ist – auf Wunsch auch ein zweiter, wenn Claude auf dich wartet.

> **Es wird kein Ton mitgeliefert.** Bis du einen wählst, bleibt das Tool still.

### Sound wählen – Mac

- **Systemton:** `/nix-done-sound liste` zeigt alle Töne deines Macs
  (z. B. Glass, Hero, Pop, Purr, Submarine). Dann z. B.:
  ```
  /nix-done-sound Glass
  ```
- **Eigene Datei** (mp3, wav, aiff, m4a): Datei im Finder auswählen, dann
  **Rechtsklick → Wahltaste (⌥) gedrückt halten → „… als Pfadname kopieren“**, und einfügen:
  ```
  /nix-done-sound /Users/deinname/Musik/fertig.mp3
  ```

### Sound wählen – Windows

- **Systemton:** `/nix-done-sound liste` zeigt die Töne aus `C:\Windows\Media`
  (z. B. chimes, notify, tada). Dann z. B.:
  ```
  /nix-done-sound tada
  ```
- **Eigene Datei** (mp3, wav): Datei im Explorer auswählen, **Rechtsklick → „Als Pfad
  kopieren“** (Windows 10: Umschalt + Rechtsklick), und einfügen:
  ```
  /nix-done-sound "C:\Users\deinname\Music\fertig.wav"
  ```

### Weitere Befehle

| Befehl | Was passiert |
|---|---|
| `/nix-done-sound` | zeigt deinen aktuellen Ton und die Hilfe |
| `/nix-done-sound warten Tink` | optional: eigener Ton, wenn Claude auf dich wartet |
| `/nix-done-sound aus` / `an` | stumm schalten und wieder an |

Beim Wählen hörst du den Ton einmal zur Probe. Deine Wahl gilt für alle Chats.
Ob Claude Code unter Windows Töne abspielt, ist noch wenig getestet – sag gern Bescheid.

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

## Updates

Einmal einschalten und vergessen: `/plugin` eingeben → **Marketplaces** → **nix-done-sound** →
automatische Updates an.

Oder von Hand, wann immer du willst:
```
/plugin marketplace update nix-done-sound
```

## Deinstallieren

```
/plugin uninstall nix-done-sound@nix-done-sound
```

## Mehr von nix

- [nix-checklist-sidebar](https://github.com/nikscz/nix-checklist-sidebar) – Claudes Plan als Checkliste
- [nix-progress-bar](https://github.com/nikscz/nix-progress-bar) – Fortschrittsleiste mit Zeitschätzung
- [nix-note](https://github.com/nikscz/nix-note) – Notizen nebenbei mit /note

## Lizenz

[MIT](LICENSE) – nutzen, ändern, weitergeben erlaubt, ohne Gewähr.

Mit Claude gebaut, für Claude. Fehler gefunden oder eine Idee?
Gern ein [Issue](https://github.com/nikscz/nix-done-sound/issues) aufmachen.
