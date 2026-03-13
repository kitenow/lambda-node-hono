# lambda-node-hono

> **LLM & Developer Reference** — 이 문서는 LLM과 개발자가 프로젝트 구조, 환경 설정, 배포 방식을 빠르게 파악할 수 있도록 작성되었습니다.

---

## 📐 프로젝트 개요

**AWS Serverless 기반 풀스택 웹 애플리케이션**

- **Backend**: Node.js + [Hono](https://hono.dev/) 웹 프레임워크 → AWS Lambda + API Gateway로 배포
- **Frontend**: React 19 + Vite → AWS S3 + CloudFront로 배포
- **Database**: AWS DynamoDB (Single-Table Design)
- **인증**: JWT (HttpOnly Cookie) + Rate Limiting

---

## 🗂️ 모노레포 구조`

```
lambda-node-hono/
├── apps/
│   ├── backend/                    # Hono API 서버 (Serverless)
│   │   ├── src/
│   │   │   ├── index.ts            # 앱 진입점: CORS 설정, 라우팅 등록
│   │   │   ├── account/
│   │   │   │   └── auth.ts         # 인증 라우터 (signup/login/logout/reset)
│   │   │   ├── users.ts            # /users 라우터
│   │   │   ├── snippets.ts         # /snippets 라우터
│   │   │   ├── me.ts               # /me 라우터 (북마크, 투두)
│   │   │   └── dynamo/
│   │   │       └── client.ts       # DynamoDB 클라이언트 싱글턴
│   │   ├── serverless-resources/
│   │   │   ├── dynamo.yml          # DynamoDB 테이블 CloudFormation 정의
│   │   │   └── iam.yml             # Lambda IAM 권한 정의
│   │   ├── serverless.yml          # Serverless Framework 설정
│   │   ├── .env                    # 로컬 환경변수 (gitignore 권장)
│   │   └── package.json
│   └── frontend/                   # React + Vite 앱
│       ├── src/
│       │   ├── main.tsx            # 앱 진입점
│       │   ├── App.tsx             # 라우터 + PrivateRoute 인증 가드
│       │   ├── components/
│       │   │   ├── Layout.tsx      # Sidebar + Outlet 레이아웃
│       │   │   └── Sidebar.tsx     # 네비게이션 사이드바
│       │   └── pages/
│       │       ├── Login.tsx
│       │       ├── Signup.tsx
│       │       ├── ForgotPassword.tsx
│       │       ├── ResetPassword.tsx
│       │       ├── Home.tsx
│       │       ├── Invest.tsx
│       │       ├── Snippet.tsx     # 코드 스니펫 관리
│       │       └── Me.tsx          # 북마크 + Todo 관리
│       └── package.json
├── docker/
│   └── dynamodb/                   # 로컬 DynamoDB 데이터 영속 저장
├── docker-compose.yml              # 로컬 DynamoDB 에뮬레이터
└── package.json                    # npm workspaces 루트
```

---

## ⚙️ 기술 스택 상세

### Backend

| 항목 | 내용 |
|---|---|
| 런타임 | Node.js 20.x |
| 웹 프레임워크 | [Hono](https://hono.dev/) v4 |
| 배포 방식 | Serverless Framework v3 → AWS Lambda |
| 번들러 | esbuild (serverless-esbuild) |
| DB SDK | `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb` |
| 인증 | `jsonwebtoken` (JWT) + `bcryptjs` (비밀번호 해시) |
| 보안 | `hono-rate-limiter` (IP 기반 Rate Limiting) |
| 로컬 개발 | `serverless-offline` (port 3000) |
| 환경변수 로딩 | `serverless-dotenv-plugin` (`.env` 파일) |

### Frontend

| 항목 | 내용 |
|---|---|
| 프레임워크 | React 19 |
| 빌드 도구 | Vite 7 |
| 라우팅 | React Router DOM v7 |
| 스타일 | TailwindCSS v4 (PostCSS 방식) |
| 언어 | TypeScript |
| 로컬 개발 | `vite dev` (port 5173) |
| API 통신 | `fetch` API (`credentials: 'include'` — 쿠키 포함 요청) |

---

## 🔌 API 라우팅 구조

```
BASE_URL = http://localhost:3000  (local)
         = https://<api-id>.execute-api.us-west-2.amazonaws.com  (prod)

/auth
  POST /signup            회원가입 (rate limited: 15분 5회)
  POST /login             로그인 → JWT를 HttpOnly Cookie로 발급
  GET  /me                세션 확인 (JWT 검증 후 유저 정보 반환)
  POST /logout            로그아웃 (쿠키 삭제)
  POST /forgot-password   비밀번호 재설정 토큰 생성 (rate limited)
  POST /reset-password    토큰으로 비밀번호 변경

/users
  GET  /                  전체 유저 목록 조회
  POST /                  유저 생성 (관리용)

/snippets
  GET    /                스니펫 목록 조회
  POST   /                스니펫 생성 { title, code, language }
  DELETE /:id             스니펫 삭제

/me
  GET    /bookmarks       북마크 목록 조회
  POST   /bookmarks       북마크 추가 { title, url }
  DELETE /bookmarks/:id   북마크 삭제
  GET    /todos           투두 목록 조회
  POST   /todos           투두 생성 { task }
  PUT    /todos/:id       투두 완료 처리 { completed: boolean }
  DELETE /todos/:id       투두 삭제
```

---

## 🔒 인증 흐름

```
1. POST /auth/login  →  비밀번호 검증 (bcrypt)
2. JWT 생성          →  { userId, email }, exp: 1h
3. Set-Cookie        →  token=<JWT>; HttpOnly; Secure; SameSite=...
                            ↳ 로컬(dev): SameSite=Lax, Secure=false
                            ↳ 배포(prod): SameSite=None, Secure=true

4. 이후 API 요청     →  Cookie 자동 첨부 (또는 Authorization: Bearer <token>)
5. PrivateRoute      →  GET /auth/me 호출로 세션 검증 → 실패 시 /login 리다이렉트

Rate Limiting:
  - /auth/login, /auth/signup, /auth/forgot-password
  - windowMs: 15분 / limit: 5회 / keyGenerator: IP 주소
```

---

## 🗄️ DynamoDB 테이블 설계 (Single-Table)

테이블명: `backend-dev` (dev) / `backend-prod` (prod)

**파티션 키**: `id` (String)

모든 엔티티를 하나의 테이블에서 `type` 필드로 구분합니다.

| type | 설명 | 주요 필드 |
|---|---|---|
| `USER` | 유저 계정 | `id`, `email`, `password`(hash), `name`, `createdAt` |
| `SNIPPET` | 코드 스니펫 | `id`, `title`, `code`, `language`, `createdAt` |
| `BOOKMARK` | 북마크 | `id`, `title`, `url`, `createdAt` |
| `TODO` | 투두 항목 | `id`, `task`, `completed`, `createdAt` |
| `RESET_TOKEN` | 비밀번호 재설정 토큰 | `id`(`RESET#<uuid>`), `userId`, `expiry` |

**IAM 권한**: Lambda에는 `Query`, `Scan`, `GetItem`, `PutItem`, `UpdateItem`, `DeleteItem` 권한이 부여됩니다.

> ⚠️ **주의**: 현재 조회는 `ScanCommand`를 사용합니다. 데이터 규모가 커지면 GSI(Global Secondary Index)와 `QueryCommand` 도입이 필요합니다.

---

## 🐳 Docker 구성 (로컬 개발용)

```yaml
# docker-compose.yml
services:
  dynamodb-local:          # DynamoDB 로컬 에뮬레이터
    image: amazon/dynamodb-local:latest
    port: 8000             # backend에서 http://127.0.0.1:8000 으로 접근
    volume: ./docker/dynamodb  # 데이터 파일 영속 저장 (컨테이너 재시작 후에도 유지)

  dynamodb-admin:          # DynamoDB 웹 GUI
    image: aaronshaf/dynamodb-admin
    port: 8001             # 브라우저에서 http://localhost:8001 접근
    env:
      DYNAMO_ENDPOINT: http://dynamodb-local:8000
      AWS_REGION: us-east-1
      AWS_ACCESS_KEY_ID: local      # 로컬용 더미 값
      AWS_SECRET_ACCESS_KEY: local  # 로컬용 더미 값
```

**DynamoDB 로컬 연동**: `serverless.yml`의 `custom.dynamoEndpoint.dev`가 `http://127.0.0.1:8000`으로 설정되어 있어, dev 스테이지에서는 로컬 컨테이너를 바라봅니다. prod 스테이지에서는 빈 문자열(`""`)이므로 AWS SDK가 실제 AWS DynamoDB로 자동 연결됩니다.

---

## 🖥️ 로컬 개발 환경 기동

### 사전 요구사항

- Node.js 20.x 이상
- Docker Desktop
- AWS CLI (배포 시 필요)
- Serverless Framework v3: `npm install -g serverless`

### 1단계: 의존성 설치

```bash
# 루트에서 실행 (모노레포 전체 설치)
npm install
```

### 2단계: 환경변수 설정

```bash
# apps/backend/.env 파일 생성
JWT_SECRET=your-local-secret-key
# DYNAMO_ENDPOINT는 serverless.yml에서 dev 스테이지는 자동으로 http://127.0.0.1:8000 사용
```

### 3단계: DynamoDB 로컬 실행

```bash
# 루트 디렉토리에서
docker-compose up -d

# DynamoDB 에뮬레이터:  http://localhost:8000
# DynamoDB 웹 GUI:      http://localhost:8001
```

### 4단계: DynamoDB 테이블 생성 (최초 1회)

```bash
cd apps/backend
npx serverless dynamodb:setup   # 또는 아래 AWS CLI 명령 직접 실행

# AWS CLI로 직접 생성:
aws dynamodb create-table \
  --table-name backend-dev \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --endpoint-url http://localhost:8000
```

### 5단계: Backend 서버 실행

```bash
cd apps/backend
npm run dev
# → http://localhost:3000 (serverless-offline)
# → Lambda 에뮬레이터: http://localhost:3002
```

### 6단계: Frontend 서버 실행

```bash
cd apps/frontend
npm run dev
# → http://localhost:5173 (Vite)
```

### 로컬 포트 정리

| 서비스 | 포트 | 설명 |
|---|---|---|
| Frontend (Vite) | 5173 | React 앱 |
| Backend API | 3000 | serverless-offline HTTP 서버 |
| Lambda 에뮬레이터 | 3002 | serverless-offline Lambda 서버 |
| DynamoDB 에뮬레이터 | 8000 | amazon/dynamodb-local |
| DynamoDB 관리 UI | 8001 | dynamodb-admin |

---

## 🚀 배포

### 환경 변수 관리

| 변수 | 설명 | 설정 위치 |
|---|---|---|
| `JWT_SECRET` | JWT 서명 키 | `.env` (로컬) / AWS Systems Manager Parameter Store (prod 권장) |
| `DYNAMODB_TABLE` | DynamoDB 테이블명 | `serverless.yml`에서 자동 생성 (`backend-{stage}`) |
| `DYNAMO_ENDPOINT` | DynamoDB 엔드포인트 | dev: `http://127.0.0.1:8000`, prod: 빈값(AWS 기본값) |
| `NODE_ENV` | 실행 환경 | `serverless.yml`에서 stage 값으로 자동 설정 |
| `VITE_API_URL` | Frontend → Backend API URL | frontend 빌드 시 `.env` 또는 CI/CD 환경변수 |

### Backend 배포 (AWS Lambda + API Gateway)

```bash
cd apps/backend

# dev 환경 배포
npm run deploy
# 내부적으로: serverless deploy --stage dev

# prod 환경 배포
npx serverless deploy --stage prod
```

배포 완료 후 출력되는 `endpoint` URL을 frontend의 `VITE_API_URL`에 설정합니다.

**배포 결과물**:
- AWS Lambda 함수: `backend-{stage}-api`
- AWS API Gateway: REST API (모든 경로 프록시)
- AWS DynamoDB 테이블: `backend-{stage}` (CloudFormation으로 자동 생성)

### Frontend 배포 (AWS S3 + CloudFront)

```bash
cd apps/frontend

# 빌드 (.env에 VITE_API_URL 설정 후)
VITE_API_URL=https://<api-id>.execute-api.us-west-2.amazonaws.com npm run build

# S3에 업로드 (버킷명은 실제 값으로 교체)
aws s3 sync dist/ s3://lambda-node-hono --delete

# CloudFront 캐시 무효화
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

**배포 도메인 예시**:
- Frontend: `https://d2nybw662z7eao.cloudfront.net`
- Backend: `https://gjqvt44n0m.execute-api.us-west-2.amazonaws.com`

### CORS 설정 (중요)

`apps/backend/src/index.ts`의 `allowedOrigins` 배열에 새 도메인을 추가해야 합니다:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://d2nybw662z7eao.cloudfront.net',
  'http://lambda-node-hono.s3-website-us-west-2.amazonaws.com',
]
```

---

## 🔑 AWS 권한 요구사항

Backend Lambda 실행 역할에 필요한 DynamoDB 권한 (`serverless-resources/iam.yml`):

```yaml
- dynamodb:Query
- dynamodb:Scan
- dynamodb:GetItem
- dynamodb:PutItem
- dynamodb:UpdateItem
- dynamodb:DeleteItem
```

대상 리소스: `arn:aws:dynamodb:{region}:*:table/{DYNAMODB_TABLE}`

---

## 🗺️ Frontend 라우팅

| 경로 | 컴포넌트 | 인증 필요 |
|---|---|---|
| `/login` | Login.tsx | ❌ |
| `/signup` | Signup.tsx | ❌ |
| `/forgot-password` | ForgotPassword.tsx | ❌ |
| `/reset-password` | ResetPassword.tsx | ❌ |
| `/` | Home.tsx | ✅ |
| `/invest` | Invest.tsx | ✅ |
| `/snippet` | Snippet.tsx | ✅ |
| `/me` | Me.tsx | ✅ |

**`PrivateRoute`**: `GET /auth/me` 호출로 세션 검증. `localStorage`의 `token` 또는 Cookie를 사용하며 실패 시 `/login`으로 리다이렉트.

---

## 📦 주요 scripts

```bash
# 루트
npm install               # 전체 의존성 설치 (workspaces)

# Backend (apps/backend)
npm run dev               # 로컬 개발 서버 (serverless offline)
npm run deploy            # AWS 배포 (dev stage)

# Frontend (apps/frontend)
npm run dev               # Vite 개발 서버
npm run build             # 프로덕션 빌드 (dist/ 생성)
npm run preview           # 빌드 결과 로컬 미리보기
npm run lint              # ESLint 검사
```

---

## 🧩 LLM 참조용 핵심 설계 결정사항

1. **Single-Table DynamoDB**: 모든 엔티티(`USER`, `SNIPPET`, `BOOKMARK`, `TODO`, `RESET_TOKEN`)를 단일 테이블에 저장하고 `type` 필드로 구분. `id`가 유일한 파티션 키.

2. **Hono on Lambda**: Express 대신 Hono를 사용. `hono/aws-lambda`의 `handle()`로 Lambda 핸들러를 생성. `serverless.yml`의 `handler: src/index.handler`가 진입점.

3. **이중 인증 방식**: 쿠키(`token`) 우선, 없으면 `Authorization: Bearer` 헤더 확인. 프로덕션에서는 `Secure=true, SameSite=None` (cross-origin 쿠키 허용).

4. **esbuild 번들링**: TypeScript를 esbuild로 번들링 후 Lambda에 업로드. `serverless-esbuild` 플러그인 사용.

5. **환경별 DynamoDB 연결**: `serverless.yml`의 `custom.dynamoEndpoint`를 통해 dev → 로컬 Docker, prod → 빈값(AWS 실제 엔드포인트) 자동 전환.


DynamoDB Local	✅ Running	http://localhost:8000
DynamoDB Admin UI	✅ Running	http://localhost:8001
Backend (serverless-offline)	✅ Running	http://localhost:3000
Frontend (Vite)	✅ Running	http://localhost:5173