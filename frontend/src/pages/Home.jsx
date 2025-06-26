import React, { useEffect, useRef, useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import Logo from '../assets/logo.svg';
import Homebg from '../assets/Homebg.jpg';
import Aboutbg from '../assets/Aboutbg.jpg';
import About2 from '../assets/About2.jpg';
import ab3 from '../assets/ab3.jpg';
import ab4 from '../assets/ab4.jpg';
import ab5 from '../assets/ab5.jpg';
import Fund from '../assets/Fund.jpg';
import SupportIcon from '../components/SupportIcon';

// Animated Counter Hook
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    let raf;
    function update() {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        raf = requestAnimationFrame(update);
      } else {
        setCount(end);
      }
    }
    update();
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return count;
}

export default function Home() {
  // Animated stats
  const donors = useCountUp(12000, 1800);
  const livesSaved = useCountUp(35000, 2200);
  const partners = useCountUp(50, 1500);

  // Smooth scroll to section
  const aboutRef = useRef(null);
  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-colour1 via-white to-colour4 flex flex-col">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center h-[90vh] overflow-hidden">
        <img src={About2} alt="hero" className="absolute inset-0 w-full h-full object-cover object-center z-0 scale-105 blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-colour4/60 to-colour2/40 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 animate-fade-in">
          <img src={Logo} alt="RedDrop Logo" className="w-20 h-20 mb-6 drop-shadow-xl animate-fade-in-up" />
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-2xl animate-fade-in-up">
            Save Lives, One Drop at a Time
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl animate-fade-in-up">
            Your blood donation can give someone a second chance at life. Sign up today, find a nearby donation center, and become a hero in just a few minutes. Every drop counts!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <button
              className="bg-colour3 hover:bg-colour2 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-colour2/40"
              onClick={scrollToAbout}
            >
              Learn More
            </button>
            <a
              href="/donor-login"
              className="bg-white/90 hover:bg-white text-colour4 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 border-2 border-colour4/20 hover:border-colour3 focus:outline-none focus:ring-4 focus:ring-colour3/30"
            >
              Donate Now <HiArrowRight className="inline ml-2" />
            </a>
          </div>
        </div>
        {/* Glassmorphism Card with Stats */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-8 bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-6 border border-white/40 animate-fade-in-up">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-colour3 animate-fade-in-up">{donors.toLocaleString()}</div>
            <div className="text-sm md:text-base text-colour4 font-semibold">Active Donors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-colour2 animate-fade-in-up">{livesSaved.toLocaleString()}</div>
            <div className="text-sm md:text-base text-colour4 font-semibold">Lives Saved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-colour4 animate-fade-in-up">{partners}+</div>
            <div className="text-sm md:text-base text-colour4 font-semibold">Partners</div>
          </div>
        </div>
      </section>

      {/* Mission and Values Section */}
      <section ref={aboutRef} className="py-20 px-4 bg-gradient-to-br from-white via-colour1/60 to-white animate-fade-in-up">
        <h2 className="text-4xl font-bold text-center text-colour4 mb-12 animate-fade-in-up">Our Vision, Mission & Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="sexy-card p-8 rounded-2xl text-center text-white shadow-xl animate-fade-in-up">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-semibold mb-2">Our Vision</h3>
            <p className="text-white/90">
              Create a world where no life is lost due to a lack of access to safe and sufficient blood. We envision a global community united by compassion, where blood donation becomes a simple, accessible, and life-saving act for everyone.
            </p>
          </div>
          <div className="sexy-card p-8 rounded-2xl text-center text-white shadow-xl animate-fade-in-up delay-100">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-semibold mb-2">Mission</h3>
            <p className="text-white/90">
              We are committed to building a reliable and efficient blood donation ecosystem by encouraging regular donations, simplifying the donation process, and leveraging technology. Through partnerships with healthcare providers and communities.
            </p>
          </div>
          <div className="sexy-card p-8 rounded-2xl text-center text-white shadow-xl animate-fade-in-up delay-200">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-2xl font-semibold mb-2">Core Values</h3>
            <p className="text-white/90">
              We uphold the highest standards of integrity, prioritizing safety, transparency, and trust in every step of the blood donation process. Our focus is on creating meaningful impact, empowering donors, and ensuring every drop makes a difference.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-gradient-to-r from-colour2/80 to-colour4/80 animate-fade-in">
        <img src={Aboutbg} alt="About RedDrop" className="absolute inset-0 w-full h-full object-cover object-center opacity-60 z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-colour4/60 to-colour2/40 z-10" />
        <div className="relative z-20 text-center text-white px-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About RedDrop</h1>
          <p className="text-xl md:text-2xl mb-8">DONATE YOUR BLOOD AND INSPIRE OTHERS TO DONATE</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white animate-fade-in-up">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-left">
            <img src={Homebg} alt="Our Story" className="w-full h-auto rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="animate-fade-in-right">
            <h2 className="text-3xl font-bold text-colour4 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4 text-lg">
              At RedDrop, we are dedicated to saving lives by connecting donors with those in urgent need. Our mission is to create a seamless and efficient platform where individuals can donate blood, find nearby donation centers, and request urgent blood support. We believe that every drop counts, and through technology, we aim to make the donation process simple, accessible, and impactful.
            </p>
            <p className="text-gray-600 text-lg">
              With a commitment to transparency and reliability, our platform ensures real-time updates, secure data handling, and a user-friendly experience. Whether you are a donor looking to give the gift of life or a recipient in need, we are here to bridge the gap and strengthen the life-saving network of blood donation. Together, we can make a difference—one donation at a time.
            </p>
            <div className="flex mt-6">
              <a
                href="/donor-login"
                className="bg-colour3 hover:bg-colour2 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-colour2/40"
              >
                Donate Now <HiArrowRight className="inline ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-colour1/60 via-white to-colour2/10 animate-fade-in-up">
        <h2 className="text-4xl font-bold text-center text-colour4 mb-12">Why Choose RedDrop?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="sexy-card p-0 rounded-2xl text-center shadow-xl animate-fade-in-up">
            <img src={ab3} alt="Superior Protection" className="w-full h-56 object-cover rounded-t-2xl" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-white mb-2">Superior Protection</h3>
              <p className="text-white/90">
                RedDrop ensures your blood donation saves lives by connecting you to patients in urgent need across hospitals and healthcare centers.
              </p>
            </div>
          </div>
          <div className="sexy-card p-0 rounded-2xl text-center shadow-xl animate-fade-in-up delay-100">
            <img src={ab4} alt="Vibrant Colors" className="w-full h-56 object-cover rounded-t-2xl" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-white mb-2">Vibrant Experience</h3>
              <p className="text-white/90">
                Our platform offers a seamless, user-friendly experience, from finding donation centers to tracking your impact, making giving simple and rewarding.
              </p>
            </div>
          </div>
          <div className="sexy-card p-0 rounded-2xl text-center shadow-xl animate-fade-in-up delay-200">
            <img src={ab5} alt="Eco-Friendly" className="w-full h-56 object-cover rounded-t-2xl" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-white mb-2">Trusted & Transparent</h3>
              <p className="text-white/90">
                Partnering with trusted blood banks, we guarantee safety, reliability, and transparency, so your donation makes a real, life-changing difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Fund Section */}
      <section className="py-20 bg-white animate-fade-in-up">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 animate-fade-in-left text-justify">
            <h2 className="text-3xl font-bold text-colour4 mb-6">Make a Difference</h2>
            <p className="text-gray-600 mb-4 text-lg">
              Your support helps us expand our reach, improve our technology, and save more lives. Join us in our mission to make blood donation accessible and impactful for everyone.
            </p>
            <div className="flex mt-6">
              <a
                href="/contactus"
                className="bg-colour4 hover:bg-colour2 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-colour2/40"
              >
                Support Us <HiArrowRight className="inline ml-2" />
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 animate-fade-in-right">
            <img src={Fund} alt="Support RedDrop" className="w-full h-auto rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      <SupportIcon />
    </div>
  );
}