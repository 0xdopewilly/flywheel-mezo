"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero object: a chrome flywheel with a Bitcoin-gold core, four glowing stations (vote, harvest, boost, save)
 * and an energy comet riding the rim. Built procedurally with three.js.
 *
 * Tuned to stay smooth on ordinary laptops: no post-processing (glow comes from additive halo sprites),
 * standard materials only, instanced rim plates (one draw call), a capped pixel ratio that drops further
 * if frames run long, and no rendering while the hero is off screen or the tab is hidden.
 * Scrolling spins it up, like a real flywheel; it settles back when you stop.
 */
export function Flywheel3D({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        setFailed(true);
        return;
      }
      let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.cssText = "width:100%;height:100%;display:block;opacity:0;transition:opacity .6s ease";
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      pmrem.dispose();

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 8.2);

      // ---------- materials (standard only) ----------
      const chrome = new THREE.MeshStandardMaterial({ color: 0xcbbcff, metalness: 1, roughness: 0.22, envMapIntensity: 0.9 });
      const darkSteel = new THREE.MeshStandardMaterial({ color: 0x2b1d4a, metalness: 0.9, roughness: 0.35, envMapIntensity: 0.6 });
      const plate = new THREE.MeshStandardMaterial({ color: 0x7a63c4, metalness: 1, roughness: 0.3, envMapIntensity: 0.7 });
      const violetGlow = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0xa77bff, emissiveIntensity: 1.6, roughness: 0.4 });
      const magentaGlow = new THREE.MeshBasicMaterial({ color: 0xf0abfc });
      const gold = new THREE.MeshStandardMaterial({ color: 0xf5b53d, metalness: 1, roughness: 0.25, emissive: 0x6b3c00, emissiveIntensity: 0.4 });
      const goldGlow = new THREE.MeshBasicMaterial({ color: 0xffc35a });

      // ---------- halo sprites: cheap glow without a bloom pass ----------
      const haloTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.25, "rgba(255,255,255,0.45)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })();
      const halo = (color: number, size: number, opacity: number) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
        s.scale.set(size, size, 1);
        return s;
      };

      // ---------- the wheel ----------
      const rig = new THREE.Group();
      const wheel = new THREE.Group();
      rig.add(wheel);
      scene.add(rig);

      const backGlow = halo(0x7c3aed, 6.4, 0.55);
      backGlow.position.z = -0.6;
      rig.add(backGlow);

      const R = 1.62;
      wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.11, 24, 128), chrome));
      const backRim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.08, 16, 128), darkSteel);
      backRim.position.z = -0.2;
      wheel.add(backRim);
      const innerLight = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.018, 8, 128), violetGlow);
      innerLight.position.z = 0.04;
      wheel.add(innerLight);

      // turbine plates around the rim: one instanced draw call
      const PLATES = 56;
      const plates = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 0.07, 0.3), plate, PLATES);
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const one = new THREE.Vector3(1, 1, 1);
      for (let i = 0; i < PLATES; i++) {
        const a = (i / PLATES) * Math.PI * 2;
        e.set(0.35, 0, a);
        q.setFromEuler(e);
        m4.compose(new THREE.Vector3(Math.cos(a) * (R + 0.2), Math.sin(a) * (R + 0.2), -0.06), q, one);
        plates.setMatrixAt(i, m4);
      }
      wheel.add(plates);

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
          const node = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 6), violetGlow);
          node.rotation.x = Math.PI / 2;
          node.position.set(Math.cos(a) * R, Math.sin(a) * R, 0.09);
          wheel.add(node);
          const glow = halo(0xa77bff, 0.9, 0.7);
          glow.position.set(Math.cos(a) * R, Math.sin(a) * R, 0.25);
          wheel.add(glow);
        }
      }

      // hub: chrome housing, gold ring, Bitcoin core
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.36, 40), chrome);
      hub.rotation.x = Math.PI / 2;
      wheel.add(hub);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.03, 8, 72), goldGlow);
      ring.position.z = 0.19;
      wheel.add(ring);
      const coreTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
        grad.addColorStop(0, "#4a2c07");
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
      const core = new THREE.Mesh(new THREE.CircleGeometry(0.36, 48), new THREE.MeshBasicMaterial({ map: coreTex }));
      core.position.z = 0.185;
      wheel.add(core);
      const coreBack = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 40), gold);
      coreBack.rotation.x = Math.PI / 2;
      coreBack.position.z = 0.16;
      wheel.add(coreBack);
      const coreGlow = halo(0xffb43a, 1.9, 0.75);
      coreGlow.position.z = 0.3;
      wheel.add(coreGlow);

      // energy comet riding the rim (spins faster than the wheel)
      const comet = new THREE.Group();
      const cometArc = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 8, 64, 1.25), magentaGlow);
      cometArc.position.z = 0.1;
      comet.add(cometArc);
      const headPos = new THREE.Vector3(Math.cos(1.25) * R, Math.sin(1.25) * R, 0.12);
      const cometHead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      cometHead.position.copy(headPos);
      comet.add(cometHead);
      const cometGlow = halo(0xe879f9, 1.2, 0.95);
      cometGlow.position.copy(headPos).setZ(0.3);
      comet.add(cometGlow);
      rig.add(comet);

      // orbiting dust
      const N = 320;
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
        new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      rig.add(dust);

      // ---------- light ----------
      scene.add(new THREE.AmbientLight(0x6d4bd1, 0.25));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(3, 4, 6);
      scene.add(key);
      const rimV = new THREE.PointLight(0x8b5cf6, 26, 20);
      rimV.position.set(-4, 2, -2);
      scene.add(rimV);
      const rimM = new THREE.PointLight(0xc026d3, 16, 20);
      rimM.position.set(4, -3, -1);
      scene.add(rimM);

      // ---------- sizing ----------
      const resize = () => {
        const w = Math.max(1, el.clientWidth);
        const h = Math.max(1, el.clientHeight);
        renderer.setSize(w, h, false);
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
      const onMove = (ev: PointerEvent) => {
        pointer.x = (ev.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (ev.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onMove, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0 });
      io.observe(el);

      const clock = new THREE.Clock();
      let raf = 0;
      let first = true;
      // adaptive quality: if frames run long, render fewer pixels; if still slow, draw every other frame
      let slowFrames = 0;
      let sampled = 0;
      let halfRate = false;
      let odd = false;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) {
          clock.getDelta();
          return;
        }
        if (halfRate) {
          odd = !odd;
          if (odd) return;
        }
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
        renderer.render(scene, camera);
        if (first) {
          first = false;
          canvas.style.opacity = "1";
          setReady(true);
        }
        if (sampled < 180 && !halfRate) {
          sampled++;
          if (dt > 0.024) slowFrames++;
          if (sampled % 90 === 0) {
            if (slowFrames > 30 && dpr > 1) {
              dpr = 1;
              renderer.setPixelRatio(dpr);
              resize();
            } else if (slowFrames > 30) {
              halfRate = true;
            }
            slowFrames = 0;
          }
        }
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onMove);
        envTex.dispose();
        coreTex.dispose();
        haloTex.dispose();
        scene.traverse((o) => {
          const m = o as unknown as { geometry?: { dispose: () => void }; material?: { dispose: () => void } | { dispose: () => void }[] };
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((x) => x.dispose());
          else m.material?.dispose();
        });
        renderer.dispose();
        canvas.remove();
      };
    })().catch(() => setFailed(true));

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={host} className={`relative ${className}`} aria-hidden>
      {(failed || !ready) && <StaticWheel />}
    </div>
  );
}

/** Shown until the 3D scene draws, and instead of it when WebGL is unavailable. */
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
