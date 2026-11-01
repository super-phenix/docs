const swaggerScript = document.currentScript;

const start = () => {
  const root = document.getElementById("swagger-ui");
  if (!root || !root.dataset.spec) {
    return;
  }

  const assetRoot = new URL("../assets/swagger-ui/", swaggerScript.src);
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("swagger-ui.css", assetRoot).href;
  document.head.appendChild(style);

  const bundle = document.createElement("script");
  bundle.src = new URL("swagger-ui-bundle.js", assetRoot).href;
  bundle.onload = () => {
    window.SwaggerUIBundle({
      url: new URL(root.dataset.spec, window.location.href).href,
      dom_id: "#swagger-ui",
      deepLinking: true,
      docExpansion: "list",
      defaultModelsExpandDepth: 1,
      presets: [window.SwaggerUIBundle.presets.apis],
      layout: "BaseLayout",
    });
  };
  document.body.appendChild(bundle);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
