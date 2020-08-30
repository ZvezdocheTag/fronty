---
title: Анимация на Canvas с использованием react-hooks Draft
date: "2019-03-13T22:12:03.284Z"
---

Недавно нужно было визуализировать массив данных в React приложение и добавить интерактивность, при манипуляции пользователя с приложением отрисовки должны были происходить плавно и с анимацией, прототип был написан с использованием D3.js, svg и react-spring (для анимации) все работало отлично, а потом пришли реальные данные и их объем сильно поколибил веру в предыдушее решение, после тестирование было принято решение переписать визуализацию с использованием canvas.

Первая тестовая версия функционала по работе с `canvas` была написана с использованием основных методов жизненого цикла `componentDidMount` и `componentDidUpdate` и функционал выполнял поставленную задачу.

Первая итерация была успешно пройдена и пришло время рефакторинга, как раз в это же время уже успешно зарелизели стабильную версию React Hook API, и выкатили пару обновлений.

> Если вы впервые слышыти о хуках, можете взглянуть на официальную
> документацию https://ru.reactjs.org/docs/hooks-intro.html

Для работы с `canvas` нам понадобиться функции с хуков [useEffect](https://ru.reactjs.org/docs/hooks-effect.html), которая отвечает за асинхронные операции и побочные действия, в кратце о данной функции:

1. Аналог `componentDidMount` и `componentDidUpdate` в одном лице
1. Вызываеться после `render`
1. Имеет доступ к переменным с замыкания
1. Функция принимает 2 аргумента, непосредственно функцию которая может работать с сайд эффектам и props с внешнего окружения.
1. Второй аргумент props уже непосредственно сравнимаются под капотом useEffect и если они являются разными то компонент снова обновляеться.

**Определяем наш компонент и визуализируем первую фигуру**

```js
function CanvasComponent() {
  const canvasRef = useRef(null)

  useEffect(() => {
    var canvas = canvasRef.current
    var ctx = canvas.getContext("2d")

    ctx.fillStyle = "tomato"
    ctx.fillRect(10, 10, 50, 50)
  })

  return <canvas ref={canvasRef} width="300" height="200" />
}
```

Глянем что тут происходи:

1. Привязываемся к canvas с помощью [useRef](https://ru.reactjs.org/docs/hooks-reference.html#useref), теперь у нас есть ссылка на отрендеренный canvas элемент.
2. Далее вызываем `useEffect` с одним аргументом, функция в которой мы вызываем все побочные эффекты в нашем случает обрашение к canvas и отрисовка квадрата.

В результате получим: ссылку на демо или скриншот.

**Пишем функцию анимации**

```js
function widthAnimation(start, ctx) {
  return function step(timestamp) {
    if (!start) start = timestamp
    let progress = timestamp - start
    ctx.fillRect(10, 10, Math.min(progress / 10, 280), 50)
    if (progress < 2800) {
      window.requestAnimationFrame(step)
    }
  }
}
```

Смотрим что здесь происходит, передаем 2 аргумента в нашу функцию анимации, первый это стартовое значение для нашей анимации, второе контекст нашего canvas которые мы запоминаем в замыкание при первом вызаве, данная функция возвращает другую функцию `step` которая является рекурсивной и отвечает за анимацию.

**Вызываем нашу анимацию в useEffect**

```js
useEffect(() => {
  var canvas = canvasRef.current
  var ctx = canvas.getContext("2d")

  ctx.fillStyle = "tomato"
  ctx.fillRect(10, 10, 50, 50)
  let animation = widthAnimation(null, ctx)
  window.requestAnimationFrame(animation)
})
```

Далее мы вызываем нашу функцию для анимации, с начальным состояеним таймера который равен `null` и context нашего `canvas`, чтобы сохранить данные значения в замыкании и запускаем нашу анимацию `window.requestAnimationFrame(animation)`

**Добавляем интерактивность**

Простая анимация готова, давайте добавим функциональность, чтобы запускать анимацию не автоматически, а по клику.

Подключяем хук для манипуляции состоянием, и объявляем переменную в которой будем хранить состояние `isActive` и функцию котороя управляет данным состоянием `toggleAnimation`

```js
const [isActive, toggleAnimation] = useState(false)
```

Добавляем кнопки к нашему компоненту, которые будут отвечать за управлением анимацией на канвасе, и передаем аргумент соответствующий действию то есть по клику на Run мы вызываем функцию которое отвечает за установку состояние и присваевает `isActive = true`, аналогичная функция на кнопки Reset `isActive = false`

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
Так логика осталось прежней, мы только заменили захардкоженные значени к примеру как `limit` - которое отвечает за конечную позицию нашего квадрата.

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
