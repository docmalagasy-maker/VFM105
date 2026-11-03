"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Vidéo de Johnny Rakotoarisoa détourée, placée derrière l'affiche (les
 * textes, le macaron et le bandeau restent devant).
 *
 * Un MP4 n'a pas de transparence : chaque image de `johnny-detoure.mp4`
 * contient les couleurs en haut et le masque (gris) en bas ; un petit shader
 * WebGL les recombine. Lecture aller-retour encodée dans la vidéo, donc sans
 * saut à la reprise. Image fixe du personnage tant que la vidéo n'est pas
 * prête, et à la place de la vidéo si WebGL ou la lecture automatique sont
 * indisponibles, ou si le visiteur a demandé moins d'animations.
 */

const VIDEO = "/videos/johnny-detoure.mp4";

/** Position de la vidéo dans le repère de l'affiche (1121 × 1403). */
const CADRE = { gauche: 448, haut: 15, largeur: 674, hauteur: 1072 };
const AFFICHE = { largeur: 1121, hauteur: 1403 };

const SOMMETS = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2((p.x + 1.0) / 2.0, (1.0 - p.y) / 2.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAGMENTS = `
precision mediump float;
uniform sampler2D video;
varying vec2 uv;
void main() {
  vec3 couleur = texture2D(video, vec2(uv.x, uv.y * 0.5)).rgb;
  float alpha = texture2D(video, vec2(uv.x, 0.5 + uv.y * 0.5)).r;
  gl_FragColor = vec4(couleur * alpha, alpha);
}`;

function pourcent(valeur: number, total: number) {
  return `${(valeur / total) * 100}%`;
}

export default function PersonnageAnime({ sizes }: { sizes: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoPrete, setVideoPrete] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!gl) return;

    const compiler = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    };
    const programme = gl.createProgram()!;
    gl.attachShader(programme, compiler(gl.VERTEX_SHADER, SOMMETS));
    gl.attachShader(programme, compiler(gl.FRAGMENT_SHADER, FRAGMENTS));
    gl.linkProgram(programme);
    if (!gl.getProgramParameter(programme, gl.LINK_STATUS)) return;
    gl.useProgram(programme);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(programme, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const video = document.createElement("video");
    video.src = VIDEO;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";

    let actif = true;
    let premiere = true;
    let rafId = 0;
    const dessiner = () => {
      if (!actif) return;
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        if (premiere) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight / 2;
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (premiere) {
          premiere = false;
          setVideoPrete(true);
        }
      }
      rafId = requestAnimationFrame(dessiner);
    };

    // Lecture seulement quand l'affiche est à l'écran
    const observateur = new IntersectionObserver(([entree]) => {
      if (entree.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observateur.observe(canvas);
    video.addEventListener("playing", () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(dessiner);
    });

    return () => {
      actif = false;
      cancelAnimationFrame(rafId);
      observateur.disconnect();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Image fixe : avant le chargement de la vidéo, ou si elle ne peut pas être lue */}
      <Image
        src="/images/affiche-personnage-sans-logo.png"
        alt=""
        width={AFFICHE.largeur}
        height={AFFICHE.hauteur}
        sizes={sizes}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${videoPrete ? "opacity-0" : "opacity-100"}`}
        priority
      />
      <canvas
        ref={canvasRef}
        className={`absolute transition-opacity duration-500 ${videoPrete ? "opacity-100" : "opacity-0"}`}
        style={{
          left: pourcent(CADRE.gauche, AFFICHE.largeur),
          top: pourcent(CADRE.haut, AFFICHE.hauteur),
          width: pourcent(CADRE.largeur, AFFICHE.largeur),
          height: pourcent(CADRE.hauteur, AFFICHE.hauteur),
        }}
      />
    </div>
  );
}
