# ADR-0006: One page, six stadium zones, Abhishek-led, built to get brand bookings

## Status
Accepted — 2026-09-12

## Context
Abhishek's presence is split across a personal brand (`@abhishekpandey_26`),
a channel brand (Spin & Swing) and a second channel (Unseen). Grilling
settled four things:
- **Identity**: the site is about Abhishek the person.
- **Goal**: the one visitor action is a brand booking him.
- **Copy**: English UI with Hinglish-toned copy.
- **Traffic**: mostly from mobile bio links.

## Decision
**Identity**
- Hero headline is Abhishek Pandey.
- Spin & Swing and Unseen are presented as his shows.
- Schema.org `Person` with `sameAs` links to all five profiles.

**Structure**: one page, no routing, six zones, in scroll order:

| # | Zone | Content | Source |
|---|------|---------|--------|
| 1 | Tunnel (hero) | Name, one-line pitch, scroll cue | Keyframe still → canvas |
| 2 | The Pitch | Featured YouTube videos (tap-to-play) | `social.json` videos |
| 3 | Scoreboard | Followers/subs/views as a stadium jumbotron, "as of" date | `social.json` profiles |
| 4 | The Stands | Featured Instagram posts/reels grid | `social.json` posts |
| 5 | Pavilion | His story, real photos | Copy + photos he supplies |
| 6 | Boundary Rope | "Book Abhishek": WhatsApp + email buttons, LinkedIn, footer | Static |

**Conversion**
- WhatsApp: a `wa.me` link with a prefilled brand-enquiry message.
- Email: a `mailto:` link with a prefilled subject.
- No form, no backend.

**Copy**
- English UI with Hinglish flavour where it fits his voice.
- No i18n.
- No Devanagari font requirement.

**Imagery of Abhishek**
- Real photos and clips he supplies only.
- AI never generates his likeness.

## Alternatives Considered
- **Spin & Swing-led or dual brand**: weaker story, harder SEO, and sponsors
  book people.
- **Fan-growth or career goal**: would change the climax to follow buttons or
  a CV. Rejected in favour of brand bookings.
- **Enquiry form (Resend)**: gives structured leads, but needs spam defence
  and a server. WhatsApp matches how Indian brand managers actually reach
  creators.
- **Multi-page**: breaks the continuous scroll journey; the content volume
  doesn't need routes.

## Consequences
**Inputs needed before building** (Phase 0 checklist):
- WhatsApp number
- Enquiry email
- Pavilion photos
- Bio facts

**Trade-offs accepted**
- **No lead tracking**: WhatsApp/email clicks are the only conversion signal.
  The buttons point at `/go/whatsapp` and `/go/email`, static pages that
  redirect onward, so clicks show up as page views. Vercel custom events
  need a Pro plan; page views work on Hobby.
- **One URL**: SEO targets his name and "cricket content creator" on a
  single page.
- **Zone anchors**: deep links use `#pitch`, `#scoreboard`, etc.
