# Calculadora Antigravity — Plan de Implementación

Construcción iterativa de una calculadora web con diseño premium (glassmorphism + dark mode), manejo robusto de errores e historial de operaciones. El proyecto se desarrolló en **3 sprints** sobre una base de `HTML + CSS + JS` puro (sin frameworks ni dependencias).

---

## Resumen del Proyecto

| Campo | Detalle |
|---|---|
| **Nombre** | Calculadora Antigravity |
| **Tecnologías** | HTML5, CSS3 (Vanilla), JavaScript ES2020 (`'use strict'`) |
| **Archivos** | `index.html`, `style.css`, `script.js` |
| **Ruta** | `c:\jdlm\Antigravity_For_Developer\Sesion 3 Antigravity\CalculadoraProgresiva\` |
| **Estado** | ✅ Completado |

---

## Sprint 1 — Calculadora Base con Diseño Premium

### Objetivo
Crear la calculadora funcional desde cero con estética glassmorphism y dark mode.

### Cambios realizados

#### [NEW] [index.html](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/index.html)
Estructura semántica completa:
- `<title>Calculadora Antigravity</title>` y meta SEO
- Fondo animado con 3 orbes (`.bg-orbs > .orb-1/2/3`)
- Pantalla dual: expresión (`#expression`) + resultado (`#result`)
- Teclado de 20 botones con **event delegation** (`data-action`, `data-value`)
- Botones especiales: `C` (wide ×2 columnas), `0` (double ×2 columnas), `=`

#### [NEW] [style.css](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/style.css)

```
Variables CSS (:root)
├── Paleta: --clr-bg, --clr-surface, --clr-border, --clr-text
├── Acento: --clr-accent-1 (#a855f7 violeta), --clr-accent-2 (#06b6d4 cian)
├── Capas de botones: --clr-num, --clr-func, --clr-op, --clr-op-active
└── Sizing: --btn-size (68px), --gap (10px), --radius-calc (28px)

Componentes
├── .bg-orbs / .orb  → 3 orbes con blur(80px) y @keyframes drift
├── .calculator      → backdrop-filter: blur(32px), border glassmorphism
├── .display         → bg rgba(0,0,0,0.3), flex-column, texto alineado a la derecha
├── .keypad          → CSS Grid 4×auto-rows
├── .btn             → scale hover/active, shimmer ::after, ripple
├── .btn-number      → rgba(255,255,255,0.07)
├── .btn-function    → rgba(255,255,255,0.13) + color accent-1
├── .btn-operator    → rgba violeta + borde + .active state con glow
└── .btn-equal       → gradiente violeta→cian + box-shadow glow
```

#### [NEW] [script.js](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/script.js)

```
Estado (objeto state)
├── current        → string en pantalla
├── previous       → operando A (Number)
├── operator       → '+' | '-' | '*' | '/'
├── shouldReset    → próximo dígito borra pantalla
├── expression     → línea superior del display
└── justEvaluated  → flag post-igual

Funciones core
├── render()         → actualiza DOM + ajusta font-size (normal/small/tiny)
├── formatNumber()   → separadores de miles, 12 dígitos significativos
├── inputDigit()     → maneja flag shouldReset / justEvaluated
├── inputDecimal()   → previene doble punto
├── inputOperator()  → encadena operaciones, resalta botón activo
├── evaluate()       → calcula resultado, llama handleError() en ÷0
├── clear()          → reseteo total del estado
├── toggleSign()     → invierte signo del número actual
└── inputPercent()   → divide entre 100

Interacción
├── Event delegation en .keypad (click)
├── Soporte completo de teclado (0-9, + - * / Enter Escape Backspace)
└── animateButton() → clase .pressed por 200ms
```

**Decisión de diseño:** Se usó **event delegation** en lugar de un listener por botón para mejor rendimiento y código más limpio.

---

## Sprint 2 — Manejo de Errores (División por Cero)

### Objetivo
Mostrar un mensaje de error en rojo con animación cuando el usuario intente dividir entre cero, y limpiarlo con `C`.

### Cambios realizados

#### [MODIFY] [index.html](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/index.html)
- `<title>` → **`Calculadora Antigravity`**
- `aria-label` del contenedor → `"Calculadora Antigravity"`

#### [MODIFY] [style.css](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/style.css)

Clases nuevas añadidas al bloque del display:

```css
.display-result.error {
  background: linear-gradient(135deg, #f87171, #ef4444);
  /* text gradient en rojo */
  font-size: 22px;
  animation: shake 0.45s ...;
}

.display-expression.error-hint {
  color: rgba(248, 113, 113, 0.7);
}

@keyframes shake { /* sacudida horizontal */ }
```

#### [MODIFY] [script.js](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/script.js)

| Función | Cambio |
|---|---|
| `handleError()` | Escribe `"Error: No se puede dividir entre 0"` directo al DOM + añade `.error` y `.error-hint` |
| `clear()` | Remueve `.error`, `.error-hint`, `.small`, `.tiny` del display antes de `render()` |

> [!NOTE]
> `handleError()` escribe directamente en el DOM (sin pasar por `render()`) porque `render()` formatea con `formatNumber()`, que devolvería el string completo sin aplicar el estilo rojo. Las clases CSS se aplican manualmente.

---

## Sprint 3 — Historial de Operaciones

### Objetivo
Mostrar bajo la calculadora las últimas 10 operaciones con formato `"A ÷ B = resultado"`, con botón independiente para limpiar el historial.

### Cambios realizados

#### [MODIFY] [index.html](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/index.html)

Nueva `<section class="history-panel">` fuera del `.calculator`:
```html
<section class="history-panel">
  <div class="history-header">
    <h2 class="history-title">⏱ Historial</h2>
    <button id="btn-clear-history">Limpiar historial</button>
  </div>
  <ol id="history-list">
    <li class="history-empty" id="history-empty">Sin operaciones aún</li>
  </ol>
</section>
```

#### [MODIFY] [style.css](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/style.css)

```
Ajustes globales
├── body: overflow-y:auto + padding (permite scroll)
└── .calculator-wrapper: flex-column + gap:20px + max-width

Nuevos componentes
├── .history-panel    → glassmorphism idéntico a .calculator, animación pop-in retardada
├── .history-header   → flex space-between
├── .history-title    → uppercase, muted, 13px
├── .btn-clear-history → borde violeta semitransparente, hover glow
├── .history-list     → flex-column, max-height:260px, overflow-y:auto, scrollbar custom
├── .history-empty    → italic, centrado, muted
├── .history-item     → flex space-between, hover suave, @keyframes slide-in
│   ├── .h-operation  → texto operación (muted, ellipsis)
│   ├── .h-result     → "= N" en gradiente violeta
│   └── .h-index      → "#N" badge violeta tenue
└── @keyframes slide-in → entrada desde arriba + scale
```

#### [MODIFY] [script.js](file:///c:/jdlm/Antigravity_For_Developer/Sesion%203%20Antigravity/CalculadoraProgresiva/script.js)

```
Variables nuevas
├── historyList    → ref DOM #history-list
├── historyEmpty   → ref DOM #history-empty
├── history[]      → array en memoria (último en [0])
└── HISTORY_MAX=10 → límite de entradas

Funciones nuevas
├── insertHistoryEntry({ operation, result })
│   └── unshift → limitar → renderHistory()
├── renderHistory()
│   └── reconstruye la lista o muestra .history-empty
└── clearHistory()
    └── vacía array → renderHistory()

Hook en evaluate()
└── const usedOp = state.operator   ← capturado ANTES de state.operator = null
    entry = { operation, result }
    insertHistoryEntry(entry)

Listener
└── #btn-clear-history → clearHistory()
```

> [!IMPORTANT]
> La captura `const usedOp = state.operator` es crítica: el bloque `if (final)` pone `state.operator = null` antes de llegar al hook del historial. Sin esta variable local, el símbolo del operador aparecería como `undefined` en cada entrada.

---

## Arquitectura Final

```mermaid
graph TD
    A["index.html\nEstructura + Botones"] -->|carga| B["style.css\nDiseño + Animaciones"]
    A -->|carga| C["script.js\nLógica + Estado"]

    C --> D["state{}\nFuente de verdad"]
    C --> E["history[]\nÚltimas 10 ops"]

    D -->|render()| F["#result\n#expression"]
    E -->|renderHistory()| G["#history-list\n.history-item × N"]

    subgraph Interacción
        H["Clic en botón"] --> I["Event delegation\n.keypad"]
        J["Teclado"] --> K["keydown listener"]
        I & K --> D
    end
```

---

## Verificación

| Caso de prueba | Resultado esperado |
|---|---|
| `7 × 8 =` | Pantalla: `56`, historial: `7 × 8 = 56 #1` |
| `5 ÷ 0 =` | Pantalla roja: `"Error: No se puede dividir entre 0"`, sin entrada en historial |
| Presionar `C` tras error | Pantalla vuelve a `0`, clases `.error` eliminadas |
| 11 operaciones seguidas | Historial muestra solo las últimas 10, la más antigua desaparece |
| Botón "Limpiar historial" | Lista vuelve a `"Sin operaciones aún"` |
| Teclado: `3`, `+`, `4`, `Enter` | Pantalla: `7`, historial actualizado |
