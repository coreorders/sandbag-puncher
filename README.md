# 샌드백 펀쳐

샌드백 타격, 장비 파밍, 해골 소환, 제련과 보스 도전을 즐기는 정적 웹게임입니다.

## 실행

```powershell
python -m http.server 4173
```

브라우저에서 http://localhost:4173 을 엽니다.

## 파일

- `index.html`: 화면과 모달
- `game.css`: 현재 사용 중인 반응형 스타일
- `script_v3.js`: 게임 로직과 저장
- `arrow.png`, `skeleton_archer.png`: 소환수 이미지

이전 버전의 script/style 파일은 이력 보존용이며 현재 HTML에서 불러오지 않습니다.

## 조작과 저장

샌드백을 누르면 공격합니다. 장비/가방/루팅 탭에서 아이템을 누르면 획득,
장착, 해제, 제련 재료 선택 메뉴가 열립니다. 삭제는 확인 후 실행됩니다.
모바일에서는 아이템 목록을 세로로 스크롤할 수 있습니다.

진행은 브라우저 localStorage에 저장됩니다. 같은 주소와 브라우저에서 이어할 수 있으며
브라우저 데이터 삭제 시 사라집니다. 시작 화면에서는 기존 저장을 덮어쓰지 않습니다.
게임 시작도 기존 저장이 있으면 복구합니다.

## 검증

로컬 서버를 실행하고 Playwright CLI 브라우저를 연 뒤 실행합니다.

```powershell
node --check script_v3.js
npx --yes @playwright/cli open http://localhost:4173
npx --yes @playwright/cli run-code --filename=tests/browser-check.js
npx --yes @playwright/cli run-code --filename=tests/touch-check.js
```

검증은 테스트 브라우저에 샘플 아이템과 저장 데이터를 생성합니다.
320/390/412/768/1365/1920px 레이아웃, 장착과 합성, 저장 복구, 터치 입력,
자동공격 타이머, 거울 반지, 보스 종료, 이전 대상 화살 무효화를 점검합니다.
