/*
 * 한국사 타자 연습 데이터
 *   TY_ERAS  : 기출 문장 문제의 시대 이름과 묶음 (문장→왕·나라 연결은 kings.js)
 *   유물 사진은 art.js, 지역사 단서는 region.js
 */
window.TY_ERAS = {
  names: {
    prehistoric: '선사 시대', gojoseon: '고조선', states: '여러 나라의 성장', c4: '4세기', c5: '5세기', c6: '6세기', c7: '7세기 · 삼국 통일',
    nambuk: '남북국 시대', husamguk: '후삼국 시대', goryeo1: '고려 전기', goryeo2: '고려 후기',
    joseon1: '조선 전기', imjin: '임진왜란', horan: '조선 후기 (호란 이후)', gaehang: '조선 후기 · 개항기', colonial: '일제 강점기', modern: '광복 이후',
  },
  groups: [
    ['ancient', '고대', ['prehistoric', 'gojoseon', 'states', 'c4', 'c5', 'c6', 'c7', 'nambuk', 'husamguk']],
    ['goryeo', '고려', ['goryeo1', 'goryeo2']],
    ['joseon', '조선', ['joseon1', 'imjin', 'horan', 'gaehang']],
    ['modern', '근현대', ['colonial', 'modern']],
  ],
};
