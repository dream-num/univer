# Security Policy

This Security Policy outlines the security practices for Univer (SDK and Univer Services) to ensure the integrity of our code, dependencies, and data. We welcome contributions from community members, developers, and security researchers to identify and address potential security issues collaboratively.

## Supported Versions

We provide security updates for the following versions of Univer.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| 0.6.0   | :white_check_mark: |
| < 0.6.0 | :x:                |

As Univer is still not reaching version 1.0 and we are moving fast with latest feature updates, unsupported versions may contain unpatched vulnerabilities. We recommend upgrading to the latest supported version.

## Reporting a Vulnerability

We encourage responsible disclosure of security vulnerabilities. If you discover a potential issue, please follow these steps:

1. How to Report:
    - Email us at: huwenzhao@univer.ai
    - Alternatively, submit a private Security Advisory via GitHub (if applicable).
2. What to Include:
    - Description: A detailed explanation of the vulnerability and its potential impact.
    - Steps to Reproduce: Clear instructions to replicate the issue.
    - Affected Versions: Specify which versions are impacted.
    - (Optional) Suggested Fix: Any recommendations for resolution.
3. Response Timeline:
    - We will acknowledge your report within 1 business days.
    - Depending on the severity, we aim to release a fix within 7-30 days.
4. Confidentiality:
    - Please refrain from disclosing vulnerability details in public Issues, forums, or social media until a fix is released.
    - We will publicly acknowledge your contribution after the fix (unless you request anonymity).

## Security Update Process

- **Detection**: We use Dependabot and GitHub Security Alerts to automatically monitor for known vulnerabilities in dependencies.
- **Resolution**: Upon identifying a vulnerability:
    1. We prioritize releasing security patches for supported versions.
    2. Dependencies are updated to non-vulnerable versions.
    3. Updates are announced via GitHub Releases.
- **Recommendation:** Users should regularly check for updates and apply the latest security patches.

## Guidelines for Developers

To maintain a secure codebase, developers should adhere to these best practices:

- **Dependency Management**:
    - Use Dependabot or similar tools to keep dependencies up to date.
    - Avoid using dependencies with known vulnerabilities.
- **Code Review**:
    - All Pull Requests must be reviewed by at least one team member.
    - Check for proper input validation, access controls, and handling of sensitive data.
- **Security Testing**:
    - Integrate static analysis tools (e.g., CodeQL) into the CI/CD pipeline.
    - Conduct periodic manual penetration testing.

## User Responsibilities

- Keep your software updated to the latest version to benefit from security fixes.
- Monitor the security status of your dependencies to avoid introducing third-party risks.
- Report any discovered issues to us promptly.

## Contact Us

For questions or further assistance, reach out to:

- Email: developer@univer.ai
- GitHub Issues: https://github.com/dream-num/univer/issues

## Acknowledgments

We extend our gratitude to all developers, researchers, and users who contribute to the security of this project!
