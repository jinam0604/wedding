/**
 * Original Warm Wedding Invitation Configuration
 *
 * 이 파일에서 청첩장의 모든 정보를 수정할 수 있습니다.
 * 이미지는 설정이 필요 없습니다. 아래 폴더에 순번 파일명으로 넣으면 자동 감지됩니다.
 *
 * 이미지 폴더 구조 (파일명 규칙):
 *   images/hero/1.jpg      - 메인 사진 (1장, 필수)
 *   images/story/1.jpg, 2.jpg, ...  - 스토리 사진들 (순번, 자동 감지)
 *   images/gallery/1.jpg, 2.jpg, ... - 갤러리 사진들 (순번, 자동 감지)
 *   images/location/1.jpg  - 약도/지도 이미지 (1장)
 *   images/og/1.jpg        - 카카오톡 공유 썸네일 (1장)
 */

const CONFIG = {
  // ── 초대장 열기 ──
  useCurtain: true,  // 커튼 열림 애니메이션 사용 여부 (true: 사용, false: 바로 본문 표시)

  // ── 메인 (히어로) ──
  groom: {
    name: "남지훈",
    father: "",
    mother: "이병숙",
    fatherDeceased: false,
    motherDeceased: false
  },

  bride: {
    name: "안경진",
    father: "안승출",
    mother: "정음미",
    fatherDeceased: false,
    motherDeceased: false
  },

  wedding: {
    date: "2026-06-21",
    time: "12:30",
    venue: "메리빌리아 더 프레스티지",
    address: "수원시 권선구 세화로 116",
    mapLinks: {
      kakao: "https://kko.to/FeK38Q3r1b",
      naver: "https://naver.me/5apDP7nI"
    }
  },

  // ── 우리의 이야기 ──
  story: {
    title: "우리의 이야기",
    content: "싱그러운 6월\n소중한 인연의 결실을 맺습니다.\n\n저희 두 사람의 새로운 시작을\n따뜻한 마음으로 축하해 주세요."
  },

  // ── 오시는 길 ──
  // (mapLinks는 wedding 객체 내에 포함)

  // ── 마음 전하실 곳 ──
  accounts: {
    groom: [
      { role: "신랑", name: "남지훈", bank: "국민은행", number: "205502-04-598759" },
        ],
    bride: [
      { role: "신부", name: "안경진", bank: "새마을금고", number: "9003-27-184703-6" },
    ]
  },

  // ── 링크 공유 시 나타나는 문구 ──
  meta: {
    title: "신랑 ♥ 신부 결혼합니다",
    description: "2026년 6월 21일, 소중한 분들을 초대합니다."
  }
};
