# Contributing to Roo Code

First off, thank you for considering contributing to Roo Code! It's people like you that make open source such a great community.

## Where do I go from here?

If you've noticed a bug or have a feature request, [make one](https://github.com/your-username/roo-code/issues/new/choose)! (Replace `your-username/roo-code` with your actual GitHub repository path). It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

If you have a general question, you can also open an issue.

## Fork & create a branch

If this is something you think you can fix, then [fork Roo Code](https://github.com/your-username/roo-code/fork) and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-japanese-localization
```

## Get the test suite running

Ensure you can get the test suite running. We value well-tested code!
(You'll need to add specific instructions here on how to run your tests, e.g., `npm test` or `python -m unittest discover`)

## Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first :smile_cat:

Make sure to:
*   Follow the coding style of the project.
*   Run linters and formatters (e.g., Prettier, ESLint). (Add specific commands if available)
*   Add tests for your changes.

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with Roo Code's master branch:

```sh
git remote add upstream git@github.com:your-username/roo-code.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 325-add-japanese-localization
git rebase master
git push --force-with-lease origin 325-add-japanese-localization
```

Finally, go to GitHub and [make a Pull Request](https://github.com/your-username/roo-code/compare) :D

### Pull Request Template

When you open a Pull Request, please use the following template:

```markdown
### Linked Issue(s)

* Closes # (issue number)

### Description

(Provide a brief description of the changes in this PR.)

### Checklist

- [ ] I have read the [CONTRIBUTING.md](CONTRIBUTING.md) document.
- [ ] I have added tests to cover my changes.
- [ ] All new and existing tests passed.
- [ ] I have updated the documentation accordingly.
- [ ] I have rebased my branch onto the latest `master` commit.
- [ ] My code follows the project's coding style.
- [ ] I have run linters and fixed all issues.
```

## Code of Conduct

This project and everyone participating in it is governed by the [Roo Code Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [INSERT CONTACT METHOD IN CODE_OF_CONDUCT.MD].

## Licensing

By contributing, you agree that your contributions will be licensed under the Apache License 2.0, as found in the [LICENSE](LICENSE) file.
