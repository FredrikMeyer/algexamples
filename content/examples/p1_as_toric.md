---
title: '$\PP^1$ as a toric variety'
slug: "p1-as-a-toric-variety"
type: computation
computes: p1
field: algebraic-geometry
tags: [toric]
summary: "..."
related: []
references:
  - https://people.math.ethz.ch/~acannas/Teaching/Moment_Map_2026/Papers/06_Introduction_to_Toric_Varieties.pdf
---

Let us construct $\PP^1$ as a toric variety. Let the lattice be $N=\Z$. Then define a fan $\Sigma$ as cones in $N_{\RR}=\ZZ \otimes_{\ZZ} \RR = \RR$ given by the union of the positive and the negative rays (together with their intersection, the zero cone $\{0\}$). Call the two maximal cones $\sigma$ and $\tau$, where $\sigma=\{c e_1 | c \in \RR_{\geq 0} \}$ (and $\tau$ is its negative).

The dual cones in $M=N^\vee$ are defined by

$$
\sigma^\vee = \left \{ y \mid \langle y ,  x \rangle \geq 0  \forall x \in \sigma_ 1 \right \} = \left \{ y \mid  y \geq 0 \right \}
$$

(and similarly for the other cone, in this case they cones are "equal" to their duals)

Their semigroup algebras are thus

$$
\CC [S_\sigma] = \CC[\sigma^\vee \cap \ZZ] = \CC [x]
$$

and
$$
\CC [S_\tau] = \CC [ x^{-1}].
$$

The intersection $\sigma \cap \tau$ gives rise to $\CC [x, x^{-1}]$, which is the coordinate ring of the torus $\CC^\ast \subset \PP^1$. We have the relation $xx^{-1}=1$.

But this is just the normal gluing map defining $\PP^1$.
