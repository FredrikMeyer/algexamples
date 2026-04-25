---
title: "Cohomology of the Quintic Threefold"
slug: "quintic-threefold-cohomology"
type: computation
field: algebraic-geometry
tags: [calabi-yau, hodge-numbers, hypersurface, cohomology]
summary: 'Compute $H_*(Y, \OO_Y)$ and Hodge numbers for a degree-5 hypersurface in $\PP^4$.'
related: []
object: ""
computes: "sheaf cohomology H*(Y, O_Y) and Hodge numbers h^{pq}"
techniques:
  - ideal sheaf sequence
  - adjunction formula
  - Serre duality
  - conormal sequence
references:
  - "Cox–Katz, Mirror Symmetry and Algebraic Geometry §1"
---

Let $Y \subset \PP^4$ be the zero locus of a general homogeneous polynomial of degree 5. We compute $H^i(Y, \OO_Y)$ and the Hodge numbers $h^{pq}$.

**Step 1: Sheaf cohomology of $\OO_Y$.**

From the ideal sheaf sequence $0 \to \OO_P(-5) \to \OO_P \to i_* \OO_Y \to 0$ and the known cohomology of $\PP^4$, we get $H^i(Y, \OO_Y) \cong k$ for $i = 0, 3$ and $0$ otherwise.

**Step 2: Canonical bundle.**

By adjunction, $\omega_Y \cong i^* \omega_P \otimes \det(\mathcal{I}/\mathcal{I}^2)^\vee = \OO_Y(-5) \otimes \OO_Y(5) = \OO_Y$. So $Y$ is **Calabi-Yau**.

**Step 3: Hodge numbers.**

Using the conormal and Euler sequences: $h^{11} = 1$ and $h^{12} = 101$.
