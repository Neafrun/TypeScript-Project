# API 테스트 가이드

## 문제 해결: "Failed to fetch" 에러

### 1. 브라우저 콘솔에서 직접 테스트

브라우저 개발자 도구(F12)를 열고 Console 탭에서 다음 명령어를 실행하세요:

```javascript
// 서버 연결 테스트
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ 서버 연결 성공:', data))
  .catch(err => console.error('❌ 서버 연결 실패:', err));

// AI 분석 API 테스트
fetch('http://localhost:5000/api/ai/public/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    owner: 'BenefitMap',
    repo: 'BenefitMap',
    model: 'openai',
    analysisType: 'general'
  })
})
  .then(res => res.json())
  .then(data => console.log('✅ API 테스트 성공:', data))
  .catch(err => console.error('❌ API 테스트 실패:', err));
```

### 2. 클라이언트 재시작

1. 클라이언트 터미널에서 **Ctrl+C**로 완전히 종료
2. 다음 명령어 실행:
   ```bash
   cd gitlog/client
   npm start
   ```

### 3. 브라우저 캐시 삭제

1. **Chrome/Edge**: Ctrl+Shift+Delete → 캐시된 이미지 및 파일 삭제
2. **또는**: Ctrl+Shift+R로 하드 리프레시
3. **또는**: 시크릿 모드에서 테스트

### 4. 개발자 도구 확인

1. F12를 눌러 개발자 도구 열기
2. **Console 탭**에서 다음 메시지 확인:
   - `🔧 [API] API 기본 URL 설정: http://localhost:5000`
   - `🔧 [API] POST 요청: http://localhost:5000/api/ai/public/analyze`
3. **Network 탭**에서:
   - 요청이 `http://localhost:5000/api/ai/public/analyze`로 가는지 확인
   - 요청 상태 코드 확인 (200이어야 함)
   - CORS 에러가 있는지 확인

### 5. 서버 콘솔 확인

서버 터미널에서 다음 메시지가 표시되는지 확인:
- `📦 [더미 데이터] 더미 데이터 모드가 활성화되었습니다.`
- `📥 [공개 AI 분석] 요청 받음: POST /api/ai/public/analyze`

### 6. 문제가 계속되면

1. **방화벽 확인**: Windows 방화벽이 localhost:5000을 차단하지 않는지 확인
2. **포트 확인**: 다른 프로그램이 포트 5000을 사용하지 않는지 확인
3. **브라우저 확인**: 다른 브라우저에서 테스트 (Chrome, Edge, Firefox)

## 예상 결과

정상 작동 시:
- 브라우저 콘솔: `✅ [API] 응답 성공: {...}`
- 서버 콘솔: `📦 [더미 데이터] 더미 데이터를 사용하여 응답합니다.`
- 화면: BenefitMap 레포지토리 분석 결과 표시

