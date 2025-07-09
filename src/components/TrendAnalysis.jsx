import React, { useState } from "react";

const TrendAnalysis = () => {
  const [selectedFabric, setSelectedFabric] = useState(null); // ✅ correct
  const [votes, setVotes] = useState({});

  const fabrics = [
    { name: "Cotton", comfort: "High", season: "Summer", tip: "Perfect for hot weather, breathable and light." },
    { name: "Wool", comfort: "Medium", season: "Winter", tip: "Great for keeping warm in winters." },
    { name: "Silk", comfort: "Low-Medium", season: "All seasons", tip: "Smooth and luxurious, but handle with care." },
  ];

  const challengeTheme = "Monochrome Monday";
  const stylingLooks = [
    {
      id: 1,
      user: "Aarohi",
      img: "/looks/look1.jpg",
      caption: "Bold black and white layers!",
    },
    {
      id: 2,
      user: "Riya",
      img: "/looks/look2.jpg",
      caption: "Minimal monochrome vibe 💫",
    },
  ];

  const handleVote = (lookId) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [lookId]: (prevVotes[lookId] || 0) + 1,
    }));
  };

  return (
    <div className="trend-analysis p-4 space-y-10">
      <h2 className="text-3xl font-bold text-center mb-4">🔮 Trend Analysis</h2>

      {/* 🧵 Fabric Usage Guide */}
      <section className="fabric-guide">
        <h3 className="text-xl font-semibold mb-2">🧵 Fabric Usage Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fabrics.map((fabric, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-4 hover:bg-gray-100 transition-all cursor-pointer"
              onClick={() => setSelectedFabric(fabric)}
            >
              <h4 className="font-bold text-lg">{fabric.name}</h4>
              <p className="text-sm text-gray-500">Season: {fabric.season}</p>
              <p className="text-sm text-gray-500">Comfort: {fabric.comfort}</p>
            </div>
          ))}
        </div>
        {selectedFabric && (
          <div className="mt-4 bg-yellow-100 rounded-xl p-3">
            <p className="font-semibold">
              💡 Tip for {selectedFabric.name}: {selectedFabric.tip}
            </p>
          </div>
        )}
      </section>

      {/* ✨ Styling Challenge */}
      <section className="styling-challenge">
        <h3 className="text-xl font-semibold mb-2">✨ Styling Challenge: {challengeTheme}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stylingLooks.map((look) => (
            <div key={look.id} className="bg-white rounded-2xl p-4 shadow-md">
              <img src={look.img} alt={look.caption} className="w-full rounded-xl mb-2" />
              <h4 className="font-bold">{look.user}</h4>
              <p className="text-sm text-gray-600 mb-2">{look.caption}</p>
              <button
                onClick={() => handleVote(look.id)}
                className="bg-pink-500 text-white px-4 py-1 rounded-full hover:bg-pink-600"
              >
                ❤️ Vote ({votes[look.id] || 0})
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TrendAnalysis;
