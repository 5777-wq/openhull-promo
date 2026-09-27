# 合成宣传片配乐：120 BPM 电子节拍，D 小调，59.5 s（1785 帧 @30fps）。
# 所有分镜边界（5.5/10.5/17.5/27.5/36.5/44.5/53.5 s）均落在 0.5 s 节拍网格上。
# 输出 public/openhull-beat.wav，淡入淡出已烘焙进音频。
import numpy as np

SR = 44100
DUR = 58.5
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(20260927)

# ── 基础工具 ────────────────────────────────────────────────────────────
def place(sig, t0, gain=1.0, pan=0.0):
    """把信号加进立体声总线。pan -1(L)..1(R)，等功率。"""
    i0 = int(t0 * SR)
    n = min(len(sig), N - i0)
    if n <= 0:
        return
    th = (pan + 1) * np.pi / 4
    L[i0 : i0 + n] += sig[:n] * gain * np.cos(th)
    R[i0 : i0 + n] += sig[:n] * gain * np.sin(th)

def env_ar(n, a, r, hold=0.0):
    """attack-release 包络（秒），hold 为保持段长度。"""
    t = np.arange(n) / SR
    e = np.ones(n)
    na = max(int(a * SR), 1)
    nr = max(int(r * SR), 1)
    e[:na] = np.linspace(0, 1, na)
    e[n - nr :] = np.linspace(1, 0, nr)
    return e

def lowpass_1p(x, fc):
    """单极点低通，可做随时间扫频（fc 为数组）。"""
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y

# ── 音色 ───────────────────────────────────────────────────────────────
def pad_note(f, dur, detune=0.0025):
    """暖 pad：双失谐锯齿波 + 谐波滚降（加法合成近似低通）。"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-detune, detune):
        f2 = f * (1 + det)
        # 前 24 个谐波，1/h 幅度 × 额外指数滚降（≈4 kHz 截止的听感）
        for h in range(1, 25):
            out += np.sin(2 * np.pi * f2 * h * t + rng.uniform(0, 6.28)) / h * np.exp(-h * f2 / 1800.0)
    out /= 8.0
    return out * env_ar(n, 0.9, 1.1)

def kick(soft=False):
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 42 + 95 * np.exp(-t * 26)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / (0.16 if soft else 0.12))
    click = rng.standard_normal(int(0.004 * SR)) * np.linspace(1, 0, int(0.004 * SR))
    body[: len(click)] += click * (0.12 if soft else 0.22)
    return body

def boom():
    n = int(1.1 * SR)
    t = np.arange(n) / SR
    f = 34 + 70 * np.exp(-t * 14)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.42)

def hat(dur=0.045):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    x = np.diff(x, prepend=0)  # 高通
    return x * np.exp(-np.arange(n) / (SR * 0.013)) * 0.9

def bass_pulse(f, dur=0.24):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return x * np.exp(-t / 0.13) * env_ar(n, 0.004, 0.02)

def pluck(f, dur=0.30):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.06)
    return x * np.exp(-t / 0.085)

def bell(f, dur=2.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * f * 2.01 * t)
    return x * np.exp(-t / 0.85) * env_ar(n, 0.01, 0.4)

def riser(dur=2.0):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    fc = np.linspace(300, 6500, n)
    y = lowpass_1p(x, fc)
    return y * (np.linspace(0, 1, n) ** 2.2)

def echo(sig, dt=0.375, g=0.34, taps=3):
    """简单回声：本体 + g^k 延迟副本。"""
    out = [ (0.0, sig) ]
    for k in range(1, taps + 1):
        out.append((dt * k, sig * (g ** k)))
    return out

# ── 和声表（D 小调）──────────────────────────────────────────────────
FREQ = dict(C2=65.41, D2=73.42, E2=82.41, F2=87.31, G2=98.0, A2=110.0,
            Bb2=116.54, C3=130.81, D3=146.83, E3=164.81, F3=174.61, G3=196.0,
            A3=220.0, Bb3=233.08, C4=261.63, D4=293.66, E4=329.63, F4=349.23,
            G4=392.0, A4=440.0, Bb4=466.16, C5=523.25, D5=587.33, E5=659.26,
            F5=698.46, A5=880.0)

CHORDS = {
    "Dm": dict(pad=["D2", "A2", "D3", "F3"], bass="D2",
               arp=["D4", "F4", "A4", "D5"]),
    "Bb": dict(pad=["Bb2", "F3", "Bb3", "D4"], bass="Bb2",
               arp=["Bb3", "D4", "F4", "Bb4"]),
    "F":  dict(pad=["F2", "C3", "F3", "A3"], bass="F2",
               arp=["F4", "A4", "C5", "F5"]),
    "C":  dict(pad=["C3", "G3", "C4", "E4"], bass="C2",
               arp=["E4", "G4", "C5", "E5"]),
}

# 分镜边界（秒）与各段和弦铺底
SCENES = [(0.0, 5.0), (5.0, 10.0), (10.0, 16.5), (16.5, 22.5),
          (22.5, 30.5), (30.5, 37.5), (37.5, 45.5), (45.5, 52.5), (52.5, 58.5)]
SECTION_CHORDS = [
    [("Dm", 5.0)],
    [("Bb", 5.0)],
    [("Dm", 6.5)],
    [("Dm", 2.0), ("Bb", 2.0), ("F", 2.0)],
    [("Dm", 4.0), ("Bb", 4.0)],
    [("F", 3.5), ("C", 3.5)],
    [("Dm", 2.0), ("Bb", 2.0), ("F", 2.0), ("C", 2.0)],
    [("Bb", 3.5), ("F", 3.5)],
    [("Dm", 5.5)],
]

# ── 1) Pad 铺底（全曲）────────────────────────────────────────────────
for (t0, _), prog in zip(SCENES, SECTION_CHORDS):
    t = t0
    for name, d in prog:
        ch = CHORDS[name]
        for i, note in enumerate(ch["pad"]):
            w = pad_note(FREQ[note], d + 1.2)  # 尾音 overlap，接缝更顺
            # 立体声展开：各音高交替偏 L / R
            place(w, t, gain=0.085, pan=(-0.35 + 0.7 * (i % 2)) * 0.9)
        t += d

# ── 2) Sub Drone 全曲低频基底（无鼓点开场）＋ Logo 落成低音重击 ────────
t_dr = np.arange(N) / SR
_drone = (np.sin(2 * np.pi * 36.71 * t_dr) * 0.09
          + np.sin(2 * np.pi * 36.94 * t_dr) * 0.05)
_drone *= (0.85 + 0.15 * np.sin(2 * np.pi * t_dr / 9.0))
place(_drone, 0.0, gain=1.0)
place(boom(), 62 / 30.0, gain=0.26)   # 00:02 Logo 描线闭合瞬间，空灵低音重击

# ── 3) 鼓组与低音（S3 进，S8 抽鼓）：10.5 → 53.5 ───────────────────────
t = 10.0
while t < 44.99:
    place(kick(), t, gain=0.62)
    place(hat(), t + 0.25, gain=0.07 if t < 17.5 else 0.10, pan=0.3)
    # S7 加 16 分帽（能量峰）
    if t >= 44.5:
        place(hat(0.03), t + 0.125, gain=0.05, pan=-0.3)
        place(hat(0.03), t + 0.375, gain=0.05, pan=0.35)
    # 低音八分脉冲，正拍让位底鼓（伪 sidechain）
    for off in (0.0, 0.25):
        tb = t + off
        if tb >= 53.49:
            break
        ch = None
        acc = 10.0
        for (t0, _), prog in zip(SCENES[2:], SECTION_CHORDS[2:]):
            for name, d in prog:
                if acc <= tb < acc + d:
                    ch = CHORDS[name]
                acc += d
        g = 0.30 if off == 0.0 else 0.38
        place(bass_pulse(FREQ[ch["bass"]]), tb, gain=g)
    t += 0.5

# S8 邀请段：诚恳、安静，软低音脉冲（无鼓）
t = 45.5
while t < 52.4:
    name = "Bb" if t < 49.0 else "F"
    place(bass_pulse(FREQ[CHORDS[name]["bass"]], 0.4), t, gain=0.22)
    t += 1.0

# S2 张力段：仅低音长脉冲（无鼓）
t = 5.0
while t < 9.9:
    place(bass_pulse(FREQ["Bb2"], 0.4), t, gain=0.24)
    t += 1.0

# ── 4) 琶音（S4 / S6 / S7）────────────────────────────────────────────
def arp_run(t0, t1, chord_names_boundaries, step=0.25, gain=0.13):
    t = t0
    k = 0
    while t < t1 - 1e-6:
        name = None
        for cname, b0, b1 in chord_names_boundaries:
            if b0 <= t < b1:
                name = cname
                break
        notes = CHORDS[name]["arp"]
        # 上行-下行 economical pattern
        idx = k % (2 * len(notes) - 2)
        idx = idx if idx < len(notes) else (2 * len(notes) - 2 - idx)
        f = FREQ[notes[idx]]
        pan = 0.28 * np.sin(k * 1.1)
        for dt_, w in echo(pluck(f), dt=0.375, g=0.32, taps=2):
            place(w, t + dt_, gain=gain, pan=pan * (0.6 ** (dt_ / 0.375)))
        k += 1
        t += step

# S4 各和弦边界
arp_run(17.5, 27.5, [("Dm", 17.5, 20.0), ("Bb", 20.0, 22.5), ("F", 22.5, 25.0), ("C", 25.0, 27.5)])
# S6
arp_run(36.5, 44.5, [("F", 36.5, 40.5), ("C", 40.5, 44.5)], gain=0.15)
# S7：16 分更密
arp_run(44.5, 53.5, [("Dm", 44.5, 46.75), ("Bb", 46.75, 49.0), ("F", 49.0, 51.25), ("C", 51.25, 53.5)], step=0.125, gain=0.10)

# ── 5) 点睛铃声 ────────────────────────────────────────────────────────
place(bell(FREQ["D5"]), 3.0, gain=0.16, pan=-0.4)
place(bell(FREQ["A5"]), 4.25, gain=0.11, pan=0.4)
place(bell(FREQ["F5"]), 32.5, gain=0.13, pan=-0.35)
place(bell(FREQ["A5"]), 34.5, gain=0.11, pan=0.35)
place(bell(FREQ["D5"]), 46.5, gain=0.15, pan=-0.3)
place(bell(FREQ["A4"]), 48.5, gain=0.11, pan=0.3)
place(bell(FREQ["D5"]), 53.5, gain=0.16, pan=-0.3)
place(bell(FREQ["A4"]), 55.5, gain=0.11, pan=0.3)

# ── 5c) UI 音效（精确到帧的机械反馈）─────────────────────────────────
def ui_tick():
    """极短干脆的高频工业微脉冲（校验项打钩）"""
    n = int(0.04 * SR)
    t = np.arange(n) / SR
    f = 2400 + 300 * rng.uniform(-1, 1)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.008) * 0.7
    x += np.diff(rng.standard_normal(n + 1)) * np.exp(-np.arange(n) / (SR * 0.001)) * 0.12
    return x

def success_chime():
    """微带混响感的双音清脆金属音（IS Code PASS）"""
    n = int(1.0 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t / 0.20) * 0.5
    x += np.sin(2 * np.pi * 1975.5 * t) * np.exp(-np.clip(t - 0.09, 0, None) / 0.24) * (t > 0.09) * 0.42
    return x * env_ar(n, 0.004, 0.35)

def sub_whoosh():
    """低沉利落的空气撕裂声（红色划线），不刺耳"""
    n = int(0.30 * SR)
    x = rng.standard_normal(n)
    y = lowpass_1p(x, np.linspace(1600, 320, n))
    return y * (np.sin(np.linspace(0, np.pi, n)) ** 1.5)

def enter_thock():
    """厚重扎实的机械回车键击（青轴 thock）"""
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    f = 95 + 30 * rng.uniform(-1, 1)
    x = np.sin(2 * np.pi * (f - 40 * t) * t) * np.exp(-t / 0.035) * 0.9
    nn = int(0.004 * SR)
    x[:nn] += np.diff(rng.standard_normal(nn + 1)) * np.exp(-np.arange(nn) / (SR * 0.0015)) * 0.5
    return x

def shutter_tick():
    """计数器高速连拍的机械咔哒"""
    n = int(0.025 * SR)
    x = np.diff(rng.standard_normal(n + 1))
    return x * np.exp(-np.arange(n) / (SR * 0.002)) * 0.8

def sine_ping():
    """示波器触顶的细微正弦鸣音（GZ max）"""
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 1046.5 * t) * np.exp(-t / 0.16) * 0.7
    x += np.sin(2 * np.pi * 1568.0 * t) * np.exp(-t / 0.11) * 0.25
    return x

def lock_clunk():
    """低频笃定落锁声（423 落定）"""
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 52 + 40 * np.exp(-t * 20)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.10)

# 帧对齐埋点（全局帧 / 30 = 秒）
S2_G = 150; S3_G = 300; S5_G = 675; S6_G = 915
place(sub_whoosh(), (S2_G + 70) / 30.0, gain=0.20)          # 00:07 划线
place(enter_thock(), (S3_G + 66) / 30.0, gain=0.30)          # 00:12 回车
for k, fr in enumerate([386, 394, 402, 410, 418]):
    place(ui_tick(), fr / 30.0, gain=0.10, pan=0.2 * (k % 2 - 0.5))
place(success_chime(), 403 / 30.0, gain=0.12)                # PASS 行
place(sine_ping(), (S5_G + 116) / 30.0, gain=0.11)           # 00:26 GZ max
for k in range(12):                                          # 00:33 计数连拍
    place(shutter_tick(), (S6_G + 70 + 3 * k) / 30.0, gain=0.065, pan=0.15 * (k % 2 - 0.5))
place(lock_clunk(), (S6_G + 105) / 30.0, gain=0.22)          # 423 落定

# ── 6) Risers 与落点 ──────────────────────────────────────────────────
place(boom(), 10.0, gain=0.30)
place(boom(), 37.5, gain=0.26)
place(boom(), 45.5, gain=0.22)
place(boom(), 52.5, gain=0.22)
place(riser(2.0), 59.5, gain=0.12)
place(boom(), 61.5, gain=0.3)

# ── 7) 总线：软限幅、归一化、淡入淡出 ─────────────────────────────────
mix = np.stack([L, R], axis=1)

# ── 6b) 痛点段低通沉降：高频瞬间被切掉，营造压抑窒息感 ────────────────
_i0, _i1 = int(4.8 * SR), int(10.4 * SR)
_seg = min(_i1, N) - _i0
_fc = np.full(_seg, 20000.0)
_d = int(1.4 * SR)                     # 4.8→6.2s 沉降到 700Hz
_fc[:_d] = np.linspace(20000, 700, _d)
_h = int(9.0 * SR) - _i0               # 9.0→10.2s 恢复
_fc[_h:] = np.linspace(700, 20000, _seg - _h)
for _ch in (0, 1):
    _src = mix[_i0:_i0 + _seg, _ch].copy()
    mix[_i0:_i0 + _seg, _ch] = lowpass_1p(_src, _fc)

mix = np.tanh(mix * 1.4) / np.tanh(1.4)
peak = np.max(np.abs(mix))
mix = mix / peak * 0.9
fade_in = int(0.06 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
f0 = int(57.2 * SR)
mix[f0:] *= np.linspace(1, 0, N - f0)[:, None] ** 1.5

# 16-bit WAV 写出
import struct, wave
pcm = (mix * 32767).astype(np.int16)
with wave.open(r"D:\remotion动画开源框架\public\openhull-beat.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote openhull-beat.wav", mix.shape[0] / SR, "s, peak", float(np.max(np.abs(mix))))
