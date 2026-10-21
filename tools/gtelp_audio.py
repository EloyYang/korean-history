# 지텔프 청취 녹음 만들기 (Kokoro TTS, kokoro-onnx). 모델 kokoro-v1.0.onnx·voices-v1.0.bin 은 <SP>/kmodel, 대본은 <SP>/gen/scripts.json
# espeak 데이터 경로가 길면 못 읽어서 ~/.cache/espk 에 복사해 쓴다. 사용: python gen.py <출력폴더> [대본id…]
import json, sys, os, subprocess
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro, EspeakConfig
import espeakng_loader
SP = os.path.dirname(os.path.abspath(__file__)) + '/..'
os.chdir(os.path.dirname(espeakng_loader.get_data_path()))
k = Kokoro(f'{SP}/kmodel/kokoro-v1.0.onnx', f'{SP}/kmodel/voices-v1.0.bin', espeak_config=EspeakConfig(lib_path=os.path.expanduser('~/.cache/espk/libespeak-ng.dylib'), data_path=os.path.expanduser('~/.cache/espk/espeak-ng-data')))
scripts = json.load(open(f'{SP}/gen/scripts.json'))
out = sys.argv[1]; only = sys.argv[2:] 
os.makedirs(out, exist_ok=True)
F, M = 'af_heart', 'am_michael'
NARR = ['af_heart', 'am_michael', 'af_bella', 'am_fenrir']
timing = {}
for si, s in enumerate(scripts):
    if only and s['id'] not in only: continue
    narr = NARR[si % len(NARR)]
    sr = 24000; chunks = []; t = []; pos = 0.0
    gap = np.zeros(int(sr * 0.45), dtype=np.float32)
    for sp, text in s['lines']:
        v = F if sp == 'F' else M if sp == 'M' else narr
        a, sr = k.create(text, voice=v, speed=1.0, lang='en-us')
        t.append(round(pos, 2)); chunks += [a.astype(np.float32), gap]; pos += (len(a) + len(gap)) / sr
    audio = np.concatenate(chunks)
    wav = f'{out}/{s["id"]}.wav'; sf.write(wav, audio, sr)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '48000', '-c', '1', wav, f'{out}/{s["id"]}.m4a'], check=True)
    os.remove(wav)
    timing[s['id']] = t
    print(s['id'], round(pos, 1), 's', flush=True)
json.dump(timing, open(f'{out}/timing.json', 'w'))
