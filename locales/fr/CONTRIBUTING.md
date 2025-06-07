# Contribuer à Zentara Code

Tout d'abord, merci d'avoir envisagé de contribuer à Zentara Code ! Ce sont des personnes comme vous qui font de l'open source une si grande communauté.

## Où aller à partir d'ici ?

Si vous avez remarqué un bug ou avez une demande de fonctionnalité, [créez-en une](https://github.com/your-username/zentara-code/issues/new/choose) ! (Remplacez `your-username/zentara-code` par le chemin réel de votre dépôt GitHub). Il est généralement préférable d'obtenir une confirmation de votre bug ou une approbation de votre demande de fonctionnalité de cette manière avant de commencer à coder.

Si vous avez une question générale, vous pouvez également ouvrir un problème.

## Forker et créer une branche

Si vous pensez pouvoir résoudre ce problème, alors [forkez Zentara Code](https://github.com/your-username/zentara-code/fork) et créez une branche avec un nom descriptif.

Un bon nom de branche serait (où le problème #325 est le ticket sur lequel vous travaillez) :

```sh
git checkout -b 325-add-japanese-localization
```

## Faire fonctionner la suite de tests

Assurez-vous de pouvoir faire fonctionner la suite de tests. Nous valorisons le code bien testé !
(Vous devrez ajouter des instructions spécifiques ici sur la façon d'exécuter vos tests, par exemple, `npm test` ou `python -m unittest discover`)

## Implémenter votre correction ou fonctionnalité

À ce stade, vous êtes prêt à apporter vos modifications ! N'hésitez pas à demander de l'aide ; tout le monde est débutant au début :smile_cat:

Assurez-vous de :
*   Suivre le style de codage du projet.
*   Exécuter les linters et les formateurs (par exemple, Prettier, ESLint). (Ajoutez des commandes spécifiques si disponibles)
*   Ajouter des tests pour vos modifications.

## Faire une Pull Request

À ce stade, vous devriez revenir à votre branche principale et vous assurer qu'elle est à jour avec la branche principale de Zentara Code :

```sh
git remote add upstream git@github.com:your-username/zentara-code.git
git checkout master
git pull upstream master
```

Ensuite, mettez à jour votre branche de fonctionnalité à partir de votre copie locale de master, et poussez-la !

```sh
git checkout 325-add-japanese-localization
git rebase master
git push --force-with-lease origin 325-add-japanese-localization
```

Enfin, allez sur GitHub et [faites une Pull Request](https://github.com/your-username/zentara-code/compare) :D

### Modèle de Pull Request

Lorsque vous ouvrez une Pull Request, veuillez utiliser le modèle suivant :

```markdown
### Problème(s) lié(s)

* Ferme # (numéro du problème)

### Description

(Fournir une brève description des changements dans cette PR.)

### Liste de contrôle

- [ ] J'ai lu le document [CONTRIBUTING.md](CONTRIBUTING.md).
- [ ] J'ai ajouté des tests pour couvrir mes changements.
- [ ] Tous les tests nouveaux et existants ont réussi.
- [ ] J'ai mis à jour la documentation en conséquence.
- [ ] J'ai rebasé ma branche sur le dernier commit `master`.
- [ ] Mon code suit le style de codage du projet.
- [ ] J'ai exécuté les linters et corrigé tous les problèmes.
```

## Code de Conduite

Ce projet et toutes les personnes qui y participent sont régis par le [Code de Conduite de Zentara Code](CODE_OF_CONDUCT.md). En participant, vous êtes censé respecter ce code. Veuillez signaler tout comportement inacceptable à [INSÉRER LA MÉTHODE DE CONTACT DANS CODE_OF_CONDUCT.MD].

## Licences

En contribuant, vous acceptez que vos contributions soient sous licence Apache License 2.0, telle que trouvée dans le fichier [LICENSE](LICENSE).
