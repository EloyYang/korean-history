# 청취 문제 먼저 듣기 음성 만들기 (gtelp_audio.py 와 같은 환경). 입력: <SP>/gen/qs.json = [{id, part, start, qs:[문제…]}]
# 청취 '문제 먼저 듣기' 음성: 지시문 → 문제 번호와 문제 → 이제 대화/발표를 들으세요 (Kokoro, 진행자 목소리)
import json, sys, os, subprocess
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro, EspeakConfig
SP = os.path.dirname(os.path.abspath(__file__)) + '/..'
k = Kokoro(f'{SP}/kmodel/kokoro-v1.0.onnx', f'{SP}/kmodel/voices-v1.0.bin', espeak_config=EspeakConfig(lib_path=os.path.expanduser('~/.cache/espk/libespeak-ng.dylib'), data_path=os.path.expanduser('~/.cache/espk/espeak-ng-data')))
items = json.load(open(f'{SP}/gen/qs.json')); out = sys.argv[1]; os.makedirs(out, exist_ok=True)
V = 'am_adam'
def say(t):
    a, sr = k.create(t, voice=V, speed=0.97, lang='en-us'); return a.astype(np.float32), sr
for it in items:
    n0 = it['start']; n1 = n0 + len(it['qs']) - 1; kind = 'conversation' if it['part'] in (1, 3) else 'talk'
    parts = [f'Part {it["part"]}. First listen to questions {n0} through {n1}.'] + [f'Number {n0 + i}. {q}' for i, q in enumerate(it['qs'])] + [f'Now listen to the {kind}.']
    chunks = []; sr = 24000
    for j, t in enumerate(parts):
        a, sr = say(t); chunks += [a, np.zeros(int(sr * (0.9 if j < len(parts) - 1 else 0.6)), dtype=np.float32)]
    audio = np.concatenate(chunks); wav = f'{out}/{it["id"]}_q.wav'; sf.write(wav, audio, sr)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '48000', '-c', '1', wav, f'{out}/{it["id"]}_q.m4a'], check=True); os.remove(wav)
    print(it['id'], round(len(audio) / sr, 1), flush=True)
