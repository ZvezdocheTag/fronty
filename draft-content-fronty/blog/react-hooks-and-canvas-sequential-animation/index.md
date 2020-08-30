---
title: Анимация на Canvas с использованием react-hooks
date: "2019-03-13T22:12:03.284Z"
---

В начале года React добавили долгожданное Hooks API, которое
дает возможность писать компоненты в более функциональном стили, а также выделять и переиспользовать логику.

Если вы впервые слышали о хуках, взгляните на официальную
документацию https://ru.reactjs.org/docs/hooks-intro.html

Для работы с `canvas` нам понадобиться одна из встроенных функции хуков [useEffect](https://ru.reactjs.org/docs/hooks-effect.html), которая отвечает за побочные действия, в кратце о данной функции:

- Аналог `componentDidMount` и `componentDidUpdate` в одном лице, соответственно вызывается после `render`
- Имеет доступ к переменным с замыкания к примеру props
- Функция принимает 2 аргумента:
  1. Функцию (эффект) в которой можно вызвать побочные действия
  2. Массив аргуменов при изменение которых useEffect должен обновляться, сравнение предыдущих и текущих значений происходит под капотом useEffect и если переданное состояние изменилось функцию(эффект) срабатывает, подробнее в реакт доках: [Совет: оптимизация производительности за счёт пропуска эффектов](https://ru.reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)

### Поехали кодить.

**Определяем наш компонент и визуализируем первую фигуру**

```jsx
function CanvasComponent() {
  const canvasRef = useRef(null)

  useEffect(() => {
    let canvas = canvasRef.current
    let ctx = canvas.getContext("2d")

    ctx.fillStyle = "tomato"
    ctx.fillRect(10, 10, 50, 50)
  })

  return <canvas ref={canvasRef} width="300" height="200" />
}
```

Привязываемся к canvas с помощью [useRef](https://ru.reactjs.org/docs/hooks-reference.html#useref), теперь у нас есть ссылка на отрендеренный canvas элемент, и в `useEffect` обращаемся к контексту (`ctx`) canvas и рисуем квадрата.

Мы нарисовали квадрат на канвасе, давайте добавим ему интерактивности.

**Функция анимации**

```js
function widthAnimation(start, ctx) {
  return function step(timestamp) {
    if (!start) start = timestamp
    let progress = timestamp - start
    let limit = 280
    let xValue = Math.min(progress / 10, limit)

    ctx.fillRect(xValue, 10, 50, 50)

    if (xValue < limit) {
      window.requestAnimationFrame(step)
    }
  }
}
```

Передаем 2 аргумента в функцию анимации, первый это стартовое значение для анимации, второе контекст canvas которые запоминаем в замыкание при первом вызове, эта функция возвращает другую рекурсивную `step` которая вызывается до тех пор пока счетчик не достигнит предела в нашем случае `limit = 280`.

**Добавляем нашу анимацию в useEffect**

```js
useEffect(() => {
  var canvas = canvasRef.current
  var ctx = canvas.getContext("2d")

  ctx.fillStyle = "tomato"
  ctx.fillRect(10, 10, 50, 50)
  let animationFunc = widthAnimation(null, ctx)
  window.requestAnimationFrame(animationFunc)
})
```

Вызываем функцию анимации в useEffect, с начальным состояеним таймера который равен `null` и контекстом нашего `canvas`, запускаем нашу анимацию `window.requestAnimationFrame(animation)`

![Что то пошло не так, мы хотили переместить переместить квадрат, а сделали увелечение ширины](./jstreet.jpg)

Это происходит из за того что канвас отрисовывает по кадру то есть получается в течени времени анимации мы рисовали квадраты с 0 до 280. Чтобы исправить это нам нужно очищать контекст canvas перед каждой отрисовкой ctx.clearRect(0,0,300,200)

```jsx
return function step(timestamp) {
  //...
  ctx.clearRect(0, 0, 300, 200)
  ctx.fillRect(xValue, 10, 50, 50)
  //...
}
```


**Добавляем интерактивность**
Простая анимация готова, давайте добавим функциональность, чтобы запускать анимацию по клику.
Подключяем хук для манипуляции состоянием, и объявляем переменную в которой будем хранить состояние `isActive` и функцию котороя управляет данным состоянием `toggleAnimation`, и в  `useState(false)` передаем первоначальное значения для переменной `isActive`

```js
const [isActive, toggleAnimation] = useState(false)
```

Добавляем кнопки к компоненту, которые будут отвечать за управлением анимацией на канвасе, и передаем аргумент соответствующий действию то есть по клику на Run присваеваем `isActive = true` в состояние, аналогичная функция на кнопки Reset `isActive = false`

```jsx
<div>
  <button
    style={styles.button}
    type="button"
    onClick={() => toggleAnimation(true)}
  >
    Run
  </button>
  <button
    style={styles.button}
    type="button"
    onClick={() => toggleAnimation(false)}
  >
    Reset
  </button>
</div>
```

Теперь нам нужно добавить условие в useEffect которое будет отвечать за запуск анимации.

```jsx
useEffect(() => {
  var canvas = canvasRef.current
  var ctx = canvas.getContext("2d")
  let init = configAnimation(null, ctx)
  let animation = null
  ctx.clearRect(0, 0, 300, 200)

  ctx.fillStyle = "tomato"
  ctx.fillRect(10, 10, 50, 50)

  if (isActive) {
    animation = window.requestAnimationFrame(init)
  }

  return () => {
    window.cancelAnimationFrame(animation)
  }
})
```

Мы добавили пару строк в наш эффект, первая `ctx.clearRect` отвечает за очистку канваса, это нужно для сброса позиции анимации, также чтобы лучше понимать как работает анимация на canvas взгляните в доки mdn [Простые анимации](https://developer.mozilla.org/ru/docs/Web/API/Canvas_API/Tutorial/%D0%9E%D1%81%D0%BD%D0%BE%D0%B2%D1%8B_%D0%B0%D0%BD%D0%B8%D0%BC%D0%B0%D1%86%D0%B8%D0%B8).

Далее если `isActive ==== true` мы вызываем анимацию.

И в конце возвращаем функцию сброса нашего эффекта, в данном случае мы "убиваем" нашу анимацию, так как она будет весеть в памяти все время пока мы пользуемся приложением, подробнее зачем это делать расписано в доках [Очистка эффекта](https://ru.reactjs.org/docs/hooks-effect.html#effects-with-cleanup).

**Создаем свой хук**

```js
import { useEffect } from "react"

export function useRectWithAnimation(isActive, canvasRef, rect) {
  useEffect(() => {
    let canvas = canvasRef.current
    let ctx = canvas.getContext("2d")
    let width = canvas.width
    let height = canvas.height
    let limit = width - rect.width

    ctx.clearRect(0, 0, width, height)

    if (isActive) {
      let animation = configAnimation(null, limit, (velocity, anim) => {
        ctx.clearRect(0, 0, width, height)
        ctx.fillRect(rect.x + velocity, rect.y, rect.width, rect.height)
      })

      window.requestAnimationFrame(animation)
    }

    ctx.fillStyle = rect.color
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
  })
}

function configAnimation(start, limit, cb) {
  return function step(timestamp) {
    if (!start) start = timestamp
    let progress = timestamp - start
    let velocity = Math.min((progress * 3) / 10, limit)

    cb(velocity)

    if (velocity < limit) {
      window.requestAnimationFrame(step)
    }
  }
}
```

Создаем новую функцию `useRectWithAnimation` которая является хуком, выносим всю логику с канвасом в эту функцию, и передаем нужные нам значения, параметры квадрата который мы хотим отрисовать, состояние анимации и ссылку на canvas.

```jsx

function CanvasComponent() {
  const [isActive, toggleAnimation] = useState(false);
  const canvasRef = useRef(null);
  let rect = {
    width: 50,
    height: 50,
    x: 0,
    y: 0,
    color: "tomato"
  };

  useRectWithAnimation(isActive, canvasRef, rect);

  return ( ... )
}

```

Вызываем хук в компоненте и передаем нужные аргументы.

Результат можно глянуть тут:

**В итоге**

Мы в кратце разобрались как работает хук useEffect, создали свой собственный хук `useRectWithAnimation` который теперь можем переисполльзовать и в других компонентах или проектах, прошлись по тому как работает базовая анимация на `canvas` и добавили события которые запускаю и сбрасывают анимацию.
