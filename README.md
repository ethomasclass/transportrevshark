# The Tank: 1792–1837

A Shark Tank-style investing game for the Transportation Revolution unit (9th-grade US History). Five fictional promoters pitch five real ventures: the Lancaster Turnpike, Slater's Mill, the Fulton steamboat, the Erie Canal and the Northern Cross Railroad. Students invest $1,000 as they go, then learn what really happened in **Where Are They Now**.

## Using it in class

- **Class game (projector).** Open the site and choose *Start class game*. For each promoter:
  1. The promoter walks in with the year, place and what they're seeking.
  2. The pitch plays with captions and "exhibits" on the easel.
  3. The class picks 2 questions from a bank of 6, and the answer appears in the promoter's voice.
  4. Students write their investment on the worksheet.
  After the last pitch, **Where Are They Now** (teacher password) reveals one newspaper per venture, then the payout table.
- **Catch-up (absent students).** The same game on their own device, with pitches in a shuffled order. They invest on screen, which enforces the $1,000 and spend-it-all rules. At the end, the teacher types the password on that device to show their results.
- **Teacher tools** (password): the period, pitch order and shuffle, questions per pitch, the decision clock, a math-check calculator, a class leaderboard, and debrief notes (the clues in every pitch and what each answer gives away).
- **Worksheet:** `handout.html`, printable, two pages.
- **Voice auditions:** `auditions/`, to compare the candidate voices for each promoter.

Settings, runs and leaderboards are saved in the browser (localStorage), so set up the game on the projector computer.

## Where things live

| What | File |
|---|---|
| Pitch scripts (the 90-second cuts, verbatim from the spec) | `content/scripts.json` |
| Promoters, years, "seeking" lines, easel exhibits | `content/pitches.json` |
| Question bank (questions and in-character answers) | `content/faq.json` |
| Payouts, newspaper reveals, clues, answer notes, debrief questions | `content/teacher.enc.json` (encrypted) |
| Voiced pitches and word timings | `assets/audio/` |
| Character sprites | `assets/sprites/` (see `SPRITES.md`) |
| Stand-in SVG characters | `js/chars.js` |

### Teacher-only content is encrypted

The repo and site are public, so the payouts and reveal text exist only in encrypted form. The site decrypts them in the browser with the teacher password. To edit them:

```sh
node tools/teacher_bundle.mjs decrypt    # asks for the password, writes content/teacher.json (git-ignored)
# edit content/teacher.json
node tools/teacher_bundle.mjs encrypt    # asks for a password; a new one here changes it
```

### Voices

Pitches are voiced with ElevenLabs `eleven_v3` by `tools/voice.py`. The voice choices and delivery tags such as `[whispers]` are at the top of that file. The tags are added only to the copy sent to ElevenLabs, so the scripts stay clean. Put `ELEVENLABS_API_KEY=...` in `tools/.env` (git-ignored). Then:

```sh
pip install numpy imageio-ffmpeg
python3 tools/voice.py                 # everything; unchanged text is cached and costs nothing
python3 tools/voice.py erie            # one pitch
python3 tools/audition.py              # regenerate the audition clips
```

## Hosting

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push. To turn it on the first time, go to the repo's **Settings → Pages** and set **Source: GitHub Actions**.

Tools and raw art are left out of the published site.

To try it locally, run any static server that supports range requests (needed for seeking in the audio), e.g. `npx http-server`.
