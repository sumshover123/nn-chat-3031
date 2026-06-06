'use strict';

// ページが読み込まれたら、おみくじボタンや結果が見えやすい位置に自動スクロール
window.addEventListener('load', () => {
  window.scrollTo({
    top: 100,
    behavior: 'smooth'
  });
});

// ツールチップの有効化
const tooltipTriggerElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltipTriggerElements.forEach((tooltipTriggerElement) => {
  new bootstrap.Tooltip(tooltipTriggerElement);
});