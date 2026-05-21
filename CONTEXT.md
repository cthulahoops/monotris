# Monotris

Shared language for the Monotris game rules and variants. This file names the domain facts the code should expose at seams.

## Language

**Piece Catalog**:
The complete set of piece shapes for one game variant. A game state carries one Piece Catalog, and piece spawning draws from it.
_Avoid_: piece list, shapes table, variant ID

## Example dialogue

Dev: Does this game state need the variant name?
Domain expert: No. It needs the Piece Catalog.

Dev: Why store the Piece Catalog in state?
Domain expert: Because spawning and rotation rules depend on the catalog, not on the route that selected it.
