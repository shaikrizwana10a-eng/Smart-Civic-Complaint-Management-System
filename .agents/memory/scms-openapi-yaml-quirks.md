---
name: SCMS openapi.yaml formatting quirks
description: Pre-existing indentation inconsistencies in lib/api-spec/openapi.yaml that are safe to ignore
---

`lib/api-spec/openapi.yaml`'s `Complaint` and `ComplaintInput` schemas have properties (e.g. `imageUrl`) with inconsistent indentation relative to their siblings (extra spaces, stray blank lines within a mapping). This is valid YAML — each property's children just need to be indented deeper than the property key itself, they don't need to align with sibling properties — and Orval codegen parses it fine.

**Why:** it looks like a formatting bug at a glance, but "fixing" it isn't necessary and risks unrelated diff noise or an unintended parse error if done carelessly.

**How to apply:** when adding new fields near this area, match the pattern of the property you're inserting after/before, but don't spend time realigning unrelated pre-existing properties.
