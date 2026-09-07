"use client";

import Image from "next/image";
import IdeaSubmissionForm from "@/components/idea-forms/idea-submission-form";
import withAuth from "@/components/auth/withAuth";

const IdeaSubmission = () => {
  return (
    <div className="wrapper afacad z-0">
      <IdeaSubmissionForm />
      <div className="corner-image-right">
        <Image
          src="/vector2.svg"
          alt="Corner decoration"
          width={1000}
          height={800}
          className="rotate-90 relative -right-[23.7rem] -top-40"
        />
      </div>

      <div className="semi-circle"></div>
      <div className="logo-circle">
        <div className="logo-circle-white">
          <Image
            src="/final-logo.webp"
            alt="Hackulus Logo"
            width={300}
            height={300}
          />
        </div>
      </div>

      <div className="corner-image-left">
        <Image
          src="/vector5.svg"
          alt="Corner decoration"
          width={1000}
          height={800}
          className="rotate-90 relative -left-[27.7rem] -top-72"
        />
      </div>

      <div className="corner-image-topleft">
        <Image
          src="/vector1.svg"
          alt="Corner decoration"
          width={200}
          height={10}
        />
      </div>

      <div className="decor blue"></div>
      <div className="decor babyblue"></div>
      <div className="decor yellow"></div>
      <Image
        src="/vector4.svg"
        alt="yellow decor"
        width={70}
        height={70}
        className="absolute top-10 left-56"
      />
      <Image
        src="/vector13.svg"
        alt="yellow decor"
        width={180}
        height={180}
        className="absolute bottom-0 left-96"
      />

      <style jsx>{`
        .wrapper {
          min-height: 100vh;
          width: 100vw;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .corner-image-left {
          position: absolute;
          bottom: 0;
          left: 0;
          z-index: 1;
        }
        .corner-image-right {
          position: absolute;
          bottom: 0;
          right: 0;
          z-index: 0;
        }
        .corner-image-topleft {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }
        .semi-circle {
          position: absolute;
          top: -3%;
          right: 18%;
          width: 250px;
          height: 480px;
          border-top-left-radius: 230px;
          border-bottom-left-radius: 230px;
          background: linear-gradient(to bottom, #fc2d2d, #fd5223, #ff9811);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-circle {
          position: absolute;
          top: 2%;
          right: 5%;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: #ffc640;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-circle-white {
          position: absolute;
          top: 11%;
          right: 10%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: #faf9f8ff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 50px rgba(255, 105, 46, 0.5);
        }
        .decor.blue {
          position: absolute;
          top: 50;
          left: 150px;
          width: 120px;
          height: 120px;
          background: #242e6c;
          border-radius: 50%;
          opacity: 0.95;
          z-index: 0;
        }
        .decor.red {
          position: absolute;
          left: -40px;
          top: 0;
          width: 160px;
          height: 420px;
          background: #ff692e;
          border-radius: 0 300px 300px 0;
          opacity: 0.9;
        }
        .decor.yellow {
          position: absolute;
          left: 300px;
          bottom: 40px;
          width: 200px;
          height: 200px;
          background: #ffc640;
          border-radius: 50%;
        }
        .decor.dots1 {
          position: absolute;
          top: 50px;
          left: 240px;
          display: grid;
          grid-template-columns: repeat(4, 5px);
          grid-gap: 8px;
        }
        .decor.dots2 {
          position: absolute;
          bottom: 90px;
          left: 400px;
          display: grid;
          grid-template-columns: repeat(4, 8px);
          grid-gap: 8px;
        }
        .decor.dots1 div {
          width: 8px;
          height: 8px;
          background: #ff7824;
        }
        .decor.dots2 div {
          width: 12px;
          height: 12px;
          background: #ff7824;
        }
      `}</style>
    </div>
  );
};

export default withAuth(IdeaSubmission);
