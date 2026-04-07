/* ============================================================
   CALCULADORA PROGRESIVA — script.js
   ============================================================ */

'use strict';

// ── State ────────────────────────────────────────────────────
const state = {
  current:    '0',    // número en pantalla
  previous:   null,   // operando A
  operator:   null,   // operador pendiente
  shouldReset: false, // bandera: próximo dígito reinicia display
  expression: '',     // texto de la línea superior
  justEvaluated: false, // true justo después de presionar =
};

// ── DOM refs ─────────────────────────────────────────────────
const displayResult     = document.getElementById('result');
const displayExpression = document.getElementById('expression');
const historyList       = document.getElementById('history-list');
const historyEmpty      = document.getElementById('history-empty');

// ── History array (max 10 entries) ───────────────────────────
const history = [];
const HISTORY_MAX = 10;

// ── Render ───────────────────────────────────────────────────
function render() {
  displayResult.textContent     = formatNumber(state.current);
  displayExpression.textContent = state.expression;

  // Adjust font size for long numbers
  const len = state.current.length;
  displayResult.classList.toggle('small', len > 10);
  displayResult.classList.toggle('tiny',  len > 15);
}

/** Añade separadores de miles pero preserva punto decimal y negativos */
function formatNumber(raw) {
  if (raw === 'Error') return 'Error';
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;

  // Mostrar hasta 12 dígitos significativos
  let formatted = parseFloat(num.toPrecision(12)).toString();

  // Si es notación científica, devolver tal cual
  if (formatted.includes('e')) return formatted;

  // Separar parte entera de decimal
  const [intPart, decPart] = formatted.split('.');
  const intFormatted = parseInt(intPart).toLocaleString('es');

  return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
}

// ── Acciones ─────────────────────────────────────────────────

function inputDigit(digit) {
  if (state.shouldReset || state.justEvaluated) {
    state.current   = digit;
    state.shouldReset = false;
    state.justEvaluated = false;
  } else {
    if (state.current === '0' && digit !== '.') {
      state.current = digit;
    } else if (state.current.length < 16) {
      state.current += digit;
    }
  }
  render();
}

function inputDecimal() {
  if (state.shouldReset || state.justEvaluated) {
    state.current = '0.';
    state.shouldReset = false;
    state.justEvaluated = false;
    render();
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
  }
  render();
}

function inputOperator(op) {
  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  // Si hay operación pendiente y el usuario no acaba de pulsar =, calcular primero
  if (state.operator && !state.justEvaluated && !state.shouldReset) {
    evaluate(false);
  }

  state.previous  = parseFloat(state.current);
  state.operator  = op;
  state.shouldReset  = true;
  state.justEvaluated = false;
  state.expression = `${formatNumber(state.previous.toString())} ${opSymbols[op]}`;

  // Highlight operator button
  document.querySelectorAll('.btn-operator').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.btn-operator[data-value="${op}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  render();
}

function evaluate(final = true) {
  if (state.operator === null || state.previous === null) return;

  const a   = state.previous;
  const b   = parseFloat(state.current);
  const usedOp  = state.operator;                          // capturar antes de borrar
  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  let result;
  switch (state.operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/':
      if (b === 0) { handleError(); return; }
      result = a / b;
      break;
    default: return;
  }

  if (final) {
    state.expression = `${formatNumber(a.toString())} ${opSymbols[usedOp]} ${formatNumber(b.toString())} =`;
  }

  state.current   = result.toString();
  if (final) {
    state.operator  = null;
    state.previous  = null;
    state.justEvaluated = true;
    state.shouldReset   = false;
  } else {
    state.previous = result;
  }

  document.querySelectorAll('.btn-operator').forEach(b => b.classList.remove('active'));
  render();

  // ── Guardar en historial si fue evaluación final ──────────
  if (final) {
    const entry = {
      operation: `${formatNumber(a.toString())} ${opSymbols[usedOp]} ${formatNumber(b.toString())}`,
      result: formatNumber(result.toString()),
    };
    insertHistoryEntry(entry);
  }
}

function clear() {
  state.current   = '0';
  state.previous  = null;
  state.operator  = null;
  state.shouldReset    = false;
  state.justEvaluated  = false;
  state.expression     = '';
  // Limpiar clases de error
  displayResult.classList.remove('error', 'small', 'tiny');
  displayExpression.classList.remove('error-hint');
  document.querySelectorAll('.btn-operator').forEach(b => b.classList.remove('active'));
  render();
}

function toggleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  render();
}

function inputPercent() {
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  state.current = (val / 100).toString();
  render();
}

// ── Historial ─────────────────────────────────────────────────

/** Inserta una entrada al inicio del historial (máx HISTORY_MAX). */
function insertHistoryEntry({ operation, result }) {
  history.unshift({ operation, result });
  if (history.length > HISTORY_MAX) history.pop();
  renderHistory();
}

/** Re-dibuja la lista de historial en el DOM. */
function renderHistory() {
  // Quitar ítem vacío si existe
  if (historyEmpty) historyEmpty.remove();

  // Limpiar lista y re-poblar
  historyList.innerHTML = '';

  if (history.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'history-empty';
    empty.id = 'history-empty';
    empty.textContent = 'Sin operaciones aún';
    historyList.appendChild(empty);
    return;
  }

  history.forEach(({ operation, result }, i) => {
    const li = document.createElement('li');
    li.className = 'history-item';

    const opSpan  = document.createElement('span');
    opSpan.className = 'h-operation';
    opSpan.textContent = operation;

    const eqSpan  = document.createElement('span');
    eqSpan.className = 'h-result';
    eqSpan.textContent = `= ${result}`;

    const idxSpan = document.createElement('span');
    idxSpan.className = 'h-index';
    idxSpan.textContent = `#${i + 1}`;

    li.appendChild(opSpan);
    li.appendChild(eqSpan);
    li.appendChild(idxSpan);
    historyList.appendChild(li);
  });
}

/** Borra todo el historial. */
function clearHistory() {
  history.length = 0;
  renderHistory();
}

function handleError() {
  state.current   = 'Error: No se puede dividir entre 0';
  state.previous  = null;
  state.operator  = null;
  state.shouldReset    = true;
  state.justEvaluated  = false;
  state.expression     = '⚠ Operación inválida';

  // Aplicar clases de error al display
  displayResult.classList.remove('small', 'tiny');
  displayResult.classList.add('error');
  displayExpression.classList.add('error-hint');

  displayResult.textContent     = state.current;
  displayExpression.textContent = state.expression;
}

// ── Button ripple animation ───────────────────────────────────
function animateButton(btn) {
  btn.style.setProperty('--ripple', '1');
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 200);
}

// ── Event delegation ─────────────────────────────────────────
document.querySelector('.keypad').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  animateButton(btn);

  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit':    inputDigit(value);    break;
    case 'decimal':  inputDecimal();       break;
    case 'operator': inputOperator(value); break;
    case 'equal':    evaluate(true);       break;
    case 'clear':    clear();              break;
    case 'sign':     toggleSign();         break;
    case 'percent':  inputPercent();       break;
  }
});

// ── Keyboard support ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const map = {
    '0':'0','1':'1','2':'2','3':'3','4':'4',
    '5':'5','6':'6','7':'7','8':'8','9':'9',
  };

  if (map[e.key]) { inputDigit(map[e.key]); highlight(`btn-${e.key}`); return; }

  switch (e.key) {
    case '.':
    case ',':       inputDecimal();       highlight('btn-dot');      break;
    case '+':       inputOperator('+');   highlight('btn-add');      break;
    case '-':       inputOperator('-');   highlight('btn-subtract'); break;
    case '*':       inputOperator('*');   highlight('btn-multiply'); break;
    case '/':
      e.preventDefault();
      inputOperator('/');
      highlight('btn-divide');
      break;
    case 'Enter':
    case '=':       evaluate(true);       highlight('btn-equal');    break;
    case 'Escape':  clear();              highlight('btn-clear');    break;
    case 'Backspace':
      if (!state.justEvaluated && !state.shouldReset) {
        state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
        render();
      }
      break;
  }
});

function highlight(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.classList.add('pressed');
  animateButton(btn);
  setTimeout(() => btn.classList.remove('pressed'), 200);
}

// ── Initial render ────────────────────────────────────────────
render();

// ── Limpiar historial ─────────────────────────────────────────
document.getElementById('btn-clear-history').addEventListener('click', () => {
  clearHistory();
});
