import type React from "react"

const BoxLoader: React.FC = () => {
    return (
        <div className="relative" style={{ height: '100px' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
        .boxes-container {
          --size: 32px;
          --duration: 800ms;
          height: calc(var(--size) * 2);
          width: calc(var(--size) * 3);
          position: relative;
          transform-style: preserve-3d;
          transform-origin: 50% 50%;
          margin-top: calc(var(--size) * 1.5 * -1);
          transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
        }

        .box-item {
          width: var(--size);
          height: var(--size);
          top: 0;
          left: 0;
          position: absolute;
          transform-style: preserve-3d;
        }

        .box-item:nth-child(1) {
          transform: translate(100%, 0);
          animation: box1 var(--duration) linear infinite;
        }

        .box-item:nth-child(2) {
          transform: translate(0, 100%);
          animation: box2 var(--duration) linear infinite;
        }

        .box-item:nth-child(3) {
          transform: translate(100%, 100%);
          animation: box3 var(--duration) linear infinite;
        }

        .box-item:nth-child(4) {
          transform: translate(200%, 0);
          animation: box4 var(--duration) linear infinite;
        }

        @keyframes box1 {
          0%,
          50% {
            transform: translate(100%, 0);
          }
          100% {
            transform: translate(200%, 0);
          }
        }

        @keyframes box2 {
          0% {
            transform: translate(0, 100%);
          }
          50% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100%, 0);
          }
        }

        @keyframes box3 {
          0%,
          50% {
            transform: translate(100%, 100%);
          }
          100% {
            transform: translate(0, 100%);
          }
        }

        @keyframes box4 {
          0% {
            transform: translate(200%, 0);
          }
          50% {
            transform: translate(200%, 100%);
          }
          100% {
            transform: translate(100%, 100%);
          }
        }

        .box-face {
          width: var(--size);
          height: var(--size);
          position: absolute;
          background-color: #ef4444;
          border: 1px solid #dc2626;
        }

        .face-front {
          transform: translateZ(calc(var(--size) / 2));
        }

        .face-right {
          transform: rotateY(90deg) translateZ(calc(var(--size) / 2));
        }

        .face-top {
          transform: rotateX(90deg) translateZ(calc(var(--size) / 2));
        }

        .face-back {
          transform: rotateY(180deg) translateZ(calc(var(--size) / 2));
        }
      `}} />
            <div className="boxes-container">
                <div className="box-item">
                    <div className="box-face face-front" />
                    <div className="box-face face-right" />
                    <div className="box-face face-top" />
                    <div className="box-face face-back" />
                </div>
                <div className="box-item">
                    <div className="box-face face-front" />
                    <div className="box-face face-right" />
                    <div className="box-face face-top" />
                    <div className="box-face face-back" />
                </div>
                <div className="box-item">
                    <div className="box-face face-front" />
                    <div className="box-face face-right" />
                    <div className="box-face face-top" />
                    <div className="box-face face-back" />
                </div>
                <div className="box-item">
                    <div className="box-face face-front" />
                    <div className="box-face face-right" />
                    <div className="box-face face-top" />
                    <div className="box-face face-back" />
                </div>
            </div>
        </div>
    )
}

export default BoxLoader
