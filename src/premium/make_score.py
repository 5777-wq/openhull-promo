"""Render the original OpenHull premium product-film score.

The renderer is deterministic and self contained: NumPy/SciPy synthesis plus
Python's wave writer. It intentionally uses tonal oscillators only; there are
no sampled assets, network calls, or noise-based risers.
"""

from __future__ import annotations

import argparse
import math
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt


SR = 48_000
DURATION = 48.0
N_SAMPLES = int(round(SR * DURATION))
BPM = 100.0
BEAT = 60.0 / BPM
TAU = 2.0 * math.pi
TARGET_RMS_DBFS = -18.4
MAX_PEAK_DBFS = -1.9


# The story is divided at the exact edit points supplied by the film brief.
SCENE_BOUNDARIES = (0.0, 5.5, 11.5, 17.5, 24.5, 30.5, 36.5, 42.5, 48.0)
CHORDS = (
    (0.0, 5.5, "Dm9", (50, 53, 57, 60, 64)),
    (5.5, 11.5, "Bbmaj7", (46, 50, 53, 57, 62)),
    (11.5, 17.5, "Fadd9", (41, 45, 48, 55, 60)),
    (17.5, 24.5, "Csus2", (48, 55, 62, 65)),
    (24.5, 30.5, "Dm9", (45, 50, 53, 60, 64)),
    (30.5, 36.5, "Bbmaj7", (46, 50, 53, 57, 62)),
    (36.5, 42.5, "F6/9", (41, 45, 48, 52, 55, 62)),
    (42.5, 48.0, "Fmaj9", (41, 45, 48, 52, 55, 60)),
)
ROOTS = (38, 34, 41, 36, 38, 34, 41, 41)



def midi_hz(note: float) -> float:
    return 440.0 * (2.0 ** ((note - 69.0) / 12.0))



def dbfs(value: float) -> float:
    return 20.0 * math.log10(max(float(value), 1.0e-12))



def sample_index(seconds: float) -> int:
    return int(round(seconds * SR))



def smoothstep(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)



def envelope(length: int, attack: float, release: float) -> np.ndarray:
    env = np.ones(length, dtype=np.float64)
    attack_n = min(length, max(1, sample_index(attack)))
    release_n = min(length, max(1, sample_index(release)))
    if attack_n > 1:
        env[:attack_n] = smoothstep(np.arange(attack_n, dtype=np.float64) / (attack_n - 1.0))
    if release_n > 1:
        tail = smoothstep(np.arange(release_n, dtype=np.float64) / (release_n - 1.0))
        env[-release_n:] *= 1.0 - tail
    return env



def lowpass(signal: np.ndarray, cutoff_hz: float, order: int = 2) -> np.ndarray:
    cutoff_hz = min(float(cutoff_hz), SR * 0.45)
    sos = butter(order, cutoff_hz / (SR * 0.5), btype="lowpass", output="sos")
    return sosfilt(sos, signal).astype(np.float64, copy=False)



def place(destination: np.ndarray, signal: np.ndarray, start: float) -> None:
    begin = max(0, sample_index(start))
    if begin >= len(destination):
        return
    count = min(len(signal), len(destination) - begin)
    destination[begin : begin + count] += signal[:count]



def pad_voice(note: int, length_s: float, amp: float, seed: int, cutoff_hz: float = 1700.0) -> np.ndarray:
    length = max(1, sample_index(length_s))
    t = np.arange(length, dtype=np.float64) / SR
    frequency = midi_hz(note)
    drift = 0.018 * np.sin(TAU * (0.075 + 0.004 * (seed % 5)) * t + 0.7 * seed)
    phase_a = TAU * frequency * t + drift
    phase_b = TAU * frequency * (1.0017 + (seed % 3) * 0.00025) * t + 1.1 + drift * 0.7
    voice_a = 0.62 * np.sin(phase_a) + 0.22 * np.sin(2.0 * phase_a) + 0.10 * np.sin(3.0 * phase_a)
    voice_b = 0.62 * np.sin(phase_b) + 0.22 * np.sin(2.0 * phase_b) + 0.10 * np.sin(3.0 * phase_b)
    voice = lowpass(0.58 * voice_a + 0.42 * voice_b, cutoff_hz)
    voice *= envelope(length, 0.72, min(1.25, max(0.2, length_s * 0.32)))
    return amp * voice



def air_voice(note: int, length_s: float, amp: float, seed: int) -> np.ndarray:
    length = max(1, sample_index(length_s))
    t = np.arange(length, dtype=np.float64) / SR
    frequency = midi_hz(note)
    phase = TAU * frequency * t + 0.025 * np.sin(TAU * 0.11 * t + seed)
    voice = 0.78 * np.sin(phase) + 0.16 * np.sin(2.01 * phase) + 0.06 * np.sin(3.0 * phase)
    voice = lowpass(voice, 3000.0)
    voice *= envelope(length, 0.95, min(1.45, max(0.25, length_s * 0.35)))
    return amp * voice



def sub_voice(note: int, length_s: float, amp: float, seed: int) -> np.ndarray:
    length = max(1, sample_index(length_s))
    t = np.arange(length, dtype=np.float64) / SR
    frequency = midi_hz(note)
    drift = 1.0 + 0.0025 * np.sin(TAU * (0.045 + seed * 0.002) * t + seed)
    phase = TAU * frequency * drift * t
    voice = 0.86 * np.sin(phase) + 0.12 * np.sin(2.0 * phase) + 0.035 * np.sin(3.0 * phase)
    voice = lowpass(voice, 230.0)
    voice *= envelope(length, 0.48, min(0.95, max(0.2, length_s * 0.3)))
    return amp * voice



def bass_hit(note: int, amp: float, length_s: float = 0.42) -> np.ndarray:
    length = max(1, sample_index(length_s))
    t = np.arange(length, dtype=np.float64) / SR
    frequency = midi_hz(note)
    pitch = frequency * (1.0 + 0.025 * np.exp(-t / 0.055))
    phase = TAU * np.cumsum(pitch) / SR
    body = 0.88 * np.sin(phase) + 0.105 * np.sin(2.0 * phase) + 0.02 * np.sin(3.0 * phase)
    body = lowpass(body, 360.0)
    body *= (1.0 - np.exp(-t / 0.008)) * np.exp(-t / 0.21)
    return amp * body



def pulse(beat_time: float, note: int, amp: float, accent: float = 1.0) -> np.ndarray:
    length = sample_index(0.28)
    t = np.arange(length, dtype=np.float64) / SR
    frequency = midi_hz(note)
    phase = TAU * frequency * t
    body = np.sin(phase) * np.exp(-t / 0.145)
    body += 0.18 * np.sin(2.0 * phase + 0.2) * np.exp(-t / 0.075)
    body *= (1.0 - np.exp(-t / 0.003))
    return amp * accent * lowpass(body, 900.0)



def felt_pluck(note: int, amp: float, seed: int) -> np.ndarray:
    length = sample_index(1.65 if note < 84 else 1.45)
    t = np.arange(length, dtype=np.float64) / SR
    frequency = midi_hz(note)
    pitch = frequency * (1.0 - 0.008 * np.exp(-t / 0.12))
    phase = TAU * np.cumsum(pitch) / SR + 0.21 * seed
    partials = (
        0.78 * np.sin(phase)
        + 0.16 * np.sin(2.005 * phase + 0.08)
        + 0.055 * np.sin(3.99 * phase + 0.13)
        + 0.018 * np.sin(5.92 * phase + 0.25)
    )
    soft = (1.0 - np.exp(-t / 0.014)) * np.exp(-t / (0.72 + 0.03 * (seed % 3)))
    voice = lowpass(partials * soft, 7200.0)
    return amp * voice



def transition_accent(root_note: int, amp: float, seed: int) -> tuple[np.ndarray, np.ndarray]:
    length = sample_index(1.12)
    t = np.arange(length, dtype=np.float64) / SR
    duration = length / SR
    f_start = midi_hz(root_note + 12) * 1.25
    f_end = midi_hz(root_note - 12) * 0.82
    ratio = max(0.2, f_end / f_start)
    frequencies = f_start * (ratio ** (t / duration))
    phase = TAU * np.cumsum(frequencies) / SR
    attack = 1.0 - np.exp(-t / 0.012)
    decay = np.exp(-t / 0.42)
    low = (0.82 * np.sin(phase) + 0.12 * np.sin(2.0 * phase)) * attack * decay
    low = lowpass(low, 850.0)

    bloom_frequency = midi_hz(root_note + 24)
    bloom_phase = TAU * bloom_frequency * t
    bloom = (0.22 * np.sin(bloom_phase) + 0.07 * np.sin(2.0 * bloom_phase))
    bloom *= (1.0 - np.exp(-t / 0.018)) * np.exp(-t / 0.64)
    bloom = lowpass(bloom, 2800.0)

    stereo = amp * (low + bloom)
    pan = -0.24 if seed % 2 == 0 else 0.24
    left = stereo * math.sqrt((1.0 - pan) * 0.5)
    right = stereo * math.sqrt((1.0 + pan) * 0.5)
    return left, right



def chord_at(time_s: float) -> tuple[int, tuple[int, ...]]:
    for index, (start, end, _name, notes) in enumerate(CHORDS):
        if start <= time_s < end or index == len(CHORDS) - 1:
            return ROOTS[index], notes
    return ROOTS[-1], CHORDS[-1][3]



def add_stereo_tap(
    wet_left: np.ndarray,
    wet_right: np.ndarray,
    source_left: np.ndarray,
    source_right: np.ndarray,
    delay_s: float,
    gain_left: float,
    gain_right: float,
) -> None:
    delay = sample_index(delay_s)
    if delay <= 0 or delay >= len(wet_left):
        return
    wet_left[delay:] += gain_left * source_left[:-delay] + gain_right * source_right[:-delay]
    wet_right[delay:] += gain_right * source_left[:-delay] + gain_left * source_right[:-delay]



def render_score() -> tuple[np.ndarray, np.ndarray]:
    pad_left = np.zeros(N_SAMPLES, dtype=np.float64)
    pad_right = np.zeros(N_SAMPLES, dtype=np.float64)
    air_left = np.zeros(N_SAMPLES, dtype=np.float64)
    air_right = np.zeros(N_SAMPLES, dtype=np.float64)
    bass_left = np.zeros(N_SAMPLES, dtype=np.float64)
    bass_right = np.zeros(N_SAMPLES, dtype=np.float64)
    pulse_left = np.zeros(N_SAMPLES, dtype=np.float64)
    pulse_right = np.zeros(N_SAMPLES, dtype=np.float64)
    motif_left = np.zeros(N_SAMPLES, dtype=np.float64)
    motif_right = np.zeros(N_SAMPLES, dtype=np.float64)
    accent_left = np.zeros(N_SAMPLES, dtype=np.float64)
    accent_right = np.zeros(N_SAMPLES, dtype=np.float64)

    # Long pad voices overlap each edit point, preserving a continuous analog bed.
    for index, (start, end, _name, notes) in enumerate(CHORDS):
        if index < len(CHORDS) - 1:
            voice_length = (end - start) + 1.18
        else:
            voice_length = end - start
        pad_gain = 0.072 if index == 0 else 0.078
        for note_index, note in enumerate(notes):
            voice = pad_voice(note, voice_length, pad_gain, index * 9 + note_index)
            pan = -0.58 + 1.16 * (note_index / max(1, len(notes) - 1))
            place(pad_left, voice * math.sqrt((1.0 - pan) * 0.5), start)
            place(pad_right, voice * math.sqrt((1.0 + pan) * 0.5), start)

        # The upper air layer opens only after the product reveal and stays restrained.
        air_gains = (0.012, 0.026, 0.037, 0.023, 0.040, 0.052, 0.059, 0.045)
        air_note = notes[-1] + (12 if index >= 1 else 0)
        air_length = voice_length
        air = air_voice(air_note, air_length, air_gains[index], 31 + index)
        pan = 0.28 if index % 2 else -0.28
        place(air_left, air * math.sqrt((1.0 - pan) * 0.5), start)
        place(air_right, air * math.sqrt((1.0 + pan) * 0.5), start)

        # A centered deep foundation, with a small widening offset below the pad.
        bass_gain = (0.115, 0.087, 0.072, 0.065, 0.087, 0.094, 0.102, 0.084)[index]
        bass_length = voice_length
        sub = sub_voice(ROOTS[index], bass_length, bass_gain, index)
        place(bass_left, sub * 0.96, start)
        place(bass_right, sub * 0.96, start)

    # Delicate 100 BPM pulse. Its scene gain is deliberately low and it never becomes a beat track.
    beat_time = 11.5
    pulse_index = 0
    while beat_time < 46.0:
        if beat_time < 17.5:
            level = 0.028
        elif beat_time < 24.5:
            level = 0.022
        elif beat_time < 30.5:
            level = 0.043
        elif beat_time < 36.5:
            level = 0.047
        elif beat_time < 42.5:
            level = 0.038
        else:
            level = 0.023
        root, _ = chord_at(beat_time + 0.01)
        pulse_note = root + (12 if pulse_index % 4 == 0 else 0)
        hit = pulse(beat_time, pulse_note, level, 1.12 if pulse_index % 4 == 0 else 0.82)
        place(pulse_left, hit * 0.92, beat_time)
        place(pulse_right, hit * 0.92, beat_time)
        pulse_index += 1
        beat_time += BEAT

    # Forward-motion bass notes join the pulse for the propulsion and deliverables scenes.
    hit_time = 24.5
    hit_index = 0
    while hit_time < 42.5:
        root, _ = chord_at(hit_time + 0.01)
        hit = bass_hit(root, 0.040 if hit_time < 30.5 else 0.045)
        if hit_index % 4 == 2:
            hit *= 0.72
        place(bass_left, hit * 0.97, hit_time)
        place(bass_right, hit * 0.97, hit_time)
        hit_index += 1
        hit_time += BEAT

    # Sparse felt-pluck motif, expanding with the story while remaining identifiable.
    motif_events = (
        (1.72, 74, 0.105, -0.22),
        (2.82, 77, 0.083, 0.18),
        (6.38, 77, 0.084, -0.24),
        (8.72, 81, 0.075, 0.23),
        (12.08, 72, 0.063, -0.28),
        (12.78, 76, 0.056, 0.20),
        (13.48, 77, 0.061, 0.30),
        (15.18, 81, 0.068, -0.18),
        (18.62, 81, 0.052, 0.16),
        (20.90, 79, 0.050, -0.24),
        (23.02, 76, 0.057, 0.25),
        (25.08, 77, 0.066, -0.20),
        (26.28, 81, 0.060, 0.18),
        (27.48, 84, 0.064, 0.28),
        (29.26, 81, 0.070, -0.17),
        (31.05, 74, 0.070, -0.28),
        (32.18, 77, 0.062, 0.18),
        (33.31, 81, 0.070, 0.28),
        (35.15, 84, 0.074, -0.14),
        (37.02, 77, 0.064, -0.24),
        (38.18, 81, 0.066, 0.20),
        (39.38, 84, 0.070, 0.27),
        (41.04, 88, 0.076, -0.16),
        (42.92, 79, 0.068, -0.22),
        (44.16, 81, 0.065, 0.18),
        (45.34, 84, 0.072, 0.28),
        (46.56, 89, 0.082, -0.12),
    )
    for event_index, (time_s, note, amp, pan) in enumerate(motif_events):
        voice = felt_pluck(note, amp, event_index + 1)
        place(motif_left, voice * math.sqrt((1.0 - pan) * 0.5), time_s)
        place(motif_right, voice * math.sqrt((1.0 + pan) * 0.5), time_s)

    # Exactly four restrained, tuned transition accents at the specified edit points.
    for accent_index, time_s in enumerate((5.5, 17.5, 30.5, 42.5)):
        root, _ = chord_at(time_s + 0.01)
        left, right = transition_accent(root, (0.095, 0.073, 0.082, 0.068)[accent_index], accent_index)
        place(accent_left, left, time_s)
        place(accent_right, right, time_s)

    # Small, fine stereo space on motif and transition buses. All taps are tonal and dry-forward.
    delay_left = np.zeros(N_SAMPLES, dtype=np.float64)
    delay_right = np.zeros(N_SAMPLES, dtype=np.float64)
    add_stereo_tap(delay_left, delay_right, motif_left, motif_right, 0.19, 0.15, 0.08)
    add_stereo_tap(delay_left, delay_right, motif_left, motif_right, 0.31, 0.08, 0.13)
    add_stereo_tap(delay_left, delay_right, motif_left, motif_right, 0.47, 0.045, 0.06)
    add_stereo_tap(delay_left, delay_right, accent_left, accent_right, 0.23, 0.07, 0.04)

    reverb_left = np.zeros(N_SAMPLES, dtype=np.float64)
    reverb_right = np.zeros(N_SAMPLES, dtype=np.float64)
    reverb_source_left = motif_left + 0.42 * accent_left
    reverb_source_right = motif_right + 0.42 * accent_right
    for delay_s, gain in ((0.13, 0.12), (0.29, 0.085), (0.43, 0.062), (0.67, 0.044), (0.91, 0.030)):
        add_stereo_tap(
            reverb_left,
            reverb_right,
            reverb_source_left,
            reverb_source_right,
            delay_s,
            gain * 0.76,
            gain * 0.52,
        )
    reverb_left = lowpass(reverb_left, 4200.0)
    reverb_right = lowpass(reverb_right, 4200.0)

    left = pad_left + air_left + bass_left + pulse_left + motif_left + accent_left
    right = pad_right + air_right + bass_right + pulse_right + motif_right + accent_right
    left += 0.54 * delay_left + 0.64 * reverb_left
    right += 0.54 * delay_right + 0.64 * reverb_right

    # A very light analog-style saturation keeps stacked oscillators rounded.
    left = np.tanh(1.10 * left) / 1.10
    right = np.tanh(1.10 * right) / 1.10

    # Logo resolution: a clean 1.2 second tail, exactly matching the requested ending.
    tail_start = sample_index(46.8)
    fade = np.ones(N_SAMPLES, dtype=np.float64)
    tail_length = N_SAMPLES - tail_start
    fade[tail_start:] = 0.5 + 0.5 * np.cos(np.linspace(0.0, math.pi, tail_length))
    left *= fade
    right *= fade

    # Calibrate to an approximately -18 LUFS pre-master level, then protect true peak.
    stereo_rms = math.sqrt(float(np.mean(0.5 * (left * left + right * right))))
    left *= 10.0 ** ((TARGET_RMS_DBFS - dbfs(stereo_rms)) / 20.0)
    right *= 10.0 ** ((TARGET_RMS_DBFS - dbfs(stereo_rms)) / 20.0)
    peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))))
    if dbfs(peak) > MAX_PEAK_DBFS:
        trim = 10.0 ** ((MAX_PEAK_DBFS - dbfs(peak)) / 20.0)
        left *= trim
        right *= trim

    return left, right



def write_wav(path: Path, left: np.ndarray, right: np.ndarray) -> tuple[float, float, float]:
    path.parent.mkdir(parents=True, exist_ok=True)
    stereo = np.column_stack((left, right))
    pcm = np.clip(np.round(stereo * 32767.0), -32768, 32767).astype("<i2", copy=False)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(SR)
        output.writeframes(pcm.tobytes())
    peak = float(np.max(np.abs(stereo)))
    rms = math.sqrt(float(np.mean(stereo * stereo)))
    duration = len(stereo) / SR
    return duration, dbfs(peak), dbfs(rms)



def default_output() -> Path:
    return Path(__file__).resolve().parents[2] / "public" / "premium" / "score.wav"



def main() -> None:
    parser = argparse.ArgumentParser(description="Render the OpenHull premium film score")
    parser.add_argument("--output", type=Path, default=default_output())
    args = parser.parse_args()

    left, right = render_score()
    duration, peak_db, rms_db = write_wav(args.output, left, right)
    print(f"Wrote {args.output}")
    print(f"format=48kHz/16-bit/stereo samples_per_channel={N_SAMPLES}")
    print(f"duration_s={duration:.6f} peak_dbfs={peak_db:.3f} rms_dbfs={rms_db:.3f}")
    print("transition_accents_s=5.5,17.5,30.5,42.5")
    print("fade_tail_s=1.2")


if __name__ == "__main__":
    main()
