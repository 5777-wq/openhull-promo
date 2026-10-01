from pathlib import Path
import json
import sys
import shutil
import numpy as np
from scipy.interpolate import PchipInterpolator
from fontTools import subset

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'premium'
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, 'D:/OpenHull/上传区/src')
from openhull.cli import run_taskbook

summary = run_taskbook(
    str(Path(__file__).with_name('taskbook.yaml')),
    report_path=str(OUT / 'design-report.md'),
    hydro_curve_chart=str(OUT / 'hydro_curves.png'),
    arrangement_chart_path=str(OUT / 'arrangement.png'),
    arrangement_dxf_path=str(OUT / 'arrangement.dxf'),
)
def json_default(value):
    if hasattr(value, 'tolist'):
        return value.tolist()
    raise TypeError(type(value).__name__)
(OUT / 'design-data.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2, default=json_default), encoding='utf8')
Path(__file__).with_name('design-data.ts').write_text('export const designData = ' + json.dumps(summary, ensure_ascii=False, default=json_default) + ' as const;\n', encoding='utf8')

# The visual surface is a display-only interpolation of published Series 60 offsets.
# It is never passed back into the engineering calculation.
import csv
source = Path('D:/OpenHull/上传区/examples/data/parent_hull_offsets.csv')
with source.open(encoding='utf-8-sig') as f:
    rows = list(csv.reader(line for line in f if not line.startswith('#')))
body = rows[1:-1]
maxima = np.array([float(v) for v in rows[-1][1:9]])
fractions = np.array([0, .075, .25, .5, .75, 1, 1.25, 1.5])
stations = np.array([0 if r[0] == 'AP' else 1 if r[0] == 'FP' else 1-float(r[0])/20 for r in body])
order = np.argsort(stations)
stations = stations[order]
y = np.array([[float(v) for v in row[1:9]] for row in body])[order] * maxima
xs = np.linspace(0, 1, 151)
zs = np.linspace(0, 1.5, 49)
yx = PchipInterpolator(stations, y, axis=0)(xs)
grid = np.maximum(PchipInterpolator(fractions, yx, axis=1)(zs), 0)
L = 14.0
B = L / 6.0
T = B / 2.7
D = 1.5*T
position = []
indices = []
for sign in [1, -1]:
    base = len(position)//3
    for i, x in enumerate(xs):
        for j, z in enumerate(zs):
            position.extend([(x-.5)*L, z*T-D*.50, sign*grid[i,j]*B/2])
    for i in range(len(xs)-1):
        for j in range(len(zs)-1):
            a=base+i*len(zs)+j; b=a+len(zs); c=b+1; d=a+1
            indices.extend([a,b,d,b,c,d] if sign>0 else [a,d,b,b,d,c])
# Close the flat bottom and deck, keeping their surface normals separate.
for j in [0,len(zs)-1]:
    base=len(position)//3
    for i,x in enumerate(xs):
        for sign in [1,-1]:
            position.extend([(x-.5)*L,zs[j]*T-D*.50,sign*grid[i,j]*B/2])
    for i in range(len(xs)-1):
        a=base+2*i; b=a+2
        indices.extend([a,a+1,b,b,a+1,b+1] if j==0 else [a,b,a+1,b,b+1,a+1])
for i in [0,len(xs)-1]:
    base=len(position)//3
    for j,z in enumerate(zs):
        for sign in [1,-1]:
            position.extend([(xs[i]-.5)*L,z*T-D*.50,sign*grid[i,j]*B/2])
    for j in range(len(zs)-1):
        a=base+2*j; b=a+2
        indices.extend([a,b,a+1,b,b+1,a+1] if i==0 else [a,a+1,b,b,a+1,b+1])
lines=[]
for i in range(0,len(xs),6):
    line=[]
    for sign, seq in [(1,range(len(zs))),(-1,range(len(zs)-1,-1,-1))]:
        for j in seq:
            line.extend([(xs[i]-.5)*L,zs[j]*T-D*.50,sign*(grid[i,j]*B/2+.003)])
    lines.append(line)
for j in [0,4,8,16,24,32,40,48]:
    for sign in [-1,1]:
        lines.append([v for i,x in enumerate(xs) for v in [(x-.5)*L,zs[j]*T-D*.50,sign*(grid[i,j]*B/2+.004)]])
mesh={'positions':np.round(position,6).tolist(),'indices':indices,'lines':np.round(lines,6).tolist() if len(set(map(len,lines)))==1 else [np.round(a,6).tolist() for a in lines], 'dimensions':{'length':L,'beam':B,'draft':T,'depth':D}}
(OUT/'series60-display.json').write_text(json.dumps(mesh,separators=(',',':')),encoding='utf8')
Path(__file__).with_name('hull-data.ts').write_text('export const hullData = '+json.dumps(mesh,separators=(',',':'))+';\n',encoding='utf8')

text='一条船的可能从这里开始一份任务书让设计连成一体主尺度重量平衡参数化船型静水力稳性校核看见每个决定的依据阻力推进螺旋桨设计耐波性估算方案空间扫描由智能体编排为船舶工程师服务中文报告型值表分层可复现可追溯公开基准验证以工程纪律建立信任超出适用范围明确拒算专业判断始终留给工程师开源探索仍在继续初步设计阶段欢迎与你共建示意动画真实计算数据散货船载重量服务航速设计吃水示例方案声明平衡开启更多可能'
text += ''.join(chr(i) for i in range(32,127))+'。，、：；（）·—±°×ηΔ∇²³≈%'
for font_name, path in [('OpenHullSans','C:/Windows/Fonts/NotoSansSC-VF.ttf'),('OpenHullLatin','C:/Windows/Fonts/SourceSans3-Regular.ttf')]:
    font=subset.load_font(path,subset.Options())
    sub=subset.Subsetter(options=subset.Options())
    sub.populate(text=text)
    sub.subset(font)
    subset.save_font(font,str(OUT/(font_name+'.ttf')),subset.Options())
print('assets ready',OUT)
print('design', {k:summary[k] for k in ['lpp_m','beam_m','draft_m','depth_m','cb_achieved']})
print('gz',summary['gz_curve'])
print('propeller',summary['propeller_design'])
