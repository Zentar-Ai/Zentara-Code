# Contribuir a Zentara Code

Primer de tot, gràcies per considerar contribuir a Zentara Code! Són persones com tu les que fan que el codi obert sigui una comunitat tan gran.

## On vaig a partir d'aquí?

Si has detectat un error o tens una sol·licitud de funció, [fes-ne una](https://github.com/your-username/zentara-code/issues/new/choose)! (Substitueix `your-username/zentara-code` per la teva ruta real del repositori de GitHub). Generalment és millor que obtinguis la confirmació del teu error o l'aprovació de la teva sol·licitud de funció d'aquesta manera abans de començar a codificar.

Si tens una pregunta general, també pots obrir un problema.

## Bifurca i crea una branca

Si creus que pots solucionar-ho, [bifurca Zentara Code](https://github.com/your-username/zentara-code/fork) i crea una branca amb un nom descriptiu.

Un bon nom de branca seria (on el problema #325 és el tiquet en què estàs treballant):

```sh
git checkout -b 325-add-japanese-localization
```

## Fes que la suite de proves funcioni

Assegura't que pots fer que la suite de proves funcioni. Valorem el codi ben provat!
(Haureu d'afegir instruccions específiques aquí sobre com executar les vostres proves, per exemple, `npm test` o `python -m unittest discover`)

## Implementa la teva correcció o funció

En aquest punt, ja estàs preparat per fer els teus canvis! No dubtis a demanar ajuda; tothom és principiant al principi :smile_cat:

Assegura't de:
*   Seguir l'estil de codificació del projecte.
*   Executar linters i formatadors (per exemple, Prettier, ESLint). (Afegeix ordres específiques si estan disponibles)
*   Afegir proves per als teus canvis.

## Fes una sol·licitud d'extracció

En aquest punt, hauries de tornar a la teva branca principal i assegurar-te que està actualitzada amb la branca principal de Zentara Code:

```sh
git remote add upstream git@github.com:your-username/zentara-code.git
git checkout master
git pull upstream master
```

Després, actualitza la teva branca de funció des de la teva còpia local de master, i fes-la push!

```sh
git checkout 325-add-japanese-localization
git rebase master
git push --force-with-lease origin 325-add-japanese-localization
```

Finalment, ves a GitHub i [fes una sol·licitud d'extracció](https://github.com/your-username/zentara-code/compare) :D

### Plantilla de sol·licitud d'extracció

Quan obris una sol·licitud d'extracció, utilitza la següent plantilla:

```markdown
### Problema(es) enllaçat(s)

* Tanca # (número del problema)

### Descripció

(Proporciona una breu descripció dels canvis en aquesta PR.)

### Llista de verificació

- [ ] He llegit el document [CONTRIBUTING.md](CONTRIBUTING.md).
- [ ] He afegit proves per cobrir els meus canvis.
- [ ] Totes les proves noves i existents han passat.
- [ ] He actualitzat la documentació en conseqüència.
- [ ] He rebasat la meva branca a l'últim commit de `master`.
- [ ] El meu codi segueix l'estil de codificació del projecte.
- [ ] He executat linters i he solucionat tots els problemes.
```

## Codi de Conducta

Aquest projecte i tothom que hi participa es regeix pel [Codi de Conducta de Zentara Code](CODE_OF_CONDUCT.md). En participar, s'espera que respectis aquest codi. Si us plau, informa de comportaments inacceptables a [INSERT CONTACT METHOD IN CODE_OF_CONDUCT.MD].

## Llicències

En contribuir, acceptes que les teves contribucions estaran sota la llicència Apache License 2.0, tal com es troba al fitxer [LICENSE](LICENSE).
