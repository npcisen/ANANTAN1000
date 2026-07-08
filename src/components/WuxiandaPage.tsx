"use client";

import Image from "next/image";
import { Heart, MessageSquare, Play, Send } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const scrambleGlyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const gearSlots = ["01", "02", "03", "04"];
const maxUiScale = 1;
const minUiScale = 0.58;

function clampScale(value: number) {
  return Math.min(maxUiScale, Math.max(minUiScale, value));
}

function ScrambleText({ children }: { children: string }) {
  const [scramble, setScramble] = useState({
    source: children,
    text: children,
  });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.clearInterval(frameRef.current);
      }
    };
  }, []);

  const run = useCallback(() => {
    if (frameRef.current !== null) {
      window.clearInterval(frameRef.current);
    }

    let frame = 0;
    const total = 9;

    frameRef.current = window.setInterval(() => {
      frame += 1;
      const settled = frame / total;

      setScramble({
        source: children,
        text: children
          .split("")
          .map((char, index) => {
            if (char === " ") {
              return char;
            }

            if (index / Math.max(children.length - 1, 1) < settled) {
              return char;
            }

            return scrambleGlyphs[
              Math.floor(Math.random() * scrambleGlyphs.length)
            ];
          })
          .join(""),
      });

      if (frame >= total) {
        if (frameRef.current !== null) {
          window.clearInterval(frameRef.current);
          frameRef.current = null;
        }
        setScramble({ source: children, text: children });
      }
    }, 28);
  }, [children]);

  const text = scramble.source === children ? scramble.text : children;

  return (
    <span
      className="wxd-scramble"
      onFocus={run}
      onMouseEnter={run}
      onMouseOver={run}
      onPointerEnter={run}
    >
      {text}
    </span>
  );
}

function WxdBarButton({
  children,
  suffix,
}: {
  children: ReactNode;
  suffix?: string;
}) {
  return (
    <span className="wxd-bar-button">
      <span>
        {typeof children === "string" ? (
          <ScrambleText>{children}</ScrambleText>
        ) : (
          children
        )}
      </span>
      {suffix ? (
        <span className="wxd-muted">
          <ScrambleText>{suffix}</ScrambleText>
        </span>
      ) : null}
    </span>
  );
}

function GearBar({
  className = "",
  selected,
  setSelected,
}: {
  className?: string;
  selected: number;
  setSelected: (index: number) => void;
}) {
  return (
    <div className={`wxd-gear-bar ${className}`}>
      <button className="wxd-plain-button" type="button">
        <WxdBarButton suffix={`${gearSlots[selected]}/04`}>装扮</WxdBarButton>
      </button>
      <div className="wxd-gear-slots" aria-label="装扮选择">
        {gearSlots.map((slot, index) => (
          <button
            aria-label={`装扮 ${slot}`}
            aria-pressed={selected === index}
            className={selected === index ? "wxd-slot is-active" : "wxd-slot"}
            key={slot}
            onClick={() => setSelected(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

function ProfilePanel({
  selected,
  setSelected,
}: {
  selected: number;
  setSelected: (index: number) => void;
}) {
  return (
    <section className="wxd-profile-panel" aria-label="角色档案">
      <div className="wxd-profile-card">
        <div className="wxd-title-row">
          <h1>
            <ScrambleText>角色档案</ScrambleText>
          </h1>
          <strong>
            <ScrambleText>CHARACTERS</ScrambleText>
          </strong>
        </div>
        <div className="wxd-meta-row">
          <span>
            <WxdBarButton suffix="10">数量</WxdBarButton>
          </span>
          <span>
            <WxdBarButton suffix="88">队列</WxdBarButton>
          </span>
          <span>
            <WxdBarButton suffix="#208">NUBER</WxdBarButton>
          </span>
        </div>
        <GearBar
          className="wxd-gear-card"
          selected={selected}
          setSelected={setSelected}
        />
      </div>

      <div className="wxd-name-block">
        <p>
          <ScrambleText>代号：摄灵之彩</ScrambleText>
        </p>
        <h2>
          <span>
            <ScrambleText>班茜</ScrambleText>
          </span>
          <em>
            <ScrambleText>BANSY</ScrambleText>
          </em>
        </h2>
      </div>

      <GearBar
        className="wxd-mid-gear"
        selected={selected}
        setSelected={setSelected}
      />

      <article className="wxd-comment">
        <div className="wxd-comment-head">
          <span className="wxd-avatar" aria-hidden="true" />
          <strong>
            <ScrambleText>SEYMOUR</ScrambleText>
          </strong>
          <span className="wxd-more">
            <ScrambleText>...</ScrambleText>
          </span>
        </div>
        <div className="wxd-comment-body">
          <p>充满破坏与创造欲的灵魂画师。唯有涂鸦才是真爱，看这完美的创作，你一定会着魔的。</p>
          <div className="wxd-actions" aria-label="评论互动">
            <button aria-label="喜欢" className="is-liked" type="button">
              <Heart fill="currentColor" size={28} strokeWidth={0} />
            </button>
            <button aria-label="评论" type="button">
              <MessageSquare size={25} strokeWidth={2.2} />
            </button>
            <button aria-label="发送" type="button">
              <Send size={25} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

export function WuxiandaPage() {
  const [selected, setSelected] = useState(0);
  const [swapCount, setSwapCount] = useState(0);
  const [uiScale, setUiScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      const portrait = window.innerHeight > window.innerWidth;
      const fitScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);

      setIsPortrait(portrait);
      setUiScale(portrait ? 1 : clampScale(fitScale));
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const pageStyle = {
    "--wxd-ui-scale": uiScale,
    ...(!isPortrait
      ? {
          "--wxd-character-stage-height": "min(162vh, 91vw)",
          "--wxd-character-top": "-18vh",
          "--wxd-character-translate": "-54%",
        }
      : {}),
  } as CSSProperties;

  return (
    <main
      className="wxd-page"
      aria-label="无限大角色页面 wuxianda_01"
      style={pageStyle}
    >
      <section className="wxd-frame" aria-label="wuxianda_01 1920x1080">
        <div className="wxd-scene" aria-hidden="true">
          <Image
            alt=""
            className="wxd-bg"
            fill
            priority
            sizes="100vw"
            src="/images/wuxianda/wuxianda_01/bg_01.png"
            unoptimized
          />
          <Image
            alt=""
            className="wxd-bg-logo"
            fill
            priority
            sizes="100vw"
            src="/images/wuxianda/wuxianda_01/bg_02_logo.png"
            unoptimized
          />
        </div>
        <div className="wxd-character-stage" aria-hidden="true">
          <Image
            alt=""
            className="wxd-character-shadow"
            height={1468}
            priority
            src="/images/wuxianda/wuxianda_01/bnsy_01shadwo.png"
            width={836}
            unoptimized
          />
          <Image
            alt=""
            className="wxd-character"
            height={1468}
            priority
            src="/images/wuxianda/wuxianda_01/bnsy_01.png"
            width={836}
            unoptimized
          />
        </div>
        <div className="wxd-ui-layer">
          <ProfilePanel selected={selected} setSelected={setSelected} />
          <GearBar
            className="wxd-top-gear"
            selected={selected}
            setSelected={setSelected}
          />
          <button
            className="wxd-switch"
            onClick={() => setSwapCount((count) => count + 1)}
            type="button"
          >
            <span>
              <ScrambleText>{swapCount % 2 === 0 ? "切换" : "预览"}</ScrambleText>
            </span>
            <strong>
              <ScrambleText>{"//"}</ScrambleText>
            </strong>
            <Play fill="currentColor" size={15} strokeWidth={0} />
          </button>
        </div>
      </section>
    </main>
  );
}
