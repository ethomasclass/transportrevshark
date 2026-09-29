"""Voices the pitches: content/scripts.json -> assets/audio/<id>-short.mp3 plus
<id>-short.words.json (each word of the on-screen script with its start and end time).

  python3 tools/voice.py                  # every pitch (the 90-second cuts)
  python3 tools/voice.py erie             # one pitch

The scripts stay clean: the delivery tags below (eleven_v3 audio tags such as [whispers]) and the
spoken forms of numbers are added only to the copy that is sent to ElevenLabs. Responses are
cached in tools/cache/, so re-running on unchanged text costs nothing.
"""
import json, os, re, subprocess, sys
import eleven

ROOT = os.path.join(eleven.HERE, "..")
OUT = os.path.join(ROOT, "assets", "audio")
try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FFMPEG = "ffmpeg"

# Chosen from the auditions in auditions/ (listen there to compare the alternatives).
VOICES = {
    "turnpike":      {"id": "TTyZrDYo6LQowrH8mixJ", "name": "Joseph Ortman", "stability": 0.5},
    "slater":        {"id": "KwPhPlUeXKi2eSe2IWCY", "name": "Nathaniel C",   "stability": 0.5},
    "steamboat":     {"id": "QMJTqaMXmGnG8TCm8WQG", "name": "Clyde",         "stability": 0.0},
    "erie":          {"id": "87tjwokZlpNU7QL3HaLP", "name": "Reverend",      "stability": 0.0},
    "northerncross": {"id": "9T9vSqRrPPxIs5wpyZfK", "name": "Eric",          "stability": 0.5},
}

# (phrase, tag): the tag is spoken-copy only, inserted before the first place the phrase occurs.
TAGS = {
    "turnpike": [("Name's Abner", "[matter-of-fact]"), ("That's all I've got", "[deadpan]"),
                 ("If you want excitement", "[dryly]")],
    "slater": [("Come closer", "[whispers]"), ("He memorized them", "[conspiratorial]"),
               ("Who tends the machines", "[whispers]"), ("No one else in America", "[whispers]")],
    "steamboat": [("Step right up", "[excited]"), ("Seizes it, friends", "[dramatic pause]"),
                  ("So when you buy a share", "[slowly]"), ("But hurry", "[rushed]")],
    "erie": [("Gentlemen! Ladies!", "[dramatic]"), ("Ten. Ten dollars", "[shouting]"),
             ("And winter?", "[casually]"), ("Seven million dollars buys", "[dramatic]")],
    "northerncross": [("Friends! Neighbors!", "[warmly]"), ("Smart, isn't it?", "[chuckles]"),
                      ("Modest fellow", "[confidentially]"), ("But here's the thing", "[rushed]"),
                      ("But I have room", "[rushed]")],
}

SAY = {"1789,": "seventeen eighty-nine,", "1790,": "seventeen ninety,"}


def spoken_word(w):
    return SAY.get(w, w)


def build(pid, paras):
    text = "\n\n".join(" ".join(spoken_word(w) for w in p.split()) for p in paras)
    for phrase, tag in TAGS.get(pid, []):
        i = text.find(phrase)
        if i >= 0:
            text = text[:i] + tag + " " + text[i:]
    return text


def spoken_words(alignment):
    """Words as voiced, with times, skipping [tags]."""
    out, cur, start, end, depth = [], "", None, 0, 0
    for c, s, e in zip(alignment["characters"], alignment["character_start_times_seconds"],
                       alignment["character_end_times_seconds"]):
        if c == "[":
            depth += 1
            continue
        if c == "]":
            depth = max(0, depth - 1)
            continue
        if depth:
            continue
        if c.isspace():
            if cur:
                out.append((cur, start, end))
            cur, start = "", None
        else:
            if start is None:
                start = s
            cur += c
            end = e
    if cur:
        out.append((cur, start, end))
    return out


def loudnorm(mp3_bytes):
    return subprocess.run([FFMPEG, "-v", "error", "-f", "mp3", "-i", "-", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                           "-ar", "44100", "-b:a", "128k", "-f", "mp3", "-"],
                          input=mp3_bytes, capture_output=True, check=True).stdout


def voice(pid, cut, scripts):
    paras = scripts[pid]["scripts"][cut]
    v = VOICES[pid]
    r = eleven.tts(v["id"], build(pid, paras), settings={"stability": v["stability"], "similarity_boost": 0.8})
    sw = spoken_words(r["alignment"])
    words, j = [], 0
    for pi, p in enumerate(paras):
        for w in p.split():
            n = len(spoken_word(w).split())
            grp = sw[j:j + n]
            j += n
            if not grp:
                sys.exit(f"{pid} {cut}: ran out of voiced words at {w!r}")
            words.append({"w": w, "s": round(grp[0][1], 3), "e": round(grp[-1][2], 3), "p": pi})
    if j != len(sw):
        print(f"  warning: {len(sw) - j} voiced words left over", file=sys.stderr)
    os.makedirs(OUT, exist_ok=True)
    base = os.path.join(OUT, f"{pid}-{cut}")
    open(base + ".mp3", "wb").write(loudnorm(eleven.mp3(r)))
    json.dump({"voice": v["name"], "duration": words[-1]["e"], "words": words},
              open(base + ".words.json", "w"), separators=(",", ":"))
    print(f"{pid}-{cut}: {words[-1]['e']:.1f}s, {len(words)} words")


def main():
    scripts = json.load(open(os.path.join(ROOT, "content", "scripts.json")))
    pids = [sys.argv[1]] if len(sys.argv) > 1 else list(VOICES)
    cuts = ["short"]
    for pid in pids:
        for cut in cuts:
            voice(pid, cut, scripts)


if __name__ == "__main__":
    main()
