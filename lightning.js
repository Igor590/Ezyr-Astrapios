// lightning.js
document.addEventListener("DOMContentLoaded", () => {
  const lightningContainer = document.querySelector(".bg-lightning");
  const flashLayer = document.querySelector(".bg-flash");
  if (!lightningContainer) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.style.position = "absolute";
  svg.style.inset = "0";
  svg.style.filter = "blur(0.1px)";
  lightningContainer.appendChild(svg);

  // ----- defs: gradiente + glow -----
  const defs = document.createElementNS(svgNS, "defs");

  const gradient = document.createElementNS(svgNS, "linearGradient");
  gradient.setAttribute("id", "boltGradient");
  gradient.setAttribute("x1", "0");
  gradient.setAttribute("y1", "0");
  gradient.setAttribute("x2", "0");
  gradient.setAttribute("y2", "1");

  const stopOuter = document.createElementNS(svgNS, "stop");
  stopOuter.setAttribute("offset", "0%");
  stopOuter.setAttribute("stop-color", "#8fd5ff");

  const stopMiddle = document.createElementNS(svgNS, "stop");
  stopMiddle.setAttribute("offset", "45%");
  stopMiddle.setAttribute("stop-color", "#ffffff");

  const stopOuter2 = document.createElementNS(svgNS, "stop");
  stopOuter2.setAttribute("offset", "100%");
  stopOuter2.setAttribute("stop-color", "#8fd5ff");

  gradient.appendChild(stopOuter);
  gradient.appendChild(stopMiddle);
  gradient.appendChild(stopOuter2);

  const glowFilter = document.createElementNS(svgNS, "filter");
  glowFilter.setAttribute("id", "boltGlow");

  const blur = document.createElementNS(svgNS, "feGaussianBlur");
  blur.setAttribute("in", "SourceGraphic");
  blur.setAttribute("stdDeviation", "0.8");
  blur.setAttribute("result", "blur");

  const merge = document.createElementNS(svgNS, "feMerge");
  const mergeNode1 = document.createElementNS(svgNS, "feMergeNode");
  mergeNode1.setAttribute("in", "blur");
  const mergeNode2 = document.createElementNS(svgNS, "feMergeNode");
  mergeNode2.setAttribute("in", "SourceGraphic");

  merge.appendChild(mergeNode1);
  merge.appendChild(mergeNode2);
  glowFilter.appendChild(blur);
  glowFilter.appendChild(merge);

  defs.appendChild(gradient);
  defs.appendChild(glowFilter);
  svg.appendChild(defs);

  // ----- desenha UM raio -----
  function drawBolt() {
    svg.innerHTML = "";
    svg.appendChild(defs); // recoloca defs

    const group = document.createElementNS(svgNS, "g");

    const mainPath = document.createElementNS(svgNS, "path");
    const branches = document.createElementNS(svgNS, "path");

    // posição horizontal: centro com pequena variação
    const baseX = 50 + (Math.random() - 0.5) * 30;
    let d = `M ${baseX} 0`;
    let x = baseX;
    let y = 0;

    // número de segmentos (comprimento/zig-zag aleatório)
    const segments = 7 + Math.floor(Math.random() * 5);

    let branchesD = "";

    for (let i = 0; i < segments; i++) {
      const jitterFactor = Math.random() < 0.25 ? 1.8 : 1.0;
      const dx = (Math.random() - 0.5) * 10 * jitterFactor;
      const dy = (90 + Math.random() * 25) / segments;

      const midX = x + dx * 0.5;
      const midY = y + dy * 0.5;

      x += dx;
      y += dy;

      // curva quadrática para não ficar quadrado
      d += ` Q ${midX} ${midY} ${x} ${y}`;

      // ramificações curtas e finas
      if (Math.random() < 0.3) {
        const branchLen = 8 + Math.random() * 14;
        const angle = (Math.random() - 0.5) * Math.PI / 3; // ±60°
        const bx = x + Math.cos(angle) * branchLen;
        const by = y + Math.sin(angle) * branchLen;

        const midBx = (x + bx) / 2;
        const midBy = (y + by) / 2;

        branchesD += ` M ${x} ${y} Q ${midBx} ${midBy} ${bx} ${by}`;
      }
    }

    // raio principal – fino, com gradiente e glow
    mainPath.setAttribute("d", d);
    mainPath.setAttribute("stroke", "url(#boltGradient)");
    mainPath.setAttribute("stroke-width", "0.9");
    mainPath.setAttribute("fill", "none");
    mainPath.setAttribute("stroke-linecap", "round");
    mainPath.setAttribute("stroke-linejoin", "round");
    mainPath.setAttribute("filter", "url(#boltGlow)");

    // ramificações
    if (branchesD) {
      branches.setAttribute("d", branchesD);
      branches.setAttribute("stroke", "url(#boltGradient)");
      branches.setAttribute("stroke-width", "0.55");
      branches.setAttribute("fill", "none");
      branches.setAttribute("stroke-linecap", "round");
      branches.setAttribute("stroke-linejoin", "round");
      branches.setAttribute("filter", "url(#boltGlow)");
      branches.style.opacity = "0.85";
      group.appendChild(branches);
    }

    group.appendChild(mainPath);
    svg.appendChild(group);

    // anima raio
    const boltAnim = svg.animate(
      [
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0.45 },
        { opacity: 0 }
      ],
      { duration: 340, easing: "ease-out" }
    );

    // flash suave na tela
    if (flashLayer) {
      flashLayer.animate(
        [
          { opacity: 0 },
          { opacity: 0.5 },
          { opacity: 0.18 },
          { opacity: 0 }
        ],
        { duration: 380, easing: "ease-out" }
      );
    }

    boltAnim.onfinish = () => {
      svg.innerHTML = "";
      svg.appendChild(defs);
    };
  }

  // ----- agenda grupos de raios (1–4 juntos) -----
  function scheduleBolt() {
    const boltsThisRound = 1 + Math.floor(Math.random() * 4); // 1–4

    // todos quase ao mesmo tempo (diferença < 80ms)
    for (let i = 0; i < boltsThisRound; i++) {
      const tinyOffset = Math.random() * 80;
      setTimeout(() => {
        drawBolt();
      }, tinyOffset);
    }

    const delayToNextRound = 2500 + Math.random() * 4000; // próxima trovoada
    setTimeout(scheduleBolt, delayToNextRound);
  }

  scheduleBolt();
});
