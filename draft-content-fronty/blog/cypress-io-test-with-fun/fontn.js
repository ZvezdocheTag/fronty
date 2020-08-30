function fountainActivation (a) {
  // Write your code here
  const [totalGarden, ...rest] = a
  const left = []
  const right = []
  for (let i = 0; i <= rest.length - 1; i += 1) {
    if (i < (rest.length - 1) / 2) {
      let b = Array.from({ length: rest[i] + 1 }, (_, k) => k)
      left.push(b)
    } else {
      let r = Array.from({ length: rest[i] + 1 }, (_, k) => k)
      right.push(r)
    }
  }
  return [...left, ...right]
}

console.log(fountainActivation([3, 1, 2, 1]))
