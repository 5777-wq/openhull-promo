import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, staticFile, Audio } from "remotion";
import * as THREE from "three";
import { hullData } from "./hull-data";
import { designData } from "./design-data";

const W = 3840,
  H = 2160,
  FPS = 30,
  DURATION = 1440;
const C = {
  ink: "#111a22",
  mid: "#71808c",
  blue: "#347fa8",
  paper: "#f2f3f0",
  line: "#d6dedc",
  orange: "#c8894d",
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const fade = (f: number, a: number, b: number, c: number, d: number) =>
  f < a || f > d
    ? 0
    : f < b
      ? ease((f - a) / (b - a))
      : f < c
        ? 1
        : 1 - ease((f - c) / (d - c));
const LocalFonts = () => (
  <style>{`
    @font-face { font-family: OpenHullSans; src: url(${staticFile("premium/OpenHullSans.ttf")}) format("truetype"); font-weight: 100 900; }
    @font-face { font-family: OpenHullLatin; src: url(${staticFile("premium/OpenHullLatin.ttf")}) format("truetype"); font-weight: 400 700; }
  `}</style>
);

const kf = (f: number, keys: Array<[number, number]>) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [fa, va] = keys[i];
    const [fb, vb] = keys[i + 1];
    if (f <= fb) {
      const t = ease((f - fa) / (fb - fa));
      return va + (vb - va) * t;
    }
  }
  return keys[keys.length - 1][1];
};
const scenes = [
  { a: 0, b: 165 },
  { a: 165, b: 345 },
  { a: 345, b: 525 },
  { a: 525, b: 735 },
  { a: 735, b: 915 },
  { a: 915, b: 1095 },
  { a: 1095, b: 1275 },
  { a: 1275, b: 1440 },
];

const txt = (size: number, weight = 400, family = "OpenHullSans") => ({
  fontFamily: family,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: 0 as const,
});
function BrandMark({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" aria-label="OpenHull">
      <defs>
        <linearGradient id="ohg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#94d9e5" />
          <stop offset="1" stopColor="#337ca7" />
        </linearGradient>
      </defs>
      <circle
        cx="120"
        cy="120"
        r="103"
        fill="none"
        stroke="#8ca6b5"
        strokeDasharray="2 12"
        opacity=".46"
      />
      <circle
        cx="120"
        cy="120"
        r="87"
        fill="none"
        stroke="#8ca6b5"
        strokeDasharray="1 8"
        opacity=".34"
      />
      <path d="M32 119 120 32l88 87h-55v-17H87v17z" fill="url(#ohg)" />
      <path
        d="M40 148c17 0 17 10 34 10s17-10 34-10 17 10 34 10 17-10 34-10 17 10 34 10"
        fill="none"
        stroke="url(#ohg)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M50 177c13 0 13 8 26 8s13-8 26-8 13 8 26 8 13-8 26-8 13 8 26 8"
        fill="none"
        stroke="#70b9ce"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  );
}

function Hull() {
  const frame = useCurrentFrame();
  const { positions, indices, lines } = hullData as {
    positions: number[];
    indices: number[];
    lines: number[][];
    dimensions: { length: number; beam: number; draft: number; depth: number };
  };
  const geometry = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [positions, indices]);
  const wireGeometries = React.useMemo(
    () =>
      lines.map((row) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(row, 3));
        return g;
      }),
    [lines],
  );
  const zoom = kf(frame, [
    [166, 140],
    [346, 146],
    [526, 170],
    [736, 190],
    [916, 152],
    [1096, 150],
    [1276, 148],
    [1439, 132],
  ]);
  const camY = kf(frame, [
    [166, 28],
    [346, 64],
    [526, 9],
    [736, 15],
    [916, 26],
    [1096, 28],
    [1439, 24],
  ]);
  const camZ = kf(frame, [
    [166, 42],
    [346, 8],
    [526, 46],
    [736, 40],
    [916, 42],
    [1439, 46],
  ]);
  const shiftX = kf(frame, [
    [166, 3.0],
    [346, 2.4],
    [526, 2.2],
    [736, 3.0],
    [916, 3.0],
    [1096, 2.6],
    [1276, 0.8],
    [1439, 0.4],
  ]);
  const turn =
    kf(frame, [
      [166, 0.3],
      [346, 0.1],
      [526, -0.38],
      [736, 0.85],
      [916, -0.3],
      [1096, 0.3],
      [1439, 0.2],
    ]) +
    Math.sin(frame * 0.004) * 0.01;
  const pitch = kf(frame, [
    [166, -0.03],
    [346, -0.02],
    [526, -0.1],
    [736, -0.04],
    [916, -0.03],
    [1439, -0.03],
  ]);
  return (
    <ThreeCanvas
      width={W}
      height={H}
      orthographic
      camera={{
        position: [0, camY, camZ],
        zoom,
        near: 0.1,
        far: 160,
      }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight
        position={[-15, 25, 24]}
        intensity={3.1}
        color="#ffffff"
      />
      <directionalLight
        position={[12, 9, -20]}
        intensity={2.8}
        color="#76cfe0"
      />
      <directionalLight
        position={[2, -3, 10]}
        intensity={1.0}
        color="#536c83"
      />
      <pointLight
        position={[0, 5, 1]}
        intensity={16}
        distance={42}
        color="#418fba"
      />
      <group position={[shiftX, -1.5, 0]} rotation={[pitch, turn, 0]}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#33414c"
            metalness={0.72}
            roughness={0.34}
            clearcoat={0.85}
            clearcoatRoughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        {wireGeometries.map((g, i) => (
          <lineSegments key={i} geometry={g}>
            <lineBasicMaterial
              color={i < 30 ? "#66c9e0" : "#5fb9d4"}
              transparent
              opacity={i < 30 ? 0.8 : 0.5}
              depthWrite={false}
            />
          </lineSegments>
        ))}
        <mesh position={[-5.55, 0.98, 0]}>
          <boxGeometry args={[1.7, 0.66, 1.42]} />
          <meshPhysicalMaterial
            color="#3a4956"
            metalness={0.7}
            roughness={0.36}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[-5.55, 1.42, 0]}>
          <boxGeometry args={[0.9, 0.24, 1.1]} />
          <meshPhysicalMaterial
            color="#42525f"
            metalness={0.7}
            roughness={0.34}
            side={THREE.DoubleSide}
          />
        </mesh>
        {[
          [-4.63, 1.31],
          [-2.26, 1.31],
          [0.1, 1.31],
          [2.46, 1.31],
          [4.83, 1.31],
        ].map(([hx, hw]) => (
          <mesh key={hx} position={[hx, 0.68, 0]}>
            <boxGeometry args={[hw, 0.07, 1.34]} />
            <meshPhysicalMaterial
              color="#46565f"
              metalness={0.6}
              roughness={0.42}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -2.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 160]} />
        <meshBasicMaterial color="#f2f3f0" transparent opacity={0.66} />
      </mesh>
      <fog attach="fog" args={["#f2f3f0", 46, 100]} />
    </ThreeCanvas>
  );
}

function EditorialLines({ frame, range }: { frame: number; range: number }) {
  const opacity = fade(frame, range, range + 20, range + 140, range + 172);
  const offset = Math.round((1 - ease((frame - range) / 25)) * 30);
  const stats = [
    ["Lpp", `${designData.lpp_m.toFixed(1)} m`],
    ["B", `${designData.beam_m.toFixed(1)} m`],
    ["T", `${designData.draft_m.toFixed(2)} m`],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 210,
        top: 216,
        opacity,
        pointerEvents: "none",
        transform: `translateY(${offset}px)`,
      }}
    >
      <div
        style={{
          ...txt(42, 600, "OpenHullLatin"),
          color: C.blue,
          letterSpacing: 3,
        }}
      >
        A BETTER WAY TO BEGIN
      </div>
      <div
        style={{
          ...txt(170, 500),
          color: C.ink,
          marginTop: 36,
          lineHeight: 1.12,
        }}
      >
        从一份任务书，
        <br />
        开始一条船的设计。
      </div>
      <div style={{ ...txt(58), color: C.mid, marginTop: 36 }}>
        载重量 {designData.deadweight_t.toLocaleString("en-US")} t · 航速 16 kn
      </div>
      <div
        style={{ height: 1, width: 760, background: C.line, marginTop: 38 }}
      />
      <div style={{ display: "flex", gap: 52, marginTop: 26 }}>
        {stats.map(([a, b]) => (
          <div key={a}>
            <div style={{ ...txt(40, 600, "OpenHullLatin"), color: C.mid }}>
              {a}
            </div>
            <div
              style={{
                ...txt(56, 500, "OpenHullLatin"),
                color: C.ink,
                marginTop: 10,
              }}
            >
              {b}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overline({
  children,
  light = false,
}: {
  children: string;
  light?: boolean;
}) {
  return (
    <div
      style={{
        ...txt(42, 600, "OpenHullLatin"),
        color: light ? "#b9d5de" : C.blue,
        letterSpacing: 3,
      }}
    >
      {children}
    </div>
  );
}
function LightScene({ frame }: { frame: number }) {
  const scene = scenes.findIndex((s) => frame >= s.a && frame < s.b);
  const titleStyle = {
    ...txt(168, 500),
    color: C.ink,
    lineHeight: 1.16,
    marginTop: 30,
  };
  const captionStyle = {
    ...txt(54),
    color: C.mid,
    lineHeight: 1.65,
    marginTop: 30,
    maxWidth: 1500,
  };
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {scene === 2 && (
        <div
          style={{
            position: "absolute",
            left: 205,
            top: 228,
            width: 1500,
            opacity: fade(frame, 345, 375, 490, 515),
          }}
        >
          <Overline>02 / A FORM WITH PROVENANCE</Overline>
          <div style={titleStyle}>
            每条型线，
            <br />
            都有来处。
          </div>
          <div style={captionStyle}>
            真实 Series 60 母型型值，
            <br />
            经 Lackenby 变换适配目标船型。
            <br />
            这是一艘由公开型值构成的示意船，不是详细设计图。
          </div>
          <div
            style={{
              marginTop: 48,
              ...txt(34, 500, "OpenHullLatin"),
              color: C.mid,
            }}
          >
            DTMB REPORT 1712 · PARAMETRIC HULL FORM
          </div>
        </div>
      )}
      {scene === 3 && (
        <div
          style={{
            position: "absolute",
            left: 205,
            top: 190,
            width: 1500,
            opacity: fade(frame, 525, 555, 700, 728),
          }}
        >
          <Overline>03 / STABILITY · IMO 2008</Overline>
          <div style={titleStyle}>看见安全余度。</div>
          <div style={captionStyle}>
            大倾角 GZ 曲线与 IS Code 衡准逐条呈现。
            <br />
            工具提供计算，专业判断仍属于船舶工程师。
          </div>
          <div style={{ display: "flex", gap: 120, marginTop: 54 }}>
            <div>
              <div style={{ ...txt(38, 600, "OpenHullLatin"), color: C.mid }}>
                INITIAL GM
              </div>
              <div
                style={{
                  ...txt(112, 500, "OpenHullLatin"),
                  color: C.blue,
                  marginTop: 10,
                }}
              >
                {designData.stability_criteria.gm0_m.toFixed(2)} m
              </div>
              <div style={{ ...txt(38), color: C.mid }}>初稳性高度</div>
            </div>
            <div>
              <div style={{ ...txt(38, 600, "OpenHullLatin"), color: C.mid }}>
                MAXIMUM GZ
              </div>
              <div
                style={{
                  ...txt(112, 500, "OpenHullLatin"),
                  color: C.blue,
                  marginTop: 10,
                }}
              >
                {designData.gz_curve.gz_max_m.toFixed(2)} m
              </div>
              <div style={{ ...txt(38), color: C.mid }}>
                {designData.gz_curve.angle_max_deg.toFixed(1)}° 倾角
              </div>
            </div>
          </div>
        </div>
      )}
      {scene === 4 && (
        <div
          style={{
            position: "absolute",
            left: 205,
            top: 214,
            width: 1500,
            opacity: fade(frame, 735, 765, 880, 905),
          }}
        >
          <Overline>04 / PROPULSION · B-SERIES</Overline>
          <div style={titleStyle}>从阻力，到匹配。</div>
          <div style={captionStyle}>
            艾亚法阻力估算，接上推进因子与
            <br />
            Wageningen B 系列初步设计。
            <br />
            方法只在已验证的适用域内给出结果。
          </div>
          <div
            style={{
              marginTop: 53,
              borderLeft: `2px solid ${C.blue}`,
              paddingLeft: 26,
            }}
          >
            <div style={{ ...txt(38, 600, "OpenHullLatin"), color: C.mid }}>
              SERIES
            </div>
            <div
              style={{
                ...txt(64, 500, "OpenHullLatin"),
                color: C.ink,
                marginTop: 6,
              }}
            >
              {designData.propeller_design.series}
            </div>
          </div>
          <div style={{ display: "flex", gap: 68, marginTop: 48 }}>
            {[
              ["ηo", designData.propeller_design.eta_open_water.toFixed(2)],
              ["D", `${designData.propeller_design.diameter_m.toFixed(1)} m`],
              ["P/D", designData.propeller_design.pitch_ratio.toFixed(2)],
            ].map((x) => (
              <div key={x[0]}>
                <div style={{ ...txt(40, 600, "OpenHullLatin"), color: C.mid }}>
                  {x[0]}
                </div>
                <div
                  style={{
                    ...txt(64, 500, "OpenHullLatin"),
                    color: C.ink,
                    marginTop: 10,
                  }}
                >
                  {x[1]}
                </div>
              </div>
            ))}
          </div>
          <div style={{ ...txt(36), color: C.mid, marginTop: 48 }}>
            初步设计点示例 · 空泡结果：
            {designData.propeller_design.cavitation?.verdict ===
            "OK: installed AE/A0 0.550 covers the required 0.534 (margin +0.016)"
              ? "满足本方案判据"
              : "见详细报告"}
          </div>
        </div>
      )}
      {scene === 5 && (
        <div
          style={{
            position: "absolute",
            left: 205,
            top: 207,
            width: 1500,
            opacity: fade(frame, 915, 945, 1060, 1088),
          }}
        >
          <Overline>05 / AN AGENT-NATIVE WORKFLOW</Overline>
          <div style={titleStyle}>
            让智能体，
            <br />
            接住重复工作。
          </div>
          <div style={captionStyle}>
            自动安装工具、整理任务书、运行设计链。工程师把时间留给假设、取舍与判断。
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 57 }}>
            {["任务书", "计算", "校核", "交付"].map((x, i) => (
              <div
                key={x}
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: `1px solid ${C.blue}`,
                    color: C.blue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...txt(32, 600, "OpenHullLatin"),
                  }}
                >
                  0{i + 1}
                </div>
                <div style={{ ...txt(40), color: C.ink }}>{x}</div>
                {i < 3 && (
                  <div style={{ width: 84, height: 1, background: C.line }} />
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 50,
              ...txt(36, 500, "OpenHullLatin"),
              color: C.mid,
            }}
          >
            ZCODE · CLAUDE CODE · OPEN CLI
          </div>
        </div>
      )}
      {scene === 6 && (
        <div
          style={{
            position: "absolute",
            left: 205,
            top: 202,
            width: 1800,
            opacity: fade(frame, 1095, 1125, 1240, 1268),
          }}
        >
          <Overline>06 / TESTED AGAINST PUBLISHED ANCHORS</Overline>
          <div style={titleStyle}>让数字，经得起复核。</div>
          <div style={captionStyle}>
            公开基准、复现命令与逐项验收。
            <br />
            一致性不是口号，是可以回到数据源的路径。
          </div>
        </div>
      )}
      {scene === 7 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 196,
            textAlign: "center",
            opacity: fade(frame, 1275, 1310, 1410, 1435),
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 29,
              }}
            >
              <BrandMark size={170} />
            </div>
            <div style={{ ...txt(108, 600, "OpenHullLatin"), color: C.ink }}>
              OpenHull
            </div>
            <div style={{ ...txt(58), color: C.mid, marginTop: 22 }}>
              Design the shell that carries it all.
            </div>
            <div
              style={{
                ...txt(34, 500, "OpenHullLatin"),
                color: C.blue,
                marginTop: 40,
              }}
            >
              OPEN SOURCE · EARLY DAYS · BUILT WITH ENGINEERS
            </div>
            <div
              style={{
                ...txt(32, 400, "OpenHullLatin"),
                color: C.mid,
                marginTop: 34,
              }}
            >
              5777-wq.github.io/openhull-site
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 205,
          right: 205,
          bottom: 87,
          height: 1,
          background: C.line,
          opacity: 0.7,
        }}
      />
    </div>
  );
}

function GzPlot({ local }: { local: number }) {
  const x0 = 0,
    y0 = 0,
    values = designData.gz_curve.points as ReadonlyArray<{
      angle_deg: number;
      gz_m: number;
    }>;
  const pts = values
    .map(
      (p) =>
        `${Math.round(x0 + 45 + p.angle_deg * 8.25)},${Math.round(y0 + 400 - p.gz_m * 100)}`,
    )
    .join(" ");
  const angle = Math.min(80, 10 + Math.max(0, local) * 0.42);
  const gzAt = (a: number) => {
    for (let i = 0; i < values.length - 1; i++) {
      const p = values[i];
      const q = values[i + 1];
      if (a >= p.angle_deg && a <= q.angle_deg) {
        const t = (a - p.angle_deg) / (q.angle_deg - p.angle_deg);
        return p.gz_m + (q.gz_m - p.gz_m) * t;
      }
    }
    return values[values.length - 1].gz_m;
  };
  const dotX = 45 + angle * 8.25;
  const dotY = 400 - gzAt(angle) * 100;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 980,
        height: 640,
        opacity: 0.95,
      }}
    >
      <svg width="980" height="640" viewBox="0 0 720 540">
        <path
          d="M45 420H700M45 60V420"
          fill="none"
          stroke={C.line}
          strokeWidth="2"
        />
        <path
          d="M45 420V95M292 420V60M540 420V95"
          stroke={C.line}
          strokeDasharray="5 10"
        />
        <polyline
          points={pts}
          fill="none"
          stroke={C.blue}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={dotX} cy={dotY} r="9" fill={C.orange} />
        <text x="0" y="463" fill={C.mid} fontSize="22">
          0°
        </text>
        <text x="251" y="463" fill={C.mid} fontSize="22">
          30°
        </text>
        <text x="457" y="463" fill={C.mid} fontSize="22">
          60°
        </text>
        <text x="0" y="20" fill={C.blue} fontSize="20">
          GZ / m · ANGLE OF HEEL
        </text>
      </svg>
    </div>
  );
}

function Film() {
  const frame = useCurrentFrame();
  const titleOpacity = fade(frame, 4, 18, 118, 158);
  return (
    <div
      style={{
        position: "absolute",
        width: W,
        height: H,
        overflow: "hidden",
        background: C.paper,
        color: C.ink,
      }}
    >
      <LocalFonts />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 71% 45%, #ffffff 0%, #f4f6f4 40%, #e7ebea 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(244,246,244,.97) 0%, rgba(244,246,244,.92) 29%, rgba(244,246,244,.48) 50%, rgba(244,246,244,.04) 78%, rgba(244,246,244,.02) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 74% 53%, transparent 10%, rgba(12,24,32,.10) 78%, rgba(12,24,32,.21) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "4.1%",
          border: "1px solid rgba(35,59,72,.12)",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />
      {frame < 210 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: frame < 165 ? 1 : fade(frame, 165, 180, 194, 210),
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(154deg,#111a21 0%,#283a47 52%,#0d1721 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 56% 46%,transparent 18%,rgba(2,9,14,.76) 90%)",
            }}
          />
          <ThreeCanvas
            width={W}
            height={H}
            orthographic
            camera={{
              position: [0, 17, 38],
              zoom: 126 + ease(frame / 165) * 12,
              near: 0.1,
              far: 100,
            }}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight
              position={[16, 10, -18]}
              intensity={5.5}
              color="#9fd8ef"
            />
            <directionalLight
              position={[-14, 20, 23]}
              intensity={4.7}
              color="#d0f1ff"
            />
            <directionalLight
              position={[8, 10, -15]}
              intensity={4.3}
              color="#47a6d2"
            />
            <pointLight
              position={[-8, 5, 6]}
              intensity={18}
              distance={35}
              color="#2683b3"
            />
            <group
              position={[0, -1.7, 0]}
              rotation={[-0.045, 0.14 - ease(frame / 165) * 0.07, 0]}
            >
              <mesh geometry={getHullGeometry()}>
                <meshPhysicalMaterial
                  color="#3b4d5e"
                  metalness={0.78}
                  roughness={0.3}
                  clearcoat={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          </ThreeCanvas>
          <div
            style={{
              position: "absolute",
              left: 212,
              top: 208,
              opacity: titleOpacity,
              transform: `translateY(${Math.round((1 - ease(frame / 24)) * 34)}px)`,
            }}
          >
            <Overline light>OPENHULL · v1.6.0</Overline>
            <div
              style={{
                ...txt(190, 500),
                color: "#f4f7f8",
                marginTop: 46,
                lineHeight: 1.12,
              }}
            >
              一条船的可能，
              <br />
              从这里开始。
            </div>
            <div
              style={{
                ...txt(58, 400, "OpenHullLatin"),
                color: "#b9cbd3",
                marginTop: 42,
              }}
            >
              Design the shell that carries it all.
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 137,
              left: 215,
              ...txt(34, 500, "OpenHullLatin"),
              color: "#a7bcc7",
              letterSpacing: 3,
              opacity: fade(frame, 92, 125, 175, 198),
            }}
          >
            PARAMETRIC · TRACEABLE · ENGINEERED
          </div>
        </div>
      )}
      {frame >= 190 && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity:
                frame < 345
                  ? 1
                  : frame < 525
                    ? 0.68
                    : frame < 1095
                      ? 0.55
                      : frame < 1276
                        ? 0.76
                        : 0.3,
            }}
          >
            <Hull />
          </div>
          <EditorialLines frame={frame} range={166} />
          <LightScene frame={frame} />
        </>
      )}
      {frame >= 165 && frame < 345 && (
        <div
          style={{
            position: "absolute",
            right: 266,
            top: 290,
            width: 720,
            opacity: fade(frame, 172, 207, 307, 338),
          }}
        >
          <TaskbookUI frame={frame} />
        </div>
      )}
      {frame >= 345 && frame < 525 && (
        <div
          style={{
            position: "absolute",
            right: 287,
            bottom: 196,
            ...txt(34, 500, "OpenHullLatin"),
            color: C.mid,
            opacity: fade(frame, 348, 378, 481, 512),
          }}
        >
          SERIES 60 × LACKENBY
        </div>
      )}
      {frame >= 525 && frame < 735 && (
        <div
          style={{
            position: "absolute",
            right: 260,
            top: 180,
            width: 980,
            height: 640,
            opacity: fade(frame, 531, 558, 696, 726),
          }}
        >
          <GzPlot local={frame - 525} />
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 12,
              ...txt(28),
              color: C.mid,
            }}
          >
            ILLUSTRATIVE · DESIGN-POINT CALCULATION
          </div>
        </div>
      )}
      {frame >= 735 && frame < 915 && (
        <div
          style={{
            position: "absolute",
            right: 270,
            top: 220,
            width: 760,
            height: 520,
            opacity: fade(frame, 742, 772, 875, 905),
          }}
        >
          <PropellerFrame frame={frame - 735} />
        </div>
      )}
      {frame >= 915 && frame < 1095 && (
        <div
          style={{
            position: "absolute",
            right: 282,
            top: 290,
            width: 720,
            opacity: fade(frame, 921, 950, 1055, 1085),
          }}
        >
          <FilesScene frame={frame - 915} />
        </div>
      )}
      {frame >= 1095 && frame < 1275 && (
        <div
          style={{
            position: "absolute",
            right: 300,
            top: 265,
            width: 720,
            opacity: fade(frame, 1100, 1130, 1235, 1265),
          }}
        >
          <ValidationFrame />
        </div>
      )}
      {frame >= 1275 && null}
      <div
        style={{
          position: "absolute",
          left: 205,
          top: 98,
          ...txt(32, 600, "OpenHullLatin"),
          color: frame < 165 ? "#b9d5de" : C.mid,
          opacity: 0.85,
          zIndex: 6,
        }}
      >
        O / H OPENHULL
      </div>
      <div
        style={{
          position: "absolute",
          right: 210,
          top: 98,
          ...txt(30, 500, "OpenHullLatin"),
          color: frame < 165 ? "#b9d5de" : C.mid,
          opacity: 0.8,
          zIndex: 6,
        }}
      >
        PRELIMINARY DESIGN 01 — 08
      </div>
      <div
        style={{
          position: "absolute",
          left: 206,
          bottom: 103,
          width: W - 412,
          height: 2,
          background: frame < 165 ? "rgba(255,255,255,.2)" : C.line,
          zIndex: 6,
        }}
      >
        <div
          style={{
            height: 2,
            width: `${(frame / DURATION) * 100}%`,
            background: frame < 165 ? "#98d3e5" : C.blue,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 206,
          bottom: 61,
          ...txt(24, 500, "OpenHullLatin"),
          color: frame < 165 ? "#b9cbd3" : C.mid,
          zIndex: 6,
        }}
      >
        OPENHULL / A PRELIMINARY DESIGN SUITE
      </div>
    </div>
  );
}

let cached: THREE.BufferGeometry | null = null;
function getHullGeometry() {
  if (cached) return cached;
  const data = hullData as { positions: number[]; indices: number[] };
  cached = new THREE.BufferGeometry();
  cached.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(data.positions, 3),
  );
  cached.setIndex(data.indices);
  cached.computeVertexNormals();
  return cached;
}
function TaskbookUI({ frame }: { frame: number }) {
  const rows = [
    ["ship_type", "bulk_carrier"],
    ["deadweight_t", "45,000"],
    ["service_speed_kn", "16.0"],
    ["design_draft_m", "11.6"],
    ["block_coefficient", "0.80"],
  ];
  return (
    <div
      style={{
        background: "rgba(255,255,255,.77)",
        border: "1px solid rgba(50,80,97,.16)",
        padding: "38px 42px",
        boxShadow: "0 22px 70px rgba(37,56,68,.09)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...txt(21, 600, "OpenHullLatin"),
          color: C.blue,
          borderBottom: `1px solid ${C.line}`,
          paddingBottom: 22,
        }}
      >
        TASKBOOK.YAML<span style={{ color: "#4c9477" }}>VALIDATED</span>
      </div>
      {rows.map(([a, b], i) => (
        <div
          key={a}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "22px 0",
            borderBottom: i === 4 ? "none" : `1px solid #e4e9e7`,
            opacity: clamp((frame - i * 12) / 16),
          }}
        >
          <span style={{ ...txt(36, 400, "OpenHullLatin"), color: C.mid }}>
            {a}
          </span>
          <span style={{ ...txt(36, 500, "OpenHullLatin"), color: C.ink }}>
            {b}
          </span>
        </div>
      ))}
    </div>
  );
}
function PropellerFrame({ frame }: { frame: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: 480,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <svg width="680" height="520" viewBox="0 0 560 430">
        <circle
          cx="280"
          cy="210"
          r="164"
          fill="none"
          stroke={C.line}
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle
          cx="280"
          cy="210"
          r="112"
          fill="none"
          stroke={C.line}
          strokeWidth="1"
        />
        <g
          transform={`rotate(${frame * 0.21} 280 210)`}
          fill="url(#blade)"
          stroke="#317493"
          strokeWidth="2"
        >
          <defs>
            <linearGradient id="blade" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#cbd7d8" />
              <stop offset="1" stopColor="#608da1" />
            </linearGradient>
          </defs>
          {[0, 90, 180, 270].map((a) => (
            <path
              key={a}
              transform={`rotate(${a} 280 210)`}
              d="M280 202 C256 142 255 80 280 39 C309 90 307 153 286 203Z"
            />
          ))}
        </g>
        <circle cx="280" cy="210" r="26" fill="#738d9a" />
        <circle cx="280" cy="210" r="7" fill="#e3eceb" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 4,
          ...txt(30, 500, "OpenHullLatin"),
          color: C.mid,
        }}
      >
        B-SERIES · 4 BLADES · PRELIMINARY DESIGN
      </div>
    </div>
  );
}
function FilesScene({ frame }: { frame: number }) {
  const files = [
    "design_report.md",
    "hydro_curves.png",
    "arrangement.dxf",
    "design_data.json",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {files.map((n, i) => (
        <div
          key={n}
          style={{
            display: "flex",
            gap: 23,
            alignItems: "center",
            padding: "28px 32px",
            borderBottom: `1px solid ${C.line}`,
            background: i === 0 ? "rgba(255,255,255,.62)" : "transparent",
            opacity: clamp((frame - i * 11) / 16),
          }}
        >
          <div
            style={{
              width: 56,
              height: 62,
              border: `1px solid ${C.blue}`,
              borderRadius: 4,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 28,
                height: 1.5,
                background: C.blue,
                left: 13,
                top: 26,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 28,
                height: 1.5,
                background: C.blue,
                left: 13,
                top: 37,
              }}
            />
          </div>
          <span style={{ ...txt(42, 500, "OpenHullLatin"), color: C.ink }}>
            {n}
          </span>
          <span
            style={{
              marginLeft: "auto",
              ...txt(30, 500, "OpenHullLatin"),
              color: "#4c9477",
            }}
          >
            READY
          </span>
        </div>
      ))}
    </div>
  );
}
function ValidationFrame() {
  const vals = [
    ["NMRI JBC", "L −1.94% · B +1.69%"],
    ["DTMB 1712", "±0.32 kn"],
    ["NMRI MP687", "ηo 2.8%"],
    ["KCS", "0.929 / 0.932"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {vals.map(([a, b]) => (
        <div
          key={a}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "baseline",
            gap: 30,
            padding: "26px 0",
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <span style={{ ...txt(32, 600, "OpenHullLatin"), color: C.blue }}>
            {a}
          </span>
          <span style={{ ...txt(44, 500, "OpenHullLatin"), color: C.ink }}>
            {b}
          </span>
        </div>
      ))}
      <div style={{ marginTop: 26, ...txt(30), color: C.mid }}>
        PUBLIC ANCHORS · REPRODUCIBLE CHECKS
      </div>
    </div>
  );
}

export const OpenHullPremium: React.FC = () => (
  <>
    <Film />
    <Audio src={staticFile("premium/score.wav")} volume={0.82} />
  </>
);
export const premiumMetadata = {
  width: W,
  height: H,
  fps: FPS,
  durationInFrames: DURATION,
};
