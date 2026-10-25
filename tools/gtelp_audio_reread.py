# 청취 '문제 다시 듣기' 음성: 본문이 끝난 뒤 문제를 한 번 더 읽어 준다 — Now listen again to questions N through M → Number N. 문제 …
import json, sys, os, subprocess
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro, EspeakConfig
import espeakng_loader
SP = os.path.dirname(os.path.abspath(__file__)) + '/..'  # gtelp_audio_questions.py 와 같은 환경(kmodel, gen/qs.json)
os.chdir(os.path.dirname(espeakng_loader.get_data_path()))
k = Kokoro(f'{SP}/kmodel/kokoro-v1.0.onnx', f'{SP}/kmodel/voices-v1.0.bin', espeak_config=EspeakConfig(lib_path=os.path.expanduser('~/.cache/espk/libespeak-ng.dylib'), data_path=os.path.expanduser('~/.cache/espk/espeak-ng-data')))
items = json.load(open(f'{SP}/gen/qs.json')); out = sys.argv[1]; os.makedirs(out, exist_ok=True)
V = 'am_adam'
def say(t):
    a, sr = k.create(t, voice=V, speed=0.97, lang='en-us'); return a.astype(np.float32), sr
for it in items:
    dst = f'{out}/{it["id"]}_r.m4a'
    if os.path.exists(dst): continue
    n0 = it['start']; n1 = n0 + len(it['qs']) - 1
    parts = [f'Now listen again to questions {n0} through {n1}.'] + [f'Number {n0 + i}. {q}' for i, q in enumerate(it['qs'])]
    chunks = []; sr = 24000
    for j, t in enumerate(parts):
        a, sr = say(t); chunks += [a, np.zeros(int(sr * (0.9 if j < len(parts) - 1 else 0.4)), dtype=np.float32)]
    audio = np.concatenate(chunks); wav = f'{out}/{it["id"]}_r.wav'; sf.write(wav, audio, sr)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '48000', '-c', '1', wav, dst], check=True); os.remove(wav)
    print(it['id'], round(len(audio) / sr, 1), flush=True)
