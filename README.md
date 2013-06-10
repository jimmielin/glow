Project Glowstone
====

Introduction
----

Welcome to the **Glowstone Desktop Environment / OS** project! This is the 
Git repository containing the core Glow components (`Kernel`, `Frameworks`, `Services`... etc.)
that may be used to boot a bare-bones Glow Desktop.

Included in this repository
----

1. The Glowstone Kernel - Essentially a bootstrapper for Glow to boot.
2. Core Frameworks & Services - `CoreFile`, `CoreUser`, `UITools`...
3. GFS - "Glow Future Storage", a relationship-driven data storage engine
4. Lockdown - The security isolator and process virtualizer for Glow.
5. RT - "Glow **R**un**t**ime" taking care of integrating Glow with the lower-level parts of an operating system (file system, Linux kernel, etc.)
Included is the *Slate* RT which uses a LAMP stack for Glow to communicate with. As technology develops, native code solutions will be released and supercede *Slate*.

License
----

**Glowstone** is mostly licensed under the *MIT License*. Some components may be proprietary, usually those in testing and
heavy development, to prevent confusion in distribution of unstable parts.

How can I join?
----

Glowstone is currently in heavy development by Jimmie Lin <jimmie.lin at gmail>. Contact me for details. I need a fair amount of help!

Development Status
----

Not near Pre-Alpha. Expect changes in the following 6 months.
