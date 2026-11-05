/* ============================================================
   青禾轻食 · 站点脚本
   - 注入 SVG 图标雪碧图（方案 B 使用）
   - 图标方案切换（字体图标 / SVG），localStorage 记忆
   - 购物车计数
   - 菜单分类筛选
   - 轻提示
   ============================================================ */
(function () {
  "use strict";

  var SPRITE = [
    '<svg width="0" height="0" style="position:absolute;left:-9999px" aria-hidden="true" focusable="false">',
    '  <symbol id="i-home" viewBox="0 0 24 24"><path d="M12 2.6 L21.6 11.8 H19.1 V21.4 H14.1 V15.4 H9.9 V21.4 H4.9 V11.8 H2.4 Z"/></symbol>',
    '  <symbol id="i-menu" viewBox="0 0 24 24">',
    '    <path d="M5.2 7.6 H16.8 L15.7 18.4 Q15.5 20 13.9 20 H8.1 Q6.5 20 6.3 18.4 Z"/>',
    '    <path d="M16.9 9.2 Q20.6 10.2 20.3 13.6 Q20 16.2 17 17 L16.8 15.2 Q18.7 14.7 18.9 13.4 Q19.1 12 16.7 11.2 Z"/>',
    '    <path d="M4.2 21 H19.8 Q20.4 21 20.4 21.6 Q20.4 22.2 19.8 22.2 H4.2 Q3.6 22.2 3.6 21.6 Q3.6 21 4.2 21 Z"/>',
    '  </symbol>',
    '  <symbol id="i-order" viewBox="0 0 24 24">',
    '    <path d="M8.8 8.4 Q8.8 4.6 12 4.6 Q15.2 4.6 15.2 8.4 L13.5 8.4 Q13.5 6.3 12 6.3 Q10.5 6.3 10.5 8.4 Z"/>',
    '    <path d="M6.6 8.4 H17.4 L18.8 20.2 Q18.9 21.6 17.5 21.6 H6.5 Q5.1 21.6 5.2 20.2 Z"/>',
    '  </symbol>',
    '  <symbol id="i-user" viewBox="0 0 24 24">',
    '    <path d="M12 3.2 A4.4 4.4 0 1 1 12 12 A4.4 4.4 0 1 1 12 3.2 Z"/>',
    '    <path d="M3.2 21.8 Q4.2 14.6 12 14.6 Q19.8 14.6 20.8 21.8 Z"/>',
    '  </symbol>',
    '  <symbol id="i-search" viewBox="0 0 24 24">',
    '    <path d="M10 3.4 A6.6 6.6 0 1 1 10 16.6 A6.6 6.6 0 1 1 10 3.4 Z"/>',
    '    <path d="M15.2 15.8 L20.4 21 L21.6 19.8 L16.4 14.6 Z"/>',
    '  </symbol>',
    '  <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2.4 L14.9 8.6 L21.6 9.4 L16.7 14 L18 20.7 L12 17.2 L6 20.7 L7.3 14 L2.4 9.4 L9.1 8.6 Z"/></symbol>',
    '</svg>'
  ].join("");

  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---------- 图标方案：先应用，避免首屏闪动 ---------- */
  var MODE_KEY = "qh-icon-mode";
  var savedMode = "font";
  try { savedMode = localStorage.getItem(MODE_KEY) || "font"; } catch (e) {}

  document.body.classList.remove("mode-font", "mode-svg");
  document.body.classList.add("mode-" + savedMode);

  ready(function () {
    /* ---------- 图标方案切换 ---------- */
    var modeBtns = Array.prototype.slice.call(document.querySelectorAll(".mode-switch button"));

    function setMode(mode) {
      document.body.classList.remove("mode-font", "mode-svg");
      document.body.classList.add("mode-" + mode);
      modeBtns.forEach(function (b) {
        b.classList.toggle("is-on", b.getAttribute("data-mode") === mode);
      });
      try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
    }

    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
    });

    setMode(savedMode);

    /* ---------- 轻提示 ---------- */
    var toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
    var toastTimer = null;

    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add("is-show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 1800);
    }

    /* ---------- 购物车 ---------- */
    var CART_KEY = "qh-cart";

    function getCart() {
      var n = 0;
      try { n = parseInt(localStorage.getItem(CART_KEY) || "0", 10) || 0; } catch (e) {}
      return n;
    }

    function renderCart() {
      var n = getCart();
      Array.prototype.slice.call(document.querySelectorAll("[data-cart-count]")).forEach(function (el) {
        el.textContent = n;
        if (n === 0) el.setAttribute("data-zero", "1");
        else el.removeAttribute("data-zero");
      });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-add]")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var n = getCart() + 1;
        try { localStorage.setItem(CART_KEY, String(n)); } catch (e) {}
        renderCart();
        toast("已加入购物车：" + btn.getAttribute("data-add"));
      });
    });

    renderCart();

    /* ---------- 菜单分类筛选 ---------- */
    var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".grid .card"));

    filters.forEach(function (f) {
      f.addEventListener("click", function () {
        var cat = f.getAttribute("data-filter");
        filters.forEach(function (x) { x.classList.toggle("is-active", x === f); });
        cards.forEach(function (c) {
          var hide = cat !== "all" && c.getAttribute("data-cat") !== cat;
          c.classList.toggle("is-hidden", hide);
        });
      });
    });
  });
})();
