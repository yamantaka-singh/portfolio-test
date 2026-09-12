# Cross-Cutting Principles

Principles that apply to all skills. Read as a mandatory checklist during
any skill creation or regeneration.

---

## Active Principles

### 1. Open-source skills must include an open-source licence
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all open-source skills
**Requirement:** Include a recognised open-source licence statement in the
skill preamble and a corresponding `LICENSE` (or `LICENSE.txt`) file in the
skill directory. Any commonly recognised licence is acceptable — CC BY 4.0
for prose-heavy skills, MIT or Apache 2.0 for code-heavy skills, CC BY-SA
or the GPL family for stronger copyleft. The choice belongs to the skill's
author; the requirement is that there *be* a licence.
**Propagation:** opportunistic
**Status:** active

### 2. Open-source skills must include author attribution and a feedback pathway
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all open-source skills
**Requirement:** Include an attribution block at the top of the skill with
author name, contact link, licence statement, and a feedback and support
pathway (an issue tracker, a repository, a contact address). A published
skill without a route back to its author cannot improve from its readers.
**Propagation:** opportunistic
**Status:** active

### 3. Skills with rules must include a pre-flight verification step
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills with explicit rules or requirements
**Requirement:** Include a verification step where the agent re-reads the
skill's rules and checks its output against them before delivery. Rules
that are not enforced are suggestions.
**Propagation:** opportunistic
**Status:** active

### 4. Open-source skills must not contain client-identifying information
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all open-source skills
**Requirement:** No client names, project URLs, domain names, or proprietary
details anywhere in the skill, its references, or its examples. Enforce at
authoring time, at observation-logging time, and again at publication —
the log and the commit message are artefacts too.
**Propagation:** opportunistic
**Status:** active

### 5. Open-source skills must use tool-agnostic language, with concrete examples first
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all open-source skills
**Requirement:** Reference capabilities (browser access, file system access,
web search, a scheduler) rather than hard-coding a dependency on one
product. Skills are read by agents, not humans, and an agent pattern-matches
against concrete tool names in its toolset — so name the concrete tool for
the primary environment as an example, then give the generic fallback:
"In [environment], use `[tool]`. Elsewhere, use the available equivalent."
Generic-first phrasing optimises for human readability at the cost of
machine actionability.
**Propagation:** opportunistic
**Status:** active

### 6. Skills that generate structured output must be grounded in multiple real examples
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that produce structured output (configs, markup,
**Requirement:** Inform the skill with several real-world examples of the
target format, never a single instance — one example creates blind spots
around edge cases, advanced features, and format variations. Where the
resulting specification is too detailed for the skill body, put it in a
reference file and point to it.
**Propagation:** opportunistic
**Status:** active

### 7. Subagents must have complete inputs and verified outputs
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that delegate content generation to subagents
**Requirement:** Use subagents for speed, but never let them guess at data
values. Safe delegations: validation, formatting checks, cross-reference
checks — anything where every required input can be passed in the brief.
Unsafe without safeguards: anything requiring live data. For data-bearing
tasks, the parent gathers the raw data first and passes it complete; a
subagent lacking a value writes a `[VERIFY: value not confirmed]`
placeholder rather than a plausible invention. After the return, the
parent verifies every concrete value against the source. Two sub-rules:
**(visualisation)** when delegating a chart or table, pass the exact data
in final display order — pre-filtered, pre-sorted — never a broader set the
subagent must rank, and spot-check content accuracy against the source,
not just layout; **(characterisation)** value-checking does not fire on
output stated as a *judgement* — a reported conflict, defect, risk or
readiness verdict has no unit to check — so any subagent claim that will
reach the user as a finding must be spot-checked by the parent at whatever
granularity makes it falsifiable (one grep is usually enough). Require
subagents to return locatable evidence (file, line, matched string) with
every claim; a claim without evidence is a claim to verify, not to relay.
A wrong value fails loudly when something computes with it; a wrong
characterisation is consumed by being agreed with, and agreement leaves no
trace.
**Propagation:** opportunistic
**Status:** active

### 8. Graceful tool-failure recovery
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that use interactive tools
**Requirement:** When a tool interaction (a question widget, a form input)
is rejected or fails, recover conversationally without exposing internal
error states to the user. Rephrase in plain text and continue; do not
assume the user dismissed the interaction.
**Propagation:** opportunistic
**Status:** active

### 9. Match interaction modality to conversation energy
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that gather user input
**Requirement:** Use structured tools (question widgets, forms) for
structured intake at the start of tasks. During free-flowing dialogue,
prefer plain-text questions. Do not downgrade a rich conversation to
multiple choice.
**Propagation:** opportunistic
**Status:** active

### 10. Small actionable sets are presented inline AND saved to file
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that produce deliverable results
**Requirement:** When the result is a small set of actionable items (roughly
25 or fewer links, tasks, or similar), present it inline in the
conversation AND save it to a file — the file is the persistent record,
the inline list serves the immediate workflow. For larger sets the file is
primary and a summary is shown inline. Do not force the user to open a
file for something they will consume right now.
**Propagation:** opportunistic
**Status:** active

### 11. Skills require pruning, not just growth
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills
**Requirement:** During every review, look for content to remove with the
same deliberateness as content to add: rules from a single observation that
never recurred, sections never consulted, elaborate workflows users
consistently shortcut, complexity added "just in case" that never triggers.
A skill that only grows eventually becomes too heavy to be useful.
**Propagation:** opportunistic
**Status:** active

### 12. Use canonical identifiers from source data, never reconstruct from derived fields
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that join, match, or cross-reference data from
**Requirement:** Always use the canonical identifier from the source system.
Never reconstruct an identifier from a derived or transformed field
(generating a URL from a name, inferring an id from a slug). Reconstructed
identifiers introduce silent false positives that pass casual review and
corrupt the analysis. A curated lookup table is more work up front and
produces verifiable, auditable results.
**Propagation:** opportunistic
**Status:** active

### 13. Skills that read or write workspace files must maintain a reference index
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that depend on, or produce, files in the shared
**Requirement:** Include a "Reference files" section listing the key files
with a one-line description each, maintained as a living index — added to
when files are created, pruned when they are superseded. Without it, a new
session loading the skill has no way to discover that relevant workspace
files exist, and the skill cannot leverage its own historical outputs.
**Propagation:** opportunistic
**Status:** active

### 14. Scheduled tasks invoke skills; they do not reimplement them
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all scheduled tasks that perform a workflow documented in a
**Requirement:** A scheduled task's prompt loads the skill and follows its
instructions; it does not inline the workflow. The skill stays the single
source of truth: improvements flow into the scheduled execution
automatically, and the methodology remains shareable and versioned.
Duplicating skill content into a task prompt creates a maintenance fork
that drifts, and traps methodology in a non-shareable location.
**Propagation:** opportunistic
**Status:** active

### 15. Scheduled task prompts are lightweight orchestrators — intelligence lives in skills
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all scheduled tasks
**Requirement:** Task prompts carry no domain knowledge, source lists,
output formats, or filtering criteria; all of that belongs in a skill the
task invokes. Pattern: task prompt = "Load skill X, then follow its
instructions." This lets the skill improve independently of the task, be
invoked manually in ad-hoc sessions, and be observed by the task-observer
on every run. When creating any scheduled task, first ask whether a skill
exists for its domain — and if not, create the skill first.
**Propagation:** opportunistic
**Status:** active

### 16. Interrupted operations are partial operations — verify state before retrying
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that perform bulk data operations or multi-step
**Requirement:** When an operation is interrupted, times out, or fails
partway, assume partial success, not total failure. Before retrying by the
same or another method, verify the current state — bulk inserts (some rows
succeeded), file operations (some files written), multi-step workflows
(some steps completed). The pattern: interrupt → verify state → adjust the
remaining work → proceed. Never assume a clean slate after a failure.
**Propagation:** opportunistic
**Status:** active

### 17. Never suggest manual typing of technical content as a workaround
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills and all conversational interactions
**Requirement:** When a tool-based workflow breaks (formatting, paste
failures, encoding), never suggest that the user manually type or
transcribe code, markup, structured data, or any technical content —
regardless of length. Find another machine-assisted route: a different
file format, a different delivery mechanism, a different tool. "It's only
N lines" is never a justification.
**Propagation:** opportunistic
**Status:** active

### 18. Browser automation is a costly last resort
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that use or recommend browser automation
**Requirement:** Browser tool payloads compound as a conversation grows.
Any skill that uses them must document the cost, offer non-browser
alternatives where they exist, position the non-browser path as the
default when equally effective, and include a checkpoint for sessions that
exceed a small number of browser calls. Escalate strictly: fetch or search
tools first, the browser only after those have failed on a specific
source, and where the browser is needed but unavailable, wait for the user
rather than skipping, aborting, or inventing an alternative.
**Propagation:** opportunistic
**Status:** active

### 19. Skills recommending API access must note network-sandbox implications
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that recommend direct access to a third-party
**Requirement:** Note that users in sandboxed environments (desktop agents,
corporate proxies) may need to allowlist the API's domain in their network
settings and restart the application before the call succeeds, and name
the domain(s) where known. Otherwise the user discovers the blocker
through failed requests mid-workflow.
**Propagation:** opportunistic
**Status:** active

### 20. Skills contain only behaviour-changing content
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills, open-source and internal
**Requirement:** Keep only content that changes the agent's behaviour at
execution time. Changelogs, version notes, history sections, credits,
self-narrating prose, and maintainer-facing context belong in a supporting
document, in commit history, or in a README — not in the skill. The test:
would removing this line change how the agent behaves? This does NOT cut
examples, anti-patterns, or worked scenarios — those are load-bearing for
rule adherence, because bare rules get violated more reliably than rules
with context. Every non-load-bearing line is token cost paid on every load
with no behavioural payoff.
**Propagation:** opportunistic
**Status:** active

### 21. Use agent-agnostic language in open-source skills
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all open-source skills
**Requirement:** Refer to the executing AI as "the agent" rather than by a
vendor's model name, except where the reference is genuinely specific to
that vendor: product names (an app, a CLI, a hosted chat), a config-file
naming convention, an architecture or API only that vendor has. Generic
references to the executor ("[model] does X", "tells [model] to") become
"the agent". This extends the tool-agnostic principle to actor references.
Internal skills that only ever run in one setup are exempt.
**Propagation:** opportunistic
**Status:** active

### 22. Verifying current vendor guidance requires a dated changelog check, not just the docs page
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that verify or assert a third-party platform's
**Requirement:** When a workflow confirms what a vendor currently
recommends, supports, or requires, check the vendor's dated changelog or
updates page — not only the documentation page (e.g. a search engine's
dated "updates" page alongside its docs). Fetched docs pages are cache
snapshots and have been observed serving week-stale versions missing new
properties; the changelog is dated and authoritative, and catches both a
stale fetch and changes since the skill was written. Corollary: any
"this property/change does not exist" claim about recently updated
documentation needs a second channel (changelog, raw fetch, or browser)
before delivery — channel staleness is the first hypothesis, not vendor
absence.
**Propagation:** opportunistic
**Status:** active

### 23. Never aggregate across structurally different segments
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that report a metric summed, averaged, or ranked
**Requirement:** Before aggregating, check whether the segments are
structurally comparable — same instrument, same population size, same
denominator behaviour. If not, report per segment first, and aggregate
only with the heterogeneity stated. Aggregation is an editorial decision,
not a neutral default. The diagnostic: an aggregate over heterogeneous
segments always flatters one segment and buries another, **and the buried
one is usually the finding** — so when an aggregate produces a "weakness",
check whether a small segment is being drowned by a large one before
reporting it.
**Propagation:** opportunistic
**Status:** active

### 24. Fetch the instance before describing it
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that describe, classify, or verify a specific
**Requirement:** Before asserting what a specific artefact *is*, obtain the
artefact itself rather than reasoning from a signal that correlates with
it. Surface patterns are evidence *about* an artefact and get substituted
for it because they are already in hand while fetching costs a call; the
substitution is invisible in the output, because an inference from a
familiar-looking pattern reads exactly like a verified fact. Typical
errors: a matching DNS record read as proof a host served content when it
served a redirect; a URL sweep read as evidence of what links to those
URLs; character proximity in serialised HTML read as DOM containment; a
URL's shape read as its page type when the dataset carried a page-type
column. The diagnostic: name the evidence a claim rests on and ask whether
it is the artefact or a correlate; if a correlate, ask what fetching the
artefact would cost — usually one call. Two corollaries: where a dataset
already classifies the entity, read its field rather than re-deriving it;
where direct access is blocked, prefer another response-level channel
(an inspection tool, a rendered view) over an infrastructure-level signal.
**Propagation:** opportunistic
**Status:** active

### 25. One verified reason beats two, where the second is unchecked
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that produce recommendations, advice, arguments,
**Requirement:** Every supporting reason attached to a recommendation must
clear the same evidence bar as the recommendation itself. When a single
justification feels thin, state it more precisely rather than reaching for
a second; if a second reason cannot be checked in the moment, flag it as
unchecked or leave it out. The mechanism does not feel like invention: the
search for a second reason is a search for something *plausible that
points the same way*, and supporting reasons get a fraction of the
scrutiny precisely because they are not the load-bearing claim — yet they
are the part the reader has no independent way to check. A wrong
supporting reason transfers its unreliability to the sound claim beside
it. Corollary: before building an argument on figures from a document,
establish who authored them — inherited or third-party numbers deviate in
both directions and change which of them are worth contesting at all.
**Propagation:** opportunistic
**Status:** active

### 26. A companion skill must declare its coverage boundary
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills that document a surface someone else owns — a
**Requirement:** State near the top which parts of the documented surface
the skill covers and which it does not. A companion is loaded precisely
because the agent does not know the tool, so the file's silence about a
surface is read as the surface not existing rather than as the file being
partial — and the load itself suppresses the exploration that would settle
the difference. Name the uncovered areas explicitly, even as a bare list
with no detail behind it; a named gap is a question the agent knows to
ask, an unnamed one is not. Read in the other direction: an existing
companion that declares no boundary has UNKNOWN coverage, not complete
coverage, so verify against the product before concluding a feature is
absent. Marking individual tools or endpoints as exercised versus
unexercised (see "Documenting an external tool surface" in
`references/skill-authoring.md`) does not substitute for this: no marking
scheme can describe a surface the file never mentions, and a skill can be
accurate on every line it contains while accounting for roughly half of
what the tool does.
**Propagation:** opportunistic
**Status:** active

### 27. Every skill ships as a bundle and is structured for progressive disclosure, regardless of size
**Added:** 2026-09-12
**Origin:** imported from starter set
**Applies to:** all skills, open-source and internal
**Requirement:** A skill is a directory, delivered and installed as one
bundle, whether it currently holds one file or twenty — there is no
single-file delivery format. Its structure follows progressive disclosure
from the first draft: SKILL.md carries the mental model, the rules that
change behaviour on every invocation, and a pointer list with explicit
load triggers; everything consulted only during one kind of episode (tool
inventories, recipes, taxonomies, per-variant detail, gotcha catalogues,
contract or clause extracts) lives in `references/`. A line-count
threshold (around 500 lines) marks only the point at which an existing,
not-yet-split skill gets retrofitted; it does not gate the structure of
new or substantially revised work. Rationale: a rule that switches on
artefact size creates two formats for one thing and a boundary every
consumer must re-derive, and one format removes the bare-SKILL.md
truncation class of install failures outright.
**Propagation:** opportunistic
**Status:** active
