import { createApp } from "vue";
import { createPinia } from "pinia";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";
import App from "./App.vue";
import router from "./router";

async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") return;
  try {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  } catch (error) {
    console.warn("MSW worker не запустился, продолжаем без моков:", error);
  }
}

enableMocking().then(() => {
  createApp(App).use(createPinia()).use(router).mount("#app");
});
