# Contributing

Thank you for contributing to this project!
Please follow these guidelines to make contributions consistent, reviewable, and easy to merge.

## Process overview

1. **Have a reference.**
   - Either a ticket or an issue.
   - Describe your feature/issue.
2. **Branch out**
   - Create a git branch for your contribution.
3. **Code-Style**
   - Keep to the [Code Style Guide](./STYLEGUIDE.md)
   - Ensure linting and formatting rules
4. **Committing**
   - Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines
5. **Create a merge request**
   - Include your reference (see more below)
   - Describe your changes

## Contributor License Agreement (CLA)

Before your MR can be merged, you must accept our CLA.
By creating your MR, you automatically agree to the terms of the CLA.
Please read the document carefully here:

[→ Contributor License Agreement (CLA)](./CLA.md)

### Frequent/Continuous Contributions

If frequent contributions are planned, e.g., from partners who want to make many commits or actively continue working on modules, we ask that you sign the [CLA.pdf](./CLA.pdf) and send it to info@dksr.city.

## MR Example

```
Ticket or Issue: XYZ 123

Branch-name: xyz-123-feature-a

MR Title: feat(moduleA): [XYZ-123] add feature a

MR Description:
This MR adds the implementation to moduleA for featureA

It adds a necessary hook to moduleB as well as two
new configuration parameters: param1 and param2

Commits:
feat(moduleA): [XYZ-123] add feature a

- implement necessary requirement to support
  feature a in moduleB
- add two new configuration parameters:
  param1 and param2
```

## Branch workflow & MRs

- Base all work on the current development branch `dev`.
- Create one branch per MR, do not reuse merged branches.
- Reference the ticket or issue in the branch name, in commits, and the MR title.
- Prefer small, focused MRs. At least one MR per ticket/issue, but may be split into multiple MRs when helpful. Add descriptions to your MRs. If splitting, note dependencies.
- Keep branches current, regularly rebase or merge changes into your feature branch and resolve conflicts.

## Commits

- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines
- Keep it short, descriptive, and focused while containing all relevant information of the changes included in the commit.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md). It describes expected behavior, how to report issues, and helps keep the project welcoming and respectful for everyone.
