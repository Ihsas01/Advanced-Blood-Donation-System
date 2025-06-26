import React, { useState } from "react";
import { Button } from "flowbite-react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

export default function FAQ() {
  const faqSections = [
    {
      title: "General Questions",
      items: [
        {
          question: "Who can donate blood?",
          answer:
            "Most healthy adults aged 18-65 can donate blood. Eligibility depends on factors such as weight, recent travel, and medical history.",
        },
        {
          question: "How often can I donate blood?",
          answer:
            "Whole blood donations can be made every 8 weeks (56 days), while platelet donations can be made every 2 weeks.",
        },
        {
          question: "Is blood donation safe?",
          answer:
            "Yes, donating blood is a safe process. New, sterile equipment is used for each donor, ensuring no risk of infection.",
        },
      ],
    },
    {
      title: "Donation Process",
      items: [
        {
          question: "How long does the donation process take?",
          answer:
            "The entire process takes about 45-60 minutes, but the actual blood donation only takes about 10 minutes.",
        },
        {
          question: "What should I do before donating blood?",
          answer:
            "Stay hydrated, eat a healthy meal, and avoid alcohol or caffeine before donating.",
        },
        {
          question: "What happens after I donate blood?",
          answer:
            "You will be given refreshments and asked to rest for a few minutes before resuming normal activities. Avoid heavy exercise for the rest of the day.",
        },
      ],
    },
    {
      title: "Health & Safety",
      items: [
        {
          question: "Are there any side effects of donating blood?",
          answer:
            "Some donors may experience mild dizziness or bruising at the injection site, but these effects are temporary.",
        },
        {
          question: "Can I donate blood if I have a cold or flu?",
          answer:
            "No, you must be in good health and free of infections to donate blood.",
        },
        {
          question: "How is donated blood used?",
          answer:
            "Donated blood is used for surgeries, accident victims, cancer treatments, and patients with blood disorders.",
        },
      ],
    },
  ];

  // Accordion state
  const [openSection, setOpenSection] = useState(null);
  const [openQuestion, setOpenQuestion] = useState({});

  const handleSectionToggle = (idx) => {
    setOpenSection(openSection === idx ? null : idx);
    setOpenQuestion({});
  };
  const handleQuestionToggle = (sectionIdx, qIdx) => {
    setOpenQuestion((prev) => ({
      ...prev,
      [sectionIdx]: prev[sectionIdx] === qIdx ? null : qIdx,
    }));
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-br from-colour1 via-white to-colour4 flex items-center justify-center animate-fade-in">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <h1 className="text-5xl font-extrabold text-center text-colour4 mb-12 animate-fade-in-up drop-shadow-xl">
          Frequently Asked Questions (FAQ)
        </h1>
        <div className="space-y-8">
          {faqSections.map((section, sIdx) => (
            <div
              key={sIdx}
              className="sexy-card bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 animate-fade-in-up"
            >
              <button
                className="w-full flex items-center justify-between text-2xl font-bold text-white focus:outline-none transition-colors duration-300 group"
                onClick={() => handleSectionToggle(sIdx)}
                aria-expanded={openSection === sIdx}
              >
                <span>{section.title}</span>
                <span className="transition-transform duration-300 group-aria-expanded:rotate-180">
                  {openSection === sIdx ? (
                    <HiChevronUp className="text-3xl" />
                  ) : (
                    <HiChevronDown className="text-3xl" />
                  )}
                </span>
              </button>
              <div
                className={`transition-all duration-500 overflow-hidden ${openSection === sIdx ? 'max-h-[1000px] mt-6' : 'max-h-0'}`}
              >
                <div className="space-y-4">
                  {section.items.map((item, qIdx) => (
                    <div
                      key={qIdx}
                      className="rounded-xl bg-white/80 p-4 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer animate-fade-in-up"
                      onClick={() => handleQuestionToggle(sIdx, qIdx)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-colour4">
                          {item.question}
                        </span>
                        <span className="ml-4">
                          {openQuestion[sIdx] === qIdx ? (
                            <HiChevronUp className="text-xl text-colour3" />
                          ) : (
                            <HiChevronDown className="text-xl text-colour3" />
                          )}
                        </span>
                      </div>
                      <div
                        className={`transition-all duration-500 text-colour4/90 ${openQuestion[sIdx] === qIdx ? 'max-h-40 mt-2 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
                      >
                        <p className="text-base">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Back Button */}
        <div className="mt-12 flex justify-center animate-fade-in-up">
          <Button
            className="w-40 bg-colour3 hover:bg-colour2 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-colour2/40"
            onClick={() => window.history.back()}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}