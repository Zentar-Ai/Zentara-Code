# Beitrag zu Zentara Code

Zunächst einmal vielen Dank, dass Sie in Betracht ziehen, zu Zentara Code beizutragen! Es sind Menschen wie Sie, die Open Source zu einer so großartigen Gemeinschaft machen.

## Wohin gehe ich von hier aus?

Wenn Sie einen Fehler bemerkt haben oder eine Funktionsanfrage haben, [erstellen Sie eine](https://github.com/your-username/zentara-code/issues/new/choose)! (Ersetzen Sie `your-username/zentara-code` durch Ihren tatsächlichen GitHub-Repository-Pfad). Es ist im Allgemeinen am besten, wenn Sie auf diese Weise eine Bestätigung Ihres Fehlers oder eine Genehmigung für Ihre Funktionsanfrage erhalten, bevor Sie mit dem Codieren beginnen.

Wenn Sie eine allgemeine Frage haben, können Sie auch ein Issue öffnen.

## Forken & einen Branch erstellen

Wenn Sie glauben, dass Sie dies beheben können, dann [forken Sie Zentara Code](https://github.com/your-username/zentara-code/fork) und erstellen Sie einen Branch mit einem aussagekräftigen Namen.

Ein guter Branch-Name wäre (wobei Issue #325 das Ticket ist, an dem Sie arbeiten):

```sh
git checkout -b 325-add-japanese-localization
```

## Die Testsuite zum Laufen bringen

Stellen Sie sicher, dass Sie die Testsuite zum Laufen bringen können. Wir legen Wert auf gut getesteten Code!
(Sie müssen hier spezifische Anweisungen zum Ausführen Ihrer Tests hinzufügen, z. B. `npm test` oder `python -m unittest discover`)

## Ihre Korrektur oder Funktion implementieren

An diesem Punkt sind Sie bereit, Ihre Änderungen vorzunehmen! Fragen Sie ruhig um Hilfe; jeder ist am Anfang ein Anfänger :smile_cat:

Stellen Sie sicher, dass Sie:
*   Den Codierungsstil des Projekts befolgen.
*   Linter und Formatierer ausführen (z. B. Prettier, ESLint). (Fügen Sie spezifische Befehle hinzu, falls verfügbar)
*   Tests für Ihre Änderungen hinzufügen.

## Einen Pull Request erstellen

An diesem Punkt sollten Sie zu Ihrem Master-Branch zurückwechseln und sicherstellen, dass er mit dem Master-Branch von Zentara Code auf dem neuesten Stand ist:

```sh
git remote add upstream git@github.com:your-username/zentara-code.git
git checkout master
git pull upstream master
```

Dann aktualisieren Sie Ihren Feature-Branch von Ihrer lokalen Master-Kopie und pushen Sie ihn!

```sh
git checkout 325-add-japanese-localization
git rebase master
git push --force-with-lease origin 325-add-japanese-localization
```

Gehen Sie schließlich zu GitHub und [erstellen Sie einen Pull Request](https://github.com/your-username/zentara-code/compare) :D

### Pull Request Vorlage

Wenn Sie einen Pull Request öffnen, verwenden Sie bitte die folgende Vorlage:

```markdown
### Verknüpfte Issue(s)

* Schließt # (Issue-Nummer)

### Beschreibung

(Geben Sie eine kurze Beschreibung der Änderungen in diesem PR an.)

### Checkliste

- [ ] Ich habe das Dokument [CONTRIBUTING.md](CONTRIBUTING.md) gelesen.
- [ ] Ich habe Tests hinzugefügt, um meine Änderungen abzudecken.
- [ ] Alle neuen und bestehenden Tests wurden bestanden.
- [ ] Ich habe die Dokumentation entsprechend aktualisiert.
- [ ] Ich habe meinen Branch auf den neuesten `master`-Commit rebased.
- [ ] Mein Code folgt dem Codierungsstil des Projekts.
- [ ] Ich habe Linter ausgeführt und alle Probleme behoben.
```

## Verhaltenskodex

Dieses Projekt und alle daran Beteiligten unterliegen dem [Zentara Code Verhaltenskodex](CODE_OF_CONDUCT.md). Durch Ihre Teilnahme wird von Ihnen erwartet, dass Sie diesen Kodex einhalten. Bitte melden Sie inakzeptables Verhalten an [KONTAKTMETHODE IN CODE_OF_CONDUCT.MD EINFÜGEN].

## Lizenzierung

Durch Ihren Beitrag erklären Sie sich damit einverstanden, dass Ihre Beiträge unter der Apache License 2.0 lizenziert werden, wie in der Datei [LICENSE](LICENSE) zu finden.
