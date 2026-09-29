// ==========================================================
// main.js — 포트폴리오의 모든 인터랙션
// 핵심 흐름: 사용자 이벤트 → 상태 변경 → 화면 업데이트(render)
// ==========================================================

// ---------- 1. 햄버거 메뉴 ----------
const navToggle = document.querySelector('#nav-toggle');
const navMenu = document.querySelector('#nav-menu');

const toggleMenu = () => {
  const isOpen = navMenu.classList.toggle('active'); // 토글 후 active가 있으면 true
  navToggle.textContent = isOpen ? '✕' : '☰';
  navToggle.setAttribute('aria-expanded', isOpen);
  navToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
};

const closeMenu = () => {
  navMenu.classList.remove('active');
  navToggle.textContent = '☰';
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', '메뉴 열기');
};

navToggle.addEventListener('click', toggleMenu);

// ---------- 2. 부드러운 스크롤 ----------
// href가 '#'으로 시작하는 모든 링크 (메뉴, 로고, Hero 버튼)
const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href'); // 예: '#about'
    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault(); // 기본 동작(순간 이동)을 막고
    target.scrollIntoView({ behavior: 'smooth' }); // 직접 부드럽게 이동
    closeMenu(); // 모바일: 메뉴를 고른 뒤 닫기
  });
});

// ---------- 3. 스크롤 반응: 네비 배경 + 맨 위로 버튼 ----------
const header = document.querySelector('#header');
const scrollTopBtn = document.querySelector('#scroll-top');
const NAV_SCROLL_THRESHOLD = 60; // 이 값(px) 이상 스크롤하면 네비 배경 변경
const TOP_BUTTON_THRESHOLD = 300; // 이 값(px) 이상 스크롤하면 맨 위로 버튼 표시

const handleScroll = () => {
  const { scrollY } = window; // 현재 세로 스크롤 위치 (구조분해 할당)

  if (scrollY >= NAV_SCROLL_THRESHOLD) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  if (scrollY >= TOP_BUTTON_THRESHOLD) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
};

window.addEventListener('scroll', handleScroll);
handleScroll(); // 페이지 중간에서 새로고침해도 처음부터 올바른 상태로

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---------- 4. 푸터 연도 ----------
document.querySelector('#year').textContent = new Date().getFullYear();

// ---------- 5. 다크 모드 (이벤트 → 상태 → 렌더링) ----------
const themeToggle = document.querySelector('#theme-toggle');
const THEME_KEY = 'theme';

// 처음 상태 정하기: ① 저장된 값 → ② OS 설정(prefers-color-scheme) → ③ light
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) return savedTheme;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

// [상태]
let theme = getInitialTheme();

// [렌더링] 상태를 화면에 반영한다. 화면을 바꾸는 코드는 여기에만 둔다.
const renderTheme = () => {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
};

// [상태 변경] 상태를 바꾸고, 저장하고, 다시 그린다.
const setTheme = (nextTheme) => {
  theme = nextTheme;
  localStorage.setItem(THEME_KEY, theme);
  renderTheme();
};

// [이벤트]
themeToggle.addEventListener('click', () => {
  setTheme(theme === 'dark' ? 'light' : 'dark');
});

renderTheme(); // 처음 한 번 그리기

// ---------- 6. 스크롤 애니메이션 (Intersection Observer) ----------
const REVEAL_THRESHOLD = 0.2; // 요소의 20%가 보이면 나타남

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;

    target.classList.add('visible');
    observer.unobserve(target); // 한 번 나타나면 관찰 종료
  });
}, { threshold: REVEAL_THRESHOLD });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ---------- 7. 문의 폼 유효성 검사 (입력 → 유효성 상태 → 에러 표시) ----------
const contactForm = document.querySelector('#contact-form');
const formFields = contactForm.querySelectorAll('input, textarea');
const formSuccess = document.querySelector('#form-success');
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// [상태] 필드별 에러 메시지 ('' 이면 통과)
const formErrors = { name: '', email: '', message: '' };

// 값 하나를 검사해 에러 메시지를 돌려준다. (화면은 건드리지 않음)
const validateField = (name, value) => {
  const trimmed = value.trim();

  if (name === 'name' && !trimmed) return '이름을 입력해 주세요.';
  if (name === 'email' && !trimmed) return '이메일을 입력해 주세요.';
  if (name === 'email' && !EMAIL_PATTERN.test(trimmed)) return '올바른 이메일 형식이 아닙니다. (예: me@example.com)';
  if (name === 'message' && !trimmed) return '메시지를 입력해 주세요.';
  return '';
};

// [렌더링] 한 필드의 에러 상태를 화면에 반영한다.
const renderFieldError = (name) => {
  const field = contactForm.querySelector(`#${name}`);
  const errorEl = contactForm.querySelector(`#${name}-error`);
  const message = formErrors[name];

  errorEl.textContent = message;
  if (message) {
    field.classList.add('invalid');
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
  }
};

// [상태 변경] 검사 결과를 상태에 저장하고 다시 그린다.
const setFieldError = (name, value) => {
  formErrors[name] = validateField(name, value);
  renderFieldError(name);
};

// [이벤트] 입력할 때마다 그 필드만 검사
formFields.forEach((field) => {
  field.addEventListener('input', () => {
    const { name, value } = field; // input 요소에서 name, value 꺼내기
    setFieldError(name, value);
    formSuccess.textContent = '';
  });
});

// [이벤트] 제출 시 전체 검사
contactForm.addEventListener('submit', (event) => {
  event.preventDefault(); // 페이지 새로고침(기본 제출) 막기

  formFields.forEach(({ name, value }) => setFieldError(name, value));

  const invalidNames = Object.keys(formErrors).filter((name) => formErrors[name]);
  if (invalidNames.length > 0) {
    contactForm.querySelector(`#${invalidNames[0]}`).focus(); // 첫 번째 에러 칸으로 이동
    return;
  }

  const name = contactForm.querySelector('#name').value.trim();
  formSuccess.textContent = `${name}님, 메시지가 전송되었습니다. 감사합니다!`; // 사용자 입력 → textContent
  contactForm.reset();
});

// ---------- 8. GitHub 프로젝트 (API 호출 → 로딩/성공/에러 상태 → Projects 렌더링) ----------
const GITHUB_USERNAME = 'Machinity'; // ← 본인 GitHub 아이디
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
const projectsContainer = document.querySelector('#projects-container');

// [상태] status: 'loading' | 'success' | 'error'
const projectState = { status: 'loading', repos: [], errorMessage: '' };

// 외부 데이터를 innerHTML에 넣기 전, HTML 특수문자를 글자로 바꾼다.
const escapeHTML = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// 저장소 객체 1개 → 카드 HTML 1개 (매개변수 자리에서 바로 구조분해)
const createProjectCard = ({ name, description, html_url, language, stargazers_count, updated_at }) => `
  <article class="project-card reveal">
    <h3 class="project-title">
      <a href="${html_url}" target="_blank" rel="noopener noreferrer">${escapeHTML(name)}</a>
    </h3>
    <p class="project-desc">${escapeHTML(description ?? '설명이 없습니다.')}</p>
    <div class="project-meta">
      ${language ? `<span class="tag">${escapeHTML(language)}</span>` : ''}
      <span>★ ${stargazers_count}</span>
      <span>${new Date(updated_at).toLocaleDateString('ko-KR')}</span>
    </div>
  </article>
`;

// [렌더링] 상태에 따라 네 가지 화면 중 하나를 그린다.
const renderProjects = () => {
  const { status, repos, errorMessage } = projectState;

  if (status === 'loading') {
    projectsContainer.innerHTML = `
      <div class="status">
        <div class="spinner" aria-hidden="true"></div>
        <p>로딩 중...</p>
      </div>
    `;
    return;
  }

  if (status === 'error') {
    projectsContainer.innerHTML = `
      <div class="status status-error">
        <p>프로젝트를 불러올 수 없습니다.</p>
        <p class="status-detail">${escapeHTML(errorMessage)}</p>
        <button type="button" class="btn btn-primary" id="retry-btn">다시 시도</button>
      </div>
    `;
    projectsContainer.querySelector('#retry-btn').addEventListener('click', loadProjects);
    return;
  }

  if (repos.length === 0) {
    projectsContainer.innerHTML = '<p class="status">표시할 프로젝트가 없습니다.</p>';
    return;
  }

  projectsContainer.innerHTML = `
    <div class="project-grid">
      ${repos.map(createProjectCard).join('')}
    </div>
  `;
  // 새로 만든 카드들도 스크롤 애니메이션 대상으로 등록 (07단계의 observer 재사용)
  projectsContainer.querySelectorAll('.reveal').forEach((card) => revealObserver.observe(card));
};

// [상태 변경] 바뀐 부분만 합치고 다시 그린다. (React의 setState와 같은 역할)
const setProjectState = (nextState) => {
  Object.assign(projectState, nextState);
  renderProjects();
};

// [비동기] API를 호출하고, 결과에 따라 상태를 바꾼다.
const loadProjects = async () => {
  setProjectState({ status: 'loading' });

  try {
    const response = await fetch(API_URL);

    // fetch는 404·403 응답에서도 에러를 던지지 않으므로 직접 확인한다.
    if (!response.ok) {
      const reason = response.status === 403
        ? 'GitHub API 요청 한도(시간당 60회)를 초과했습니다. 잠시 후 다시 시도해 주세요.'
        : `서버 응답 오류 (상태 코드 ${response.status})`;
      throw new Error(reason);
    }

    const data = await response.json();
    const repos = data.filter((repo) => !repo.fork); // 포크한 저장소는 제외
    setProjectState({ status: 'success', repos });
  } catch (error) {
    setProjectState({ status: 'error', errorMessage: error.message });
  }
};

loadProjects();
