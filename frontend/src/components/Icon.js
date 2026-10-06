import React from 'react';

/**
 * 공용 SVG 아이콘 (스트로크 기반, 이모지 대체)
 * @param {string} name - 아이콘 이름
 * @param {number} size - px 크기 (기본 22)
 * @param {boolean} filled - 채움 여부 (하트 등)
 */
const paths = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chat: <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.36-4.1-1L3 20l1-5.4A8.5 8.5 0 1 1 21 11.5Z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <path d="M10.3 19a2 2 0 0 0 3.4 0" />
    </>
  ),
  back: <path d="M15 5 8 12l7 7" />,
  send: <path d="m4 12 16-8-4 16-4.5-6.5L4 12Z" />,
  heart: <path d="M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.8 0 4-4 7.2-9 11.2Z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19c1.2-2.8 3.6-4.2 6.5-4.2s5.3 1.4 6.5 4.2" />
      <path d="M15.5 4.9a3.5 3.5 0 0 1 0 6.2M17.8 14.9c1.7.6 3 1.9 3.7 4.1" />
    </>
  ),
};

export default function Icon({ name, size = 22, filled = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
