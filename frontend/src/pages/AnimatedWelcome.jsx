import React from 'react';

const AnimatedWelcome = ({ name }) => {
  const text = `Welcome, ${name}`;
  
  return (
    <div className="text-center my-6">
      <h2
        className="text-4xl md:text-5xl font-bold text-teal-500 tracking-wide"
        style={{ fontFamily: `'Outfit', sans-serif` }}
      >
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="inline-block opacity-0 animate-fade-in-char"
            style={{
              animationDelay: `${index * 0.05}s`, // adjust speed
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h2>
    </div>
  );
};

export default AnimatedWelcome;
