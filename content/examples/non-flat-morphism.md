---
title: "A Non-Flat Morphism"
slug: "non-flat-morphism"
type: counterexample
field: algebraic-geometry
tags: [flatness, modules, morphisms]
summary: "The projection of the union of two coordinate axes to one axis is not flat."
related: []
refutes: "Every finite morphism of affine schemes is flat."
references:
  - "Hartshorne, Ex. III.9.3"
---

Let $A = k[x]$ and $B = k[x,y]/(xy)$. The inclusion $A \hookrightarrow B$ given by $x \mapsto x$ corresponds to projecting the union of the $x$- and $y$-axes to the $x$-axis.

**Claim:** $B$ is not flat as an $A$-module.

Start with the exact sequence $0 \to (x) \to A \to k \to 0$ and tensor with $B$:
$$0 \to (x) \otimes_A B \to B \to k \otimes_A B \to 0.$$

The element $x \otimes y \in (x) \otimes_A B$ maps to $xy = 0 \in B$. Since $B$ has $k$-basis $\{x^i, y^j\}_{i,j \geq 0}$, the element $x \otimes y$ is nonzero in $(x) \otimes_A B$. Hence the map is not injective, so $B$ is not flat.
