# Tarot User App 📮

## 📋 5줄 요약
1. 타로 테마 스탬프 적립 시스템의 사용자용 React 앱
2. 전화번호 로그인 후 방문 기록 확인 및 타로 카드 선택
3. 10개 스탬프 적립 시 자동 발급되는 쿠폰 관리
4. 공지사항 확인 및 버그/불편사항 접수 기능
5. Supabase 기반 실시간 데이터 동기화

---

## 📋 목차
- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [설치 및 실행](#-설치-및-실행)
- [프로젝트 구조](#-프로젝트-구조)
- [환경 설정](#-환경-설정)
- [주요 컴포넌트](#-주요-컴포넌트)
- [데이터베이스 구조](#-데이터베이스-구조)

---

## 🎯 프로젝트 소개

**Tarot User App**은 타로 테마의 고객 스탬프 적립 및 방문 기록 관리 시스템의 사용자용 애플리케이션입니다. 

고객은 매장 방문 후 10장의 타로 카드 중 하나를 선택하고 방문 소감을 기록할 수 있으며, 스탬프 10개를 모으면 자동으로 쿠폰이 발급됩니다. 보라-네이비 그라데이션과 금색 포인트의 신비로운 타로 테마 디자인이 특징입니다.

---

## ✨ 주요 기능

### 1. 🔐 로그인
- 전화번호 기반 간편 로그인 (010-XXXX-XXXX 형식)
- 로그인 정보 저장 옵션
- 관리자 앱에서 등록된 고객만 접근 가능

### 2. 🏠 홈 (방문 기록)
- 전체 방문 기록 조회 (날짜별 정렬)
- 현재 스탬프 / 총 방문 횟수 / 보유 쿠폰 통계
- 각 방문마다 선택한 타로 카드 확인
- 100자 이내 방문 리뷰 작성 및 수정
- 방문 기록 삭제 기능

### 3. 🃏 타로 카드 선택
- 10종의 타로 카드 중 선택
  - 🃏 The Fool (새로운 시작)
  - 🎩 The Magician (창조와 의지)
  - 👸 The Empress (풍요와 사랑)
  - 🤴 The Emperor (권위와 안정)
  - ⚖️ Justice (정의와 균형)
  - 🌙 The Moon (직관과 꿈)
  - ☀️ The Sun (성공과 기쁨)
  - ⭐ The Star (희망과 영감)
  - 🎭 The Lovers (선택과 사랑)
  - 🔱 The Devil (유혹과 집착)
- 선택한 카드와 함께 방문 소감 기록 (선택사항)

### 4. 🎟️ 쿠폰 관리
- 보유 쿠폰 전체 조회
- 쿠폰 유형별 분류
  - ⭐ 스탬프 쿠폰: 10개 적립 시 자동 발급 (무제한 보관)
  - 🎂 생일 쿠폰: 생일 전후 15일간 사용 가능
- 쿠폰 사용 기능 (관리자 비밀번호 필요)
- 발급일 및 만료일 표시

### 5. 📢 공지사항
- 매장 공지사항 실시간 확인
- 고정 공지 우선 표시
- 읽음 상태 자동 관리
- 안 읽은 공지사항 개수 배지 표시

### 6. 🛠️ 버그/불편사항 접수
- 앱 버그 및 매장 불편사항 접수
- 카테고리별 분류 (앱/가게)
- 접수 내역 조회 및 처리 상태 확인
- 관리자 답변 확인 (읽음 표시)

---

## 🛠️ 기술 스택

### Frontend
- **React** 19.2.0 - UI 프레임워크
- **React DOM** 19.2.0 - DOM 렌더링
- **CSS3** - 커스텀 스타일링 (그라데이션, 애니메이션)

### Backend & Database
- **Supabase** 2.75.1
  - PostgreSQL 데이터베이스
  - Row Level Security (RLS)
  - 실시간 데이터 동기화

### Build & Dev Tools
- **React Scripts** 5.0.1 - CRA 기반 빌드 시스템
- **Testing Library** - 컴포넌트 테스팅

---

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd tarot-user-app
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`src/supabaseClient.js` 파일에서 Supabase 정보를 설정합니다:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 4. 개발 서버 실행
```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속

### 5. 프로덕션 빌드
```bash
npm run build
```

---

## 📁 프로젝트 구조

```
tarot-user-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── BugReport.js      # 버그 리포트 컴포넌트
│   │   ├── CardSelection.js  # 타로 카드 선택
│   │   ├── CouponView.js     # 쿠폰 관리
│   │   ├── History.js        # 방문 기록 (홈)
│   │   ├── LoginScreen.js    # 로그인 화면
│   │   └── Notice.js         # 공지사항 & 버그 접수
│   ├── supabaseClient.js     # Supabase 클라이언트 설정
│   ├── App.js                # 메인 앱 컴포넌트
│   ├── App.css               # 전역 스타일
│   ├── index.js              # React 진입점
│   └── index.css             # 기본 스타일
├── package.json
└── README.md
```

---

## ⚙️ 환경 설정

### Supabase 설정

#### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. Settings → API에서 URL과 anon key 확인

#### 2. 데이터베이스 테이블 생성
제공된 SQL 스크립트 실행:
- `customers` - 고객 정보
- `visit_history` - 방문 기록
- `coupon_history` - 쿠폰 발급 기록
- `notices` - 공지사항
- `notice_reads` - 공지사항 읽음 상태
- `bug_reports` - 버그 리포트

#### 3. RLS (Row Level Security) 활성화
모든 테이블에 대해 RLS 정책 설정 (제공된 SQL 스크립트 사용)

---

## 🧩 주요 컴포넌트

### App.js
- 전체 앱의 상태 관리
- 화면 전환 로직 (login/history/coupon/notice/select)
- 하단 네비게이션 바
- 안 읽은 공지사항 배지 표시

### LoginScreen.js
- 전화번호 입력 및 자동 포맷팅 (010-XXXX-XXXX)
- 로그인 정보 저장 옵션 (localStorage)
- 고객 존재 여부 확인

### History.js
- 방문 기록 리스트 표시
- 스탬프/방문/쿠폰 통계
- 타로 카드 및 리뷰 표시
- 리뷰 추가/수정 기능
- 방문 기록 삭제

### CardSelection.js
- 10종 타로 카드 그리드 표시
- 카드 선택 및 하이라이트
- 100자 이내 리뷰 작성
- 선택 완료 후 데이터베이스 업데이트

### CouponView.js
- 보유 쿠폰 통계 (스탬프/생일 분리)
- 쿠폰 유형별 섹션 구분
- 쿠폰 선택 및 사용 (비밀번호 확인)
- 쿠폰 상세 정보 (발급일, 만료일)

### Notice.js
- 공지사항 목록 (고정 공지 우선)
- 버그/불편사항 접수 폼
- 내 접수 내역 조회
- 관리자 답변 확인
- 읽음 상태 자동 업데이트

---

## 🗄️ 데이터베이스 구조

### customers (고객)
```sql
- id: bigint (PK)
- phone_number: text (UNIQUE)
- nickname: text
- birthday: text
- current_stamps: integer (현재 스탬프)
- total_stamps: integer (누적 스탬프)
- coupons: integer (보유 쿠폰)
- visit_count: integer (방문 횟수)
- first_visit: timestamp
- last_visit: timestamp
```

### visit_history (방문 기록)
```sql
- id: bigint (PK)
- customer_id: bigint (FK)
- visit_date: timestamp
- stamps_added: integer
- selected_card: text (타로 카드 이름)
- card_review: text (100자 이내)
```

### coupon_history (쿠폰)
```sql
- id: bigint (PK)
- customer_id: bigint (FK)
- issued_at: timestamp
- coupon_code: text (UNIQUE)
- valid_until: timestamp (nullable)
- valid_from: timestamp
```

### notices (공지사항)
```sql
- id: bigint (PK)
- title: text
- content: text
- created_at: timestamp
- is_pinned: boolean
- is_published: boolean
```

### bug_reports (버그 리포트)
```sql
- id: bigint (PK)
- customer_id: bigint (FK)
- title: text
- description: text
- report_type: text (앱/가게)
- category: text
- status: text (접수/처리중/완료)
- admin_response: text
- response_read: boolean
```

---

## 🌐 배포

### Vercel 배포 (권장)
```bash
npm install -g vercel
vercel
```

### Netlify 배포
```bash
npm run build
# build 폴더를 Netlify에 드래그 앤 드롭
```

### GitHub Pages 배포
```bash
npm install --save-dev gh-pages
```

`package.json`에 추가:
```json
"homepage": "https://yourusername.github.io/tarot-user-app",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

배포 실행:
```bash
npm run deploy
```

---

## 🎨 디자인 특징

### 색상 팔레트
- **보라-네이비 그라데이션**: 메인 배경 및 카드
- **금색 (Gold)**: 강조 색상, 테두리, 타이틀
- **라벤더**: 서브 텍스트
- **레드**: 버그 리포트, 로그아웃 버튼

### 애니메이션
- 카드 호버 시 확대 및 그림자 효과
- 로딩 중 펄스 애니메이션
- 페이드 인/아웃 전환

### 반응형 디자인
- 모바일 우선 설계
- 768px 이하: 단일 컬럼 레이아웃
- 태블릿/데스크톱: 그리드 레이아웃

---

## 🔧 개발 가이드

### 새 컴포넌트 추가
1. `src/components/` 폴더에 컴포넌트 생성
2. `App.js`에서 import 및 라우팅 추가
3. 필요시 `App.css`에 스타일 추가

### Supabase 쿼리 예시
```javascript
// 데이터 조회
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

// 데이터 삽입
const { error } = await supabase
  .from('table_name')
  .insert({ column: value });

// 데이터 업데이트
const { error } = await supabase
  .from('table_name')
  .update({ column: value })
  .eq('id', id);
```

**Made with LSS**
