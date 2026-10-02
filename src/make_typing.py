"""Synthesize the S7 typing SFX track for OpenHullPromo.

One soft "tap" per character appearance, placed at the character's
absolute frame on the global 1755-frame timeline (S7 starts at frame
1140 = sum of S1..S6 durations; TYPE_START 64, 1.4 frames/char,
62 chars).  Tasteful by design: gentle filtered tick ~-24 dBFS under
the score - the user asked for typing sound synced to the characters,
not a mechanical keyboard.
"""
import math
import struct
import wave

SR = 48000
FPS = 30
TOTAL_FRAMES = 1755
S7_START = 1140          # sum of S1..S6 scene durations
TYPE_START = 64          # scene-local
FPC = 1.4
N_CHARS = 62

rng_state = 12345
def rng():
    global rng_state
    rng_state = (1103515245 * rng_state + 12345) % (1 << 31)
    return rng_state / (1 << 31)

n_total = int(TOTAL_FRAMES / FPS * SR)
buf = [0.0] * n_total

for i in range(N_CHARS):
    frame = S7_START + TYPE_START + i * FPC
    start = int(frame / FPS * SR)
    tick_seed = rng()
    freq = 1750.0 + (tick_seed - 0.5) * 320.0        # subtle pitch spread
    level = 0.058 * (0.85 + 0.3 * rng())             # ~ -24.7 dBFS peak
    dur = int(0.055 * SR)                            # 55 ms decay tail
    attack = int(0.0022 * SR)
    for j in range(dur):
        t = j / SR
        if j < attack:
            env = j / attack
        else:
            env = math.exp(-j / (0.011 * SR))
        # body: damped sine + a touch of filtered click noise
        body = math.sin(2 * math.pi * freq * t) * 0.8 \
             + math.sin(2 * math.pi * freq * 2.7 * t) * 0.2
        click = (rng() - 0.5) * (env ** 6) * 0.55
        buf[start + j] += level * env * (body + click)

# gentle master fade at the very tail of the file (safety)
peak = max(abs(v) for v in buf)
print("peak:", round(peak, 4))
with wave.open("public/openhull-typing.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for v in buf:
        s = max(-0.98, min(0.98, v))
        q = int(s * 32767)
        frames += struct.pack("<hh", q, q)
    w.writeframes(bytes(frames))
print("public/openhull-typing.wav written,", n_total, "samples")
