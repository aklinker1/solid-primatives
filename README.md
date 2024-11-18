# `@aklinker1/solid-primatives`

Personal collection of primatives to use with Solid JS. I'm a vue developer, so many of these are exact copies from `@vueuse/core`, which I think is better than `solid-primatives`.

```ts
import { watch } from 'jsr:@aklinker1/solid-primatives/watch';

const [count, setCount] = createSignal(0)
watch(count, (newCount, oldCount) => {
  console.log("Count changed from", oldCount, "to", newCount);
})
```
