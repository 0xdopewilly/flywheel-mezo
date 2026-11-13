"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero object: a chrome flywheel with a Bitcoin-gold core, four glowing stations (vote, harvest, boost, save)
 * and an energy comet riding the rim. Built procedurally with three.js, so there is nothing to download but code.
 * Scrolling spins it up, like a real flywheel; it settles back when you stop.
 */
export function Flywheel3D({ className = "", onReady }: { className?: string; onReady?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js");
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { UnrealBloomPass } = await import("three/examples/jsm/postprocessing/UnrealBloomPass.js");
      const { OutputPass } = await import("three/examples/jsm/postprocessing/OutputPass.js");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        setFailed(true);
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.82;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x0c0717, 1);
      el.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      // the canvas is opaque (bloom needs it); fade its edges into the panel
      renderer.domElement.style.maskImage = "radial-gradient(circle at 50% 50%, #000 50%, transparent 70%)";
      renderer.domElement.style.webkitMaskImage = "radial-gradient(circle at 50% 50%, #000 50%, transparent 70%)";

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 8.2);

      // ---------- materials ----------
      const chrome = new THREE.MeshPhysicalMaterial({ color: 0xcbbcff, metalness: 1, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.75 });
      const darkSteel = new THREE.MeshPhysicalMaterial({ color: 0x2b1d4a, metalness: 0.9, roughness: 0.35, clearcoat: 0.6 });
      const plate = new THREE.MeshPhysicalMaterial({ color: 0x7a63c4, metalness: 1, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 0.6 });
      const violetGlow = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x9d6bff, emissiveIntensity: 1.5, metalness: 0.2, roughness: 0.4 });
      const magentaGlow = new THREE.MeshStandardMaterial({ color: 0xc026d3, emissive: 0xe040fb, emissiveIntensity: 1.9 });
      const gold = new THREE.MeshPhysicalMaterial({ color: 0xf5b53d, metalness: 1, roughness: 0.22, clearcoat: 1, emissive: 0x6b3c00, emissiveIntensity: 0.35 });
      const goldGlow = new THREE.MeshStandardMaterial({ color: 0xf5b53d, emissive: 0xffb43a, emissiveIntensity: 1.3 });

      // ---------- the wheel ----------
      const rig = new THREE.Group();
      const wheel = new THREE.Group();
      rig.add(wheel);
      scene.add(rig);

      const R = 1.62;
      wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.11, 36, 200), chrome));
      const backRim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.08, 24, 200), darkSteel);
      backRim.position.z = -0.2;
      wheel.add(backRim);
      const innerLight = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.018, 12, 200), violetGlow);
      innerLight.position.z = 0.04;
      wheel.add(innerLight);

      // turbine plates around the rim
      const plateGeo = new THREE.BoxGeometry(0.26, 0.07, 0.3);
      for (let i = 0; i < 56; i++) {
        const a = (i / 56) * Math.PI * 2;
        const m = new THREE.Mesh(plateGeo, i % 14 === 0 ? violetGlow : plate);
        m.position.set(Math.cos(a) * (R + 0.2), Math.sin(a) * (R + 0.2), -0.06);
        m.rotation.z = a;
        m.rotation.x = 0.35;
        wheel.add(m);
      }

      // spokes: four heavy (the stations) and four light
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const heavy = i % 2 === 0;
        const len = R - 0.5;
        const s = new THREE.Mesh(new THREE.BoxGeometry(len, heavy ? 0.13 : 0.05, heavy ? 0.12 : 0.06), heavy ? chrome : darkSteel);
        s.position.set(Math.cos(a) * (0.42 + len / 2), Math.sin(a) * (0.42 + len / 2), heavy ? 0 : -0.05);
        s.rotation.z = a;
        wheel.add(s);
        if (heavy) {
          // station node on the rim
          const node = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 6), violetGlow);
          node.rotation.x = Math.PI / 2;
          node.position.set(Math.cos(a) * R, Math.sin(a) * R, 0.09);
          wheel.add(node);
          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 6), chrome);
          cap.rotation.x = Math.PI / 2;
          cap.position.set(Math.cos(a) * R, Math.sin(a) * R, -0.02);
          wheel.add(cap);
        }
      }

      // hub: chrome housing, gold ring, Bitcoin core
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.36, 48), chrome);
      hub.rotation.x = Math.PI / 2;
      wheel.add(hub);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.03, 16, 96), goldGlow);
      ring.position.z = 0.19;
      wheel.add(ring);
      const coreTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
        grad.addColorStop(0, "#3a2205");
        grad.addColorStop(1, "#120a1f");
        g.fillStyle = grad;
        g.fillRect(0, 0, 256, 256);
        g.fillStyle = "#ffcb63";
        g.font = "bold 168px Arial, Helvetica, sans-serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("₿", 128, 138);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })();
      const core = new THREE.Mesh(
        new THREE.CircleGeometry(0.36, 64),
        new THREE.MeshStandardMaterial({ map: coreTex, emissive: 0xffb43a, emissiveMap: coreTex, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.4 }),
      );
      core.position.z = 0.185;
      wheel.add(core);
      const coreBack = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 48), gold);
      coreBack.rotation.x = Math.PI / 2;
      coreBack.position.z = 0.16;
      wheel.add(coreBack);

      // energy comet riding the rim (spins faster than the wheel)
      const comet = new THREE.Group();
      const cometArc = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 12, 120, 1.25), magentaGlow);
      cometArc.position.z = 0.1;
      comet.add(cometArc);
      const cometHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf0abfc, emissiveIntensity: 2.4 }));
      cometHead.position.set(Math.cos(1.25) * R, Math.sin(1.25) * R, 0.1);
      comet.add(cometHead);
      rig.add(comet);

      // orbiting dust
      const N = 420;
      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      const cv = new THREE.Color(0xb69cff);
      const cg = new THREE.Color(0xf5b53d);
      for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 2.1 + Math.random() * 1.4;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = Math.sin(a) * r;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
        const c = Math.random() < 0.12 ? cg : cv;
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      dustGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const dust = new THREE.Points(
        dustGeo,
        new THREE.PointsMaterial({ size: 0.028, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      rig.add(dust);

      // ---------- light ----------
      scene.add(new THREE.AmbientLight(0x6d4bd1, 0.2));
      const key = new THREE.DirectionalLight(0xffffff, 1.3);
      key.position.set(3, 4, 6);
      scene.add(key);
      const rimV = new THREE.PointLight(0x8b5cf6, 26, 20);
      rimV.position.set(-4, 2, -2);
      scene.add(rimV);
      const rimM = new THREE.PointLight(0xc026d3, 16, 20);
      rimM.position.set(4, -3, -1);
      scene.add(rimM);
      const coreL = new THREE.PointLight(0xffb43a, 6, 4);
      coreL.position.set(0, 0, 1.2);
      rig.add(coreL);

      // ---------- post ----------
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.5, 0.4, 0.78);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());

      // ---------- sizing ----------
      const resize = () => {
        const w = Math.max(1, el.clientWidth);
        const h = Math.max(1, el.clientHeight);
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // ---------- motion ----------
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let spin = 0.45;
      let lastY = window.scrollY;
      const onScroll = () => {
        const dy = Math.abs(window.scrollY - lastY);
        lastY = window.scrollY;
        spin = Math.min(4.5, spin + dy * 0.006);
      };
      const pointer = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onMove, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0 });
      io.observe(el);

      const clock = new THREE.Clock();
      let raf = 0;
      let first = true;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        spin += (0.45 - spin) * Math.min(1, dt * 0.9);
        const s = reduce ? 0.12 : spin;
        wheel.rotation.z -= s * dt;
        comet.rotation.z -= (s * 2.4 + 0.6) * dt;
        dust.rotation.z -= s * 0.25 * dt;
        rig.rotation.x = -0.3 + (reduce ? 0 : Math.sin(t * 0.6) * 0.04) + pointer.y * 0.08;
        rig.rotation.y = 0.42 + (reduce ? 0 : Math.sin(t * 0.4) * 0.05) + pointer.x * 0.16;
        rig.position.y = reduce ? 0 : Math.sin(t * 0.9) * 0.06;
        bloom.strength = 0.45 + Math.min(0.5, (spin - 0.45) * 0.15);
        composer.render();
        if (first) {
          first = false;
          onReady?.();
        }
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onMove);
        composer.dispose();
        pmrem.dispose();
        envTex.dispose();
        coreTex.dispose();
        scene.traverse((o) => {
          const m = o as unknown as { geometry?: { dispose: () => void }; material?: { dispose: () => void } | { dispose: () => void }[] };
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((x) => x.dispose());
          else m.material?.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => setFailed(true));

    return () => {
      disposed = true;
      cleanup();
    };
  }, [onReady]);

  return (
    <div ref={host} className={`relative ${className}`} aria-hidden>
      {failed && <StaticWheel />}
    </div>
  );
}

/** Shown when WebGL is unavailable: the same object, flat. */
function StaticWheel() {
  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto h-[80%] w-[80%]">
      <defs>
        <linearGradient id="sw" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e7defe" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="78" fill="none" stroke="url(#sw)" strokeWidth="9" />
      <circle cx="100" cy="100" r="58" fill="none" stroke="#9d6bff" strokeWidth="1.5" />
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a} 100 100)`}>
          <rect x="122" y="96" width="50" height="8" fill="url(#sw)" />
          <circle cx="178" cy="100" r="8" fill="#9d6bff" />
        </g>
      ))}
      <circle cx="100" cy="100" r="24" fill="#2a1a05" stroke="#f5b53d" strokeWidth="3" />
      <text x="100" y="110" textAnchor="middle" fontSize="28" fontWeight="700" fill="#ffcb63">
        ₿
      </text>
    </svg>
  );
}
