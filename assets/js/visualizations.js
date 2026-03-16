(() => {
  const diffusionCanvas = document.getElementById("diffusionCanvas");
  const fsmCanvas = document.getElementById("fsmCanvas");
  const treeContainer = document.getElementById("optionsTree");

  if (!diffusionCanvas || !fsmCanvas || !treeContainer) {
    return;
  }

  const dctx = diffusionCanvas.getContext("2d");
  const fctx = fsmCanvas.getContext("2d");

  const nodes = [
    { x: 80, y: 90, u: 0.85 },
    { x: 200, y: 60, u: 0.35 },
    { x: 320, y: 95, u: 0.2 },
    { x: 110, y: 220, u: 0.5 },
    { x: 250, y: 210, u: 0.25 },
    { x: 410, y: 185, u: 0.1 },
  ];

  const edges = [
    [0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [4, 5], [2, 5], [2, 4]
  ];

  function drawDiffusion() {
    dctx.clearRect(0, 0, diffusionCanvas.width, diffusionCanvas.height);

    dctx.strokeStyle = "rgba(160, 180, 255, 0.28)";
    dctx.lineWidth = 1.4;
    edges.forEach(([a, b]) => {
      dctx.beginPath();
      dctx.moveTo(nodes[a].x, nodes[a].y);
      dctx.lineTo(nodes[b].x, nodes[b].y);
      dctx.stroke();
    });

    nodes.forEach((n) => {
      const glow = 10 + n.u * 26;
      dctx.beginPath();
      dctx.fillStyle = `rgba(126,255,201,${0.15 + n.u * 0.5})`;
      dctx.arc(n.x, n.y, glow, 0, Math.PI * 2);
      dctx.fill();

      dctx.beginPath();
      dctx.fillStyle = "rgba(118, 227, 255, 0.95)";
      dctx.arc(n.x, n.y, 6 + n.u * 5, 0, Math.PI * 2);
      dctx.fill();
    });

    const next = nodes.map((n) => n.u * 0.62);
    edges.forEach(([a, b]) => {
      const flow = (nodes[a].u - nodes[b].u) * 0.08;
      next[b] += flow;
      next[a] -= flow;
    });
    nodes.forEach((n, i) => {
      n.u = Math.max(0.04, Math.min(0.95, next[i]));
    });
  }

  const fsmStates = [
    { label: "Observe", x: 90, y: 160 },
    { label: "Assess", x: 230, y: 70 },
    { label: "Plan", x: 370, y: 160 },
    { label: "Act", x: 230, y: 250 },
  ];

  let fsmTick = 0;

  function drawFSM() {
    fctx.clearRect(0, 0, fsmCanvas.width, fsmCanvas.height);

    const links = [[0,1],[1,2],[2,3],[3,0],[1,3]];
    links.forEach(([a, b], idx) => {
      const hot = (fsmTick + idx * 18) % 100 < 28;
      fctx.beginPath();
      fctx.strokeStyle = hot ? "rgba(255, 211, 109, 0.9)" : "rgba(160, 180, 255, 0.25)";
      fctx.lineWidth = hot ? 2.4 : 1.3;
      fctx.moveTo(fsmStates[a].x, fsmStates[a].y);
      fctx.lineTo(fsmStates[b].x, fsmStates[b].y);
      fctx.stroke();
    });

    fsmStates.forEach((s, idx) => {
      const active = (Math.floor(fsmTick / 28) % fsmStates.length) === idx;
      fctx.beginPath();
      fctx.fillStyle = active ? "rgba(126,255,201,0.95)" : "rgba(118,227,255,0.7)";
      fctx.arc(s.x, s.y, active ? 26 : 20, 0, Math.PI * 2);
      fctx.fill();

      fctx.fillStyle = "#03101a";
      fctx.font = "600 12px Sora";
      fctx.textAlign = "center";
      fctx.fillText(s.label, s.x, s.y + 4);
    });

    fsmTick = (fsmTick + 1) % 1000;
  }

  const options = [
    {
      title: "Stabilize corridor",
      confidence: 0.78,
      branches: ["Reconfigure sensor mesh", "Constrain maneuver envelope", "Prioritize low-latency updates"],
    },
    {
      title: "Expand search frontier",
      confidence: 0.64,
      branches: ["Increase model horizon", "Allocate exploratory policy mass", "Trigger risk monitor"],
    },
    {
      title: "Conservative fallback",
      confidence: 0.86,
      branches: ["Hold current mission state", "Route through trusted subgraph", "Defer high-variance actions"],
    },
  ];

  treeContainer.innerHTML = options
    .map((opt) => {
      const pct = Math.round(opt.confidence * 100);
      return `
        <article class="tree-branch">
          <header>
            <h3>${opt.title}</h3>
            <span>${pct}% confidence</span>
          </header>
          <ul>
            ${opt.branches.map((b) => `<li>${b}</li>`).join("")}
          </ul>
        </article>
      `;
    })
    .join("");

  function animate() {
    drawDiffusion();
    drawFSM();
    requestAnimationFrame(animate);
  }

  animate();
})();
