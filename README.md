## 1. 패키지 설치
```
npm install
```

## 2. .env 생성 및 수정
```
ORGANIZATION=개인 organization key
OPEN_AI_API_KEY=개인 OPEN AI API KEY
```

## 3. 서버 실행
```
npm run start
```

## 4. 서버 접속
localhost:15000

기본 질문 형태와 답변형태의 페이지가 출력됨

아래에 질문 입력 후 엔터 및 메시지 전송 버튼 클릭시 응답


## 에러 LOG 발생 예측
app.ts의 17 ~ 59line llama 사용하는 부분에서 콘솔 에러 로그 발생
해당 부분은 로컬 ai 모델을 기동하는 부분으로 binary가 필요하기 때문에 없다면 에러 발생
binary는 https://huggingface.co/Pi3141/alpaca-lora-30B-ggml 에서 다운로드해서 사용 중